import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';
import GroupChatCreateMessage from '../../../../components/messages/groupchat/GroupChatCreateMessage';
import GroupChatMessageBlock from '../../../../components/messages/groupchat/GroupChatMessageBlock';
import {useSelector, useDispatch} from 'react-redux';
import {
  useDeleteGroupAPIMutation,
  useExitGroupAPIMutation,
} from '../../../../features/chat/groupChat';
import CustomAlert from '../../../../utils/customalert/CustomAlert';
import socket from '../../../../socket/socket';
import showToast from '../../../../utils/toast/showToast';
import {useFocusEffect} from '@react-navigation/native';
import {
  setHideMinistryIcon,
  setShowMinistryIcon,
} from '../../../../features/auth/authSlice';
import NamePromptCard from '../../../../components/shared/NamePromptCard';

const GroupChatScreen = ({navigation, route}) => {
  const {groupId} = route.params;

  const {groupConversationList} = useSelector(state => state.message);
  const [groupInfo, setGroupInfo] = useState(null);
  const {currentUserId} = useSelector(state => state.auth);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [showExitGroup, setShowExitGroup] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const dispatch = useDispatch();

  const [
    deleteGroupAPI,
    {isLoading: deleteGroupLoading, isError: deleteGroupError},
  ] = useDeleteGroupAPIMutation();

  const [exitGroupAPI, {isLoading: exitGroupLoading, isError: exitGroupError}] =
    useExitGroupAPIMutation();

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleDeleteGroup = async groupId => {
    try {
      const response = await deleteGroupAPI(groupId).unwrap();

      navigation.navigate('Fellowship', {initialTab: 'Message'});
    } catch (error) {
    } finally {
      setDropdownVisible(false);
    }
  };

  const handleExitGroup = async groupId => {
    try {
      const response = await exitGroupAPI(groupId).unwrap();

      navigation.navigate('Fellowship', {initialTab: 'Message'});
    } catch (error) {
    } finally {
      // setDropdownVisible(false);
    }
  };

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const handleGroupProfile = () => {
    navigation.navigate('GroupProfile', {groupId});
  };

  useEffect(() => {
    const groupInformation = groupConversationList.find(
      group => group._id === groupId,
    );
    setGroupInfo(groupInformation);
  }, [groupId, groupConversationList]);

  // navigate to add members screen where the add logic happens
  const addNewMembersToGroup = () => {
    navigation.navigate('AddMembersInGroup', {groupId});
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  // user removed from group
  // LOG  {"group": "6757cc1d80292b42c50a9d36", "removed": true}
  useEffect(() => {
    if (socket?.socket) {
      const eventName = `user_group_${currentUserId}`;
      const handleSocketResponse = response => {
        if (response?.group === groupId && response?.removed) {
          navigation.navigate('Fellowship', {initialTab: 'Message'});
        }
      };
      // Attach the listener
      socket?.socket?.on(eventName, handleSocketResponse);
      return () => {
        socket?.socket?.off(eventName, handleSocketResponse);
      };
    }
    return () => {};
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Hide when chat opens
      dispatch(setHideMinistryIcon());

      return () => {
        // Show again when leaving chat
        dispatch(setShowMinistryIcon());
      };
    }, []),
  );

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : ''}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        <SafeAreaView style={tw`bg-[#fff]`}>
          <View style={tw`mx-2 flex-row items-center justify-between`}>
            <View style={tw`flex-row gap-2 items-center`}>
              <TouchableOpacity onPress={navigateToPreviousScreen}>
                <View style={tw`py-3 px-2`}>
                  <Image
                    source={require('../../../../assets/images/backnavicon.png')}
                    style={tw`w-[26px] h-[46px]`}
                  />
                </View>
              </TouchableOpacity>
              {groupInfo && (
                <TouchableOpacity
                  style={tw`flex-row items-center gap-2`}
                  onPress={handleGroupProfile}>
                  <Image
                    source={
                      groupInfo?.groupPicture
                        ? {uri: groupInfo?.groupPicture}
                        : require('../../../../assets/images/groupplaceholder.png')
                    }
                    style={tw`w-12 h-12 rounded-full`}
                    resizeMode="cover"
                  />
                  <View>
                    <Text style={tw`text-[16px] text-[#040641] font-medium`}>
                      {truncateText(groupInfo?.groupName, 18)}
                    </Text>
                    <Text style={tw`text-gray-400 text-[12px] `}>
                      created by{' '}
                      {groupInfo?.admin[0]?.first_name +
                        ' ' +
                        groupInfo?.admin[0]?.last_name}
                    </Text>
                    <Text style={tw`text-gray-400 text-[12px]`}>
                      {groupInfo?.participants.length} Members
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity onPress={toggleDropdown}>
                <View style={tw`pl-3 py-3`}>
                  <Image
                    source={require('../../../../assets/images/dotmenuicon-black.png')}
                    style={tw`w-7 h-7`}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Dropdown Menu */}
        <Modal
          transparent
          animationType="fade"
          visible={dropdownVisible}
          onRequestClose={() => setDropdownVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[tw`shadow-lg`, styles.dropdownContainer]}>
                  {groupInfo?.admin[0]?._id === currentUserId && (
                    <View>
                      <TouchableOpacity
                        style={tw`flex-row justify-center items-center gap-3`}
                        onPress={() => addNewMembersToGroup()}>
                        <Image
                          source={require('../../../../assets/images/addmembers.png')}
                          style={tw`w-6 h-6`}
                        />
                        <Text style={styles.dropdownText}>Add Members</Text>
                      </TouchableOpacity>
                      <View style={tw`border-[0.2px] border-gray-200`} />
                      <TouchableOpacity
                        style={tw`flex-row justify-center items-center gap-3`}
                        onPress={() => {
                          setDropdownVisible(false);
                          setTimeout(
                            () => setShowDeleteGroup(true),
                            Platform.OS === 'ios' ? 350 : 0,
                          );
                        }}>
                        <Image
                          source={require('../../../../assets/images/logouticon.png')}
                          style={tw`w-6 h-6`}
                        />
                        <Text style={styles.dropdownText}>Delete Group</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {groupInfo?.admin[0]?._id !== currentUserId && (
                    <TouchableOpacity
                      style={tw`flex-row justify-center items-center gap-3`}
                      onPress={() => {
                        setDropdownVisible(false);
                        setTimeout(
                          () => setShowExitGroup(true),
                          Platform.OS === 'ios' ? 350 : 0,
                        );
                      }}>
                      <Image
                        source={require('../../../../assets/images/logouticon.png')}
                        style={tw`w-6 h-6`}
                      />
                      <Text style={styles.dropdownText}>Exit Group</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={styles.container}>
          <View style={styles.body}>
            <View contentContainerStyle={tw`flex-grow`} style={tw`flex-1`}>
              <LinearGradient
                colors={['#0077B6', '#00B4D8']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={tw`h-full px-4`}>
                {/* for rendering the messages */}
                <GroupChatMessageBlock
                  groupId={groupId}
                  conversationId={null}
                />
              </LinearGradient>
            </View>
            <NamePromptCard />
          </View>

          <View style={styles.createMessage}>
            <GroupChatCreateMessage groupId={groupId} />
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Exit group modal */}
      <CustomAlert
        visible={showExitGroup}
        boldText={''}
        message={'Are you sure you want to exit this group?'}
        onConfirm={() => {
          setShowExitGroup(false);
          setDropdownVisible(false);
          handleExitGroup(groupId);
        }}
        onCancel={() => {
          setDropdownVisible(false);
          setShowExitGroup(false);
        }}
      />
      {/* Delete group modal */}
      <CustomAlert
        visible={showDeleteGroup}
        boldText={''}
        message={'Are you sure you want to delete this group?'}
        onConfirm={() => {
          setShowDeleteGroup(false);
          setDropdownVisible(false);
          handleDeleteGroup(groupId);
        }}
        onCancel={() => {
          setDropdownVisible(false);
          setShowDeleteGroup(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
  },
  createMessage: {
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 50 : 0,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    right: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#0077B6',
    paddingVertical: 10,
  },
});

export default GroupChatScreen;
