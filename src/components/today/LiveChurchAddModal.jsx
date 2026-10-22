import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc';
import {useDispatch} from 'react-redux';
import {showLiveModalForm} from '../../features/auth/authSlice';
import { showAddMoreChurchesModal } from '../../features/livechurches/liveChurchSlice';

const LiveChurchAddModal = () => {
  const dispatch = useDispatch();

  const handleShowLiveModalForm = () => {
    // dispatch(showLiveModalForm());
    dispatch(showAddMoreChurchesModal());
  };

  return (
    <View style={tw`flex-1 w-full`}>
      {/* Button to trigger the modal */}
      <TouchableOpacity
        style={tw`bg-[#CAF0F8] h-[90px]   flex-1 justify-center items-center rounded-tl-[10px] rounded-tr-[10px] mr-3 w-[100%]`}
        onPress={handleShowLiveModalForm}>
        <Image
          source={require('../../assets/images/churchicon2.png')}
          style={tw` opacity-30  `}
        />
      </TouchableOpacity>
      <View
        style={tw`bg-[#0077B6] py-[18px] flex justify-center items-center rounded-bl-[10px] rounded-br-[10px]`}>
        <TouchableOpacity onPress={handleShowLiveModalForm}>
          <View style={tw`flex-row justify-center items-center gap-2`}>
            <Image
              source={require('../../assets/images/addicon.png')}
              style={tw`w-10 h-10`}
            />
            <Text style={tw`text-white text-[14px]`}>Follow More Churches</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LiveChurchAddModal;
