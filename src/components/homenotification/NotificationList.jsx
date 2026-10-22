import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, FlatList} from 'react-native';
import tw from 'twrnc';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import NotificationListItem from './NotificationListItem';
import LoadingSpinner from '../LoadingSpinner';
import {useHomeNotificationsQuery} from '../../features/auth/authApiSlice';
import {useNavigation} from '@react-navigation/native';

const NotificationList = () => {
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: notificationsResponse,
    isError,
    isLoading,
    isFetching,
  } = useHomeNotificationsQuery(currentPage);

  const incrementPage = () => {
    if (notificationsResponse?.hasMore && !isFetching) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`flex-row items-center gap-4 mb-4`}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={tw`w-12 h-12 rounded-full`}
      />
      <View>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-[75%] h-4 mb-2 rounded-md`}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-[50%] h-4 rounded-md`}
        />
      </View>
    </View>
  );

  return (
    <View style={tw`h-[50%] bg-white p-4`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`font-medium text-[18px] text-[#040641]`}>
          Last 30 Days
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('PendingRequestList')}>
          <Text style={tw`text-gray-500 text-base text-[15px]`}>
            Pending Requests (
            {notificationsResponse?.pendingFollowRequestsCount || 0})
          </Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View>
          {Array.from({length: 5}).map((_, index) => (
            <View key={index}>{renderShimmerPlaceholder()}</View>
          ))}
        </View>
      ) : isError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-black`}>No Notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notificationsResponse?.list}
          keyExtractor={item => item?._id}
          renderItem={({item}) => (
            <NotificationListItem notificationItem={item} />
          )}
          // onEndReached={incrementPage}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <View>
              {(isLoading || isFetching) && (
                <View style={{marginBottom: 60}}>
                  <LoadingSpinner color="blue" size="small" />
                </View>
              )}
              {!isLoading &&
                !isFetching &&
                notificationsResponse?.list?.length === 0 && (
                  <View style={tw`flex-1 py-30  justify-center items-center`}>
                    <Text style={tw`text-black`}>No Notifications !</Text>
                  </View>
                )}
            </View>
          }
        />
      )}
      {!isFetching && notificationsResponse?.hasMore && (
        <TouchableOpacity
          style={tw`flex justify-center items-center`}
          onPress={incrementPage}>
          <View style={tw` flex gap-2 flex-row justify-center items-center`}>
            <Text style={tw`text-black font-semibold text-[#040641]`}>
              See More
            </Text>
            <Image
              source={require('../../assets/images/darkchevronrighticon.png')}
              style={[tw` w-5 h-5 -mt-2`, {transform: [{rotate: '90deg'}]}]}
            />
          </View>
        </TouchableOpacity>
      )}
      {!isLoading && isFetching && (
        <View style={tw` flex gap-2 flex-row justify-center items-center`}>
          <Text style={tw`text-black font-semibold text-[#040641]`}>
            Loading...
          </Text>
        </View>
      )}
    </View>
  );
};

export default NotificationList;
