import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {
  convertEventTime,
  formatDate,
  formattedLocalDate,
  formattedLocalTime,
} from '../../utils/formattedDate';
import {truncateText} from '../../utils/helpers';
import {useOtherLiveChurchesNearYouAPIQuery} from '../../features/home/homeApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import tw from 'twrnc';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
// import LiveChurchAddModal from './LiveChurchAddModal';

const {height, width} = Dimensions.get('window');

const LiveChurchesNearYou = () => {
  const {followedChurchesIdsToFilter} = useSelector(state => state.home);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const handleClose = () => setModalVisible(false);

  const [filteredLiveChurches, setFilteredLiveChurches] = useState([]);

  // Handle address concatenation
  const concatAddress = item => {
    if (item.church) {
      return `${item.church.city} `;
      e;
    }
    if (item.organization) {
      return `${item.organization.city}`;
    }
  };

  const concatName = item => {
    if (item.church) {
      return `${item.church.name}`;
    }
    if (item.organization) {
      return `${item.organization.name}`;
    }
  };

  const {
    data: otherLiveChurchList,
    isLoading: liveChurchesLoading,
    isFetching: liveChurchesFetching,
    error: liveChurchesError,
  } = useOtherLiveChurchesNearYouAPIQuery();

  const handleChurchDetails = (liveChurchId, churchId) => {

    navigation.navigate('LiveChurchDetails', {liveChurchId, churchId});
  };


  // filter for followed churches that is already present in the your church activity
  useEffect(() => {
    if (!liveChurchesLoading && otherLiveChurchList) {
      const result = otherLiveChurchList.filter(
        item => !followedChurchesIdsToFilter.includes(item._id),
      );
   
      setFilteredLiveChurches(result);
    }
  }, [
    liveChurchesLoading,
    liveChurchesFetching,
    otherLiveChurchList,
    followedChurchesIdsToFilter,
  ]);

  const renderItem = ({item}) => {
    
    
    return (
      <Animated.View>
        <TouchableOpacity
          onPress={() =>
            handleChurchDetails(
              item?._id,
              item?.church ? item?.church?._id : item?.organization?._id,
            )
          }
          key={item._id}
          style={[tw`bg-[#fff] rounded-[10px] mr-3 w-[95%]`]}>
          <View>
            <Image
              source={
                item?.cover_image?.path
                  ? {uri: item?.cover_image?.path}
                  : require('../../assets/images/livechurchplaceholder.png')
              }
              style={tw`w-[180px] h-41 rounded-tl-[10px] rounded-tr-[10px]`}
            />
            <View
              style={tw`absolute bg-white px-2 rounded-full py-1 top-2 right-2`}>
              <Text style={tw`text-[10px] font-medium text-[#040641]`}>
                {item.activities_from}
              </Text>
            </View>
          </View>
          <View
            style={tw`w-[180px]  bg-[#0077B6] p-3 rounded-bl-[10px] rounded-br-[10px]`}>
            {/* <Text
              numberOfLines={1}
              style={tw`text-[9.6px] text-[#fff] font-medium`}>
              {`${formatDate(item?.start_date)}, ${item?.start_time}`}
            </Text> */}
            <Text
              numberOfLines={1}
              style={tw`text-[9.6px] text-[#fff] font-medium`}>
              {/* {`${formattedLocalDate(item?.start_date)} - ${item?.start_time}`} */}
              {/* {`${formattedLocalDate(item?.start_date)} - ${formattedLocalTime(item?.start_time)}`} */}
              {convertEventTime(
                item?.start_date,
                item?.slotInfo?.start_time,
                item?.timezone?.tzCode,
              )}
            </Text>

            {/* <Text>{`${item?.start_date} ${item?.start_time} ${item?.timezone?.tzCode}`}</Text> */}

            <View>
              <Text style={tw`text-[14px] text-[#fff] font-medium mt-1 mb-1`}>
                {truncateText(item.title, 18)}
              </Text>
            </View>
            <View style={tw`items-start mb-2 gap-1`}>
              <Text
                style={tw`text-[10px] text-[#fff] font-400 `}
                numberOfLines={1}>
                {concatName(item)}
              </Text>
              <View style={tw`flex-row items-center gap-1`}>
                <Image
                  source={require('../../assets/images/locationiconwhite.png')}
                  style={tw`w-3 h-3`}
                />
                <Text style={tw`text-[10px] text-[#fff] `}>
                  {concatAddress(item)}
                </Text>
              </View>
            </View>
            <View style={tw`flex-row items-center`}>
              <View style={tw`relative mr-10`}>
                <Image
                  source={require('../../assets/images/placeholder.png')}
                  style={tw`w-4 h-4 rounded-full absolute bg-white -top-2 left-0`}
                />
                <Image
                  source={require('../../assets/images/placeholder.png')}
                  style={tw`w-4 h-4 rounded-full absolute bg-white -top-2 left-2`}
                />
                <Image
                  source={require('../../assets/images/placeholder.png')}
                  style={tw`w-4 h-4 rounded-full absolute bg-white -top-2 left-4`}
                />
              </View>
              <Text style={tw`text-[10px] text-[#fff]`}>
                {item?.attendeesCount} attending
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`h-60 mb-4 gap-3 justify-between flex-row`}>
      {[...Array(3)].map((_, index) => (
        <ShimmerPlaceholder
          key={index}
          style={tw`w-[180px] h-[260px] rounded-[10px]`}
          shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
          LinearGradient={LinearGradient}
        />
      ))}
    </View>
  );

  return (
    <>
      <View style={tw`flex-row  justify-between items-center mb-2 mt-1`}>
        <View style={tw`flex-row`}>
          <Image
            source={require('../../assets/images/churchicon2.png')}
            style={tw`w-5 h-5 mr-1`}
          />
          <Text style={tw`text-[15px] text-[#040641] font-semibold`}>
            Live Churches You Might Like
          </Text>
          {otherLiveChurchList?.length === 0 && (
            <TouchableOpacity
              style={tw`w-5 h-5 justify-center items-center`}
              onPress={() => setModalVisible(true)}>
              <Image
                source={require('../../assets/images/infoicon.png')}
                style={tw`w-4 h-4 ml-2`}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Livechurch')}>
          <Text style={tw`text-[13px] text-[#040641] py-2  opacity-50`}>
            See all {'>'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}>
        <TouchableWithoutFeedback>
          <View
            style={tw`flex-1 justify-center items-center bg-gray-500 bg-opacity-30 px-4`}>
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={[tw`px-4`, styles.modalOverlay]}>
                <View style={[tw`p-4`, styles.alertBox]}>
                  <View>
                    <View style={tw`flex-row gap-1 justify-start items-center`}>
                      <Image
                        source={require('../../assets/images/infoicon.png')}
                        style={tw`w-6 h-6 `}
                      />
                      <Text
                        style={tw`text-[#040641] text-[16px] font-semibold`}>
                        Details
                      </Text>
                    </View>
                    <View style={tw`p-2`}>
                      {/* <Text
                        style={tw`text-[#040641] text-[14px] tracking-normal leading-5 text-gray-700`}>
                        This section displays live updates related to your
                        church, the churches you follow, and nearby churches in
                        your locations.
                      </Text> */}
                      <Text
                        style={tw`text-[#040641] text-[14px] tracking-normal leading-5 text-gray-700`}>
                        There is no data available for your church and the
                        churches you follow, so you are viewing churches from
                        across the globe.{' '}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {liveChurchesLoading || liveChurchesFetching ? (
        renderShimmerPlaceholder()
      ) : liveChurchesError ? (
        <View style={tw`flex-1 mb-4 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to load live churches</Text>
        </View>
      ) : otherLiveChurchList?.length === 0 ? (
        <View style={tw`flex-1 mb-4 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>No Live Church Activities </Text>
        </View>
      ) : (
        <View style={{height: 300, justifyContent: 'center'}}>
          <FlatList
            data={filteredLiveChurches}
            keyExtractor={item => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            decelerationRate="fast"
            // ListFooterComponent={<LiveChurchAddModal />}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
});

export default LiveChurchesNearYou;
