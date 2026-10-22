import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const {width} = Dimensions.get('screen');

const DotsPagination = ({data, scrollX, scrollToIndex}) => {
  const handleDotPress = idx => {
    if (typeof scrollToIndex === 'function') {
      scrollToIndex(idx);
    }
  };

  return (
    <View style={styles.container}>
      {data.map((_, idx) => {
        const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [12, 30, 12],
          extrapolate: 'clamp',
        });
        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: ['#ccc', '#040641', '#ccc'],
          extrapolate: 'clamp',
        });

        return (
          <TouchableOpacity
            key={idx.toString()}
            onPress={() => handleDotPress(idx)}>
            <Animated.View
              style={[styles.dot, {width: dotWidth, backgroundColor}]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default DotsPagination;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -15,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    width: 2,
    borderRadius: 60,
    marginHorizontal: 3,
    backgroundColor: '#0077B6',
  },
  dotActive: {
    backgroundColor: '#0077B6',
  },
});
