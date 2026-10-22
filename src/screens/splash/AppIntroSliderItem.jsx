import React, {useRef, useEffect} from 'react';
import {View, Animated, Text, StyleSheet, Dimensions} from 'react-native';
import tw from 'twrnc';

const {width, height} = Dimensions.get('screen');

const AppIntroSliderItem = ({item}) => {
  const translateYImage = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.timing(translateYImage, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={item.img}
        resizeMode="cover"
        style={[styles.image, {transform: [{translateY: translateYImage}]}]}
      />
      <Text
        style={tw`text-[#040641] mt-2 text-center text-[22px] font-semibold`}>
        {item.title}
      </Text>
      <Text
        style={tw`text-[#040641] text-center text-[16px] text-opacity-75 mt-2 h-[58px]`}>
        {item.description}
      </Text>
    </View>
  );
};

export default AppIntroSliderItem;

const styles = StyleSheet.create({
  container: {
    width,
    height,
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
  },
  image: {
    width: '100%',
    height: '50%',
  },
});
