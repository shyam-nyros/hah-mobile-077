import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import tw from 'twrnc';

import LoadingSpinner from '../../LoadingSpinner';
import {useDispatch, useSelector} from 'react-redux';
import {useRemoveMemberFromGroupAPIMutation} from '../../../features/chat/groupChat';
import {setGroupConversationList} from '../../../features/messages/messageSlice';

const GroupProfileMembersItem = ({groupId, combinedMembers}) => {

  const dispatch = useDispatch();
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState();

  const {currentUserId} = useSelector(state => state.auth);
  const {groupConversationList} = useSelector(state => state.message);

  const [modalVisible, setModalVisible] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState({_id: null, name: null});

  const [
    removeMemberFromGroupAPI,
    {isLoading: removeMemberLoading, isError: removeMemberError},
  ] = useRemoveMemberFromGroupAPIMutation();


 
  // old setup
  // const showModal = member => {
  //   setMemberToRemove({
  //     _id: member?._id,
  //     name: member?.first_name + ' ' + member?.last_name,
  //   });
  //   setModalVisible(true);
  // };

  // only when the user is admin can remove other members in group
  // otherwise the modal will not be triggered
  const showModal = member => {
    if (currentUserIsAdmin) {
      setMemberToRemove({
        _id: member?._id,
        name: member?.first_name + ' ' + member?.last_name,
      });
      setModalVisible(true);
    }
  };

  // admin removing a member from the group
  const removeMemberFromGroup = async () => {
    setModalVisible(false);
    try {
      const response = await removeMemberFromGroupAPI({
        groupId,
        memberId: memberToRemove._id,
      }).unwrap();
    
      // apply the remove logic for the groupConversationList
      const updatedList = groupConversationList.map(group => {
        if (group._id === response.group) {
          return {
            ...group,
            participants: group.participants.filter(
              participant => participant !== response.user_id,
            ),
          };
        }
        return group;
      });
  
  
      dispatch(setGroupConversationList(updatedList));
      setMemberToRemove(null);
    } catch (error) {
    
    }
  };

  useEffect(() => {
    if (combinedMembers?.length > 0) {
      const isCurrentUserAdminOfGroup = combinedMembers.some(
        item => item?._id === currentUserId && item?.isAdmin === true,
      );
      setCurrentUserIsAdmin(isCurrentUserAdminOfGroup);
    }
  }, [currentUserId, combinedMembers]);

  return (
    <>
      {/* Group in common */}
      <View style={tw`mb-5`}>
        <Text style={tw`text-[16px] text-[#040641] font-medium mt-5`}>
          Members
        </Text>
        {removeMemberLoading && <LoadingSpinner />}

        <View
          style={tw` bg-[#040641] gap-2 bg-opacity-6 mt-3 p-4 rounded-[15px]`}>
          {combinedMembers.map((participant, index) => (
            <View key={participant._id}>
              <TouchableOpacity
                disabled={participant?.isAdmin}
                onPress={() => showModal(participant)}>
                <View style={tw`flex-row items-center gap-2`}>
                  <View
                    style={tw`${
                      participant?.is_leader
                        ? 'w-12 h-14 top-1'
                        : 'w-12 h-14 top-1'
                    } rounded-full relative`}>
                    {participant?.is_leader && (
                      <Image
                        source={require('../../../assets/images/leadersframe.png')}
                        style={tw`absolute top-[-4px] left-[-2px] w-[50px] h-[50px] rounded-full`}
                      />
                    )}
                    <Image
                      source={
                        participant?.profile_image
                          ? {uri: participant?.profile_image}
                          : require('../../../assets/images/whiteplaceholder.png')
                      }
                      style={tw`${
                        participant?.is_leader
                          ? 'w-9 h-9 left-1.3 top-0.7'
                          : 'w-11 h-11'
                      } rounded-full`}
                    />
                    {participant?.is_verified && (
                      <Image
                        source={require('../../../assets/images/profilebadge.png')}
                        style={tw`w-[12px] h-[14px] absolute top-[8] left-[9]`}
                      />
                    )}
                  </View>
                  <View style={tw`flex-row flex-1  justify-between`}>
                    <Text style={tw`text-[15px] text-[#0077B6] font-medium`}>
                      {`${participant?.first_name} ${participant?.last_name} `}
                    </Text>
                    {participant?.isAdmin && (
                      <View
                        style={tw`bg-[#040641] text-white text-[12px] bg-opacity-40 rounded-full p-[4px] px-2`}>
                        <Text style={tw`text-white text-[12px]`}>Admin</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              {index < combinedMembers.length - 1 && (
                <View style={tw`border-b border-[#ccc] opacity-20 mt-1 mb-1`} />
              )}
            </View>
          ))}
        </View>
      </View>
      {/* Modal for actions */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            onPress={() => removeMemberFromGroup()}
            style={[
              tw`bg-red-100 bg-opacity-20 rounded-2 px-5 py-3 w-full`,
              styles.modalButton,
            ]}>
            <Text style={tw`text-red-500  text-[16px]`}>
              Remove {memberToRemove?.name}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[
              tw`bg-[#040641] mt-3 bg-opacity-2 rounded-2 px-5 py-3 w-full`,
              styles.modalButton,
            ]}>
            <Text style={tw`text-[#040641]  text-[16px]`}>
              Make (UserName) Admin
            </Text>
          </TouchableOpacity> */}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 17,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '30%',
    left: '11%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default GroupProfileMembersItem;
