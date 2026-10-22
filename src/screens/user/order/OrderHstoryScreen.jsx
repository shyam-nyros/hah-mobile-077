import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import {
  useDownloadOrderInvoiceLinkQuery,
  useOrderHistoryQuery,
} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';
import moment from 'moment';
import useDebounce from '../../../utils/customhooks/useDebounce';
import InvoiceDownload from './InvoiceDownload';

import musicicon from '../../../assets/images/musicoutlineicon.png';
import videoicon from '../../../assets/images/blueplayicon.png';
import ebookicon from '../../../assets/images/bluebookicon.png';

import bookcoverImg from '../../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../../assets/images/podcastplaceholder.png';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [searchKeyword, setSearchKeyword] = useState('');

  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);

  const {
    data: orderHistory,
    isLoading: orderHistoryLoading,
    isError: OrderHistoryIsError,
    error: OrderHistoryError,
  } = useOrderHistoryQuery(
    {q: debouncedSearchKeyword},
    {refetchOnMountOrArgChange: true},
  );

  const navigateToPreviousScreen = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  //Static Cover Images
  const getCoverImage = mimetype => {
    if (mimetype === 'audio/mpeg') {
      return audiocoverImg;
    } else if (mimetype === 'video/mp4') {
      return videocoverImg;
    } else {
      return bookcoverImg;
    }
  };

  //Formate Type Icons
  const getLibraryItemIconType = mimetype => {
    if (mimetype === 'application/pdf') {
      return ebookicon;
    } else if (mimetype === 'video/mp4') {
      return videoicon;
    } else {
      return musicicon;
    }
  };



  //modal
  const [modalVisible, setModalVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const toggleModal = orderInfo => {
  

    setOrderDetails(orderInfo);
    setModalVisible(!modalVisible);
  };

  const handleSearchInput = txt => {
    setSearchKeyword(txt);
  };

  const clearSearch = () => {
    setSearchKeyword('');
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`flex-row items-center gap-4 mb-4 ml-5 mt-5`}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={tw`w-12 h-12 rounded-2`}
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
    <>
      {/* Header - Always visible */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={navigateToPreviousScreen}>
          <View style={tw`mx-2 flex-row py-4 items-center`}>
            <View>
              <Image
                source={require('../../../assets/images/chevronlefticon.png')}
                style={tw`w-[26px] h-[26px]`}
              />
            </View>
            <Text style={tw`text-xl text-[#fff] font-medium`}>
              Order History
            </Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Content - Changes based on loading and error states */}
      {orderHistoryLoading ? (
        <View>
          {Array.from({length: 5}).map((_, index) => (
            <View key={index}>{renderShimmerPlaceholder()}</View>
          ))}
        </View>
      ) : OrderHistoryIsError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>Error</Text>
        </View>
      ) : (
        <View style={tw`bg-white flex-1 pb-5`}>
          {/* Body */}
          <ScrollView style={tw`mx-4 mt-4 `}>
            {/* Search */}
            <View style={styles.inputbar}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'space-between',
                  marginHorizontal: 16,
                  alignItems: 'center',
                }}>
                <TextInput
                  value={searchKeyword}
                  placeholder="Search Orders"
                  placeholderTextColor="rgba(4, 6, 65, 0.3)"
                  style={tw` text-[15px] font-medium flex-1 h-full text-black`}
                  onChangeText={handleSearchInput}
                />
                <View style={tw`flex-row gap-3 justify-center items-center`}>
                  {searchKeyword.length > 0 && (
                    <TouchableOpacity onPress={clearSearch}>
                      <Image
                        source={require('../../../assets/images/closeicon.png')}
                        style={tw` w-7 h-7`}
                      />
                    </TouchableOpacity>
                  )}
                  {/* <Image
                    source={require('../../../assets/images/filtericon.png')}
                    style={tw` w-7 h-7 ${searchKeyword.length ? ' ' : ''}`} // Apply conditionally
                  /> */}
                </View>
                <Image
                  source={require('../../../assets/images/searchicon2.png')}
                  style={tw`w-7 h-7`}
                />
              </View>
            </View>

            {/**   first model  start **/}
            <Modal
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}>
              <View
                style={tw`flex-1  justify-center items-center bg-gray-900 bg-opacity-40`}>
                <View
                  style={tw`bg-white w-[90%]  rounded-[10px] overflow-hidden`}>
                  <View style={tw`mx-3 mb-4`}>
                    <View style={tw`py-4 flex-row justify-between`}>
                      <Text style={tw`text-[#040641] text-[19px] font-medium`}>
                        Order details
                      </Text>
                      <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Image
                          style={tw`text-black w-6 h-6 text-[18px]`}
                          source={require('../../../assets/images/closeicon.png')}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={tw`flex-row justify-between items-center`}>
                      <View style={tw`flex-row gap-3 mb-3`}>
                        <View>
                          <Image
                            source={
                              orderDetails?.purchasable?.cover_image?.path
                                ? {
                                    uri: orderDetails.purchasable.cover_image
                                      .path,
                                  }
                                : getCoverImage(
                                    orderDetails?.purchasable?.attachment
                                      ?.mimetype,
                                  )
                            }
                            style={tw`w-15 h-17 rounded-[12px]`}
                          />
                          <View
                            style={tw`p-1 rounded-full bg-white absolute right-1 top-1`}>
                            <Image
                              source={getLibraryItemIconType(
                                orderDetails?.purchasable?.attachment?.mimetype,
                              )}
                              style={tw`w-3 h-3`}
                            />
                          </View>
                        </View>
                        <View style={tw`flex-1`}>
                          <Text
                            numberOfLines={2}
                            style={tw`text-[16px] text-[#0077B6] font-medium`}>
                            {orderDetails?.purchasable?.title}
                          </Text>
                          <Text
                            style={tw`text-[14px] text-[#040641] opacity-70`}>
                            {orderDetails?.purchasable?.author?.first_name ||
                              'N/A'}
                            {orderDetails?.purchasable?.author?.last_name
                              ? ` ${orderDetails?.purchasable?.author?.last_name}`
                              : ''}
                          </Text>
                          <View style={tw`justify-end items-end`}>
                            <Text
                              style={tw`text-[14px] text-[#0077B6] font-medium`}>
                              {orderDetails?.transaction_status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={tw`flex-row justify-between items-center`}>
                      <Text
                        style={tw`text-[#040641] font-semibold text-[14px] ml-2`}>
                        Order date
                      </Text>
                      <Text style={tw`text-[#040641] text-[14px] ml-2`}>
                        {moment(orderDetails?.purchase_date).format(
                          'D-MMM-YYYY',
                        )}
                      </Text>
                    </View>

                    <View
                      style={tw`border-b border-[#ccc] opacity-30 mt-3 mb-3`}
                    />

                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`text-[#040641] text-[14px] ml-2`}>
                        Payment Id #
                      </Text>
                      <Text style={tw`text-[#040641] text-[14px] ml-2`}>
                        {orderDetails?.payment_id}
                      </Text>
                    </View>

                    <View
                      style={tw`border-b border-[#ccc] opacity-30 mt-3 mb-3`}
                    />

                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`text-[#040641] text-[14px] ml-2`}>
                        Order total
                      </Text>
                      <Text style={tw`text-[#040641] text-[14px] ml-2`}>
                        {`${orderDetails?.currency} ${orderDetails?.amount?.$numberDecimal}`}
                      </Text>
                    </View>

                    {orderDetails?.transaction_status === 'Completed' && (
                      <InvoiceDownload orderId={orderDetails?._id} />
                    )}
                  </View>
                </View>
              </View>
            </Modal>

            {/* Order items */}
            {orderHistory && orderHistory.length > 0 ? (
              orderHistory.map(order => (
                <View
                  key={order._id}
                  style={tw`flex mt-2 justify-between items-start`}>
                  <TouchableOpacity
                    onPress={() => toggleModal(order)}
                    style={tw`flex-row gap-3 w-full`}>
                    <View style={tw`flex-row justify-between gap-3 flex-1`}>
                      <View style={tw`flex-row gap-3 flex-1`}>
                        <View>
                          <Image
                            source={
                              order?.purchasable?.cover_image?.path
                                ? {uri: order.purchasable.cover_image.path}
                                : getCoverImage(
                                    order?.purchasable?.attachment?.mimetype,
                                  )
                            }
                            style={tw`w-15 h-17 rounded-[12px]`}
                          />

                          <View
                            style={tw`p-1 rounded-full bg-white absolute right-1 top-1`}>
                            <Image
                              source={getLibraryItemIconType(
                                order?.purchasable?.attachment?.mimetype,
                              )}
                              style={tw`w-3 h-3`}
                            />
                          </View>
                        </View>
                        <View style={tw`flex-1`}>
                          <Text
                            numberOfLines={2}
                            style={tw`text-[16px] text-[#0077B6] font-medium`}>
                            {order?.purchasable?.title}
                          </Text>
                          <Text
                            style={tw`text-[14px] text-[#040641] opacity-50`}>
                            Ordered on{' '}
                            {moment(order?.purchase_date).format('D MMM')}
                          </Text>
                          <Text
                            style={tw`text-[14px] text-[#040641] opacity-50`}>
                            Status: {order?.transaction_status}
                          </Text>
                        </View>
                      </View>
                      <View>
                        <Image
                          source={require('../../../assets/images/darkchevronrighticon.png')}
                          style={tw`w-6 h-6`}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text>No orders</Text>
            )}
          </ScrollView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(139, 192, 220, 0.4)',
    borderRadius: 50,
    marginBottom: 16,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    alignItems: 'center',
  },
  resultsContainer: {
    backgroundColor: '#ffffff',
    width: '90%',
    maxHeight: '80%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
  },
});

export default OrderHistoryScreen;
