import React, { useState, useEffect, useCallback } from 'react';
import { Modal, TextInput, Button, View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import Svg, { Rect, Text as SvgText} from 'react-native-svg';


const SleepRecordsScreen = () => {
  const [sleepRecords, setSleepRecords] = useState([]);
  const [db, setDb] = useState(null);
  const [viewType, setViewType] = useState('today');
  const [loading, setLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
const [isEditModalVisible, setIsEditModalVisible] = useState(false);


  useEffect(() => {
    const initializeDatabase = async () => {
      const database = SQLite.openDatabaseSync('myDatabase.db');
      setDb(database);

      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS sleep_records (id INTEGER PRIMARY KEY AUTOINCREMENT, start TEXT, end TEXT);'
      );

      fetchSleepRecords();
    };

    initializeDatabase();
  }, []);

  const handleEditPress = (record) => {
    console.log("Edit button pressed for record:", record);  // Debugging line
    setSelectedRecord(record);
    setIsEditModalVisible(true);
  };
  
  
  const handleSaveChanges = async () => {
    if (db && selectedRecord) {
      try {
        await db.execAsync(
          'UPDATE sleep_records SET start = ?, end = ? WHERE id = ?',
          [selectedRecord.start, selectedRecord.end, selectedRecord.id]
        );
        fetchSleepRecords();
        setIsEditModalVisible(false);
      } catch (error) {
        console.error('Error updating record:', error);
      }
    }
  };
  
  const fetchSleepRecords = async () => {
    if (db) {
      setLoading(true);
      try {
        const now = moment();
        let startDate = now.format('YYYY-MM-DD');
        let endDate = now.format('YYYY-MM-DD');
        
        if (viewType === 'past7days') {
          startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
        }

        const result = await db.getAllAsync(
          `SELECT * FROM sleep_records WHERE date(start) BETWEEN ? AND ? ORDER BY start DESC`,
          [startDate, endDate]
        );

        setSleepRecords(result);
      } catch (error) {
        console.error('Error fetching sleep records:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSleepRecords();
    }, [db, viewType])
  );

  const calculateSleepDuration = (start, end) => {
    if (start && end) {
      const duration = (new Date(end) - new Date(start)) / 1000 / 60; // Duration in minutes
      return `${Math.floor(duration)} minutes`;
    }
    return 'N/A';
  };

  const renderRecordItem = ({ item }) => (
    <View style={styles.recordCard}>
      <Text style={styles.recordTitle}>Sleep Record {item.id}</Text>
      <Text style={styles.recordDetail}>Start: {new Date(item.start).toLocaleString()}</Text>
      <Text style={styles.recordDetail}>End: {item.end ? new Date(item.end).toLocaleString() : 'Still sleeping'}</Text>
      <Text style={styles.recordDetail}>Duration: {item.end ? calculateSleepDuration(item.start, item.end) : 'N/A'}</Text>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(item)}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGraph = () => {
    if (sleepRecords.length === 0) {
      return <Text style={styles.emptyText}>No data available for the graph</Text>;
    }


    const graphWidth = 300;
    const graphHeight = 200;
    const barWidth = 20;
    const barSpacing = 10; // Space between bars
    const xAxisHeight = 20; // Space for X-axis labels
    const yAxisWidth = 30; // Space for Y-axis labels
  
    const durations = sleepRecords.map(record => {
      const duration = (new Date(record.end) - new Date(record.start)) / 1000 / 60; // Duration in minutes
      return Math.floor(duration);
    });
  
    const maxDuration = Math.max(...durations);
  
    return (
      <Svg width={graphWidth + yAxisWidth} height={graphHeight + xAxisHeight} style={styles.graphContainer}>
        {/* X-axis Labels */}
        {sleepRecords.map((record, index) => {
          const x = index * (barWidth + barSpacing) + yAxisWidth + (barWidth / 2);
          const labelX = x;
          const labelY = graphHeight + 15; // Position below the graph
  
          return (
            <SvgText
              key={`x-axis-${record.id}`}
              x={labelX}
              y={labelY}
              fontSize="10"
              fill="black"
              textAnchor="middle"
            >
              {moment(record.start).format('D/M')}
            </SvgText>
          );
        })}
  
        {/* Y-axis Labels */}
        <SvgText
          x={yAxisWidth / 2}
          y={graphHeight / 2}
          fontSize="10"
          fill="black"
          textAnchor="middle"
          transform={`rotate(-90, ${yAxisWidth / 2}, ${graphHeight / 2})`}
        >
          Duration (minutes)
        </SvgText>
  
        {/* Bars */}
        {sleepRecords.map((record, index) => {
          const x = index * (barWidth + barSpacing) + yAxisWidth;
          const duration = durations[index];
          const barHeight = (duration / maxDuration) * graphHeight;
  
          return (
            <React.Fragment key={record.id}>
              <Rect
                x={x}
                y={graphHeight - barHeight}
                width={barWidth}
                height={barHeight}
                fill="blue"
              />
              <SvgText
                x={x + barWidth / 2}
                y={graphHeight - barHeight - 5}
                fontSize="10"
                fill="black"
                textAnchor="middle"
              >
                {duration}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };
  
  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        console.log("Modal closed");  // Debugging line
        setIsEditModalVisible(false);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Sleep Record</Text>
          <TextInput
            style={styles.input}
            placeholder="Start Time"
            value={selectedRecord?.start || ''}
            onChangeText={(text) => {
              console.log("Start Time changed:", text);  // Debugging line
              setSelectedRecord({ ...selectedRecord, start: text });
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="End Time"
            value={selectedRecord?.end || ''}
            onChangeText={(text) => {
              console.log("End Time changed:", text);  // Debugging line
              setSelectedRecord({ ...selectedRecord, end: text });
            }}
          />
          <Button title="Save Changes" onPress={() => {
            console.log("Save Changes pressed");  // Debugging line
            handleSaveChanges();
          }} />
          <Button title="Cancel" onPress={() => {
            console.log("Cancel pressed");  // Debugging line
            setIsEditModalVisible(false);
          }} />
        </View>
      </View>
    </Modal>
  );
  
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Records</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, viewType === 'today' && styles.selectedButton]}
          onPress={() => setViewType('today')}
        >
          <Text style={styles.buttonText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, viewType === 'past7days' && styles.selectedButton]}
          onPress={() => setViewType('past7days')}
        >
          <Text style={styles.buttonText}>Past 7 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowGraph(!showGraph)}
        >
          <Text style={styles.buttonText}>{showGraph ? 'Hide Graph' : 'Display Sleep'}</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : showGraph ? (
        <ScrollView contentContainerStyle={styles.graphContainer}>
          {renderGraph()}
        </ScrollView>
      ) : sleepRecords.length === 0 ? (
        <Text style={styles.emptyText}>No sleep records available</Text>
      ) : (
        <FlatList
          data={sleepRecords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecordItem}
        />
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  selectedButton: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recordDetail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#007BFF',
  },
  graphContainer: {
    alignItems: 'center',
  },
});

export default SleepRecordsScreen;
