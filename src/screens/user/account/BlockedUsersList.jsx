import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useGetBlockedUsersListQuery} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';
import BlockedUserListItem from '../../../components/user/account/BlockedUserListItem';
import tw from 'twrnc';

const BlockedUsersList = ({navigation}) => {
  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const {
    data: blockedUsersList,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetBlockedUsersListQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();

      return () => {};
    }, [refetch]),
  );

  //   reload on unblock
  const handleUnblockSuccess = () => {
    refetch();
  };

  return (
    <View style={tw`bg-white flex-1`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity
          style={tw`mx-2 flex-row py-4 items-center`}
          onPress={navigateToPreviousScreen}>
          <Image
            source={require('../../../assets/images/chevronlefticon.png')}
            style={tw`w-[26px] h-[26px]`}
          />
          <Text style={tw`text-xl text-white font-medium ml-2`}>
            Blocked Users
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Body */}
      {isLoading || isFetching ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <LoadingSpinner />
        </View>
      ) : isError ? (
        <Text style={tw`text-red-500 text-center mt-10`}>
          Failed to load blocked users.
        </Text>
      ) : (
        <ScrollView style={tw`p-4`}>
          {blockedUsersList?.length === 0 ? (
            <Text style={tw`text-center text-gray-500 mt-10`}>
              No blocked users.
            </Text>
          ) : (
            blockedUsersList.map(user => (
              <BlockedUserListItem
                key={user._id}
                user={user}
                onUnblockSuccess={handleUnblockSuccess}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default BlockedUsersList;
