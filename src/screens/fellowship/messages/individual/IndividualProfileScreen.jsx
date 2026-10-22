import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import tw from 'twrnc';
import {
  useIndividualProfileDetailsQuery,
  useFollowUserAPIMutation,
  useUnFollowUserAPIMutation,
} from '../../../../features/messages/messageApiSlice';
import {useFocusEffect} from '@react-navigation/native';
import ConnectionStatusInfo from '../../../../components/messages/individualchat/profile/ConnectionStatusInfo';

const IndividualProfileScreen = ({navigation, route}) => {
  const {userId} = route.params;

  const {data, isLoading, isError, refetch} = useIndividualProfileDetailsQuery(
    userId,
    {
      // Skip caching to ensure fresh data
      refetchOnMountOrArgChange: true,
    },
  );

  const [isFollowing, setIsFollowing] = useState(false);

  const [followUserAPI, {isLoading: followUserLoading}] =
    useFollowUserAPIMutation();
  const [unFollowUserAPI, {isLoading: unFollowUserLoading}] =
    useUnFollowUserAPIMutation();

  // Use useFocusEffect to refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // This will run when the screen comes into focus
      
      refetch();
      return () => {
        // This will run when the screen loses focus
        
      };
    }, [refetch]),
  );

  // Update isFollowing state when data changes
  useFocusEffect(
    useCallback(() => {
      if (data) {
        setIsFollowing(data.isFollowing);
      }
    }, [data]),
  );

  const handleFollowUser = async () => {
    try {
      await followUserAPI({recipientId: userId}).unwrap();
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnFollowUser = async () => {
    try {
      await unFollowUserAPI({recipientId: userId}).unwrap();
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const isConnectionButtonLoading =
    followUserLoading || unFollowUserLoading || isLoading;

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`bg-[#fff]`}>
        <View style={tw`mx-2 flex-row items-center justify-between`}>
          <TouchableOpacity onPress={navigateToPreviousScreen}>
            <View style={tw`flex-row gap-2 py-4 items-center`}>
              <Image
                source={require('../../../../assets/images/backnavicon.png')}
                style={tw`w-[36px] h-[36px]`}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={tw`px-4 pb-4`} style={tw`flex-1`}>
        {isLoading ? (
          <View style={tw`items-center mt-10`}>
            {/* Profile Image */}
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`w-24 h-24 rounded-full`}
            />
            {/* Name */}
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`w-[60%] h-6 mt-4 rounded-md`}
            />
            {/* About Section */}
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`w-[90%] h-16 mt-6 rounded-[15px]`}
            />
            {/* Common Groups */}
            <View style={tw`w-full mt-5`}>
              {[1, 2, 3].map(index => (
                <View key={index} style={tw`flex-row items-center gap-3 mt-3`}>
                  <ShimmerPlaceholder
                    LinearGradient={LinearGradient}
                    style={tw`w-10 h-10 rounded-full`}
                  />
                  <ShimmerPlaceholder
                    LinearGradient={LinearGradient}
                    style={tw`flex-1 h-5 rounded-md`}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : isError ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`text-gray-500`}>Failed to load profile</Text>
            <TouchableOpacity
              style={tw`mt-4 p-3 bg-[#0077B6] rounded-lg`}
              onPress={refetch}>
              <Text style={tw`text-white font-medium`}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Profile Section */}
            <View style={tw`items-center mt-10`}>
              <View style={tw`w-24 h-24 rounded-full`}>
                <Image
                  source={
                    data?.profile_image
                      ? {uri: data.profile_image}
                      : require('../../../../assets/images/placeholder.png')
                  }
                  style={tw`w-19 h-19 rounded-full`}
                  resizeMode="cover"
                />
              </View>
              <Text style={tw`text-[20px] text-[#040641] font-medium mt-2`}>
                {`${data?.first_name} ${data?.last_name}`}
              </Text>
            </View>

            {/* Connection Button */}
            {/* <TouchableOpacity
              style={tw`px-2 py-2 mx-10 rounded-[18px] mt-4 border-[1px] border-[#0077B6] items-center justify-center flex-row`}
              onPress={isFollowing ? handleUnFollowUser : handleFollowUser}
              disabled={isConnectionButtonLoading}>
              {isConnectionButtonLoading ? (
                <ActivityIndicator size="small" color="#0077B6" />
              ) : (
                <Text style={tw`text-[#0077B6] text-[14px]`}>
                  {isFollowing ? 'Remove Connection' : 'Connect'}
                </Text>
              )}
            </TouchableOpacity> */}
            <ConnectionStatusInfo oppositeUserId={userId} />

            {/* About Section */}
            <View>
              <Text style={tw`text-[16px] text-[#040641] font-medium mt-5`}>
                About
              </Text>
              <View
                style={tw`bg-[#040641] bg-opacity-6 mt-3 p-4 rounded-[15px]`}>
                <Text style={tw`text-[14px] text-[#040641] opacity-70`}>
                  {data?.about?.length > 0
                    ? data.about
                    : `Hey there, I am ${data?.first_name}`}
                </Text>
              </View>
            </View>

            {/* Groups in Common */}
            <View>
              {data?.common_groups && data?.common_groups.length > 0 && (
                <Text style={tw`text-[16px] text-[#040641] font-medium mt-5`}>
                  {data?.common_groups.length} Group(s) in common
                </Text>
              )}
              {data?.common_groups &&
                data?.common_groups.map(item => (
                  <View
                    key={item._id}
                    style={tw`flex-row bg-[#040641] items-center gap-2 bg-opacity-6 mt-3 p-4 rounded-[15px]`}>
                    <Image
                      source={
                        item?.groupPicture
                          ? {uri: item.groupPicture}
                          : require('../../../../assets/images/placeholder.png')
                      }
                      style={tw`w-10 h-10 rounded-full`}
                    />
                    <Text
                      style={tw`text-[15px] text-[#0077B6] flex-wrap flex-1 font-medium`}>
                      {item.groupName}
                    </Text>
                  </View>
                ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default IndividualProfileScreen;
