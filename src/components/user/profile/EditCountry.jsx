import React from 'react';
import {View, Text} from 'react-native';
import tw from 'twrnc';

import {useSelector} from 'react-redux';

const EditCountry = () => {
  const {location} = useSelector(state => state.auth);

  return (
    <>
      <View style={tw` h-12 mx-4 flex-row justify-between items-center`}>
        <Text style={tw`text-[15px] text-[#040641] font-medium`}>Country</Text>

        <Text style={tw`text-[15px] text-right text-[#040641] opacity-70`}>
          {location?.country ? location?.country : ''}
        </Text>
      </View>
    </>
  );
};

export default EditCountry;
