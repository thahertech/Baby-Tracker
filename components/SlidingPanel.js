// components/SlidingPanel.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { height: screenHeight } = Dimensions.get('window');

const SlidingPanel = ({ isVisible, toggleVisibility, children }) => {
  const translateY = useSharedValue(screenHeight);

  React.useEffect(() => {
    translateY.value = isVisible ? withSpring(0, { damping: 2, stiffness: 100 }) : withSpring(screenHeight, { damping: 2, stiffness: 100 });
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const onClose = () => {
    toggleVisibility();
  };

  return (
    <Animated.View style={[styles.panel, animatedStyle]}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    height: screenHeight * 0.5, // Adjust height as needed
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 18,
    color: '#007BFF',
  },
});

export default SlidingPanel;
