import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';

const ProfileScreen = () => {
  const [name, setName] = useState('Baby');
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
      alert('Profile saved!');
    } catch (error) {
      console.error('Failed to save record', error);
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
      if (storedRecords) {
        setRecords(JSON.parse(storedRecords));
      }
    } catch (error) {
      console.error('Failed to load records', error);
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDelete(id)}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const toggleHeightPicker = () => {
    setShowHeightPicker(!showHeightPicker);
  };

  const toggleWeightPicker = () => {
    setShowWeightPicker(!showWeightPicker);
  };

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
        <Text style={styles.label}>Name:</Text>
        {editableName ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            onBlur={() => setEditableName(false)}
            placeholder="Enter your name"
          />
        ) : (
          <View style={styles.nameView}>
            <Text style={styles.nameText}>{name}</Text>
            <TouchableOpacity onPress={() => setEditableName(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!showDetails && (
        <Button title="Show Details" onPress={() => setShowDetails(true)} />
      )}

      {showDetails && (
        <>
          <TouchableOpacity onPress={toggleHeightPicker} style={styles.pickerLabel}>
            <Text style={styles.label}>Height (cm): {height}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleWeightPicker} style={styles.pickerLabel}>
            <Text style={styles.label}>Weight (kg): {weight}</Text>
          </TouchableOpacity>
          <Button title="Save Profile" onPress={handleSave} />
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
            <Button title="OK" onPress={() => setShowHeightPicker(false)} />
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
              {Array.from({ length: 21 }, (_, i) => i + 1).map((value) => (
                <Picker.Item key={value} label={`${value}`} value={value} />
              ))}
            </Picker>
            <Button title="OK" onPress={() => setShowWeightPicker(false)} />
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
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  nameContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  nameView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    color: '#333',
    marginRight: 10,
  },
  editText: {
    color: '#007BFF',
    fontSize: 18,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  pickerLabel: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  picker: {
    height: 150,
    width: '100%',
    marginBottom: 20,
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
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    height: '100%',
    width: 80,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: 'white',
    fontFamily: 'Inter',
    fontWeight: '400',
  },
});

export default ProfileScreen;
