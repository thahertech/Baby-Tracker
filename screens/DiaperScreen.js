import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { Appbar, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiaperScreen() {
  const [diaperLog, setDiaperLog] = useState('');
  const [visible, setVisible] = useState(false);

  const logDiaperChange = () => {
    setVisible(true);
    // Logic to save diaper change log
  };

  const onDismissSnackBar = () => setVisible(false);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction />
        <Appbar.Content title="Log Diaper Change" />
      </Appbar.Header>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Enter diaper change details"
          onChangeText={setDiaperLog}
        />
        <Button title="Log Diaper Change" onPress={logDiaperChange} />
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Close',
            onPress: () => {},
          }}>
          Diaper change logged successfully!
        </Snackbar>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
});
