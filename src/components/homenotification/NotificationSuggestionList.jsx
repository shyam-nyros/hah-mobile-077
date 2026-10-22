import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import tw from 'twrnc';

import NotificationSuggestionListItem from './NotificationSuggestionListItem';
import LoadingSpinner from '../LoadingSpinner';
import {useSuggestedForYouAPIQuery} from '../../features/home/homeApiSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const NotificationSuggestionList = () => {
  const {
    data: suggestionList,
    isLoading: suggestionListLoading,
    isError: suggestionListError,
  } = useSuggestedForYouAPIQuery();



  const renderShimmerPlaceholder = () => (
    <View style={tw`flex-row items-center gap-4 mb-4`}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={tw`w-12 h-12 rounded-full`}
      />
      <View>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-[75%] h-4 mb-2 rounded-md`}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-[50%] h-4 rounded-md`}
        />
      </View>
    </View>
  );

  return (
    <>
      <View style={tw`h-[1px] bg-gray`} />

      <ScrollView style={tw`flex-1 bg-white`}>
        {suggestionListLoading ? (
          <View>
            {Array.from({length: 5}).map((_, index) => (
              <View key={index}>{renderShimmerPlaceholder()}</View>
            ))}
          </View>
        ) : suggestionListError ? (
          <View style={tw`flex-1 text-[#040641] justify-center items-center`}>
            <Text>No Suggestions</Text>
          </View>
        ) : (
          // <View style={tw`h-[50%] flex-1  bg-white p-4`}>
          //   {suggestionList?.length > 0 && (
          //     <Text style={tw`text-[16px] text-[#040641] font-medium mb-4`}>
          //       Suggested for you
          //     </Text>
          //   )}
          //   {suggestionList?.length > 0 &&
          //     suggestionList.map(suggestion => (
          //       <NotificationSuggestionListItem
          //         key={suggestion?._id}
          //         suggestion={suggestion}
          //       />
          //     ))}
          // </View>
          <View style={tw`h-[50%] flex-1 bg-white p-4`}>
            {suggestionList?.length > 0 && (
              <>
                <Text style={tw`text-[16px] text-[#040641] font-medium mb-4`}>
                  Suggested for you
                </Text>
                {suggestionList.map(suggestion => (
                  <NotificationSuggestionListItem
                    key={suggestion?._id}
                    suggestion={suggestion}
                  />
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default NotificationSuggestionList;
