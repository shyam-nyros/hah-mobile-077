import {View, ActivityIndicator, StyleSheet} from 'react-native';
import React from 'react'

const SmallLoadingSpiner = ({color}) => {
  return (
    <View style={[styles.container, styles.horizontal, styles.overlay]}>
      <ActivityIndicator size="small" color={color || "blue"} />
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      zIndex: 100, 
    },
  });

export default SmallLoadingSpiner