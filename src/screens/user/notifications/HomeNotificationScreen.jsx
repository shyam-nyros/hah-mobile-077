import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import NotificationList from '../../../components/homenotification/NotificationList';
import NotificationSuggestionList from '../../../components/homenotification/NotificationSuggestionList';

const HomeNotificationScreen = () => {
  const navigation = useNavigation();

  const navigateToPreviousScreen = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={navigateToPreviousScreen}>
        <View style={tw`mx-2 flex-row py-4 items-center`}>
          <View>
            <Image
              source={require('../../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
          </View>
          <Text style={tw`text-xl text-[#fff] font-medium`}>Notifications</Text>
        </View>
        </TouchableOpacity>
      </SafeAreaView>
      <NotificationList />
      <NotificationSuggestionList />
    </>
  );
};

export default HomeNotificationScreen;
