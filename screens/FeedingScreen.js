import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, TextInput, FlatList, Modal, TouchableOpacity, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Swipeable } from 'react-native-gesture-handler';

const FeedingScreen = () => {
  const [foodAmount, setFoodAmount] = useState('normal');
  const [notes, setNotes] = useState('');
  const [feedingRecords, setFeedingRecords] = useState([]);
  const [db, setDb] = useState(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted!');
      }
    };

    getPermissions();

    const initializeDatabase = async () => {
      setLoading(true);
      try {
        const database = SQLite.openDatabaseSync('myDatabase.db');
        setDb(database);

        await database.execAsync(
          'CREATE TABLE IF NOT EXISTS feeding_records (id INTEGER PRIMARY KEY AUTOINCREMENT, datetime TEXT, amount TEXT, notes TEXT);'
        );

        fetchFeedingRecords();
      } catch (error) {
        console.error('Database initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();
    return () => {
      cancelNotification();
    };
  }, []);

  useEffect(() => {
    if (currentDateTime) {
      scheduleNotification();
    } else {
      cancelNotification();
    }
  }, [currentDateTime]);

  const fetchFeedingRecords = async () => {
    if (db) {
      setLoading(true);
      try {
        const result = await db.getAllAsync('SELECT * FROM feeding_records ORDER BY id DESC');
        setFeedingRecords(result);
        console.log('Fetch Feeding Records...');

      } catch (error) {
        console.error('Error fetching feeding records:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const saveFeedingRecord = async (datetime, amount, notes) => {
    if (db) {
      setLoading(true);
      try {
        await db.runAsync(
          'INSERT INTO feeding_records (datetime, amount, notes) VALUES (?, ?, ?)',
          [datetime.toISOString(), amount, notes]

        );
        console.log(datetime.toISOString(), amount + notes);

        fetchFeedingRecords();
      } catch (error) {
        console.error('Error saving feeding record:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteFeedingRecord = async (id) => {
    if (db) {
      setLoading(true);
      try {
        await db.runAsync('DELETE FROM feeding_records WHERE id = ?', [id]);
        fetchFeedingRecords();
      } catch (error) {
        console.error('Error deleting feeding record:', error);
      } finally {
        setLoading(false);

      }
    console.log('deleted record: ' + id);
  }
  };

  const handleLogFeeding = () => {
    if (currentDateTime) {
      saveFeedingRecord(currentDateTime, foodAmount, notes);
      setFoodAmount('normal');
      setNotes('');
      setCurrentDateTime(new Date());
    }
  };

  const scheduleNotification = async () => {
    await cancelNotification();

    const triggerInterval = 60;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Feeding Tracker',
        body: `Feeding logged at ${currentDateTime ? currentDateTime.toLocaleString() : 'unknown time'}`,
      },
      trigger: {
        seconds: triggerInterval,
        repeats: true,
      },
    });
  };

  const cancelNotification = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const handleDateTimeConfirm = (date) => {
    setCurrentDateTime(date);
    setIsDatePickerVisible(false);
  };

  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  const handleOpenPickerModal = () => {
    setIsPickerModalVisible(true);
  };

  const handleClosePickerModal = () => {
    setIsPickerModalVisible(false);
  };

  const handleFoodAmountSelect = (amount) => {
    setFoodAmount(amount);
    handleClosePickerModal();
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteFeedingRecord(id)}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.recordItem}>
        <Text style={styles.itemText}>Time: {new Date(item.datetime).toLocaleString()}</Text>
        <Text style={styles.itemText}>Amount: {item.amount}</Text>
        <Text style={styles.itemText}>Notes: {item.notes}</Text>
      </View>
    </Swipeable>
  );

  return (
    
    <TouchableWithoutFeedback onPress={handleKeyboardDismiss}>
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={
            <>
              <View style={styles.section}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Date</Text>
                  <Button title="Set Date" onPress={() => setIsDatePickerVisible(true)} />
                </View>
                <Text style={styles.value}>{currentDateTime ? currentDateTime.toLocaleString() : 'Not set'}</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Amount</Text>
                  <Button title="Select Food Amount" onPress={handleOpenPickerModal} />
                </View>
                <Text style={styles.value}>{foodAmount.charAt(0).toUpperCase() + foodAmount.slice(1)}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={styles.textarea}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter any additional notes..."
                />
              </View>

            </>
          }
          data={feedingRecords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListFooterComponent={loading && <ActivityIndicator size="large" color="#007BFF" />}
          contentContainerStyle={styles.container}
        />
                      <View style={styles.logButtonContainer}>

              <Button style={styles.buttonFeed} title="Log Feeding" onPress={handleLogFeeding} color="#007BFF" />
              </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleDateTimeConfirm}
          onCancel={() => setIsDatePickerVisible(false)}
        />

        <Modal
          transparent={true}
          animationType="slide"
          visible={isPickerModalVisible}
          onRequestClose={handleClosePickerModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Food Amount</Text>
              {['none', 'a little', 'normal', 'a lot'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.modalOption}
                  onPress={() => handleFoodAmountSelect(amount)}
                >
                  <Text style={styles.modalOptionText}>{amount.charAt(0).toUpperCase() + amount.slice(1)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleClosePickerModal}
              >
                <Text style={styles.modalButtonText}>Okay</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#f7f7f7',
  },

  buttonFeed: {
    fontSize:30,
    marginBottom:30,
    fontFamily:'Inter'
  },
  logButtonContainer: {
    backgroundColor:'#009',
    padding:8,
    margin: 14,
    borderRadius: 8

  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
  },

  itemText: {
    fontFamily: 'Inter',
    fontWeight:'500',
    color:'white'
  },
  textarea: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  recordItem: {
    backgroundColor: 'grey',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '80%',
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
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
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalOption: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default FeedingScreen;
