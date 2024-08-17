import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import './BackGroundFetch'; // Import the task manager file

// Configure how notifications should be handled
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show the notification alert
    shouldPlaySound: true, // Don't play a sound with the notification
    shouldSetBadge: true, // Don't set a badge count
  }),
});

export default function App() {
  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}
