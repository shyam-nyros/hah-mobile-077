import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';

const DeleteAccount = () => {
  const navigation = useNavigation();

  return (
    <View
      style={tw`px-3 py-[16px] w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
      <TouchableOpacity
        style={tw`flex-row items-center justify-between`}
        onPress={() => navigation.navigate('DeleteAccount')}>
        <View>
          <Text style={tw`text-[15px] text-[#040641] `}>
            Delete Account
          </Text>
        </View>
        <View>
          <Image
            source={require('../../../assets/images/darkchevronrighticon.png')}
            style={tw`w-5 h-5 mr-2`}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default DeleteAccount;
