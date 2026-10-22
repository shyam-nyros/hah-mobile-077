import React, {useRef, useState, useEffect} from 'react';
import {FlatList, Animated, SafeAreaView} from 'react-native';
import DotsPagination from './DotsPagination';
import SlideItem from './SlideItem';

const ChurchesActivitySlider = ({list}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Extend the list to include two "last cards"
  const extendedList = [
    ...list,
    {id: 'last_card_1', type: 'last_card_1'},
    {id: 'last_card_2', type: 'last_card_2'},
  ];

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

  const handleScrollToIndexFailed = info => {
    flatListRef.current?.scrollToOffset({
      offset: info.averageItemLength * info.index,
      animated: true,
    });
    setTimeout(() => scrollToIndex(info.index), 100); // Retry scrolling after a short delay
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      scrollToIndex((index + 1) % extendedList.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [index]);

  return (
    <SafeAreaView>
      <FlatList
        ref={flatListRef}
        data={extendedList}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        initialScrollIndex={index}
        showsHorizontalScrollIndicator={false}
        onScroll={handleOnScroll}
        onViewableItemsChanged={handleOnItemsViewableChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({item, index}) => (
          <SlideItem
            item={item}
            index={index}
            isLast={item.type.startsWith('last_card')}
          />
        )}
        keyExtractor={(item, index) => (item.id ? item.id : index.toString())}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />

      <DotsPagination
        data={extendedList}
        scrollX={scrollX}
        index={index}
        scrollToIndex={scrollToIndex}
      />
    </SafeAreaView>
  );
};

export default ChurchesActivitySlider;
