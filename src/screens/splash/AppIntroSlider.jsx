import React, {useRef, useState} from 'react';
import {
  FlatList,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import SlideItem from './AppIntroSliderItem';
import Pagination from './AppIntroPagination';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import slides from './appIntro';
import {setIsInstalled} from '../../features/auth/authSlice';
import {useDispatch} from 'react-redux';

const {height} = Dimensions.get('window');

const AppIntroSlider = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [index, setIndex] = useState(0);

  const handleOnScroll = event => {
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              x: scrollX,
            },
          },
        },
      ],
      {
        useNativeDriver: false,
      },
    )(event);
  };

  const handleOnItemsViewableChanged = useRef(({viewableItems}) => {
    if (
      viewableItems &&
      viewableItems.length > 0 &&
      viewableItems[0] &&
      viewableItems[0].index !== undefined
    ) {
      setIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const scrollToIndex = idx => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({animated: true, index: idx});
      setIndex(idx);
    }
  };

  const handleNextPress = () => {
    if (index < slides.length - 1) {
      scrollToIndex(index + 1);
    } else {
      dispatch(setIsInstalled());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={handleOnScroll}
        onViewableItemsChanged={handleOnItemsViewableChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({item, index}) => <SlideItem item={item} index={index} />}
        keyExtractor={(item, index) => index.toString()}
        style={styles.flatList}
        bounces={false} 
        overScrollMode="never" 
      />
      <View style={styles.paginationContainer}>
        <Pagination
          data={slides}
          scrollX={scrollX}
          scrollToIndex={scrollToIndex}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={tw`w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex justify-center items-center`}
          onPress={handleNextPress}>
          <Text style={tw`text-[#0077B6] text-[16px] font-semibold`}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`mt-5`}
          onPress={() => dispatch(setIsInstalled())}>
          <Text style={tw`text-[#040641] text-[16px] font-semibold`}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flatList: {
    flex: 1,
    width: '99.5%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
});

export default AppIntroSlider;
