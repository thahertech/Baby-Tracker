import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CardComponent from '../components/CardComponent';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/BG.jpg')}
        style={styles.backgroundImage}
      >
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
            title="Records"
            icon="history"
            onPress={() => navigation.navigate('Records')}
          />

          <CardComponent
            title="Profile"
            icon="human"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'stretch',
    height: 900,
    
  },
  content: {
    flex: 1,
    padding: 16,
    width:300,
    alignSelf:'center',
    marginTop: '10%',
  },
});
