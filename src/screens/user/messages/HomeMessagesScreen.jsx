import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';

import PersonalInbox from '../../../components/messages/individualchat/PersonalInbox';
import GroupInbox from '../../../components/messages/individualchat/GroupInbox';
import {useSelector} from 'react-redux';

const HomeMessagesScreen = ({navigation}) => {
  const {personalConversationList, groupConversationList} = useSelector(
    state => state.message,
  );

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  return (
    <>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={navigateToPreviousScreen}>
          <View style={tw`mx-2 flex-row  py-4 items-center`}>
            <View>
              <Image
                source={require('../../../assets/images/chevronlefticon.png')}
                style={tw`w-[26px] h-[26px]`}
              />
            </View>
            <Text style={tw`text-xl text-[#fff] font-medium`}>Messages</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        style={tw`-z-100 flex-1`}
        showsVerticalScrollIndicator={true}
        indicatorStyle="#99E1EF">
        <View style={tw`-z-100 flex-1`}>
          {/* Personal */}
          <PersonalInbox />
          {/* Groups */}
          <GroupInbox />
          {/* when both personal and groups are zero */}
          {personalConversationList?.length === 0 &&
            groupConversationList?.length === 0 && (
              <View
                style={tw`mx-4 mt-[80%] justify-center items-center -z-100`}>
                <Text style={tw`text-[#040641] text-[14px] mb-3`}>
                  No personal or group messages
                </Text>
              </View>
            )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(139, 192, 220, 0.4)',
    borderRadius: 50,
    marginTop: 24,
    justifyContent: 'center',
  },
});

export default HomeMessagesScreen;
