// HomeRequestForm.js
import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import tw from 'twrnc';
import ActivityModal from './ActivityModal';
import {useDispatch, useSelector} from 'react-redux';
import {showAddRequestForm} from '../../features/auth/authSlice';

const HomeRequestForm = () => {
  const dispatch = useDispatch();

  const handleShowRequestForm = () => {
    dispatch(showAddRequestForm());
  };

  const selectedChurchName = useSelector(
    state => state.auth.selectedChurchName,
  );

  return (
    <View style={tw`flex-1 w-full`}>
      <TouchableOpacity
        onPress={handleShowRequestForm}
        style={tw`bg-[#D2F7FF] h-[90px] flex-1 justify-center items-center rounded-tl-[10px] rounded-tr-[10px]`}>
        <Image
          source={require('../../assets/images/churchicon1.png')}
          style={tw` opacity-30 absolute  top-4 `}
        />
        <View
          style={tw`absolute inset-1 top-20 flex justify-center items-center `}>
          <Text style={tw`text-[17px] text-[#040641]`}>
            {' '}
            {selectedChurchName}
          </Text>
        </View>
      </TouchableOpacity>
      <View
        style={tw`bg-[#0077B6] py-5 flex justify-center items-center rounded-bl-[10px] rounded-br-[10px]`}>
        <TouchableOpacity onPress={handleShowRequestForm}>
          <View style={tw`flex-row justify-center items-center`}>
            <Image
              source={require('../../assets/images/addicon.png')}
              style={tw`w-9 h-9`}
            />
            <View style={tw`ml-2`}>
              <Text style={tw`text-[14px] text-white`}>
                Are you a member of this church?
              </Text>
              <Text style={tw`text-[13px] text-white`}>Add Activity</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeRequestForm;
