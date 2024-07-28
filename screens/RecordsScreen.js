import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import Svg, { Polyline, Text as SvgText, Line } from 'react-native-svg';
import { LineChart, YAxis, XAxis, Grid } from 'react-native-svg-charts';

const { width: screenWidth } = Dimensions.get('window');

const RecordsScreen = () => {
  const [feedingRecords, setFeedingRecords] = useState([]);
  const [sleepRecords, setSleepRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [recordType, setRecordType] = useState('feeding');
  const [viewType, setViewType] = useState('chart'); // Add a state for chart/table view

  useEffect(() => {
    const initializeDatabase = async () => {
      const database = SQLite.openDatabaseSync('myDatabase.db');
      setDb(database);

      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS feeding_records (id INTEGER PRIMARY KEY AUTOINCREMENT, datetime TEXT, amount TEXT, notes TEXT, height INTEGER, weight INTEGER);'
      );
      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS sleep_records (id INTEGER PRIMARY KEY AUTOINCREMENT, start TEXT, end TEXT, height INTEGER, weight INTEGER);'
      );

      fetchRecords();
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
    setIsEdit(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (db && selectedRecord) {
      try {
        if (isEdit) {
          await db.execAsync(`UPDATE ${recordType}_records SET datetime = ?, amount = ?, notes = ?, height = ?, weight = ? WHERE id = ?`, [
            selectedRecord.datetime,
            selectedRecord.amount,
            selectedRecord.notes,
            selectedRecord.height,
            selectedRecord.weight,
            selectedRecord.id,
          ]);
        } else {
          await db.execAsync(`INSERT INTO ${recordType}_records (datetime, amount, notes, height, weight) VALUES (?, ?, ?, ?, ?)`, [
            selectedRecord.datetime,
            selectedRecord.amount,
            selectedRecord.notes,
            selectedRecord.height,
            selectedRecord.weight,
          ]);
        }
        fetchRecords();
        setModalVisible(false);
      } catch (error) {
        console.error('Error saving record:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (db && selectedRecord) {
      try {
        await db.execAsync(`DELETE FROM ${recordType}_records WHERE id = ?`, [selectedRecord.id]);
        fetchRecords();
        setModalVisible(false);
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const renderFeedingChart = () => {
    if (feedingRecords.length === 0) return null;

    const dates = feedingRecords.map(record => moment(record.datetime).format('MMM DD'));
    const amounts = feedingRecords.map(record => {
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
    });

    return (
      <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 20 }}>
        <LineChart
          style={{ height: 200, width: screenWidth - 40 }}
          data={amounts}
          svg={{ stroke: 'rgb(134, 65, 244)' }}
          contentInset={{ top: 20, bottom: 20 }}
          animate
        >
          <Grid />
        </LineChart>
        <XAxis
          style={{ marginTop: 10, width: screenWidth - 40 }}
          data={dates}
          formatLabel={(value, index) => dates[index]}
          contentInset={{ left: 10, right: 10 }}
        />
      </ScrollView>
    );
  };

  const renderSleepChart = () => {
    if (sleepRecords.length === 0) return null;

    const dates = sleepRecords.map(record => moment(record.start).format('MM DD'));
    const sleepDurations = sleepRecords.map(record => {
      if (record.end) {
        const duration = (new Date(record.start) - new Date(record.end)) / 1000 / 60;
        return duration;
      }
      return 0;
    });

    return (
      <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 20 }}>
        <LineChart
          style={{ height: 200, width: screenWidth - 40 }}
          data={sleepDurations}
          svg={{ stroke: 'rgb(54, 162, 235)' }}
          contentInset={{ top: 20, bottom: 20 }}
          animate
        >
          <Grid />
        </LineChart>
        <XAxis
          style={{ marginTop: 10, width: screenWidth - 40 }}
          data={dates}
          formatLabel={(value, index) => dates[index]}
          contentInset={{ left: 10, right: 10 }}
        />
      </ScrollView>
    );
  };

  const renderFeedingTable = () => (
    <FlatList
      data={feedingRecords}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.tableRow} onPress={() => handleRecordPress(item, 'feeding')}>
          <Text style={styles.tableCell}>{moment(item.datetime).format('HH')} AM / PM</Text>
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
          <Text style={styles.tableCell}>{moment(item.start).format('MMM D')}</Text>
          <Text style={styles.tableCell}>{item.end ? moment(item.end).format('MMM D') : 'Still sleeping'}</Text>
          <Text style={styles.tableCell}>{item.end ? calculateSleepDuration(new Date(item.start), new Date(item.end)) : 'N/A'}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No sleep records available</Text>}
    />
  );

  const calculateSleepDuration = (start, end) => {
    if (start && end) {
      const duration = (new Date(end) - new Date(start)) / 1000 / 60;
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
          <Text style={styles.modalTitle}>{isEdit ? 'Edit Record' : 'Add Record'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Datetime"
            value={selectedRecord?.datetime || ''}
            onChangeText={(text) => setSelectedRecord({ ...selectedRecord, datetime: text })}
          />
          {recordType === 'feeding' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                value={selectedRecord?.amount || ''}
                onChangeText={(text) => setSelectedRecord({ ...selectedRecord, amount: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Notes"
                value={selectedRecord?.notes || ''}
                onChangeText={(text) => setSelectedRecord({ ...selectedRecord, notes: text })}
              />
            </>
          )}
          {recordType === 'sleep' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Start"
                value={selectedRecord?.start || ''}
                onChangeText={(text) => setSelectedRecord({ ...selectedRecord, start: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="End"
                value={selectedRecord?.end || ''}
                onChangeText={(text) => setSelectedRecord({ ...selectedRecord, end: text })}
              />
            </>
          )}
          <TextInput
            style={styles.input}
            placeholder="Height"
            keyboardType="numeric"
            value={selectedRecord?.height?.toString() || ''}
            onChangeText={(text) => setSelectedRecord({ ...selectedRecord, height: parseInt(text) })}
          />
          <TextInput
            style={styles.input}
            placeholder="Weight"
            keyboardType="numeric"
            value={selectedRecord?.weight?.toString() || ''}
            onChangeText={(text) => setSelectedRecord({ ...selectedRecord, weight: parseInt(text) })}
          />
          <Button title={isEdit ? 'Save Changes' : 'Add Record'} onPress={handleSave} />
          {isEdit && <Button title="Delete Record" color="red" onPress={handleDelete} />}
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
                  {renderFeedingChart()}
                </View>
                <View style={styles.table}>
                  <Text style={styles.title}>Sleep Records (Past 7 Days)</Text>
                  {renderSleepChart()}
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
    fontSize: 16,
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
