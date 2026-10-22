import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
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

const IndividualProfileScreen = ({navigation, route}) => {
  const {userId} = route.params;

  const {data, isLoading, isError, refetch} =
    useIndividualProfileDetailsQuery(userId);


  const [isFollowing, setIsFollowing] = useState(data?.isFollowing);

  const [
    followUserAPI,
    {isLoading: followUserLoading, isError: followUserError},
  ] = useFollowUserAPIMutation();
  const [
    unFollowUserAPI,
    {isLoading: unFollowUserLoading, isError: unFollowUserError},
  ] = useUnFollowUserAPIMutation();

  const handleFollowUser = async () => {
    try {
      setIsFollowing(true);
      await followUserAPI({recipientId: userId}).unwrap();
    } catch (error) {
      console.error(error);
      // setIsFollowing(false);
    }
  };

  const handleUnFollowUser = async () => {
    try {
      setIsFollowing(false);
      await unFollowUserAPI({recipientId: userId}).unwrap();
    } catch (error) {
      console.error(error);
      // setIsFollowing(true);
    }
  };

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (data) {
      refetch();
      setIsFollowing(data.isFollowing);
    }
  }, [data, isLoading]);

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
            <TouchableOpacity
              style={tw`px-2 py-2 mx-10 rounded-[18px] mt-4 border-[1px] border-[#0077B6] items-center justify-center`}
              disabled={followUserLoading || unFollowUserLoading}>
              {isFollowing ? (
                <TouchableOpacity onPress={handleUnFollowUser}>
                  <Text style={tw`text-[#0077B6] text-[14px]`}>
                    Remove Connection
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleFollowUser}>
                  <Text style={tw`text-[#0077B6] text-[14px]`}>Connect</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

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
