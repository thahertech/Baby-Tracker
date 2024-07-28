import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';

const SleepScreen = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [sleepStart, setSleepStart] = useState(null);
  const [sleepEnd, setSleepEnd] = useState(null);
  const [isStartPickerVisible, setIsStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setIsEndPickerVisible] = useState(false);
  const [sleepRecords, setSleepRecords] = useState([]);
  const [db, setDb] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // State to keep track of elapsed time

  const timerRef = useRef(null); // Ref to hold the timer interval

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted!');
      }
    };

    getPermissions();

    const initializeDatabase = async () => {
      const database = SQLite.openDatabaseSync('myDatabase.db'); // Open synchronously
      setDb(database);

      // Create table if it doesn't exist
      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS sleep_records (id INTEGER PRIMARY KEY AUTOINCREMENT, start TEXT, end TEXT);'
      );

      fetchSleepRecords();
    };

    initializeDatabase();
    return () => {
      cancelNotification();
    };
  }, []);

  useEffect(() => {
    if (isTracking) {
      startTimer();
      scheduleNotification();
    } else {
      stopTimer();
      cancelNotification();
    }
  }, [isTracking]);

  const startTimer = () => {
    if (sleepStart) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((new Date() - sleepStart) / 1000));
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };


  const handleLogSleep = () => {
    if (sleepStart && sleepEnd && sleepEnd > sleepStart) {
      saveSleepRecord(sleepStart, sleepEnd);
      Alert.alert('Success', 'Sleep record logged successfully.');
    } else {
      Alert.alert('Error', 'Please set valid start and end times.');
    }
  };

  const fetchSleepRecords = async () => {
    if (db) {
      try {
        const result = await db.getAllAsync('SELECT * FROM sleep_records ORDER BY id DESC');
        setSleepRecords(result);
      } catch (error) {
        console.error('Error fetching sleep records:', error);
        Alert.alert('Error', 'Failed to fetch sleep records.');
      }
    }
  };

  const saveSleepRecord = async (start, end) => {
    if (db) {
      try {
        await db.runAsync(
          'INSERT INTO sleep_records (start, end) VALUES (?, ?)',
          [start.toISOString(), end ? end.toISOString() : null]
        );
        fetchSleepRecords();
      } catch (error) {
        console.error('Error saving sleep record:', error);
        Alert.alert('Error', 'Failed to save sleep record.');
      }
    }
  };

  const handleStartTracking = () => {
    setSleepStart(new Date());
    setIsTracking(true);
  };

  const handleStopTracking = () => {
    const end = new Date();
    if (sleepStart && end > sleepStart) {
      setSleepEnd(end);
      setIsTracking(false);
      saveSleepRecord(sleepStart, end);
    } else {
      Alert.alert('Error', 'End time must be after start time');
    }
  };

  const handleStartTimeConfirm = (date) => {
    setSleepStart(date);
    setIsStartPickerVisible(false);
  };

  const handleEndTimeConfirm = (date) => {
    setSleepEnd(date);
    setIsEndPickerVisible(false);
  };

  const calculateSleepDuration = (start, end) => {
    if (start && end) {
      const duration = (new Date(end) - new Date(start)) / 1000 / 60; // Duration in minutes
      return `${Math.floor(duration)} minutes`;
    }
    return 'N/A';
  };

  const scheduleNotification = async () => {
    console.log('Scheduling notification...');
    await cancelNotification();

    const triggerInterval = 600; // Trigger every 10 minutes (600 seconds)

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sleep Tracker',
        body: `Sleep Timer: ${calculateSleepDuration(sleepStart, new Date())}`,
      },
      trigger: {
        seconds: triggerInterval,
        repeats: true,
      },
    });
    console.log('Notification scheduled.');
  };

  const cancelNotification = async () => {
    console.log('Cancelling notifications...');
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Notifications cancelled.');
  };

  const formatElapsedTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <View style={styles.container}>
    
      {isTracking ? (
        <View style={styles.trackingContainer}>
          <Text style={styles.trackingText}>Tracking Sleep...</Text>
          <Text style={styles.timerText}>Elapsed Time: {formatElapsedTime(elapsedTime)}</Text>
          <Button title="Stop Tracking" onPress={handleStopTracking} />
        </View>
      ) : (
        <View style={styles.trackingContainer}>
          <Button title="Start Tracking" onPress={handleStartTracking} />
        </View>
      )}
      <View style={styles.timeContainer}>
        <Text>Start Time:</Text>
        <Button title="Set Start Time" onPress={() => setIsStartPickerVisible(true)} />
        <Text>{sleepStart ? sleepStart.toLocaleTimeString() : 'Not set'}</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text>End Time:</Text>
        <Button title="Set End Time" onPress={() => setIsEndPickerVisible(true)} />
        <Text>{sleepEnd ? sleepEnd.toLocaleTimeString() : 'Not set'}</Text>
      </View>
      <View style={styles.durationContainer}>
        <Text>Duration: {sleepStart && sleepEnd ? calculateSleepDuration(sleepStart, sleepEnd) : 'N/A'}</Text>
      </View>
      <View style={styles.logButtonContainer}>
        <Button style={styles.LogButton} title="Log Sleep" onPress={handleLogSleep} />
      </View>
      <View style={styles.recordsContainer}>
        <Text>Sleep Records:</Text>
        <FlatList
          data={sleepRecords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recordItem}>
              <Text>Start: {new Date(item.start).toLocaleString()}</Text>
              <Text>End: {item.end ? new Date(item.end).toLocaleString() : 'Still sleeping'}</Text>
              <Text>Duration: {item.end ? calculateSleepDuration(new Date(item.start), new Date(item.end)) : 'N/A'}</Text>
            </View>
          )}
        />
      </View>

      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="datetime"
        onConfirm={handleStartTimeConfirm}
        onCancel={() => setIsStartPickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="datetime"
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setIsEndPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eaeaea',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  trackingContainer: {
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff9',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
  },
  trackingText: {
    fontSize: 20,
    marginBottom: 10,
    color: '#555',
  },
  timerText: {
    fontSize: 18,
    marginVertical: 10,
    color: '#666',
  },
  timeContainer: {
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  durationContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  logButtonContainer: {
    backgroundColor:'#009',
    borderRadius:'10px',
    padding: 8,
    marginBottom: 20,
  },
  recordsContainer: {
    flex: 1,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  recordItem: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default SleepScreen;
