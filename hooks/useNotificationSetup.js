import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const useNotificationSetup = () => {
  useEffect(() => {
    const getPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission required', 'You need to grant notification permissions to use this feature.');
        return;
      }
      // Register the device for push notifications
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Notification token:', token);
    };

    getPermissions();
  }, []);
};

export default useNotificationSetup;
