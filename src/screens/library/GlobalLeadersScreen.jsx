import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import {useSearchGlobalLeadersAPIQuery} from '../../features/leaders/leadersApiSlice';
import useDebounce from '../../utils/customhooks/useDebounce';
import LoadingSpinner from '../../components/LoadingSpinner';
import LeaderListItem from '../../components/library/LeaderListItem';
import NavHeader from '../../navigation/NavHeader';

const GlobalLeadersScreen = () => {
  const navigation = useNavigation();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [leaderListItems, setLeaderListItems] = useState([]);
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);

  const {
    data: leaderList,
    isLoading: leaderListLoading,
    error: leaderListError,
    isFetching: leaderListFetching,
  } = useSearchGlobalLeadersAPIQuery(
    {
      page: currentPage,
      search: debouncedSearchKeyword,
    },
    {refetchOnMountOrArgChange: true},
  );

  const navigateToPreviousScreen = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  const getMoreEvents = () => {
    if (hasMore && !leaderListFetching) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleSearchInput = txt => {
    setSearchKeyword(txt);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    setLeaderListItems([]);
    setHasMore(true);
  };

  // useEffect(() => {
  //   if (!leaderListFetching && leaderList) {
  //     setLeaderListItems(prevItems => [...prevItems, ...leaderList]);
  //     setHasMore(leaderList.length > 0);
  //   }
  // }, [leaderList, leaderListFetching]);

  useEffect(() => {
    if (!leaderListFetching && leaderList) {
      if (currentPage === 1) {
        setLeaderListItems(leaderList);
      } else {
        setLeaderListItems(prevItems => {
          const existingIds = new Set(prevItems.map(item => item._id));
          const newItems = leaderList.filter(item => !existingIds.has(item._id));
          return [...prevItems, ...newItems];
        });
      }
      setHasMore(leaderList.length > 0);
    }
  }, [leaderList]);

  useEffect(() => {
    setCurrentPage(1);
    setLeaderListItems([]);
    setHasMore(false);
  }, [debouncedSearchKeyword]);

  // useEffect(() => {
  //   setCurrentPage(1);
  //   setLeaderListItems([]);
  // }, [searchKeyword]);

  const renderShimmerPlaceholder = () => (
    <View style={tw`flex-row justify-between mt-3 mb-3`}>
      {[...Array(2)].map((_, index) => (
        <View key={index} style={tw`w-[48%]`}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-full h-40 rounded-lg mb-2`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-3/4 h-4 rounded-md mb-1`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-3/4 h-4 rounded-md`}
          />
        </View>
      ))}
    </View>
  );

  if (leaderListLoading) {
    return (
      <>
        <NavHeader
          onBackPress={navigateToPreviousScreen}
          title="Global Leaders"
        />
        <View style={tw`flex-1 px-4`}>
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <View key={index}>{renderShimmerPlaceholder()}</View>
            ))}
        </View>
      </>
    );
  }
  return (
    <View style={tw`bg-white flex-1`}>
      {/* Header */}
      <NavHeader
        onBackPress={navigateToPreviousScreen}
        title="Global Leaders"
      />

      {/* Body */}
      {/* Search */}
      <View style={tw`mx-4 mb-3 rounded-[10px]`}>
        <View style={styles.inputbar}>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TextInput
              placeholder="Search"
              value={searchKeyword}
              placeholderTextColor="rgba(4, 6, 65, 0.7)"
              style={tw` text-[15px] flex-1 h-full text-black`}
              onChangeText={handleSearchInput}
            />
            <View style={tw`flex-row gap-3 justify-center items-center`}>
              {searchKeyword && (
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
                style={tw` ${searchKeyword ? '' : ''} w-7 h-7`}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Leaders cards */}
      {leaderListFetching && <LoadingSpinner />}
      {!leaderListFetching && leaderListItems.length === 0 && (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>No leaders</Text>
        </View>
      )}
      {leaderListItems.length > 0 && (
        <FlatList
          data={leaderListItems}
          renderItem={({item}) => <LeaderListItem leaderInfo={item} />}
          keyExtractor={item => item._id}
          horizontal={false}
          numColumns={2}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={tw`justify-between`}
          onEndReached={getMoreEvents}
          onEndReachedThreshold={0.1}
          style={tw`flex-1 mx-4`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 46,
    backgroundColor: 'rgba(139, 192, 220, 0.4)',
    borderRadius: 50,
    marginTop: 24,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});

export default GlobalLeadersScreen;
