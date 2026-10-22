import React from 'react';
import {View, Text, Image} from 'react-native';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';

// Three dots loader component
const ThreeDotsLoader = () => {
  return (
    <View style={tw`flex-row items-center justify-center py-2`}>
      <View style={tw`flex-row gap-1`}>
        <View style={tw`w-2 h-2 bg-gray-400 rounded-full animate-bounce`} />
        <View style={tw`w-2 h-2 bg-gray-400 rounded-full animate-bounce`} />
        <View style={tw`w-2 h-2 bg-gray-400 rounded-full animate-bounce`} />
      </View>
    </View>
  );
};

const AIMessage = ({content, isLoading = false}) => {
  console.log('AIMessage content:');

  console.log(content);

  return (
    <View style={tw`mb-4 flex-row justify-start items-start`}>
      {/* AI Avatar */}
      <View style={tw`mr-3 mt-1`}>
        <LinearGradient
          colors={['#f8fafbff', '#f2f7f8ff']}
          style={tw`w-8 h-8 rounded-full justify-center items-center`}>
          <Image
            source={require('../../assets/images/AIicon.png')}
            style={tw`w-10 h-10`}
            resizeMode="contain"
          />
        </LinearGradient>
      </View>

      {/* Message Content */}
      <View style={tw`max-w-[75%]`}>
        <View
          style={tw`bg-white rounded-tl-[5px] rounded-tr-[20px] rounded-bl-[20px] rounded-br-[20px] px-4 py-3`}>
          {isLoading ? (
            <ThreeDotsLoader />
          ) : (
            <Text style={tw`text-[#040641] text-[14px] leading-5`}>
              {content}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default AIMessage;
