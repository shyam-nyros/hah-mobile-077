import React from 'react';
import {View, Text} from 'react-native';
import tw from 'twrnc';

import {useSelector} from 'react-redux';

const EditCity = () => {
  const {location} = useSelector(state => state.auth);

  return (
    <>
      <View style={tw` h-12 mx-4 flex-row justify-between items-center`}>
        <Text style={tw`text-[15px] text-[#040641] font-medium`}>City</Text>

        <Text style={tw`text-[15px] text-right text-[#040641] opacity-70`}>
          {location?.city ? location?.city : ''}
        </Text>
      </View>
    </>
  );
};

export default EditCity;
