import React from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import tw from 'twrnc';
import {formatDate} from '../../utils/formattedDate';
import LoadingSpinner from '../LoadingSpinner';

const LiveChurchModal = ({
  setModalVisible,
  modalVisible,
  item,
  handleLiveChurchConfirmation,
}) => {
  const handleClose = () => setModalVisible(false);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View
          style={tw`flex-1 justify-end items-center bg-gray-900 bg-opacity-40`}>
          <TouchableWithoutFeedback>
            <View style={tw`bg-[#0077B6] p-4 h-67 rounded-t-[40px] w-full`}>
              <TouchableOpacity onPress={handleClose}>
                <Image
                  source={require('../../assets/images/closewhite.png')}
                  style={tw`h-4 w-6`}
                />
              </TouchableOpacity>
              <View style={tw`flex-1 justify-center items-center`}>
                <View style={tw`flex items-center`}>
                  <Image
                    // source={require('../../assets/images/eventmodalimage.png')}
                    source={{uri: item?.cover_image?.path}}
                    style={tw`-top-10 w-20 h-20 rounded-full`}
                  />
                </View>
              </View>
              <View style={tw`-top-6`}>
                <Text style={tw`text-[#fff] text-[13px] text-center mb-1`}>
                  {`${formatDate(item.start_date)} ${item?.start_time}`}
                </Text>
                <Text
                  style={tw`text-[#fff] text-[16px] font-medium text-center mb-1`}>
                  {item?.title}
                </Text>
                <Text style={tw`text-[#fff] text-sm mb-4 text-center`}>
                  {item?.address}
                </Text>
                <TouchableOpacity
                  style={tw`flex-row items-center`}
                  onPress={() => handleLiveChurchConfirmation(1)}>
                  <Image
                    source={require('../../assets/images/attendingicon.png')}
                    style={tw`w-6 h-6 rounded-full`}
                  />
                  <Text style={tw`text-[#fff] text-[15px] ml-5`}>
                    Attending
                  </Text>
                </TouchableOpacity>

                <View
                  style={tw`border-b border-gray-300 opacity-40 mb-3 mt-3`}
                />
                <TouchableOpacity
                  style={tw`flex-row items-center`}
                  onPress={() => handleLiveChurchConfirmation(0)}>
                  <Image
                    source={require('../../assets/images/notattendingicon.png')}
                    style={tw`w-6 h-6 rounded-full`}
                  />
                  <Text style={tw`text-[#fff] text-[15px] ml-5`}>
                    Not Attending
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LiveChurchModal;
