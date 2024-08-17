import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('myDatabase.db');

const SleepTracking = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM sleep ORDER BY start DESC',
        [],
        (_, { rows: { _array } }) => setRecords(_array),
        (tx, error) => console.error('Error fetching records', error)
      );
    });
  };

  const renderRecord = ({ item }) => (
    <View style={styles.recordItem}>
      <Text style={styles.text}>Start: {new Date(item.start).toLocaleString()}</Text>
      <Text style={styles.text}>End: {new Date(item.end).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecord}
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
  recordItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default SleepTracking;
