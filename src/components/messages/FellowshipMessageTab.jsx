import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Button,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import {
  useFollowUserAPIMutation,
  useGetConversationIdByUserIdAPIQuery,
  useMessageTabSearchAPIQuery,
  useUnFollowUserAPIMutation,
} from '../../features/messages/messageApiSlice';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';
import Conversations from './individualchat/Conversations';
import useDebounce from '../../utils/customhooks/useDebounce';
import LoadingSpinner from '../LoadingSpinner';
import {ScrollView} from 'react-native-gesture-handler';
import {setConversationIdNull} from '../../features/home/homeSlice';
import {useDispatch, useSelector} from 'react-redux';
import FellowshipSearchItem from './FellowshipSearchItem';
import {useListenForInboxUpdatesQuery} from '../../features/chat/chatApiSlice';
import socket from '../../socket/socket';

const FellowshipMessageTab = () => {
  const dispatch = useDispatch();

  const {currentUserId} = useSelector(state => state.auth);
  const {personalConversationList, groupConversationList} = useSelector(
    state => state.message,
  );
  const hasNoConversations =
    personalConversationList.length === 0 && groupConversationList.length === 0;
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);
  const navigation = useNavigation();
  const [value, setValue] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);

  // start listening for the inbox updates
  const memoizedParams = useMemo(() => ({currentUserId}), [currentUserId]);
  // const { data: newMsg, isLoading: newMsgLoading } =
  // useListenForInboxUpdatesQuery(memoizedParams);

  // for testing only
  // useEffect(() => {
  //   if (socket?.socket) {
  //     const eventName = `message_conversation_list_${currentUserId}`;
  //     const handleNewMessage = newMsg => {
  //     };
  //     // Attach the listener
  //     socket?.socket?.on(eventName, handleNewMessage);
  //     // Cleanup function to remove the listener
  //     return () => {
  //       socket?.socket?.off(eventName, handleNewMessage);
  //     };
  //   }
  // }, []);

  // const {data: newMsg, isLoading: newMsgLoading} =
  //   useListenForInboxUpdatesQuery({currentUserId});

  // for search item response based on the keyword
  // it does not have conversation id
  // so to fetch conversation id - need to trigger another api
  // once the response (conversation id) received then only navigate to chat screen
  // const [searchItem, setSearchItem] = useState(false);
  const [userIdFromSearch, setUserIdFromSearch] = useState('');

  const [fetchConversationId, setFetchConversationId] = useState(true);

  const {
    data: searchData,
    isLoading: searchDataLoading,
    isFetching: searchDataFetching,
    error: searchDataError,
  } = useMessageTabSearchAPIQuery(
    {search: debouncedSearchKeyword},
    {skip: !debouncedSearchKeyword},
  );

  const {data, isLoading, isFetching, isError} =
    useGetConversationIdByUserIdAPIQuery(
      {userId: userIdFromSearch?.id},
      {skip: fetchConversationId},
    );


  const handleSearchInput = txt => {
    setSearchKeyword(txt);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (!searchDataLoading && searchData) {
      
      // Dynamically create dropdown data from searchData
      const updatedDropdownData = [];
      if (searchData.personal && searchData.personal.length > 0) {
        updatedDropdownData.push({
          label: 'Personal',
          value: 'Personal',
          isHeader: true,
        });
        updatedDropdownData.push(
          ...searchData.personal.map(item => ({
            label: `${item?.first_name} ${item?.last_name}`,
            value: item?._id + Math.floor(Math.random() * (1000 - 1 + 1)) + 1,
            id: item?._id,
            isFollowing: item?.isFollowing,
            // this is a new prop to check the relation between two users - connected or not 
            relationStatus: item?.relationStatus,
            profileImg: item?.profile_image,
            isLeader: item?.role?.title === 'Leader',
            featured: item?.featured,
          })),
        );
      }

      if (searchData.byChurch && searchData.byChurch.length > 0) {
        updatedDropdownData.push({
          label: 'By Church',
          value: 'By Church',
          isHeader: true,
        });
        updatedDropdownData.push(
          ...searchData.byChurch.map(item => ({
            label: `${item?.first_name} ${item?.last_name}`,
            value: item?._id + Math.floor(Math.random() * (1000 - 1 + 1)) + 1,
            id: item?._id,
            isFollowing: item?.isFollowing,
            // this is a new prop to check the relation between two users - connected or not 
            relationStatus: item?.relationStatus,
            profileImg: item?.profile_image,
            isLeader: item?.role?.title === 'Leader',
            featured: item?.featured,
          })),
        );
      }

      if (searchData.byLocation && searchData.byLocation.length > 0) {
        updatedDropdownData.push({
          // label: 'By Location',
          // value: 'By Location',
          label: 'By Location',
          value: 'By Location',
          isHeader: true,
        });
        updatedDropdownData.push(
          ...searchData.byLocation.map(item => ({
            label: `${item?.first_name} ${item?.last_name}`,
            value: item?._id + Math.floor(Math.random() * (1000 - 1 + 1)) + 1,
            id: item?._id,
            isFollowing: item?.isFollowing,
            // this is a new prop to check the relation between two users - connected or not 
            relationStatus: item?.relationStatus,
            profileImg: item?.profile_image,
            isLeader: item?.role?.title === 'Leader',
            featured: item?.featured,
          })),
        );
      }

      if (searchData.others && searchData.others.length > 0) {
        updatedDropdownData.push({
          // label: 'By Location',
          // value: 'By Location',
          label: 'Others',
          value: 'Others',
          isHeader: true,
        });
        updatedDropdownData.push(
          ...searchData.others.map(item => ({
            label: `${item?.first_name} ${item?.last_name}`,
            value: item?._id + Math.floor(Math.random() * (1000 - 1 + 1)) + 1,
            id: item?._id,
            isFollowing: item?.isFollowing,
            // this is a new prop to check the relation between two users - connected or not 
            relationStatus: item?.relationStatus,
            profileImg: item?.profile_image,
            isLeader: item?.role?.title === 'Leader',
            featured: item?.featured,
          })),
        );
      }
      setDropdownData(updatedDropdownData);
    }
  }, [searchData, searchDataLoading]);

  // Custom function to prevent headers from being selected
  const handleValueChange = itemValue => {
    const selectedItem = dropdownData.find(item => item.value === itemValue);

    if (!selectedItem.isHeader) {
      setValue(itemValue);
    }
    setShowDropdown(false);
  };

  const handleCreateGroup = () => {
    navigation.navigate('FollowingUsers');
  };

  useEffect(() => {
    if (!isLoading && !isFetching && data) {
  
      // Ensure that this block is only executed when data is available
      dispatch(setConversationIdNull());
      navigation.navigate('Chat', {
        recepientId: userIdFromSearch?.id,
        conversationId: data?.conversation_id ? data?.conversation_id : null,
        name: `${userIdFromSearch?.label}`,
        is_leader: userIdFromSearch?.isLeader,
        profileImage: userIdFromSearch?.profileImg,
      });
      // this will skip the query
      setFetchConversationId(true);
      // reset the search
      setUserIdFromSearch('');
      setSearchKeyword('');
    }
  }, [isLoading, isFetching, data, navigation, dispatch]);


  return (
    <View style={tw`bg-white h-full`}>
      {/* Search */}

      <View style={tw`mx-4`}>
        <View
          style={[
            styles.searchbar,
            {
              borderTopEndRadius: searchKeyword ? 25 : 25,
              borderTopStartRadius: searchKeyword ? 25 : 25,
              borderBottomStartRadius: searchKeyword ? 0 : 25,
              borderBottomEndRadius: searchKeyword ? 0 : 25,
            },
          ]}>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 16,
              flex: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TextInput
              placeholder="Search user"
              value={searchKeyword}
              editable={true}
              onChangeText={handleSearchInput}
              placeholderTextColor="rgba(4, 6, 65, 0.7)"
              style={tw` text-[15px]  w-[100px]  flex-1  text-black`}
            />
            {!searchKeyword && (
              <TouchableOpacity>
                <Image
                  source={require('../../assets/images/searchicon2.png')}
                  style={tw`w-7 h-7`}
                />
              </TouchableOpacity>
            )}
            {searchKeyword && (
              <TouchableOpacity onPress={() => clearSearch()}>
                <Image
                  source={require('../../assets/images/closeicon.png')}
                  style={tw`w-7 h-7`}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {searchKeyword && (searchDataLoading || searchDataFetching) && (
          <View style={styles.searchLoadingContainer}>
            <ActivityIndicator size="small" color="#040641" />
          </View>
        )}

        {searchData && searchKeyword && !(searchDataLoading || searchDataFetching) && (
          <DropDownPicker
            style={styles.searchdropdown}
            // open={showDropdown}
            open={true}
            customItemContainerStyle={tw`h-500`}
            showArrowIcon={false}
            value={value}
            items={dropdownData}
            setOpen={setShowDropdown}
            setValue={handleValueChange}
            setItems={setDropdownData}
            placeholder=""
            dropDownContainerStyle={[tw`text-black`, styles.dropDownContainer]}
            // ListEmptyComponent={() => (
            //   <View style={{padding: 10, alignItems: 'center'}}>
            //     {(followUserLoading || unFollowUserLoading) && (
            //       <View style={tw`z-300 flex-1 py-2`}>
            //         <LoadingSpinner size={'small'} />
            //       </View>
            //     )}
            //     <Text style={tw`text-[#040641]`}>No data found</Text>
            //   </View>
            // )}
            renderListItem={({item, index}) => {
              if (item.isHeader) {
                // Render headers as non-clickable
                return (
                  <View style={tw`bg-[#fff]  bg-opacity-20`}>
                    <View
                      key={index}
                      style={{
                        padding: 10,
                      }}>
                      <Text style={{fontWeight: '500', color: '#040641'}}>
                        {item.label}
                      </Text>
                    </View>
                  </View>
                );
              }
              // Render selectable items as touchable
              return (
                <FellowshipSearchItem
                  item={item}
                  index={index}
                  setUserIdFromSearch={setUserIdFromSearch}
                  setFetchConversationId={setFetchConversationId}
                  isLoading={isLoading}
                />
              );
            }}
          />
        )}
        {/* <View style={tw`mt-5 w-30`}>
          <Button title="Create Group" onPress={handleCreateGroup} />
        </View> */}
      </View>
      {/* Body */}
      {/* Chats */}
      <ScrollView
        style={tw`-z-100 flex-1`}
        showsVerticalScrollIndicator={true}
        indicatorStyle="#99E1EF">
        <View style={tw`-z-100 flex-1`}>
          {hasNoConversations && !searchKeyword ? (
            <View style={styles.emptyState}>
              <Image
                source={require('../../assets/images/searchicon2.png')}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>
                Search for a user and connect to start a conversation
              </Text>
            </View>
          ) : (
            <Conversations />
          )}
        </View>
      </ScrollView>

      {/* Groups */}
      {/* Floating Button */}
      <TouchableOpacity
        onPress={handleCreateGroup}
        style={tw`absolute bottom-10 right-5 bg-[#99E1EF] rounded-full w-12 h-12 justify-center items-center shadow-lg`}>
        <Image
          source={require('../../assets/images/groupicon.png')}
          style={tw`w-6 h-6`}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FellowshipMessageTab;

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 38,
    backgroundColor: '#fff',
    borderRadius: 100,
    marginTop: 16,
    justifyContent: 'center',
  },
  searchbar: {
    width: '100%',
    height: 46,
    backgroundColor: 'rgba(0, 180, 216, 0.2)',
    marginTop: 24,
    justifyContent: 'center',
  },
  searchdropdown: {
    // backgroundColor: 'rgba(0, 180, 216, 0.2)',
    backgroundColor: '#fff',
    borderWidth: 0,
    borderRadius: 0,
    top: 2,
  },
  searchLoadingContainer: {
    backgroundColor: '#C6EBF3',
    borderBottomEndRadius: 25,
    borderBottomStartRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    opacity: 0.4,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#040641',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(4, 6, 65, 0.55)',
    textAlign: 'center',
    lineHeight: 20,
  },
  dropDownContainer: {
    borderWidth: 0,
    position: 'absolute',
    borderBottomEndRadius: 25,
    borderBottomStartRadius: 25,
    flex: 1,
    top: 2,
    backgroundColor: '#C6EBF3',
    // backgroundColor: '#000',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
