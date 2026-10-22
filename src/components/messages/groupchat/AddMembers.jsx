import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import React, {useState, useRef} from 'react';
import {useSelector} from 'react-redux';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  useAddMembersGroupAPIMutation,
  useMyConnectionsQuery,
} from '../../../features/messages/messageApiSlice';
import {Formik} from 'formik';

import tw from 'twrnc';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';
import LoadingSpinner from '../../LoadingSpinner';
import {truncateText} from '../../../utils/helpers';

const AddMembers = ({navigation, route}) => {
  const formikRef = useRef();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [attachementName, setAttachementName] = useState(null);
  const {currentUserId} = useSelector(state => state.auth);

  const {
    data: rawConnectionsList = [],
    isLoading: followingListLoading,
    isError: followingListError,
  } = useMyConnectionsQuery();

  const followingList = rawConnectionsList.filter(
    item => item._id !== currentUserId,
  );
  const {groupId} = route.params;

  const [addMembersGroupAPI] = useAddMembersGroupAPIMutation();

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const clearAttachmentName = () => {
    setAttachementName(null);
  };

  const toggleSelectMember = id => {
    setSelectedMembers(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(memberId => memberId !== id)
        : [...prevSelected, id],
    );
  };

  const renderItem = ({item}) => {
    const isSelected = selectedMembers.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          tw`py-4 border-b border-gray-100 flex-row items-center`,
          isSelected && tw`bg-blue-100`,
        ]}
        onPress={() => toggleSelectMember(item.id)}>
        <Image
          source={require('../../../assets/images/confirmicon.png')}
          style={{
            width: 20,
            height: 20,
            marginRight: 10,
            borderRadius: 100,
          }}
        />
        <View style={tw`flex-row items-center gap-3`}>
          <Image
            source={{uri: item.profileImage}}
            style={tw`w-10 h-10 rounded-full`}
          />
          <View>
            <Text style={tw`text-[#0077B6] text-[16px] font-500`}>
              {item.name}
            </Text>
          </View>
        </View>
        {isSelected && <Text style={tw`ml-auto text-green-500`}>Selected</Text>}
      </TouchableOpacity>
    );
  };

  if (followingListLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <LoadingSpinner />
      </View>
    );
  }

  if (followingListError) {
    return (
      <Text style={tw`text-red-500 text-center mt-5`}>
        Failed to load members.
      </Text>
    );
  }

  const handleMemberPress = (setFieldValue, member) => {
    let updatedMembers;
    if (selectedMembers.includes(member._id)) {
      updatedMembers = selectedMembers.filter(id => id !== member._id);
    } else {
      updatedMembers = [...selectedMembers, member._id];
    }
    setSelectedMembers(updatedMembers);
    setFieldValue('members', updatedMembers);
  };

  const addMemberGroup = async (values, {resetForm}) => {
  

    try {
      const payload = {
        groupId,
        participants: JSON.stringify(values.members),
      };

      const response = await addMembersGroupAPI(payload).unwrap();

      navigation.navigate('Fellowship', {initialTab: 'Message'});
     
    } catch (error) {
      console.error('API Error:', error);
    }

    resetForm();
  };

  return (
    <>
      <SafeAreaView style={tw`bg-[#fff]`}>
        <View style={tw`flex-row gap-2 py-3  items-center`}>
          <TouchableOpacity onPress={navigateToPreviousScreen}>
            <Image
              source={require('../../../assets/images/backnavicon.png')}
              style={tw`w-[26px] h-[46px]`}
            />
          </TouchableOpacity>
          <Text style={tw`text-[#040641] text-[18px] font-500`}>
            Add Members
          </Text>
        </View>
      </SafeAreaView>
      <ScrollView style={tw`px-4 bg-white flex-1`}>
        <View style={tw`h-full bg-white`}>
          <View style={tw`mx-4 flex-1`}>
            <Formik
              innerRef={formikRef}
              initialValues={{
                members: [],
              }}
              onSubmit={addMemberGroup}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                setFieldValue,
                errors,
                touched,
              }) => (
                <View style={tw`flex-1 mt-[6px]`}>
                  <View style={tw`mt-5 w-35  items-start`}></View>
                  {attachementName && (
                    <View style={tw`flex-row  items-center  mt-2`}>
                      <View
                        style={tw`bg-[#040641] bg-opacity-6 gap-3 rounded-[12px]  items-center flex-row py-3 px-4 `}>
                        <Text
                          style={tw`text-[#040641] text-[16px] font-medium`}>
                          {truncateText(attachementName, 20)}
                        </Text>
                        <TouchableOpacity onPress={clearAttachmentName}>
                          <Image
                            source={require('../../../assets/images/closered.png')}
                            style={tw`w-6 h-6 `}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  <View style={tw`mt-3 flex-1 mb-20`}>
                    <FlatList
                      data={followingList}
                      keyExtractor={item => item._id}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          onPress={() => handleMemberPress(setFieldValue, item)}
                          style={tw`py-4 border-b border-gray-100 flex-row items-center`}>
                          {selectedMembers.includes(item._id) && (
                            <Image
                              source={require('../../../assets/images/confirmicon.png')}
                              style={{
                                width: 20,
                                height: 20,
                                marginRight: 10,
                                borderRadius: 100,
                              }}
                            />
                          )}
                          <View style={tw`flex-row items-center gap-3`}>
                            <Image
                              source={
                                item?.profile_image
                                  ? {uri: item?.profile_image}
                                  : require('../../../assets/images/placeholder.png')
                              }
                              style={tw`w-10 h-10 rounded-full`}
                            />
                            <View>
                              <Text
                                style={tw`text-[#0077B6] text-[16px] font-500`}>
                                {item.first_name} {item.last_name}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </ScrollView>
      <View
        style={tw`justify-center bg-white w-full  bottom-0 absolute items-center`}>
        <TouchableOpacity
          onPress={() => formikRef.current.handleSubmit()}
          style={tw`mt-5 mb-5 w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex justify-center items-center`}>
          <Text style={tw`text-[#0077B6] text-[16px] font-semibold`}>
            Add Members
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default AddMembers;
