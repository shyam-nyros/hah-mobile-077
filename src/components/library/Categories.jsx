import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useLibraryCategoriesAPIQuery} from '../../features/library/libraryApiSlice';
import tw from 'twrnc';
import CategoryItem from './CategoriesListItems';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';

const Categories = () => {
  const navigation = useNavigation();
  const {interestedContent} = useSelector(state => state.auth);
  const {reloadFlagForBlockUser} = useSelector(state => state.feed);

  const {
    data: libraryCategoryList,
    isLoading: libraryCategoryListLoading,
    isFetching: libraryCategoryListFetching,
    error: libraryCategoryListError,
    refetch,
  } = useLibraryCategoriesAPIQuery();

  // console.log('Library Categories Data:', libraryCategoryList);

  const handleCategoryClick = categoryId => {
    navigation.navigate('LibrarySearch', {categoryId});
  };

  // Helper function to reorder categories based on the user selected interests
  const reorderCategories = () => {
    if (!libraryCategoryList) return [];
    const interestedCategoryIds = interestedContent.map(item => item._id);
    const selectedCategories = libraryCategoryList.filter(category =>
      interestedCategoryIds.includes(category.category._id),
    );
    const otherCategories = libraryCategoryList.filter(
      category => !interestedCategoryIds.includes(category.category._id),
    );
    return [...selectedCategories, ...otherCategories];
  };

  const reorderedCategories = reorderCategories();

  // when a user is blocked then reload
  useEffect(() => {
    refetch();
  }, [reloadFlagForBlockUser]);

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 gap-3 justify-between flex-row`}>
      {[...Array(3)].map((_, index) => (
        <View key={index} style={tw`h-[120px] w-[140px]`}>
          <ShimmerPlaceholder
            style={tw`h-[83px] w-[140px] rounded-[10px] mb-2`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-[16px] w-[100px] rounded-[4px] mb-1`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-[12px] w-[70px] rounded-[4px]`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
        </View>
      ))}
    </View>
  );

  return (
    <>
      {libraryCategoryListLoading ? (
        renderShimmerPlaceholder()
      ) : libraryCategoryListError ? (
        <View style={tw`flex-1 mb-2 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to load categories</Text>
        </View>
      ) : reorderedCategories?.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>No categories available</Text>
        </View>
      ) : (
        <>
          {reorderedCategories.map((categoryData, index) => (
            <CategoryItem
              key={categoryData.category._id}
              categoryData={categoryData}
              handleCategoryClick={handleCategoryClick}
            />
          ))}
        </>
      )}
    </>
  );
};

export default Categories;
