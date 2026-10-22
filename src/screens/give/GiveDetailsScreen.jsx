import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import LoadingSpinner from '../../components/LoadingSpinner';
import {useGiveProjectDetailsAPIQuery} from '../../features/give/giveApiSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

const GiveDetailsScreen = ({navigation, route}) => {
  const {giveProjectId} = route.params;

  const {
    data: giveProjectDetails,
    isLoading,
    error,
  } = useGiveProjectDetailsAPIQuery(giveProjectId, {
    refetchOnMountOrArgChange: true,
  });

  const navigateToPreviousScreen = () => navigation.goBack();

  const concatAddress = item =>
    item.church
      ? `${item.church.address}, ${item.church.city}, ${item.church.state}, ${item.church.country}`
      : item.organization
      ? `${item.organization.city}, ${item.organization.state}, ${item.organization.country}`
      : 'No address available';

  const openLinkInBrowser = url => {
    Linking.openURL(url).catch(err =>
      console.error('Error opening link:', err),
    );
  };

  if (isLoading) {
    return (
      <View style={tw`mx-4 mt-4`}>
        <ShimmerPlaceholder style={tw`h-8 w-full mt-10 mb-4`} />
        <ShimmerPlaceholder style={tw`h-50 w-95 rounded-lg mb-4`} />
        <ShimmerPlaceholder style={tw`h-10 w-full mt-5 mb-2`} />
        <ShimmerPlaceholder style={tw`h-5 w-full mt-5 mb-2`} />
        <ShimmerPlaceholder style={tw`h-20 w-full mt-5 mb-2`} />
        <ShimmerPlaceholder style={tw`ml-25 mt-6 h-12 w-50 rounded-full`} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex items-center mt-6`}>
        <Text style={tw`text-base text-[#FF0000]`}>
          Unable to load project details. Please try again later.
        </Text>
      </View>
    );
  }

  if (!giveProjectDetails) {
    return (
      <View style={tw`flex justify-center items-center mt-6`}>
        <Text style={tw`text-[14px] text-[#040641]`}>
          No details available for this give project.
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={navigateToPreviousScreen}>
          <View style={tw`mx-2 flex-row py-4 items-center`}>
            <Image
              source={require('../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
            <Text style={tw`text-xl text-[#fff] font-medium ml-2`}>Give</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
      <ScrollView style={tw`bg-white`}>
        <View style={tw`mx-4 mt-4`}>
          <View style={tw`flex-row justify-between items-start`}>
            <Text style={tw`text-[16px] text-[#040641] font-medium flex-1`}>
              {giveProjectDetails.title}
            </Text>
            <View style={tw`p-2 rounded bg-[#040641]`}>
              <Text style={tw`text-[12px] text-[#fff] font-medium`}>
                {`Start with $${giveProjectDetails?.price?.$numberDecimal}`}
              </Text>
            </View>
          </View>

          {/* Project Image */}
          <View style={tw`mt-4 mb-4`}>
            <Image
              source={
                giveProjectDetails?.cover_image?.path
                  ? {uri: giveProjectDetails?.cover_image?.path}
                  : require('../../assets/images/imgplaceholder.png')
              }
              style={tw`w-full h-50 rounded-[10px]`}
            />
          </View>

          {/* Project Info */}
          <View>
            <View style={tw`flex-row gap-1 items-start`}>
              <Image
                source={require('../../assets/images/locationicon1.png')}
                style={tw`w-5 h-5`}
              />
              <Text style={tw`text-[14px] text-[#040641]`}>
                {giveProjectDetails.church
                  ? `${giveProjectDetails?.church?.address}, ${giveProjectDetails?.church?.state}, ${giveProjectDetails?.church?.country}`
                  : giveProjectDetails.organization
                  ? `${giveProjectDetails?.organization.city}, ${giveProjectDetails?.organization?.state}, ${giveProjectDetails?.organization?.country}`
                  : 'No address available'}
              </Text>
            </View>
            <View style={tw`mt-2 mb-4`}>
              <Text style={tw`text-[14px] text-[#040641] opacity-70`}>
                {giveProjectDetails.description}
              </Text>
            </View>
            <View style={tw`flex-row gap-1 items-center mb-4`}>
              <Image
                source={require('../../assets/images/fundsicon.png')}
                style={tw`w-5 h-5`}
              />
              <Text style={tw`text-[16px] text-[#040641] font-medium`}>
                Fundraiser
              </Text>
            </View>
            <View
              style={tw` bg-[#040641] bg-opacity-5 gap-3 rounded-[10px] p-3`}>
              <View style={tw`flex-row gap-1 items-center`}>
                <Image
                  source={require('../../assets/images/churchicon1.png')}
                  style={tw`w-5 h-5`}
                />
                <Text style={tw`text-[13px] text-[#040641] font-medium`}>
                  {giveProjectDetails?.church?.name ||
                    giveProjectDetails?.organization?.name ||
                    'No name available'}
                </Text>
              </View>
              <View style={tw`flex-row gap-1 items-center`}>
                <Image
                  source={require('../../assets/images/locationicon1.png')}
                  style={tw`w-5 h-5`}
                />
                <Text style={tw`text-[13px] text-[#040641] font-medium`}>
                  {concatAddress(giveProjectDetails)}
                </Text>
              </View>
            </View>
          </View>
          <View style={tw`items-center mt-8`}>
            <TouchableOpacity
              onPress={() =>
                openLinkInBrowser(giveProjectDetails.donation_link)
              }
              style={tw`flex-row gap-2 mb-10 justify-center items-center bg-white p-2 rounded-full border-[1.5px] border-[#040641]`}>
              <Text style={tw`text-[15px] text-[#040641] font-medium`}>
                Give to this project
              </Text>
              <Image
                source={require('../../assets/images/heartdarkicon.png')}
                style={tw`w-5 h-5`}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default GiveDetailsScreen;
