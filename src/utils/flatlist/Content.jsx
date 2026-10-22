import React, {useRef, useState} from 'react';
import {View, Text, FlatList, Dimensions, Animated} from 'react-native';
import {ArrowButton, handleArrowNavigation} from './SliderComponent';

const {height, width} = Dimensions.get('window');

export default function SlideScreen() {
  const [slides] = useState([1, 2, 3, 4, 5]); // Placeholder slide data
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef();

  const handleScrollTo = index => {
    flatListRef.current.scrollToOffset({ offset: index * (width - 50), animated: true });
  };

  const onScroll = e => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / (width - 50));
    setCurrentSlideIndex(newIndex);
  };

  const renderItem = ({item}) => (
    <Animated.View
      style={{
        width: width - 34,
        height: height / 2,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          width: '90%',
          height: '90%',
          backgroundColor: '#0077B6',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{color: 'white', fontSize: 48}}>{item}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={{height: height / 2, justifyContent: 'center'}}>
        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={renderItem}
        />

        {/* Left Arrow - Only show if not on the first slide */}
        {currentSlideIndex > 0 && (
          <ArrowButton
            direction="left"
            style={{top: '42%'}}
            onPress={() =>
              handleArrowNavigation(
                -1,
                currentSlideIndex,
                setCurrentSlideIndex,
                flatListRef,
                slides,
                handleScrollTo // Pass handleScrollTo here
              )
            }
          />
        )}

        {/* Right Arrow - Only show if not on the last slide */}
        {currentSlideIndex < slides.length - 1 && (
          <ArrowButton
            direction="right"
            style={{top: '42%'}}
            onPress={() =>
              handleArrowNavigation(
                1,
                currentSlideIndex,
                setCurrentSlideIndex,
                flatListRef,
                slides,
                handleScrollTo // Pass handleScrollTo here
              )
            }
          />
        )}
      </View>
    </View>
  );
}
