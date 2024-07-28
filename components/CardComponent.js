import React from 'react';
import { Card, IconButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';

const CardComponent = ({ title, icon, onPress }) => (
  <Card style={styles.card} onPress={onPress}>
    <Card.Title
      title={title}
      left={(props) => <IconButton {...props} icon={icon} color="#6200ee" />}
    />
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    elevation: 4,
  },
});

export default CardComponent;
