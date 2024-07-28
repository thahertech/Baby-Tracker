import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const useNotificationHandler = () => {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle the response from the notification
      Alert.alert('Notification tapped', `You tapped on a notification with id: ${response.notification.request.identifier}`);
    });

    return () => subscription.remove();
  }, []);
};

export default useNotificationHandler;
