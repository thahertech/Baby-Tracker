import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, ActivityIndicator, Dimensions } from 'react-native';
import * as SQLite from 'expo-sqlite';
import ChartComponent from '../components/ChartComponent';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window');

const RecordsScreen = () => {
  const [feedingRecords, setFeedingRecords] = useState([]);
  const [sleepRecords, setSleepRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recordType, setRecordType] = useState('feeding');
  const [viewType, setViewType] = useState('chart');

  useEffect(() => {
    const initializeDatabase = async () => {
      const database = SQLite.openDatabaseSync('myDatabase.db');
      setDb(database);

      try {
        await database.execAsync(
          'CREATE TABLE IF NOT EXISTS feeding_records (id INTEGER PRIMARY KEY AUTOINCREMENT, datetime TEXT, amount TEXT, notes TEXT);'
        );
        await database.execAsync(
          'CREATE TABLE IF NOT EXISTS sleep_records (id INTEGER PRIMARY KEY AUTOINCREMENT, start TEXT, end TEXT);'
        );

        fetchRecords();
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initializeDatabase();
  }, []);

  const fetchRecords = async () => {
    if (db) {
      setLoading(true);
      try {
        const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');

        const feedingResult = await db.getAllAsync(`SELECT * FROM feeding_records WHERE datetime >= ? ORDER BY datetime DESC`, [sevenDaysAgo]);
        setFeedingRecords(feedingResult);

        const sleepResult = await db.getAllAsync(`SELECT * FROM sleep_records WHERE start >= ? ORDER BY start DESC`, [sevenDaysAgo]);
        setSleepRecords(sleepResult);

      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [db])
  );

  const handleRecordPress = (record, type) => {
    setSelectedRecord(record);
    setRecordType(type);
    setModalVisible(true);
  };

  const debugDatabase = async () => {
    if (db) {
      try {
        const feedingResult = await db.getAllAsync('SELECT * FROM feeding_records ORDER BY datetime DESC');
        const sleepResult = await db.getAllAsync('SELECT * FROM sleep_records ORDER BY start DESC');
        console.log('Feeding Records:', feedingResult);
        console.log('Sleep Records:', sleepResult);
      } catch (error) {
        console.error('Error querying database:', error);
      }
    }
  };
  

  const handleDelete = () => {
    if (db && selectedRecord) {
      Alert.alert(
        'Confirm Deletion',
        `Are you sure you want to delete this ${recordType} record?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              try {
                await db.runAsync(`DELETE FROM ${recordType}_records WHERE id = ?`, [selectedRecord.id]);
  
                await fetchRecords();
                
                await debugDatabase();
  
                Alert.alert('Record Deleted', `Deleted ${recordType} record with ID ${selectedRecord.id}`);
              } catch (error) {
                console.error('Error deleting record:', error);
                Alert.alert('Error', 'Failed to delete record');
              } finally {
                setModalVisible(false);
              }
            },
          },
        ]
      );
    }
    setModalVisible(false);
  };
  
  

  const renderFeedingTable = () => (
    <FlatList
      data={feedingRecords}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.tableRow} onPress={() => handleRecordPress(item, 'feeding')}>
          <Text style={styles.tableCell}>{moment(item.datetime).format('MMM D')}</Text>
          <Text style={styles.tableCell}>{item.amount}</Text>
          <Text style={styles.tableCell}>{item.notes}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No feeding records available</Text>}
    />
  );

  const renderSleepTable = () => (
    <FlatList
      data={sleepRecords}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.tableRow} onPress={() => handleRecordPress(item, 'sleep')}>
          <Text style={styles.tableCell}>{moment(item.start).format('MMM D HH:MM')}</Text>
          <Text style={styles.tableCell}>{item.end ? moment(item.end).format('MMM D HH:MM') : 'Still sleeping'}</Text>
          <Text style={styles.tableCell}>{item.end ? calculateSleepDuration(new Date(item.start), new Date(item.end)) : 'N/A'}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No sleep records available</Text>}
    />
  );

  const calculateSleepDuration = (start, end) => {
    if (start && end) {
      const duration = (end - start) / 1000 / 60;
      return `${Math.floor(duration)} minutes`;
    }
    return 'N/A';
  };

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{recordType === 'feeding' ? 'Feeding Record' : 'Sleep Record'}</Text>

          {recordType === 'feeding' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Datetime"
                value={selectedRecord?.datetime || ''}
                editable={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Amount"
                value={selectedRecord?.amount || ''}
                editable={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Notes"
                value={selectedRecord?.notes || ''}
                editable={false}
              />
            </>
          )}
          {recordType === 'sleep' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Start"
                value={selectedRecord?.start || ''}
                editable={false}
              />
              <TextInput
                style={styles.input}
                placeholder="End"
                value={selectedRecord?.end || ''}
                editable={false}
              />
            </>
          )}

          <Button title="Delete Record" color="red" onPress={handleDelete} />
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <Button
              title="View Chart"
              onPress={() => setViewType('chart')}
              color={viewType === 'chart' ? '#007BFF' : '#ccc'}
            />
            <Button
              title="View Table"
              onPress={() => setViewType('table')}
              color={viewType === 'table' ? '#007BFF' : '#ccc'}
            />
          </View>
          <View style={styles.tableContainer}>
            {viewType === 'chart' ? (
              <>
                <View style={styles.table}>
                  <Text style={styles.title}>Feeding Records (Past 7 Days)</Text>
                  <ChartComponent
                    data={feedingRecords.map(record => {
                      switch (record.amount) {
                        case 'none':
                          return 0;
                        case 'little':
                          return 1;
                        case 'normal':
                          return 2;
                        case 'a lot':
                          return 3;
                        default:
                          return 0;
                      }
                    })}
                    dates={feedingRecords.map(record => moment(record.datetime).format('DD M'))}
                  />
                </View>
                <View style={styles.table}>
                  <Text style={styles.title}>Sleep Records (Past 7 Days)</Text>
                  <ChartComponent
                    data={sleepRecords.map(record => {
                      if (record.end) {
                        const duration = (new Date(record.end) - new Date(record.start)) / 1000 / 60;
                        return duration;
                      }
                      return 0;
                    })}
                    dates={sleepRecords.map(record => moment(record.start).format('MM DD'))}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.table}>
                  <Text style={styles.title}>Feeding Records (Past 7 Days)</Text>
                  {renderFeedingTable()}
                </View>
                <View style={styles.table}>
                  <Text style={styles.title}>Sleep Records (Past 7 Days)</Text>
                  {renderSleepTable()}
                </View>
              </>
            )}
          </View>
          {renderModal()}
        </>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  table: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#007BFF',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter'
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
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
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
  },
  modalCloseText: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default RecordsScreen;
