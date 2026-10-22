import React from 'react';
import {TouchableOpacity, View, Image} from 'react-native';
import tw from 'twrnc';

// Reusable ArrowButton Component
export const ArrowButton = ({direction, onPress, style}) => (
  <TouchableOpacity
    style={{
      position: 'absolute',
      [direction]: 10, // 'left' or 'right'
      transform: [{translateY: -20}],
      padding: 10,
      borderRadius: 30,
      ...style, // Add custom styles if needed
    }}
    onPress={onPress}>
    {direction === 'left' ? (
      <View style={tw`absolute top-[25px] left-[-4px]`}>
        <Image
          source={require('../../assets/images/chevronrighticon.png')}
          style={[tw`w-8 h-8`, {transform: [{rotate: '180deg'}]}]}
        />
      </View>
    ) : (
      <View style={tw`absolute top-[25px] right-[4px]`}>
        <Image
          source={require('../../assets/images/chevronrighticon.png')}
          style={tw`w-8 h-8`}
        />
      </View>
    )}
  </TouchableOpacity>
);

// Reusable Navigation Logic (For Next/Previous buttons)
export const handleArrowNavigation = (
  direction,
  currentSlideIndex,
  setCurrentSlideIndex,
  flatListRef,
  slides,
  handleScrollTo,
) => {
  let newIndex = currentSlideIndex + direction;

  if (newIndex >= 0 && newIndex < slides.length) {
    setCurrentSlideIndex(newIndex);
    handleScrollTo(newIndex);
  }
};
