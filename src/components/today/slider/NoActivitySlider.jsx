import React from 'react';
import {View, ScrollView, Dimensions} from 'react-native';
import LiveChurchAddModal from '../LiveChurchAddModal';
import HomeRequestForm from '../HomeRequestForm';
import tw from 'twrnc';

const NoActivitiesPlaceholder = () => {
  const {width} = Dimensions.get('window');
  return (
    <ScrollView
      horizontal
      contentContainerStyle={tw`flex-row justify-center gap-4 items-center`}
      showsHorizontalScrollIndicator={false}>
      <View style={[tw`h-[250px]`, {width: width * 0.9}]}>
        <HomeRequestForm />
      </View>
      <View style={[tw`h-[250px]`, {width: width * 0.9}]}>
        <LiveChurchAddModal />
      </View>
    </ScrollView>
  );
};

export default NoActivitiesPlaceholder;
