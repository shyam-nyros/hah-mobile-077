import React, {useState, useEffect} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import {useLiveChurchFeedAPIMutation} from '../../features/livechurches/liveChurchAPiSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import socket from '../../socket/socket';

const FeedTab = ({route, navigation}) => {
  const {firstName, lastName} = useSelector(state => state.auth);

  const {liveChurchId, churchId} = route.params;


  const currentUsername = `${firstName} ${lastName}`;
  const [liveChurchFeed] = useLiveChurchFeedAPIMutation(
    {churchId, liveChurchId},
    {refetchOnMountOrArgChange: true},
  ); // Hook for the mutation
  const [message, setMessage] = useState('');
  const [feedData, setFeedData] = useState([]);

  useEffect(() => {
    if (socket?.socket) {
      const eventName = `feed_${churchId}_${liveChurchId}`;
     
      socket?.socket?.on(eventName, newMessage => {
        
        setFeedData(prevFeedData => [newMessage, ...prevFeedData]);
      });
      return () => {
        socket?.socket?.off(eventName);
      };
    }
  }, []);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const response = await liveChurchFeed({
          churchId,
          liveChurchId,
          message,
        }).unwrap();

        setMessage(''); // Clear the input field after sending
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleFocus = () => {
    navigation.getParent()?.setParams({hideMap: true});
  };

  const handleBlur = () => {
    navigation.getParent()?.setParams({hideMap: false});
  };
  return (
    <KeyboardAvoidingView
      style={tw`flex flex-1 justify-between bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
      <>
        <ScrollView
          style={[tw`mx-4`, {marginBottom: Platform.OS === 'ios' ? 60 : 70}]}>
          {feedData
            .slice()
            .reverse()
            .map((item, index) => (
              <View
                key={index}
                style={tw`${
                  item.user.username === currentUsername
                    ? 'flex-row-reverse'
                    : 'flex-row'
                } mt-3`}>
                <View
                  style={tw`gap-2 items-start ${
                    item.user.username === currentUsername
                      ? 'flex-row-reverse'
                      : 'flex-row'
                  }`}>
                  {/* <View style={tw`flex-row-reverse gap-2 items-start`}> */}
                  <View
                    style={tw`${
                      item?.user?.is_leader
                        ? 'w-12 h-14 top-1'
                        : 'w-12 h-14 top-1'
                    } rounded-full relative`}>
                    {item?.user.is_leader && (
                      <Image
                        source={require('../../assets/images/leadersframe.png')}
                        style={tw`absolute top-[-4px] left-[-2px] w-[50px] h-[50px] rounded-full`}
                      />
                    )}
                    <Image
                      source={
                        item?.user?.profile_pic
                          ? {uri: item?.user?.profile_pic}
                          : require('../../assets/images/whiteplaceholder.png')
                      }
                      style={tw`${
                        item?.user.is_leader
                          ? 'w-9 h-9 left-1.3 top-0.7'
                          : 'w-11 h-11'
                      } rounded-full`}
                    />
                    {item?.user?.is_verified && (
                      <Image
                        source={require('../../assets/images/profilebadge.png')}
                        style={tw`w-[13px] h-[15px] absolute top-[8] left-[8]`}
                      />
                    )}
                  </View>

                  <View>
                    <View
                      style={tw`items-center gap-1 ${
                        item.user.username === currentUsername
                          ? 'flex-row-reverse'
                          : 'flex-row'
                      }`}>
                      {/* <View style={tw`flex-row-reverse gap-1  items-center`}> */}
                      <Text
                        style={tw`text-[#0077B6] text-[15px] md:text-[16px] lg:text-[16px]  font-semibold`}>
                        {item.user.username}
                      </Text>
                      <Text
                        style={tw`text-[#040641] text-[15px] md:text-[16px] lg:text-[16px]  font-semibold`}>
                        {item.line}
                      </Text>
                      {/* <Text
                      style={tw`text-[#040641] text-[12px] md:text-[16px] lg:text-[16px]  `}>
                      {item.user.job}
                    </Text> */}
                    </View>
                    <View>
                      <Text
                        style={[
                          tw`text-[#040641] text-[14px] md:text-[16px] lg:text-[16px] opacity-80 ${
                            item.user.username === currentUsername
                              ? 'text-right'
                              : ''
                          }`,
                          styles.messages,
                        ]}>
                        {item.message}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
        </ScrollView>

        {/* <ScrollView
  style={[tw`mx-4`, { marginBottom: Platform.OS === 'ios' ? 60 : 2 }]}>
  {feedData.map((item, index) => (
    <View key={item.index} style={tw`flex-row-reverse mt-3`}>
      <View style={tw`flex-row-reverse gap-2 items-start`}>
        {item?.user?.profile_pic ? (
          <Image
            source={{ uri: item.user.profile_pic }}
            style={tw`w-8 h-8 rounded-full mt-1`}
          />
        ) : (
          <Image
            source={require('../../assets/images/darkprofile.png')}
            style={tw`w-8 h-8 rounded-full mt-1`}
          />
        )}
        
        <View>
          <View style={tw`flex-row-reverse gap-1 items-center`}>
            <Text
              style={tw`text-[#0077B6] text-[15px] md:text-[16px] lg:text-[16px] font-semibold`}>
              {item.user.username}
            </Text>
            <Text
              style={tw`text-[#040641] text-[15px] md:text-[16px] lg:text-[16px] font-semibold`}>
              {item.line}
            </Text>
            <Text
              style={tw`text-[#040641] text-[12px] md:text-[16px] lg:text-[16px]`}>
              {item.user.job}
            </Text>
          </View>
          <View>
            <Text
              style={[
                tw`text-[#040641] text-[14px] md:text-[16px] lg:text-[16px] opacity-80 text-right`,
                styles.messages,
              ]}>
              {item.message}
            </Text>
          </View>
        </View>
      </View>
    </View>
  ))}
</ScrollView> */}

        <SafeAreaView style={styles.stickyInputContainer}>
          <View style={tw`bg-white h-12 `}>
            <View style={tw`mx-4 `}>
              {/* Sticky TextInput */}
              <View style={styles.inputbar}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flex: 1,
                    alignItems: 'center',
                  }}>
                  <TextInput
                    placeholder="Type something..."
                    placeholderTextColor="rgba(4, 6, 65, 0.7)"
                    value={message}
                    onChangeText={setMessage}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={tw`ml-3 text-[14px] text-black h-full flex-1 `}
                  />
                  <TouchableOpacity onPress={handleSendMessage}>
                    <Image
                      source={require('../../assets/images/sendicon.png')}
                      style={tw`mr-3 w-5 h-5`}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(0, 119, 182, 0.4)',
    borderRadius: 10,
    justifyContent: 'center',
  },
  stickyInputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 4 : 1,
    zIndex: 20,
  },
  messages: {
    width: wp('82%'),
  },
});

export default FeedTab;
