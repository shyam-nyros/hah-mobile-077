import React, {useMemo, useState} from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import tw from 'twrnc';
import {useMyConnectionsQuery} from '../../../../features/messages/messageApiSlice';

import LoadingSpinner from '../../../../components/LoadingSpinner';
import {Formik} from 'formik';
import {
  useAddNewMembersToGroupAPIMutation,
  useGroupProfileDetailsQuery,
} from '../../../../features/chat/groupChat';
import {setGroupConversationList} from '../../../../features/messages/messageSlice';
import {useDispatch, useSelector} from 'react-redux';

const AddMembersToGroupScreen = ({navigation, route}) => {
  const {groupId} = route.params;

  const dispatch = useDispatch();
  const {groupConversationList} = useSelector(state => state.message);
  const {currentUserId} = useSelector(state => state.auth);

  const [selectedMembers, setSelectedMembers] = useState([]);

  const {
    data: connectionsData,
    isLoading: followingListLoading,
    isError: followingListError,
    error: connectionsError,
  } = useMyConnectionsQuery();

  const {
    data: groupDetails,
    isLoading: groupDetailsLoading,
    isError: groupDetailsError,
    error: groupError,
  } = useGroupProfileDetailsQuery(groupId);

  if (connectionsError) {
    console.error('[AddMembers] connections API error:', connectionsError);
  }
  if (groupError) {
    console.error('[AddMembers] group details API error:', groupError);
  }

  // Compute the members list directly from query data — no intermediate state needed.
  // Marks existing group members as disabled so they cannot be re-added.
  const newMembersList = useMemo(() => {
    const connections = (connectionsData ?? []).filter(
      item => item._id !== currentUserId,
    );
    const existingMembers = groupDetails?.participants ?? [];
    const admins = groupDetails?.admin ?? [];

    const combinedMap = new Map();
    connections.forEach(item => {
      combinedMap.set(item._id, {...item, isExisting: false});
    });
    existingMembers.forEach(item => {
      if (combinedMap.has(item._id)) {
        combinedMap.set(item._id, {...combinedMap.get(item._id), isExisting: true});
      }
    });

    const uniqueArr = Array.from(combinedMap.values());
    const nonAdmins = uniqueArr.filter(
      item => !admins.some(admin => admin._id === item._id),
    );
    const adminsNotInList = admins.filter(
      admin =>
        admin._id !== currentUserId &&
        !uniqueArr.some(item => item._id === admin._id),
    );
    return [...nonAdmins, ...adminsNotInList];
  }, [connectionsData, groupDetails, currentUserId]);

  const [
    addNewMembersToGroupAPI,
    {isLoading: newGroupLoading, isError: newGroupError},
  ] = useAddNewMembersToGroupAPIMutation();

  const handleAddMembers = async (values, {resetForm}) => {
    try {
      const response = await addNewMembersToGroupAPI({
        groupId,
        participants: JSON.stringify(values.members),
      }).unwrap();

      // Apply the logic to create the updated list
      const updatedList = groupConversationList.map(group => {
        if (group._id === response.group) {
          return {
            ...group,
            participants: [
              ...group.participants,
              ...response.user_id.filter(
                userId => !group.participants.includes(userId),
              ),
            ],
          };
        }
        return group;
      });
  
      dispatch(setGroupConversationList(updatedList));
      navigation.navigate('Fellowship', {initialTab: 'Message'});
    } catch (error) {

    } finally {
      resetForm();
    }
  };

  const handleMemberPress = (setFieldValue, member) => {
    let updatedMembers;
    if (selectedMembers.includes(member._id)) {
      // Deselect member
      updatedMembers = selectedMembers.filter(id => id !== member._id);
    } else {
      // Select member
      updatedMembers = [...selectedMembers, member._id];
    }
    setSelectedMembers(updatedMembers);
    setFieldValue('members', updatedMembers);
  };

  return (
    <>
      {newGroupLoading && <LoadingSpinner />}
      {followingListLoading || groupDetailsLoading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <LoadingSpinner />
        </View>
      ) : followingListError || groupDetailsError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-red-500 text-center mx-6`}>
            Failed to load members. Please go back and try again.
          </Text>
        </View>
      ) : (
        <SafeAreaView>
          <View style={tw`h-full bg-white`}>
            <View style={tw`mx-4 flex-1`}>
              <Formik
                initialValues={{
                  members: [],
                }}
                onSubmit={handleAddMembers}>
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
                    <View style={tw`mt-3 flex-1 mb-20`}>
                      <FlatList
                        data={newMembersList} // Or your actual data from the API
                        keyExtractor={item => item._id}
                        renderItem={({item}) => (
                          <TouchableOpacity
                            disabled={item.isExisting}
                            onPress={() =>
                              handleMemberPress(setFieldValue, item)
                            }
                            style={tw`py-4 border-b border-gray-100 flex-row items-center`}>
                            {selectedMembers.includes(item._id) && (
                              <Image
                                source={require('../../../../assets/images/confirmicon.png')}
                                style={{
                                  width: 20,
                                  height: 20,
                                  marginRight: 10,
                                  borderRadius: 100,
                                }}
                              />
                            )}
                            <View
                              style={tw`flex-row items-center gap-3 ${
                                item.isExisting ? 'opacity-50' : ''
                              }`}>
                              <Image
                                source={
                                  item?.profile_image
                                    ? {uri: item?.profile_image}
                                    : require('../../../../assets/images/placeholder.png')
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
                    <View
                      style={tw`justify-center bg-white w-full  bottom-0 absolute items-center`}>
                      <TouchableOpacity
                        onPress={handleSubmit}
                        style={tw`mt-5 mb-5 w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex justify-center items-center`}>
                        <Text
                          style={tw`text-[#0077B6] text-[16px] font-semibold`}>
                          Add Members
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Formik>
            </View>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

export default AddMembersToGroupScreen;
