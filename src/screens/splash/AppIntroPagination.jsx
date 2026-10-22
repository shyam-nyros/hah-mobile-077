import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import tw from 'twrnc';

const {width} = Dimensions.get('screen');

const AppIntroPagination = ({data, scrollX, scrollToIndex}) => {
  
  const handleDotPress = idx => {
    if (typeof scrollToIndex === 'function') {
      scrollToIndex(idx);
    }
  };

  return (
    <View style={styles.container}>
      {data.map((item, idx) => {
        const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [12, 30, 12],
          extrapolate: 'clamp',
        });
        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: ['#ccc', '#000', '#ccc'],
          extrapolate: 'clamp',
        });

        return (
          <View key={item.id}>
            <TouchableOpacity onPress={() => handleDotPress(idx)}>
              <Animated.View
                style={[
                  tw`w-2 h-2 bg-[#D9D9D9] rounded-full m-1`,
                  {width: dotWidth, backgroundColor},
                ]}
              />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export default AppIntroPagination;

const styles = StyleSheet.create({
  container: {
    position: 'static',
    bottom: 190,
    flexDirection: 'row',
    width: '100%',
    height:10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 60,
    marginHorizontal: 3,
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: '#000',
  },
});
