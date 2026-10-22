import React from 'react';
import LoadingSpinner from '../../LoadingSpinner';
import {Text, View} from 'react-native';
import tw from 'twrnc';
import GroupSuggestionItem from './GroupSuggestionItem';
import {useSuggestedGroupsAPIQuery} from '../../../features/chat/groupChat';
import {useSelector} from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const GroupSuggestions = () => {
  const {personalConversationList, groupConversationList} = useSelector(
    state => state.message,
  );

  const {
    data: suggestedGroups,
    isLoading: suggestedGroupsLoading,
    isFetching: suggestedGroupsFetching,
    isError: suggestedGroupsError,
  } = useSuggestedGroupsAPIQuery();

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
      {/* when the group inbox is zero and suggestion length is greater than zer then show the title */}
      {/* for groups the title is already shown in group inbox compoenent */}
      {/* to avoid 2 times this condition is needed */}
      {groupConversationList?.length === 0 && suggestedGroups?.length > 0 && (
        <View style={tw`mx-4 mt-3 flex-1 -z-100`}>
          <Text style={tw`text-[#040641] text-[18px] font-medium mb-3`}>
            Groups
          </Text>
        </View>
      )}
      {suggestedGroupsLoading || suggestedGroupsFetching ? (
        <View>
          {Array.from({length: 2}).map((_, index) => (
            <View key={index}>{renderShimmerPlaceholder()}</View>
          ))}
        </View>
      ) : suggestedGroupsError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>Failed to load suggested groups</Text>
        </View>
      ) : (
        <>
          {suggestedGroups.length > 0 && (
            <View>
              {suggestedGroups.map((item, index) => (
                <GroupSuggestionItem groupInfo={item} key={item?._id} />
              ))}
            </View>
          )}
        </>
      )}
    </>
  );
};

export default GroupSuggestions;
