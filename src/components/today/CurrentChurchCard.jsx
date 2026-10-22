import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import tw from 'twrnc';
import {useDispatch} from 'react-redux';
import {showCurrentChurchModal} from '../../features/auth/authSlice';

const CurrentChurchCard = () => {
  const dispatch = useDispatch();

  const handleOpenModal = () => {
    dispatch(showCurrentChurchModal());
  };

  return (
    <View style={tw`flex-1 w-full`}>
      <TouchableOpacity
        style={tw`bg-[#CAF0F8] h-[90px]   flex-1 justify-center items-center rounded-tl-[10px] rounded-tr-[10px] mr-3 w-[100%]`}
        onPress={handleOpenModal}>
        <Image
          source={require('../../assets/images/churchicon2.png')}
          style={tw` opacity-30  `}
        />
      </TouchableOpacity>
      <View
        style={tw`bg-[#0077B6] py-[18px] flex justify-center items-center rounded-bl-[10px] rounded-br-[10px]`}>
        <TouchableOpacity onPress={handleOpenModal}>
          <View style={tw`flex-row justify-center items-center gap-2`}>
            <Image
              source={require('../../assets/images/addicon.png')}
              style={tw`w-10 h-10`}
            />
            <Text style={tw`text-white text-[14px]`}>
              {' '}
              Select your current church
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CurrentChurchCard;
