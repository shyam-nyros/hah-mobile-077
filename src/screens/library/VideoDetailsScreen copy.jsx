import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Alert,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import React, {useEffect, useState} from 'react';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import {
  useDownloadYTLinkAPIQuery,
  useLibraryDetailsAPIQuery,
  useRemoveBookMarksAPIMutation,
  useSaveBookMarksAPIMutation,
} from '../../features/library/libraryApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import showToast from '../../utils/toast/showToast';
import bookcoverImg from '../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../assets/images/podcastplaceholder.png';
import LibraryVideoPlayer from '../../utils/videoplayer/LibraryVideoPlayer';
import YouTubePlayer from 'react-native-youtube-iframe';
import {URL} from 'react-native-url-polyfill';

const VideoDetailsScreen = ({route}) => {
  const {libraryItemId} = route.params;

  const [showVideo, setShowVideo] = useState(false);
  const [downloadYTVideo, setDownloadYTVideo] = useState(false);
  const [ytVideoId, setYTVideoId] = useState('');

  const [paidSatus, setPaidStatus] = useState(false);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [saveBookmark] = useSaveBookMarksAPIMutation();
  const [removeBookmark] = useRemoveBookMarksAPIMutation();

  const getCoverImage = libraryType => {
    if (libraryType === 'audio') {
      return audiocoverImg;
    } else if (libraryType === 'video') {
      return videocoverImg;
    } else {
      return bookcoverImg;
    }
  };
  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  // details api
  const {
    data: libraryDetails,
    isLoading: libraryDetailsLoading,
    isFetching: libraryDetailsFetching,
    error: libraryDetailsError,
  } = useLibraryDetailsAPIQuery(libraryItemId);

  // yt link download api
  const {
    data: ytAttachment,
    isLoading: ytAttachmentLoading,
    isError: ytAttachmentIsError,
    isFetching: ytAttachmentFetching,
    error: ytAttachmentError,
  } = useDownloadYTLinkAPIQuery(libraryItemId, {
    skip: !downloadYTVideo,
    refetchOnMountOrArgChange: true,
  });

  const handleYTDownloadLink = () => {
    setDownloadYTVideo(true);
  };

  const handleBookmarkToggle = async () => {
    try {
      if (libraryDetails?.library?.user_bookmarked) {
        await removeBookmark(libraryDetails.library._id);
      } else {
        await saveBookmark(libraryDetails.library._id);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };


  // const handleNavigation = (id, libraryType) => {

    
  //    if (libraryType === 'audio') {
  //      // navigation.navigate('PodcastDetails', {libraryItemId: id});
  //      navigation.navigate({
  //        name: 'PodcastDetails',
  //        params: { libraryItemId: id },
  //        key: `PodcastDetails-${id}`  
  //      });
  //    } else if (libraryType === 'video') {
  //      // navigation.navigate('VideoDetails', {libraryItemId: id});
  //      navigation.navigate({
  //        name: 'VideoDetails',
  //        params: { libraryItemId: id },
  //        key: `VideoDetails-${id}`  
  //      });
  //    } else if (libraryType === 'ebook') {
  //      // navigation.navigate('BookDetails', {libraryItemId: id});
  //      navigation.navigate({
  //        name: 'BookDetails',
  //        params: { libraryItemId: id },
  //        key: `BookDetails-${id}`  
  //      });
  //    }
  //  };
   
  const handleNavigation = (id, libraryType) => {

    if (libraryType === 'audio') {
      navigation.navigate('PodcastDetails', {libraryItemId: id});
    } else if (libraryType === 'video') {
      navigation.navigate('VideoDetails', {libraryItemId: id});
    } else if (libraryType === 'ebook') {
      navigation.navigate('BookDetails', {libraryItemId: id});
    }
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
    const saveYTLinkFile = async blob => {
      try {
        const fileName = `${libraryDetails?.library?.title}.mp4`;
        var filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        if (Platform.OS == 'ios') {
          filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        }
        // Convert blob to base64
        const base64Data = await blobToBase64(blob);
        await RNFS.writeFile(filePath, base64Data, 'base64');
        if (Platform.OS == 'ios') {
          await FileViewer.open(filePath);
        }
        showToast('success', 'File downloaded successfully!');
      } catch (err) {
        console.error(err);
        showToast('error', 'Failed to download the file');
      } finally {
        setDownloadYTVideo(false);
      }
    };

    const blobToBase64 = blob => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    if (ytAttachment && !ytAttachmentLoading && !ytAttachmentIsError) {
      // blob received from the api response and passed here
      saveYTLinkFile(ytAttachment);
    }

    if (ytAttachmentIsError) {
      showToast('error', 'Failed to download file.');
      setDownloadYTVideo(false);
    }
  }, [ytAttachment, ytAttachmentLoading, ytAttachmentIsError, libraryItemId]);

  useEffect(() => {
    if (libraryDetails?.library) {
      // Check if it's purchased or free (price is 0)
      const isPurchased = libraryDetails.library.purchased;
      const isFree = libraryDetails?.library?.price?.$numberDecimal === '0';
      if (isPurchased || isFree) {
        setPaidStatus(true);
      } else {
        setPaidStatus(false);
      }
    }

    // set video id if the item has yt url link
    if (
      libraryDetails &&
      libraryDetails?.library &&
      libraryDetails?.library?.youtubeUrl
    ) {
      const ytlink = libraryDetails?.library?.youtubeUrl;
      const parsedUrl = new URL(ytlink);
      const videoId = parsedUrl.searchParams.get('v');
      if (videoId) {
        setYTVideoId(videoId);
      }
    }
  }, [libraryDetailsLoading, libraryDetails]);

  const handlePlayVideo = () => {
    if (paidSatus) {
      setShowVideo(true);
    }
  };


  // old code
  // useEffect(() => {
  //   if (libraryDetails?.library) {
  //     setPaidStatus(libraryDetails.library.purchased);
  //   }
  // }, [libraryDetails]);


  return (
    <>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <View style={tw`mx-2 py-4 flex-row justify-between`}>
          <TouchableOpacity
            onPress={navigateToPreviousScreen}
            style={tw`mx-2 bg-white w-9 h-9 justify-center items-center rounded-full py-4`}>
            <Image
              source={require('../../assets/images/backnavicon.png')}
              style={tw`w-[34px] h-[34px] mr-1`}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={handleYTDownloadLink}>
            <Text>Test</Text>
          </TouchableOpacity> */}
          {!libraryDetailsLoading &&
            !libraryDetailsFetching &&
            (paidSatus ||
              libraryDetails?.library?.price?.$numberDecimal === '0') && (
              <View style={tw`flex-row`}>
                <TouchableOpacity
                  // onPress={handleDownload}
                  // onPress={handleYTDownloadLink}
                  onPress={() =>
                    libraryDetails?.library?.youtubeUrl
                      ? handleYTDownloadLink()
                      : handleDownload()
                  }
                  disabled={isLoading}
                  style={tw`mx-2 border-2 border-white w-9 h-9 justify-center items-center rounded-[10px] py-4`}>
                  {isLoading || ytAttachmentLoading || ytAttachmentFetching ? (
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
                {/* <TouchableOpacity
                  style={tw`mx-2 border-2 border-white w-9 h-9 justify-center items-center rounded-[10px] py-4`}>
                  <Image
                    source={require('../../assets/images/transcripticon.png')}
                    style={tw`w-[22px] h-[22px] `}
                  />
                </TouchableOpacity> */}
              </View>
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
        <View style={tw`flex-1 justify-center items-center`}>
          Failed to load details
        </View>
      ) : (
        <ScrollView style={tw` bg-[#fff]`}>
          <View style={tw`bg-[#0077B6]`}>
            {/** Image Area **/}
            {!libraryDetailsLoading && libraryDetails && !showVideo && (
              // {!libraryDetailsLoading && libraryDetails && !paidSatus && (
              <View style={tw`h-40 mb-20 mt-12 justify-center items-center `}>
                <TouchableOpacity
                  onPress={handlePlayVideo}
                  style={tw`h-47 w-82 border-[4px] border-white`}>
                  <Image
                    source={
                      libraryDetails.library.cover_image
                        ? {uri: libraryDetails.library.cover_image.path}
                        : getCoverImage(libraryDetails.library.type)
                    }
                    style={tw`h-45 w-80`}
                    resizeMode="stretch"
                  />

                  <View style={tw` top-18 right-30 absolute `}>
                    <Image
                      source={require('../../assets/images/playcirclewhiteicon.png')}
                      style={tw`w-12 h-11`}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}
            {/* Show video if paid or if its a free version */}
            {paidSatus && showVideo && (
              <View style={tw`h-40 mb-20 mt-12 justify-center items-center `}>
                <View style={tw`h-47 w-82 border-[4px] border-white`}>
                  <View style={tw`h-45 w-80 mb-20`}>
                    {/* for direct attachment */}
                    {libraryDetails && !libraryDetails?.library?.youtubeUrl && (
                      <LibraryVideoPlayer
                        // uri={'https://www.youtube.com/watch?v=vLmDTl5DJoE'}
                        uri={libraryDetails?.library?.attachment?.path}
                        playStatus={showVideo}
                        controlsStyles={{
                          hideSeekBar: false,
                          hideDuration: false,
                          seekIncrementMS: 10000,
                          hideNavigationBarOnFullScreenMode: true,
                          hideNotificationBarOnFullScreenMode: true,
                        }}
                      />
                    )}
                    {/* for YT attachments */}
                    {libraryDetails && libraryDetails?.library?.youtubeUrl && (
                      <YouTubePlayer
                        height={300}
                        play={true}
                        // videoId={'o0tuB5_Rvjs'}
                        videoId={ytVideoId}
                      />
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/** Body **/}
          {!libraryDetailsLoading && libraryDetails && (
            <View style={tw`flex-1 pb-10 -mt-10 bg-white  rounded-t-[38px]`}>
              <View style={tw`mx-4 flex-1`}>
                <Text style={tw`text-[#040641] text-[22px] font-medium  mt-5`}>
                  {/* Be Different who do you think you are? Craig Groeschel */}
                  {!libraryDetailsLoading && libraryDetails?.library.title}
                </Text>
                <View style={tw`flex-row justify-between items-center mt-3`}>
                  {libraryDetails?.library?.price?.$numberDecimal === '0' ? (
                    <Text style={tw`text-[#0077B6] font-bold`}>Free</Text>
                  ) : !paidSatus ? (
                    <Text style={tw`text-[#0077B6] italic`}>Premium</Text>
                  ) : (
                    <Text style={tw`text-[#0077B6] italic`}>Purchased</Text>
                  )}
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
                  style={tw`border-b border-gray-300 opacity-80 mb-4 mt-4`}
                />
                <Text style={tw`text-[16px]  text-[#040641] font-medium`}>
                  Overview
                </Text>

                <View>
                  {/*Over View */}
                  <View
                    style={tw` flex-row justify-between w-full bg-[#040641] bg-opacity-4 p-3 rounded-[8px] mt-2 mb-4`}>
                    {/*Column 1 */}
                    <View style={tw`flex-1`}>
                      <View style={tw`flex-row  items-center  `}>
                        <Image
                          source={require('../../assets/images/speakericon.png')}
                          style={tw`w-4 h-4 mr-2`}
                        />
                        <View>
                          <Text
                            style={tw`text-[12px] text-[#040641] font-medium flex-1`}>
                            {`Speakers: ${
                              libraryDetails?.library?.author
                                ? `${
                                    libraryDetails.library.author.first_name ||
                                    'N/A'
                                  } ${
                                    libraryDetails.library.author.last_name ||
                                    ''
                                  }`
                                : 'N/A'
                            }`}
                          </Text>
                        </View>
                      </View>
                      <View style={tw`flex-row  items-center mt-2 `}>
                        <Image
                          source={require('../../assets/images/formaticon1.png')}
                          style={tw`w-4 h-4 mr-2`}
                        />
                        <View>
                          <Text
                            style={tw`text-[12px]  text-[#040641] font-medium`}>
                            {`Format : ${libraryDetails.library.type}`}
                          </Text>
                        </View>
                      </View>
                      <View style={tw`flex-row  items-center mt-2 `}>
                        <Image
                          source={require('../../assets/images/languageicon.png')}
                          style={tw`w-4 h-4 mr-2`}
                        />
                        <View>
                          <Text
                            style={tw`text-[12px]  text-[#040641] font-medium`}>
                            {`Language : ${libraryDetails?.library.language}`}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/*Column 2 */}
                    <View>
                      <View style={tw`flex-row  items-center `}>
                        <Image
                          source={require('../../assets/images/stopwatchicon.png')}
                          style={tw`w-4 h-4 mr-2`}
                        />
                        <View>
                          <Text
                            style={tw`text-[12px]  text-[#040641] font-medium`}>
                            {`Duration : ${libraryDetails?.library.duration} mins`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text style={tw`text-[16px]  text-[#040641] font-medium`}>
                      About the Video
                    </Text>
                    <Text
                      style={tw`text-[13px]  text-[#040641] opacity-50 mt-2`}>
                      {libraryDetails?.library.description}
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
          )}
        </ScrollView>
      )}
    </>
  );
};

export default VideoDetailsScreen;
