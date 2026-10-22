import React from 'react';
import {useSelector} from 'react-redux';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';

const GiveTab = () => {
  const navigation = useNavigation();
  const {liveChurchDetails} = useSelector(state => state.livechurch);

  const handleGiveDetails = giveProjectId => {
    navigation.navigate('GiveDetails', {giveProjectId});
  };

  const openLinkInBrowser = donateLinkUrl => {
    Linking.openURL(donateLinkUrl).catch(err =>
      console.error('Error opening link:', err),
    );
  };

  return (
    <ScrollView style={tw`bg-white`}>
      {liveChurchDetails?.liveChurch?.give_projects?.map((item, index) => (
        <TouchableOpacity
          onPress={() => handleGiveDetails(item._id)}
          key={item._id}
          style={tw`py-4 ${
            index % 2 === 0 ? 'bg-[#B2E9F3]' : 'bg-[#66D2E8]'
          } `}>
          <View style={tw`mx-4`}>
            <TouchableOpacity onPress={() => handleGiveDetails(item._id)}>
              <Text style={tw`text-[15px] text-[#040641] mb-2 font-semibold`}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <Text style={tw`text-[13px] text-[#040641] opacity-70 font-medium`}>
              {item.description}
            </Text>
            <View style={tw`items-end mt-2`}>
              <TouchableOpacity
                style={tw`flex-row gap-2 justify-center items-center bg-white p-2 rounded-full`}>
                <TouchableOpacity
                  onPress={() => openLinkInBrowser(item.donation_link)}>
                  <Text style={tw`text-[15px] text-[#040641] font-medium`}>
                    Give to this project
                  </Text>
                </TouchableOpacity>
                <Image
                  source={require('../../assets/images/heartdarkicon.png')}
                  style={tw`w-5 h-5`}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      {liveChurchDetails?.liveChurch?.give_projects?.length === 0 && (
        <View style={tw`flex justify-center items-center mt-6`}>
          <Text style={tw`text-[14px] text-[#040641]`}>No Give project!</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default GiveTab;
