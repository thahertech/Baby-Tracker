import React from 'react';
import { View, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { LineChart, XAxis, YAxis, Grid } from 'react-native-svg-charts';
import * as d3Scale from 'd3-scale';

const { width: screenWidth } = Dimensions.get('window');

const ChartComponent = ({ data, dates }) => {
  return (
    <View style={styles.chartContainer}>
      <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
        <View style={styles.chartWrapper}>
          <YAxis
            data={data}
            contentInset={{ top: 20, bottom: 20 }}
            svg={{ fill: 'black', fontSize: 10}}
            yAccessor={({ index }) => index}
            scale={d3Scale.scaleLinear}
          />
          <View style={styles.chartContent}>
            <LineChart
              style={styles.lineChart}
              data={data}
              svg={{ stroke: 'rgb(031, 203, 244)' }}
              contentInset={{ top: 20, bottom: 20 }}
              animate
            >
              <Grid />
            </LineChart>
            <XAxis
              style={styles.xAxis}
              data={dates}
              formatLabel={( index) => dates[index]}
              contentInset={{ left: 10, right: 10 }}
              svg={{ fill: 'grey', fontSize: 10 }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 2
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 220,
  },
  chartContent: {
    flex: 1,
  },
  lineChart: {
    height: 200,
    width: screenWidth - 40,
  },
  xAxis: {
    marginHorizontal: -10,
    marginTop: 5,
  },
});

export default ChartComponent;
