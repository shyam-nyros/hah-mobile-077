import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import {useChatWithFriendsListQuery} from '../../features/home/homeApiSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import ChatWithFriendsItem from './ChatWithFriendsItem';
import {useNavigation} from '@react-navigation/native';

const ChatWithFriends = () => {
  const navigation = useNavigation();
  const {
    data: chatList,
    isLoading: chatListLoading,
    isError: chatListError,
  } = useChatWithFriendsListQuery();


  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 gap-3 flex-row`}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={tw`items-center`}>
          <ShimmerPlaceholder
            style={tw`h-16 w-16 rounded-full`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-3 w-17 rounded-md mt-2`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-3 w-15 rounded-md mt-1`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-3 w-12 rounded-md mt-1`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
        </View>
      ))}
    </View>
  );

  const renderItem = ({item}) => {
    if (item._id === 'custom_card') {
      return (
        <View style={tw`justify-center items-center`}>
          <TouchableOpacity
            style={tw`bg-[#e6f8fb] rounded-full items-center justify-center w-17 h-17 mt-2`}
            onPress={() =>
              navigation.navigate('Fellowship', {initialTab: 'Message'})
            }>
            <Image
              source={require('../../assets/images/addicon.png')}
              style={tw`w-10 h-10`}
            />
          </TouchableOpacity>
          <Text style={tw`text-[12px] text-[#0077B6]  font-medium mt-1`}>
            Add More
          </Text>
          <Text style={tw`text-[12px] text-[#0077B6]  font-medium`}>
            Friends
          </Text>
        </View>
      );
    }
    return <ChatWithFriendsItem friendInfo={item} />;
  };

  return (
    <>
      <View style={tw`flex-row justify-between items-center`}>
        <Text
          style={tw`text-[15px] md:text-[16px] lg:text-[16px] pb-3 text-[#040641] font-semibold`}>
          Chat with Friends
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Fellowship', {initialTab: 'Message'})
          }
          style={tw`flex-1 justify-end items-end pb-3 `}>
          <Text
            style={tw`text-[13px] md:text-[14px]  lg:text-[14px] text-[#040641] opacity-50`}>
            See all {'>'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70 `}>
        Connect & Grow Together
      </Text>
      {chatListLoading ? (
        renderShimmerPlaceholder()
      ) : chatListError ? (
        <View style={tw`flex-1 mt-5 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to Chat with Friends</Text>
        </View>
      ) : chatList?.length === 0 ? (
        <View style={tw`flex-1 mt-5 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>No Chat with Friends Data</Text>
          <Text>Connect with friends</Text>
        </View>
      ) : (
        <>
          {chatList && (
            <FlatList
              data={[...chatList, {_id: 'custom_card'}]}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={false}
            />
          )}
        </>
        // <View style={tw`flex-1`}>
        //   <FlatList
        //     data={[...chatList, {_id: 'custom_card'}]}
        //     renderItem={renderItem}
        //     keyExtractor={item => item._id}
        //     horizontal
        //     showsHorizontalScrollIndicator={false}
        //     pagingEnabled={false}
        //   />
        // </View>
      )}
      {/* {chatList && (
        <FlatList
          data={[...chatList, {_id: 'custom_card'}]}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
        />
      )} */}
    </>
  );
};

export default ChatWithFriends;
