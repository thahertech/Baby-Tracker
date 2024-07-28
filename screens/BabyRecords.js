import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Polyline, Text as SvgText, Line } from 'react-native-svg';
import moment from 'moment'; // For date formatting

const { width: screenWidth } = Dimensions.get('window');

const RecordPage = () => {
  const [records, setRecords] = useState([]);
  const [chartData, setChartData] = useState({ dates: [], heights: [], weights: [] });

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      prepareChartData();
    }
  }, [records]);

  const loadRecords = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem('records');
      if (storedRecords) {
        setRecords(JSON.parse(storedRecords));
      }
    } catch (error) {
      console.error('Failed to load records', error);
    }
  };

  const prepareChartData = () => {
    const dates = records.map(record => moment(record.date).format('MMM DD')); // Short month and day
    const heights = records.map(record => record.height);
    const weights = records.map(record => record.weight);

    setChartData({
      dates,
      heights,
      weights,
    });
  };

  const renderLineChart = (data, color, label) => {
    if (data.length === 0) return null;

    const width = screenWidth - 40; // Adjust width based on screen size
    const height = 200; // Chart height
    const padding = 20; // Padding around the chart
    const xStep = (width - 2 * padding) / (data.length - 1); // X-axis spacing
    const yMax = Math.max(...data); // Max value for Y-axis scaling

    const pathData = data
      .map((value, index) => {
        const x = padding + index * xStep;
        const y = height - padding - (value / yMax) * (height - 2 * padding);
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');

    return (
      <Svg width={width} height={height} style={styles.chart}>
        {/* Draw the chart line */}
        <Polyline
          points={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        {/* Draw the date labels */}
        {chartData.dates.map((date, index) => {
          const x = padding + index * xStep;
          const y = height - padding + 10; // Position below the chart
          return (
            <SvgText
              key={index}
              x={x}
              y={y}
              fontSize="10"
              fill="#333"
              textAnchor="middle"
            >
              {date}
            </SvgText>
          );
        })}
        {/* Draw y-axis lines and labels */}
        {[0, yMax / 2, yMax].map((value, index) => {
          const y = height - padding - (value / yMax) * (height - 2 * padding);
          return (
            <React.Fragment key={index}>
              <Line
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="#ddd"
                strokeWidth="1"
              />
              <SvgText
                x={padding - 10}
                y={y + 5}
                fontSize="10"
                fill="#333"
                textAnchor="end"
              >
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}
        {/* Draw x-axis label */}
        <SvgText
          x={width / 2}
          y={height - 5}
          fontSize="12"
          fill="#333"
          textAnchor="middle"
        >
          {label}
        </SvgText>
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight and Height Records</Text>

      <View style={styles.chartContainer}>
        {renderLineChart(chartData.heights, 'rgba(255, 99, 132, 1)', 'Height (cm)')}
      </View>

      <View style={styles.chartContainer}>
        {renderLineChart(chartData.weights, 'rgba(54, 162, 235, 1)', 'Weight (kg)')}
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <Text style={styles.text}>Date: {moment(item.date).format('MMM DD')}</Text>
            <Text style={styles.text}>Height: {item.height} cm</Text>
            <Text style={styles.text}>Weight: {item.weight} kg</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  chartContainer: {
    marginVertical: 7,
  },
  chart: {
    width: '100%',
    height: 200,
    marginBottom: 10
  },
  recordItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: 'grey',
  },
  text: {
    fontSize: 14,
    fontFamily:'Inter',
    fontWeight:'400',
    color:'white',
    
  },
});

export default RecordPage;
