import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
  TextInput,
  Linking,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import LoadingSpinner from '../../components/LoadingSpinner';
import useDebounce from '../../utils/customhooks/useDebounce';
import {
  useGiveCategoriesAPIQuery,
  useGiveProjectsByCategoryQuery,
} from '../../features/give/giveApiSlice';
import NavHeaders from '../../components/navheaders/NavHeaders';
import GiveListItem from '../../components/give/GiveListItem';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const GiveScreen = ({navigation}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [giveCategoriesList, setGiveCategoriesList] = useState([]);
  const [refreshingGive, setRefreshingGive] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);

  const {
    data: categoriesList,
    isLoading: categoriesListLoading,
    isFetching: categoriesListError,
  } = useGiveCategoriesAPIQuery();

  const {
    data: giveList,
    isLoading: giveListLoading,
    isFetching: giveListFetching,
    isError: giveListError,
  } = useGiveProjectsByCategoryQuery({
    category: selectedCategory,
    page: currentPage,
    search: debouncedSearchKeyword,
  });

  const openLinkInBrowser = donateLinkUrl => {
    Linking.openURL(donateLinkUrl).catch(err =>
      console.error('Error opening link:', err),
    );
  };

  const handleSearchInput = txt => {
    setSearchKeyword(txt);
  };

  const handleEndReached = () => {
    if (giveList?.hasMore && !giveListFetching) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleCategoryChange = category => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setRefreshingGive(true);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!giveListFetching) {
      setRefreshingGive(false);
    }
  }, [giveListFetching, giveList, giveListError, refreshingGive]);

  // add all category to the category list
  useEffect(() => {
    if (!categoriesListLoading && categoriesList) {
      setGiveCategoriesList([{name: 'All', _id: 'all'}, ...categoriesList]);
    }
  }, [categoriesList, categoriesListLoading]);

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6] `}>
        <NavHeaders title={'Give'} showHomeButton />
      </SafeAreaView>

      {/* Search */}
      <View style={tw`mx-4`}>
        <View style={styles.searchbar}>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 16,
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
                source={require('../../assets/images/searchicon2.png')}
                style={tw` w-7 h-7 ${searchKeyword.length ? ' ' : ''}`}
              />
            </View>
          </View>
        </View>
      </View>

      {/* label for categories */}
      <View style={tw`mx-4 `}>
        {categoriesListLoading && (
          <ShimmerPlaceholder
            style={tw`h-6 w-20 m-2 rounded-full`}
            LinearGradient={LinearGradient}
          />
        )}
        <ScrollView horizontal={true}>
          {!categoriesListLoading &&
            categoriesList &&
            categoriesList?.length > 0 && (
              <View style={tw`flex-row justify-center items-center gap-2 py-4`}>
                {giveCategoriesList.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleCategoryChange(category._id)}
                    style={tw`p-[8px] flex-row border-[1px] ${
                      category?._id === selectedCategory
                        ? 'bg-[#0077B6]'
                        : 'border-[#0077B6]'
                    } rounded-full`}>
                    <Text
                      style={tw`text-white text-[14px] md:text-[16px] lg:text-[16px] ${
                        category?._id === selectedCategory
                          ? 'font-medium'
                          : 'text-[#0077B6] font-medium'
                      } px-2`}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
        </ScrollView>
      </View>

      {/* banner */}
      <View style={tw`mx-4 mt-4 mb-8 relative`}>
        <Image
          source={require('../../assets/images/givebanner.png')}
          style={tw`w-full h-30 rounded-[10px]`}
        />
        <View style={tw`absolute inset-0 justify-center items-center`}>
          <View style={tw`text-center`}>
            <Text
              style={tw`text-[#040641] text-center text-[15px] md:text-[16px] lg:text-[16px] font-medium`}>
              Give Project
            </Text>
            <Text
              style={tw`text-[#040641] text-center text-[10px] md:text-[12px] lg:text-[12px] w-60 italic mt-2`}>
              Make a difference in someone's life by supporting projects from
              Christian non-profits around the world.
            </Text>
          </View>
        </View>
      </View>

      {/* give list  */}
      {giveListLoading ? (
        <FlatList
          data={Array(5).fill({})}
          renderItem={() => (
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`w-full h-30 m-2 rounded-lg`}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : giveListError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          Failed to load give projects
        </View>
      ) : (
        <>
          {giveListFetching && currentPage === 1 && (
            <FlatList
              data={Array(5).fill({})}
              renderItem={() => (
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={tw`w-full h-30 m-2 rounded-lg`}
                />
              )}
              keyExtractor={(_, index) => index.toString()}
            />
          )}
          <FlatList
            data={giveList?.list}
            renderItem={({item, index}) => (
              <GiveListItem item={item} index={index} />
            )}
            keyExtractor={item => item._id}
            horizontal={false}
            numColumns={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            refreshing={refreshingGive}
            onEndReached={handleEndReached}
            onRefresh={handleRefresh}
            onEndReachedThreshold={0.1}
            style={tw`flex-1 bg-white`}
            contentContainerStyle={{paddingBottom: 20}}
            ListFooterComponent={
              <View>
                {!giveListFetching && giveList?.list?.length === 0 && (
                  <Text style={tw`text-center text-black`}>
                    No give projects
                  </Text>
                )}
                {giveListFetching && currentPage > 1 && (
                  <View style={{marginBottom: 60}}>
                    <LoadingSpinner color="blue" size="small" />
                  </View>
                )}
                {!giveList?.hasMore &&
                  !giveListFetching &&
                  giveList?.list?.length > 0 && (
                    <Text
                      style={tw`text-center text-gray-500  mt-4 mb-4
                    `}>
                      No more projects to load
                    </Text>
                  )}
              </View>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 38,
    backgroundColor: '#fff',
    borderRadius: 100,
    marginTop: 16,
    justifyContent: 'center',
  },
  searchbar: {
    width: '100%',
    height: 46,
    backgroundColor: 'rgba(0, 180, 216, 0.4)',
    borderRadius: 50,
    marginTop: 24,
    justifyContent: 'center',
  },
});

export default GiveScreen;
