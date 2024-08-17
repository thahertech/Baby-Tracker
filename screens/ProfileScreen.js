import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('Baby');
  const [storedName, setStoredName] = useState();
  const [editableName, setEditableName] = useState(false);
  const [height, setHeight] = useState(50);
  const [weight, setWeight] = useState(3);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleHeaderButtonPress} style={styles.editButton}>
          <Text style={styles.editButtonText}>{editableName ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, editableName]);

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.uri);
    }
  };

  const handleSave = async () => {
    try {
      const newRecord = { id: Date.now().toString(), height, weight, date: new Date() };
      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      await AsyncStorage.setItem('records', JSON.stringify(updatedRecords));
      await AsyncStorage.setItem('name', name);
      setShowDetails(false);
      alert('Profile saved!');
    } catch (error) {
      console.error('Failed to save profile', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const updatedRecords = records.filter(record => record.id !== id);
      setRecords(updatedRecords);
      await AsyncStorage.setItem('records', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Failed to delete record', error);
    }
  };

  const loadRecords = async () => {
    try {
      const storedRecords = await AsyncStorage.getItem('records');
      const storedName = await AsyncStorage.getItem('name');
  
      if (storedRecords) {
        const records = JSON.parse(storedRecords);
        setRecords(records);
        if (records.length > 0) {
          const latestRecord = records[records.length - 1];
          setHeight(latestRecord.height);
          setWeight(latestRecord.weight);
        }
      }
  
      if (storedName) {
        setName(storedName);
        setStoredName(storedName);
      }
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const handleHeaderButtonPress = async () => {
    if (editableName) {
      await AsyncStorage.setItem('name', name);
      setEditableName(false);
      setShowDetails(false);
    } else {
      setEditableName(true);
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(id)}>
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const toggleHeightPicker = () => setShowHeightPicker(!showHeightPicker);
  const toggleWeightPicker = () => setShowWeightPicker(!showWeightPicker);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={handleSelectImage}>
          <Image
            source={profilePicture ? { uri: profilePicture } : require('../assets/Logo.jpg')}
            style={styles.profilePicture}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.nameContainer}>
        {editableName ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            onBlur={async () => {
              setEditableName(false);
              await AsyncStorage.setItem('name', name);
            }}
            placeholder="Enter your baby's name"
          />
        ) : (
          <View style={styles.nameView}>
            <Text style={styles.nameText}>{storedName}</Text>
          </View>
        )}
        <View style={styles.labelView}>
          <Text style={styles.infoLabel}>{weight} kg</Text>
          <Text style={styles.infoLabel}>{height} cm</Text>
        </View>
      </View>

      {!showDetails ? (
        <Button title="Show Details" onPress={() => setShowDetails(true)} />
      ) : (
        <>
          <TouchableOpacity onPress={toggleHeightPicker} style={styles.pickerLabel}>
            <Text style={styles.label}>Height (cm): {height}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleWeightPicker} style={styles.pickerLabel}>
            <Text style={styles.label}>Weight (kg): {weight}</Text>
          </TouchableOpacity>
          <Button title="Save Input" onPress={handleSave} />
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                <View style={styles.recordItem}>
                  <Text style={styles.text}>Date: {new Date(item.date).toLocaleDateString()}</Text>
                  <Text style={styles.text}>Height: {item.height} cm</Text>
                  <Text style={styles.text}>Weight: {item.weight} kg</Text>
                </View>
              </Swipeable>
            )}
          />
        </>
      )}

      <Modal
        transparent={true}
        visible={showHeightPicker}
        animationType="slide"
        onRequestClose={() => setShowHeightPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={height}
              onValueChange={(itemValue) => setHeight(itemValue)}
              style={styles.picker}
            >
              {Array.from({ length: 51 }, (_, i) => i + 30).map((value) => (
                <Picker.Item key={value} label={`${value}`} value={value} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.okButton} onPress={() => setShowHeightPicker(false)}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={showWeightPicker}
        animationType="slide"
        onRequestClose={() => setShowWeightPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={weight}
              onValueChange={(itemValue) => setWeight(itemValue)}
              style={styles.picker}
            >
              {Array.from({ length: 25 }, (_, i) => i + 1).map((value) => (
                <Picker.Item key={value} label={`${value}`} value={value} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.okButton} onPress={() => setShowWeightPicker(false)}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  nameContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  okButton: {
    marginTop: 25,
    borderRadius: 10,
    padding: 1,
    backgroundColor: '#ddd',
    borderColor: '#007BFF',
    borderWidth: 2,
  },
  okButtonText: {
    color: '#007BFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  nameView: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  infoLabel: {
    fontSize: 18,
    color: '#333',
  },
  pickerLabel: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  picker: {
    width: 300,
    height: 200,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  recordItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    width: 100,
    height: '100%',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  editButton: {
    marginRight: 15,
  },
  editButtonText: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default ProfileScreen;
