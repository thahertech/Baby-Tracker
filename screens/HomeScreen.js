import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CardComponent from '../components/CardComponent';

export default function HomeScreen({ navigation }) {
  return (
    
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      
        <CardComponent
          title="Track Feeding"
          icon="food-apple"
          onPress={() => navigation.navigate('Feeding')}
        />

        <CardComponent
          title="Track Sleep"
          icon="bed"
          onPress={() => navigation.navigate('Sleep')}
        />

        <CardComponent
        title="Sleep Records"
        icon="history"
        onPress={() => navigation.navigate('SleepRecords')}
        />

          <CardComponent
        title="Records"
        icon="history"
        onPress={() => navigation.navigate('Records')}
        />
                  <CardComponent
        title="Baby Records"
        icon="history"
        onPress={() => navigation.navigate('BabyRecords')}
        />

<CardComponent
          title="Profile"
          icon="human"
          onPress={() => navigation.navigate('Profile')}
        />
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
});
