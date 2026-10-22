import React, {useState, useEffect, useCallback} from 'react';
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
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useLibrarySearchAPIQuery} from '../../features/library/libraryApiSlice';
import useDebounce from '../../utils/customhooks/useDebounce';
import LibraryListItem from '../../components/library/LibraryListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useGetContentListQuery} from '../../features/content/contentApiSlice';

const LibrarySearchScreen = ({route}) => {
  const navigation = useNavigation();
  const {categoryId} = route.params;

  const [selectedCategory, setSelectedCategory] = useState(
    categoryId ? categoryId : 'all',
  );

  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);

  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);

  const [refreshingLibrary, setRefreshingLibrary] = useState(false);
  const [libraryCategories, setLibraryCategories] = useState([]);

  const {
    data: libraryList,
    isLoading: libraryListLoading,
    isFetching: libraryListFetching,
    error: libraryListError,
    refetch: refetchlibraryList,
  } = useLibrarySearchAPIQuery(
    {
      filter: selectedCategory,
      subfilter: selectedSubCategory,
      page: currentPage,
      search: debouncedSearchKeyword,
    },
    {refetchOnMountOrArgChange: true},
  );

  const {
    data: contentCategories,
    isLoading: contentCategoriesLoading,
    isError: contentCategoriesError,
  } = useGetContentListQuery();

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const handleEndReached = () => {
    if (libraryList?.hasMore && !libraryListFetching) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleCategoryChange = category => {
    setSelectedCategory(category);
    //reset sub category to all when main category changes
    setSelectedSubCategory('all');
    setCurrentPage(1);
  };

  const handleSubCategoryChange = subCategory => {
    setSelectedSubCategory(subCategory);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setRefreshingLibrary(true);
  };

  const handleSearchInput = txt => {
    setCurrentPage(1);
    setSearchKeyword(txt);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!libraryListFetching) {
      setRefreshingLibrary(false);
    }
  }, [libraryListFetching, libraryList, libraryListError, refreshingLibrary]);

  useEffect(() => {
    if (!contentCategoriesLoading && contentCategories) {
      setLibraryCategories([{name: 'All', _id: 'all'}, ...contentCategories]);
    }
  }, [contentCategories, contentCategoriesLoading]);

  return (
    <>
      <View style={tw`bg-white`}>
        {/* Header */}
        <SafeAreaView style={tw`bg-[#0077B6]`}>
          <TouchableOpacity onPress={navigateToPreviousScreen}>
            <View style={tw`mx-2 flex-row py-4 items-center`}>
              <View>
                <Image
                  source={require('../../assets/images/chevronlefticon.png')}
                  style={tw`w-[26px] h-[26px]`}
                />
              </View>
              <Text style={tw`text-xl text-white font-medium ml-2`}>
                Library
              </Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Body */}

        {/* Search */}
        <View style={tw`mx-4`}>
          <View style={styles.inputbar}>
            <View style={tw`flex-row items-center`}>
              <TextInput
                placeholder="Search"
                value={searchKeyword}
                onChangeText={handleSearchInput}
                placeholderTextColor="rgba(4, 6, 65, 0.7)"
                style={tw`ml-3 text-[15px] font-medium text-black flex-1`}
              />
              {searchKeyword.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <Image
                    source={require('../../assets/images/closeicon.png')}
                    style={tw` w-7 h-7 mr-3`}
                  />
                </TouchableOpacity>
              )}
              <Image
                source={require('../../assets/images/searchicon2.png')}
                style={tw`w-7 h-7 mr-5`}
              />
            </View>
          </View>
        </View>

        {/* Labels */}
        <View style={tw`mx-4 `}>
          {contentCategoriesLoading && (
            <ShimmerPlaceholder
              style={tw`h-6 w-20 m-2 rounded-full`}
              LinearGradient={LinearGradient}
            />
          )}
          <ScrollView horizontal={true}>
            {!contentCategoriesLoading &&
              contentCategories &&
              contentCategories?.length > 0 && (
                <View
                  style={tw`flex-row justify-center items-center gap-2 py-4`}>
                  {libraryCategories.map((category, index) => (
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

          {/* Show the subcategories of the selected main category */}
          {/* <ScrollView horizontal={true}>
            {!contentCategoriesLoading && contentCategories?.length > 0 && (
              // <View style={tw`flex-row justify-center items-center gap-2 py-4`}>
              <View
                style={tw`flex-row justify-center items-center gap-2 ${
                  contentCategories?.find(
                    category => category._id === selectedCategory,
                  )?.sub_content_categories?.length > 0
                    ? 'py-4'
                    : ''
                }`}>
                {contentCategories?.find(
                  category => category._id === selectedCategory,
                )?.sub_content_categories?.length > 0 && (
                  <Text style={tw`text-[#040641] font-medium text-[14px] md:text-[16px] lg:text-[16px]`}>
                    Sub Categories
                  </Text>
                )}

                {contentCategories
                  ?.find(category => category._id === selectedCategory) // Get the selected category
                  ?.sub_content_categories?.map((subCategory, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSubCategoryChange(subCategory._id)}
                      style={tw`p-[8px] flex-row border-[1px] ${
                        subCategory?._id === selectedSubCategory
                          ? 'bg-[#0077B6]'
                          : 'border-[#0077B6]'
                      } rounded-full`}>
                      <Text
                        style={tw`text-white text-[14px] md:text-[16px] lg:text-[16px] ${
                          subCategory?._id === selectedSubCategory
                            ? 'font-medium'
                            : 'text-[#0077B6] font-medium'
                        } px-2`}>
                        {subCategory.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </ScrollView> */}
          <ScrollView horizontal={true}>
  {!contentCategoriesLoading && contentCategories?.length > 0 && (
    (() => {
      const selectedCat = contentCategories.find(
        category => category._id === selectedCategory
      );
      const subCategories = selectedCat?.sub_content_categories || [];

      return subCategories.length > 0 ? (
        <View style={tw`py-4`}>
          {/* Static Sub Categories Text */}
          <Text style={tw`text-[#040641] font-medium text-[14px] md:text-[16px] lg:text-[16px] mb-2 text-left`}>
            Sub Categories
          </Text>

          {/* Sub Categories List */}
          <View style={tw`flex-row justify-center items-center gap-2`}>
            {subCategories.map((subCategory, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSubCategoryChange(subCategory._id)}
                style={tw`p-[8px] flex-row border-[1px] ${
                  subCategory?._id === selectedSubCategory
                    ? 'bg-[#0077B6]'
                    : 'border-[#0077B6]'
                } rounded-full`}
              >
                <Text
                  style={tw`text-white text-[14px] md:text-[16px] lg:text-[16px] ${
                    subCategory?._id === selectedSubCategory
                      ? 'font-medium'
                      : 'text-[#0077B6] font-medium'
                  } px-2`}
                >
                  {subCategory.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null;
    })()
  )}
</ScrollView>

        </View>

        {/* Banner Area */}
        <View style={tw`mx-4 mt-4 mb-4`}>
          <View style={tw`justify-center items-center`}>
            <Image
              source={require('../../assets/images/librarysearchbanner.png')}
              style={tw`w-full h-34 rounded-[10px]`}
            />
            <View style={[tw`justify-center items-center absolute top-11`]}>
              <Text
                style={[
                  tw`text-white text-center font-medium`,
                  styles.textsize,
                ]}>
                Find eBooks, Videos & Audios
              </Text>
              <Text style={[tw`text-white `, styles.textbottom]}>
                Discover the latest content from leaders around the world.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Library Cards */}
      {libraryListLoading ? (
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
      ) : libraryListError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          Failed to load details
        </View>
      ) : (
        <>
          {libraryListFetching && currentPage === 1 && <LoadingSpinner />}
          <FlatList
            data={libraryList?.list}
            renderItem={({item}) => <LibraryListItem libraryInfo={item} />}
            keyExtractor={item => item._id}
            horizontal={false}
            numColumns={2}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={tw`justify-between`}
            refreshing={refreshingLibrary}
            onEndReached={handleEndReached}
            onRefresh={handleRefresh}
            onEndReachedThreshold={0.1}
            style={tw`flex-1 bg-white px-4`}
            ListFooterComponent={
              <View>
                {!libraryListFetching && libraryList?.list?.length === 0 && (
                  <Text style={tw`text-center text-black`}>
                    No Library items
                  </Text>
                )}
                {libraryListFetching && currentPage > 1 && (
                  <View style={{marginBottom: 60}}>
                    <LoadingSpinner color="blue" size="small" />
                  </View>
                )}
                {!libraryList?.hasMore &&
                  !libraryListFetching &&
                  libraryList?.list?.length > 0 && (
                    <Text style={tw`text-center text-gray-500 mb-10`}>
                      No more library to load
                    </Text>
                  )}
              </View>
            }
          />
        </>
      )}
    </>
  );
};

export default LibrarySearchScreen;

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 46,
    backgroundColor: 'rgba(139, 192, 220, 0.4)',
    borderRadius: 50,
    marginTop: 24,
    justifyContent: 'center',
  },
  textsize: {
    fontSize: hp('2.1%'),
    fontWeight: '600',
  },
  textbottom: {
    fontSize: hp('1.4%'),
    fontWeight: '600',
  },
});
