import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import EventListItem from '../../components/events/EventListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import {useEventsSearchAPIQuery} from '../../features/events/eventsApiSlice';
import useDebounce from '../../utils/customhooks/useDebounce';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch} from 'react-redux';
import {setSearchQuery} from '../../features/events/eventsSlice';

const eventCategories = [
  {name: 'All', code: 'all'},
  {name: 'Featured', code: 'featured'},
  {name: 'Happening Today', code: 'today'},
  {name: 'Events This Week', code: 'week'},
  {name: 'Upcoming Events', code: 'upcoming'},
];

const EventsSearchScreen = ({route}) => {
  const {eventCategory} = route.params;
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(
    eventCategory || 'all',
  );
  const [eventListItems, setEventListItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);

  // const {
  //   data: eventList,
  //   isLoading: eventListLoading,
  //   isFetching: eventListFetching,
  // } = useEventsSearchAPIQuery(
  //   {
  //     groupBy: 'featured',
  //     page: 1,
  //     search: debouncedSearchKeyword,
  //   },
  //   {refetchOnMountOrArgChange: true},
  // );
  const {
    data: eventList,
    isLoading: eventListLoading,
    isFetching: eventListFetching,
  } = useEventsSearchAPIQuery(
    {
      groupBy: selectedCategory,
      page: currentPage,
      search: debouncedSearchKeyword,
    },
    {refetchOnMountOrArgChange: true},
  );

  useEffect(() => {
    if (!eventListLoading && eventList) {
      setEventListItems(prevItems => [...prevItems, ...eventList]);
      setHasMore(eventList.length > 0);
    }
  }, [eventList, eventListLoading, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
    setEventListItems([]);
  }, [searchKeyword]);

  useEffect(() => {
    dispatch(
      setSearchQuery({
        groupBy: selectedCategory,
        page: currentPage,
        search: debouncedSearchKeyword,
      }),
    );
  }, [selectedCategory, currentPage, debouncedSearchKeyword]);

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const handleCategoryChange = category => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setEventListItems([]);
  };

  const getMoreEvents = () => {
    if (hasMore && !eventListFetching) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleSearchInput = txt => {
    setSearchKeyword(txt);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    setEventListItems([]);
    setHasMore(true);
  };

  const renderPlaceholder = () => (
    <View style={styles.placeholderWrapper}>
      {Array.from({length: 6}).map((_, index) => (
        <View key={index} style={styles.shimmerWrapper}>
          <ShimmerPlaceholder
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
            style={styles.shimmerImage}
          />
          <ShimmerPlaceholder
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
            style={styles.shimmerText}
          />
        </View>
      ))}
    </View>
  );

  return (
    <>
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={navigateToPreviousScreen}>
          <View style={tw`mx-2 flex-row py-4 items-center`}>
            <Image
              source={require('../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
            <Text style={tw`text-xl text-[#fff] font-medium`}>
              Event Search
            </Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Search */}
      <View style={tw`px-4 bg-white`}>
        <View style={styles.inputbar}>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TextInput
              value={searchKeyword}
              placeholder="Search by title"
              placeholderTextColor="rgba(4, 6, 65, 0.7)"
              onChangeText={handleSearchInput}
              style={tw` text-[15px]  flex-1 h-full text-black`}
            />
            <View style={tw`flex-row gap-3 justify-center items-center`}>
              {searchKeyword.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <Image
                    source={require('../../assets/images/closeicon.png')}
                    style={tw` w-7 h-7`}
                  />
                </TouchableOpacity>
              )}
              <Image
                // source={require('../../assets/images/filtericon.png')}
                source={require('../../assets/images/searchicon2.png')}
                style={tw` w-7 h-7 ${searchKeyword.length ? ' ' : ''}`} // Apply conditionally
              />
            </View>
          </View>
        </View>
      </View>

      <View style={tw`px-4 bg-white`}>
        <ScrollView horizontal>
          <View style={tw`flex-row justify-center items-center gap-2 py-4`}>
            {eventCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleCategoryChange(category.code)}
                style={tw`p-[8px] flex-row border-[1px] ${
                  category.code === selectedCategory
                    ? 'bg-[#0077B6]'
                    : 'border-[#0077B6]'
                } rounded-full`}>
                <Text
                  style={tw`text-[14px] px-2 ${
                    category.code === selectedCategory
                      ? 'text-white font-medium'
                      : 'text-[#0077B6] font-medium'
                  }`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {eventListFetching && eventListItems.length === 0 && renderPlaceholder()}
      {/* {  eventListItems.length > 0 && ( */}
      {eventList.length > 0 && (
        <View style={styles.container}>
          <FlatList
            data={eventList}
            // data={eventListItems}
            renderItem={({item}) => (
              <EventListItem
                showVertical={true}
                eventInfo={item}
                groupBy={selectedCategory}
                page={currentPage}
                search={debouncedSearchKeyword}
              />
            )}
            keyExtractor={item => item._id}
            numColumns={2}
            contentContainerStyle={tw`p-2`}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={tw`justify-between`}
            onEndReached={getMoreEvents}
            onEndReachedThreshold={0.5}
            ListFooterComponent={eventListFetching ? <LoadingSpinner /> : null}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 6,
    width: '100%',
    paddingTop: 5,
    backgroundColor: 'white',
  },
  inputbar: {
    width: '100%',
    height: 46,
    backgroundColor: 'rgba(139, 192, 220, 0.4)',
    borderRadius: 50,
    marginTop: 24,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  placeholderWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  shimmerWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  shimmerImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  shimmerText: {
    width: '80%',
    height: 20,
    borderRadius: 5,
  },
});

export default EventsSearchScreen;
