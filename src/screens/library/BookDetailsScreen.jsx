import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import tw from 'twrnc';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {
  useLibraryDetailsAPIQuery,
  useRemoveBookMarksAPIMutation,
  useSaveBookMarksAPIMutation,
} from '../../features/library/libraryApiSlice';
import {
  useUserDetailsQuery,
  useUpdateUserAPIMutation,
} from '../../features/auth/authApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import showToast from '../../utils/toast/showToast';
import bookcoverImg from '../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../assets/images/podcastplaceholder.png';

const BookDetailsScreen = ({route, navigation}) => {
  const [saveBookmark] = useSaveBookMarksAPIMutation();
  const [removeBookmark] = useRemoveBookMarksAPIMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [paidStatus, setPaidStatus] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const {libraryItemId} = route.params;

  // Name prompt sheet
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [nameFirst, setNameFirst] = useState('');
  const [nameLast, setNameLast] = useState('');
  const [pendingBookmark, setPendingBookmark] = useState(false);
  const {data: userInfo} = useUserDetailsQuery();
  const [updateUserAPI, {isLoading: isUpdatingName}] =
    useUpdateUserAPIMutation();

  const {
    data: libraryDetails,
    isLoading: libraryDetailsLoading,
    isFetching: libraryDetailsFetching,
    error: libraryDetailsError,
  } = useLibraryDetailsAPIQuery(libraryItemId);

  const getCoverImage = libraryType => {
    switch (libraryType) {
      case 'audio':
        return audiocoverImg;
      case 'video':
        return videocoverImg;
      default:
        return bookcoverImg;
    }
  };

  // const handleNavigation = (id, libraryType) => {

  //   if (libraryType === 'audio') {
  //     // navigation.navigate('PodcastDetails', {libraryItemId: id});
  //     navigation.navigate({
  //       name: 'PodcastDetails',
  //       params: { libraryItemId: id },
  //       key: `PodcastDetails-${id}`
  //     });
  //   } else if (libraryType === 'video') {
  //     // navigation.navigate('VideoDetails', {libraryItemId: id});
  //     navigation.navigate({
  //       name: 'VideoDetails',
  //       params: { libraryItemId: id },
  //       key: `VideoDetails-${id}`
  //     });
  //   } else if (libraryType === 'ebook') {
  //     // navigation.navigate('BookDetails', {libraryItemId: id});
  //     navigation.navigate({
  //       name: 'BookDetails',
  //       params: { libraryItemId: id },
  //       key: `BookDetails-${id}`
  //     });
  //   }
  // };
  const handleNavigation = (id, libraryType) => {
    if (libraryType === 'audio') {
      navigation.navigate('PodcastDetails', {libraryItemId: id});
    } else if (libraryType === 'video') {
      navigation.navigate('VideoDetails', {libraryItemId: id});
    } else if (libraryType === 'ebook') {
      navigation.navigate('BookDetails', {libraryItemId: id});
    }
  };

  const handleBookmarkToggle = async () => {
    if (userInfo?.is_name_verified === false) {
      setPendingBookmark(true);
      setShowNameSheet(true);
      return;
    }
    try {
      if (libraryDetails?.library?.user_bookmarked) {
        await removeBookmark(libraryDetails.library._id);
      } else {
        await saveBookmark(libraryDetails.library._id);
      }
    } catch (error) {
      console.error('Bookmark toggle error:', error);
    }
  };

  const handleNameSubmit = async () => {
    if (!nameFirst.trim() || !nameLast.trim()) return;
    try {
      await updateUserAPI({
        first_name: nameFirst.trim(),
        last_name: nameLast.trim(),
        is_name_verified: true,
      }).unwrap();
      setShowNameSheet(false);
      if (pendingBookmark) {
        setPendingBookmark(false);
        try {
          if (libraryDetails?.library?.user_bookmarked) {
            await removeBookmark(libraryDetails.library._id);
          } else {
            await saveBookmark(libraryDetails.library._id);
          }
        } catch (error) {
          console.error('Bookmark toggle error:', error);
        }
      }
    } catch (e) {}
  };

  const downloadAttachment = async () => {
    if (!libraryDetails?.library?.attachment?.path) {
      showToast('error', 'No file URL found.');
      return;
    }
    setIsLoading(true);
    try {
      const fileUrl = libraryDetails.library.attachment.path;
      const fileName =
        libraryDetails.library.attachment.name || 'downloaded_file';
      let destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      if (Platform.OS === 'ios') {
        destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }

      const options = {
        fromUrl: fileUrl,
        background: true,
        discretionary: true,
        toFile: destinationPath,
      };

      await RNFS.downloadFile(options).promise;

      if (Platform.OS === 'ios') {
        await FileViewer.open(destinationPath);
      }

      showToast('success', 'File downloaded!');
    } catch (error) {
      showToast('error', 'Failed to download file!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await downloadAttachment();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (libraryDetails?.library) {
      setPaidStatus(libraryDetails.library.purchased);
      console.log('Library title:', libraryDetails.library.slug);
    }
  }, [libraryDetails]);

  return (
    <>
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <View style={tw`mx-2 py-4 flex-row justify-between`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`mx-2 bg-white w-9 h-9 justify-center items-center rounded-full`}>
            <Image
              source={require('../../assets/images/backnavicon.png')}
              style={tw`w-[34px] h-[34px] mr-1`}
            />
          </TouchableOpacity>
          {!libraryDetailsLoading &&
            !libraryDetailsFetching &&
            (paidStatus ||
              libraryDetails?.library?.price?.$numberDecimal === '0') && (
              <TouchableOpacity
                onPress={handleDownload}
                disabled={isLoading}
                style={tw`mx-2 border-2 border-white w-9 h-9 justify-center items-center rounded-[10px] py-4`}>
                {isLoading ? (
                  <View
                    style={tw`mx-2 border-2 border-white w-9 h-9 justify-center items-center rounded-[10px] py-4`}>
                    <LoadingSpinner size="small" />
                  </View>
                ) : (
                  <Image
                    source={require('../../assets/images/downloadwhiteicon.png')}
                    style={tw`w-[22px] h-[22px]`}
                  />
                )}
              </TouchableOpacity>
            )}
        </View>
      </SafeAreaView>

      {libraryDetailsLoading || libraryDetailsFetching ? (
        <ScrollView style={tw`bg-[#fff]`}>
          <View style={tw`bg-[#0077B6]`}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-40 w-70 mb-8 self-center mt-12`}
            />
          </View>
          <View style={tw`p-4`}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-30 w-full mb-4 rounded-5`}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-20 w-full mt-10 mb-4 rounded-4`}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-25 w-full mt-6 mb-2 rounded-3`}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-25 w-full mt-4 rounded-5`}
            />
          </View>
        </ScrollView>
      ) : libraryDetailsError ? (
        <Text>Failed to load details</Text>
      ) : (
        <ScrollView style={tw`bg-[#fff]`}>
          <View style={tw`bg-[#0077B6]`}>
            <View style={tw`flex-1 mb-12 mt-12 justify-center items-center`}>
              <View style={tw`h-61 w-49 border-4 border-white`}>
                {/* generated by AI */}
                {libraryDetails?.library?.aigenerated && (
                  <Image
                    source={
                      libraryDetails.library?.ai_cover_image
                        ? {uri: libraryDetails?.library?.ai_cover_image}
                        : getCoverImage(libraryDetails.library.type)
                    }
                    style={[tw`h-59 w-47`, {zIndex: -500}]}
                  />
                )}
                {/* not generated by AI */}
                {!libraryDetails?.library?.aigenerated && (
                  <Image
                    source={
                      libraryDetails.library.cover_image
                        ? {uri: libraryDetails.library.cover_image.path}
                        : getCoverImage(libraryDetails.library.type)
                    }
                    style={[tw`h-59 w-47`, {zIndex: -500}]}
                  />
                )}
              </View>
            </View>

            <View style={tw`flex-1 pb-10 bg-white rounded-t-[38px]`}>
              <View style={tw`mx-4`}>
                <Text style={tw`text-[#040641] text-[22px] font-medium mt-5`}>
                  {libraryDetails?.library?.title}
                </Text>

                <View style={tw`flex-row justify-between items-center mt-3`}>
                  <Text style={tw`text-[#0077B6] font-bold`}>
                    {libraryDetails.library.price?.$numberDecimal === '0' ? (
                      'Free'
                    ) : !paidStatus ? (
                      // <Text>Premium</Text>
                      <TouchableOpacity
                        onPress={() => setShowPremiumModal(true)}
                        style={tw`flex-row items-center px-3 py-1  rounded-full border border-[#B8860B]`}>
                        <Image
                          source={require('../../assets/images/librarypremium.png')}
                          style={tw`w-4 h-4 mr-1`}
                          resizeMode="contain"
                        />
                        <Text
                          style={tw`text-[#B8860B] text-[13px] font-medium`}>
                          Premium
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={tw`text-[#0077B6] italic `}>Purchased</Text>
                    )}
                  </Text>
                  <TouchableOpacity
                    style={tw`flex-row px-2 py-2 border border-[#0077B6] rounded-3 justify-center items-center`}
                    onPress={handleBookmarkToggle}>
                    <Text
                      style={tw`text-[#0077B6] text-[14px] mr-2 font-medium`}>
                      Add to Favorites
                    </Text>
                    <Image
                      source={
                        libraryDetails?.library?.user_bookmarked
                          ? require('../../assets/images/saveactiveicon.png')
                          : require('../../assets/images/saveicon.png')
                      }
                      style={tw`h-5 w-5`}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={tw`flex-1 flex-row justify-between w-full bg-[#040641] bg-opacity-4 p-2 rounded-[8px] mt-2 mb-4`}>
                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row flex-1 items-start mb-2`}>
                      <Image
                        source={require('../../assets/images/authoricon.png')}
                        style={tw`w-4 h-4 mr-2`}
                      />
                      <Text
                        style={tw`text-[12px] text-[#040641] font-medium flex-1`}>
                        {`Speakers: ${
                          libraryDetails?.library?.author
                            ? `${
                                libraryDetails.library?.author?.first_name ||
                                'N/A'
                              } ${
                                libraryDetails.library?.author?.last_name || ''
                              }`
                            : 'N/A'
                        }`}
                      </Text>
                    </View>
                    <View style={tw`flex-row items-center mb-2`}>
                      <Image
                        source={require('../../assets/images/formaticon.png')}
                        style={tw`w-4 h-4 mr-2`}
                      />
                      <Text
                        style={tw`text-[12px] text-[#040641] font-medium flex-1`}>
                        {`Format: ${libraryDetails.library.type}`}
                      </Text>
                    </View>
                    <View style={tw`flex-row items-center mb-2`}>
                      <Image
                        source={require('../../assets/images/languageicon.png')}
                        style={tw`w-4 h-4 mr-2`}
                      />
                      <Text
                        style={tw`text-[12px] text-[#040641] font-medium flex-1`}>
                        {!libraryDetailsLoading &&
                          `Language : ${libraryDetails?.library?.language}`}
                      </Text>
                    </View>
                  </View>

                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center mb-2`}>
                      <Image
                        source={require('../../assets/images/pagesicon.png')}
                        style={tw`w-4 h-4 mr-2`}
                      />
                      <Text
                        style={tw`text-[12px] text-[#040641] font-medium flex-1`}>
                        {`Pages: ${libraryDetails?.library?.pages || 'N/A'}`}
                      </Text>
                    </View>
                    <View style={tw`flex-row items-start mb-2`}>
                      <Image
                        source={require('../../assets/images/publisher.png')}
                        style={tw`w-4 h-4 mr-2`}
                      />
                      <Text
                        style={tw`text-[12px] text-[#040641] font-medium flex-1`}>
                        {`Publisher: ${
                          libraryDetails.library.publisher || 'N/A'
                        }`}
                      </Text>
                    </View>
                    <View style={tw`flex-row items-start mb-2`}>
                      <Image
                        source={require('../../assets/images/isbnicon.png')}
                        style={tw`w-4 h-4 mr-2`}
                      />
                      <Text
                        style={tw`text-[12px] text-[#040641] font-medium flex-1`}>
                        {`ISBN: ${libraryDetails?.library?.isbn || 'N/A'}`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View>
                  <Text style={tw`text-[16px]  text-[#040641] font-medium`}>
                    About the Book
                  </Text>
                  <Text style={tw`text-[13px] text-[#040641] opacity-50 mt-2`}>
                    {libraryDetails?.library?.description}
                  </Text>
                </View>

                {/* From the same contributor */}
                <View>
                  <Text
                    style={tw`text-[16px] text-[#040641] font-medium mt-4 mb-2`}>
                    From the same contributor
                  </Text>
                  {libraryDetails?.from_same_contributor &&
                    libraryDetails?.from_same_contributor?.length === 0 && (
                      <Text style={tw`text-[#040641]`}>None</Text>
                    )}
                  {libraryDetails?.from_same_contributor &&
                    libraryDetails?.from_same_contributor?.length > 0 && (
                      <View>
                        <FlatList
                          data={libraryDetails.from_same_contributor}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={item => item._id}
                          renderItem={({item}) => (
                            <View style={tw`mr-3 flex-1`}>
                              <TouchableOpacity
                                onPress={() =>
                                  handleNavigation(item._id, item?.type)
                                }>
                                <Image
                                  source={
                                    item.cover_image
                                      ? {uri: item.cover_image.path}
                                      : getCoverImage(item.type)
                                  }
                                  style={tw`w-22 h-22 rounded-[10px]`}
                                />
                              </TouchableOpacity>
                              <Text
                                style={tw`text-[12px] w-22 ml-1 mt-1 text-[#0077B6] font-medium`}>
                                {item?.title}
                              </Text>
                            </View>
                          )}
                        />
                      </View>
                    )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Name prompt bottom sheet */}
      <Modal
        visible={showNameSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameSheet(false)}>
        <View style={nameStyles.sheetOverlay}>
          <View style={nameStyles.sheet}>
            <View style={nameStyles.sheetHandle} />
            <View style={nameStyles.sheetAvatarRow}>
              <View style={nameStyles.sheetAvatar}>
                <Image
                  source={require('../../assets/images/placeholder.png')}
                  style={nameStyles.sheetAvatarImg}
                />
              </View>
            </View>
            <Text style={nameStyles.sheetTitle}>Add your name to save</Text>
            <Text style={nameStyles.sheetSubtitle}>
              Your name will be shown with your saved items so others can know
              and connect with you.
            </Text>
            <TextInput
              style={nameStyles.sheetInput}
              placeholder="First Name"
              placeholderTextColor="#9A9EAE"
              value={nameFirst}
              onChangeText={setNameFirst}
            />
            <TextInput
              style={nameStyles.sheetInput}
              placeholder="Last Name"
              placeholderTextColor="#9A9EAE"
              value={nameLast}
              onChangeText={setNameLast}
            />
            <TouchableOpacity
              style={[
                nameStyles.sheetButton,
                (!nameFirst.trim() || !nameLast.trim()) &&
                  nameStyles.sheetButtonDisabled,
              ]}
              onPress={handleNameSubmit}
              disabled={
                !nameFirst.trim() || !nameLast.trim() || isUpdatingName
              }>
              {isUpdatingName ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={nameStyles.sheetButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowNameSheet(false)}>
              <Text style={nameStyles.sheetNotNow}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showPremiumModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPremiumModal(false)}>
        <View style={nameStyles.sheetOverlay}>
          <View style={nameStyles.sheet}>
            <View style={nameStyles.sheetHandle} />

            {/* icon */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#FFF3CD',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
              <Text style={{fontSize: 28}}>🔒</Text>
            </View>

            <Text style={nameStyles.sheetTitle}>Premium content</Text>
            <Text style={nameStyles.sheetSubtitle}>
              This item requires a purchase. You'll be redirected to our website
              to complete your purchase securely.
            </Text>

            {/* info banner */}
            <View
              style={{
                backgroundColor: '#F1F5F9',
                borderRadius: 8,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 24,
                gap: 8,
              }}>
              <Text style={{color: '#64748B', fontSize: 18, lineHeight: 20}}>
                ℹ️
              </Text>
              <Text
                style={{
                  color: '#64748B',
                  fontSize: 13,
                  flex: 1,
                  lineHeight: 20,
                }}>
                You'll be taken to an external website to complete the purchase.
              </Text>
            </View>

            <TouchableOpacity
              style={nameStyles.sheetButton}
              onPress={() => {
                setShowPremiumModal(false);
                // Replace with your actual purchase URL:
                Linking.openURL(
                  `https://heavenathand.org/library/ebook/${libraryDetails?.library?.slug}`,
                );
              }}>
              <Text style={nameStyles.sheetButtonText}>
                Go to website to purchase
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPremiumModal(false)}>
              <Text style={nameStyles.sheetNotNow}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const nameStyles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D3DC',
    marginBottom: 20,
  },
  sheetAvatarRow: {
    marginBottom: 14,
  },
  sheetAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DFF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheetAvatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  sheetInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#040641',
    marginBottom: 14,
  },
  sheetButton: {
    height: 52,
    borderRadius: 30,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sheetButtonDisabled: {
    opacity: 0.5,
  },
  sheetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sheetNotNow: {
    textAlign: 'center',
    color: '#0077B6',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BookDetailsScreen;
