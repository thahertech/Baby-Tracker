import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SleepTracking = () => {
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);
  const [sleepStart, setSleepStart] = useState(null);
  const [sleepEnd, setSleepEnd] = useState(null);
  const [sleeping, setSleeping] = useState(false);
  const [storedName, setStoredName] = useState('Your baby');

  useEffect(() => {
    const loadName = async () => {
      const name = await AsyncStorage.getItem('name');
      if (name) {
        setStoredName(name);
      }
    };
    loadName();
  }, []);

  const showStartPicker = () => setStartPickerVisible(true);
  const hideStartPicker = () => setStartPickerVisible(false);

  const showEndPicker = () => setEndPickerVisible(true);
  const hideEndPicker = () => setEndPickerVisible(false);

  const handleStartConfirm = (date) => {
    setSleepStart(date);
    hideStartPicker();
    setSleeping(true);
    scheduleNotification();
  };

  const handleEndConfirm = (date) => {
    setSleepEnd(date);
    hideEndPicker();
    setSleeping(false);
    cancelNotification();
  };

  const scheduleNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Sleep Tracking Alert",
        body: `Is ${storedName} still asleep?`,
      },
      trigger: {
        seconds: 3600, // 1 hour
      },
    });
  };

  const cancelNotification = async () => {
    const allScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    allScheduledNotifications.forEach(notification => {
      Notifications.cancelScheduledNotificationAsync(notification.identifier);
    });
  };

  const calculateSleepDuration = () => {
    if (sleepStart && sleepEnd) {
      const duration = sleepEnd - sleepStart;
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} hours ${minutes} minutes`;
    }
    return 'N/A';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sleep Tracking</Text>
      {sleeping ? (
        <View>
          <Text style={styles.status}>Tracking Sleep...</Text>
          <TouchableOpacity onPress={showEndPicker} style={styles.button}>
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TouchableOpacity onPress={showStartPicker} style={styles.button}>
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>
          {sleepStart && (
            <View style={styles.sleepInfo}>
              <Text>Sleep Started: {sleepStart.toLocaleTimeString()}</Text>
              <Text>Sleep Duration: {calculateSleepDuration()}</Text>
            </View>
          )}
        </View>
      )}
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="time"
        onConfirm={handleStartConfirm}
        onCancel={hideStartPicker}
      />
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="time"
        onConfirm={handleEndConfirm}
        onCancel={hideEndPicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  status: {
    fontSize: 18,
    color: '#FF5722',
    marginBottom: 10,
  },
  sleepInfo: {
    marginTop: 20,
  },
});

export default SleepTracking;
