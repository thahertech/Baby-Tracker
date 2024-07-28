import React from 'react';
import { Button} from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import SleepScreen from '../screens/SleepScreen';
import FeedingScreen from '../screens/FeedingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SleepRecordsScreen from '../screens/SleepRecordsScreen';
import RecordsScreen from '../screens/RecordsScreen';
import BabyRecords from '../screens/BabyRecords';


const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#f8f9fa' }, // Custom header background color
          headerTintColor: '#333', // Custom header text color
          headerTitleStyle: { fontWeight: 'bold' }, // Custom header title style
        }}
      >
        <Stack.Screen 
          name="Home"
          component={HomeScreen} 
          options={{ title: 'Baby Tracker' }} 
        />
        <Stack.Screen 
          name="Sleep" 
          component={SleepScreen} 
          options={{ title: 'Sleep Tracker' }} 
        />
   <Stack.Screen
          name="Feeding"
          component={FeedingScreen}
          options={{
            title: 'Log Feeding',
            headerRight: () => (
              <Button
                onPress={() => {}}
                title="🍏" // Apple icon or use a custom icon
                color="#007BFF"
              />
            ),
          }}
        />

                    <Stack.Screen name="SleepRecords" 
            component={SleepRecordsScreen}
            options={{ title: 'Sleep Records' }} 
        />
                    <Stack.Screen name="Records" 
            component={RecordsScreen}
            options={{ title: 'Records' }} 
        />
                            {/* <Stack.Screen name="BabyRecords" 
            component={BabyRecords}
            options={{ title: 'History' }} 
        /> */}
        
            <Stack.Screen name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }} 
        />



      </Stack.Navigator>
    </NavigationContainer>
  );
}
