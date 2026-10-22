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
  FlatList,
} from 'react-native';
import tw from 'twrnc';
import {useLiveActivitiesFeedAPIMutation} from '../../features/liveactivity/liveActivityAPiSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import socket from '../../socket/socket';
import FeedActivityMessages from './FeedActivityMessages';

const ActivitiesFeedTab = ({route, navigation}) => {
  const {liveActivitiesStarted } = useSelector((state) => state.liveactivity)
  const {firstName, lastName} = useSelector(state => state.auth);

  const {liveActivityId, christianId, liveEventStarted} = route.params;


  const currentUsername = `${firstName} ${lastName}`;
  const [liveActivityFeed] = useLiveActivitiesFeedAPIMutation(
    {christianId, liveActivityId},
    {refetchOnMountOrArgChange: true},
  ); // Hook for the mutation
  const [message, setMessage] = useState('');
 

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const response = await liveActivityFeed({
          christianId,
          liveActivityId,
          message,
        }).unwrap();
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setMessage('');
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
        {/* render the messages  */}
        <FeedActivityMessages
          currentUsername={currentUsername}
          liveActivityId={liveActivityId}
          christianId={christianId}
          // feedData={feedData}
        />

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
                    // editable={!liveEventStarted}
                    // editable={!liveChurchStarted}
                    style={tw`ml-3 text-[14px] text-black h-full flex-1 `}
                  />
                  <TouchableOpacity onPress={handleSendMessage} disabled={!liveActivitiesStarted}>
                  {/* <TouchableOpacity onPress={handleSendMessage} disabled={!liveEventStarted}> */}
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

export default ActivitiesFeedTab;
