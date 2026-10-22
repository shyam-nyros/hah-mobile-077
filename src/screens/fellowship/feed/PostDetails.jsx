import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import tw from 'twrnc';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {
  useCreateCommentAPIMutation,
  usePostDetailsAPIQuery,
} from '../../../features/feed/feedApiSlice';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PostComments from '../../../components/feed/PostComments';
import LikeUnlikeCount from '../../../components/feed/LikeUnlikeCount';
import CommentsCount from '../../../components/feed/CommentsCount';
import showToast from '../../../utils/toast/showToast';
import {formatDate} from '../../../utils/formattedDate';
import CustomVideoPlayer from '../../../utils/videoplayer/CustomVideoPlayer';
import ShareAppInSocialLinks from '../../../components/feed/ShareAppInSocialLinks';
import VideoPlayer from 'react-native-video-player';
import videoPostThumbnail from '../../../assets/images/defaults/videothumbnail.png';
import LibraryVideoPlayer from '../../../utils/videoplayer/LibraryVideoPlayer';

const PostDetails = ({navigation, route}) => {
  const {postId} = route.params;

  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const {data: postDetails, isLoading: postDetailsLoading} =
    usePostDetailsAPIQuery(postId, {refetchOnMountOrArgChange: true});

  const [createCommentAPI, {isLoading: createCommentLoading}] =
    useCreateCommentAPIMutation();

  const handleCreateComment = async id => {
    try {
      await createCommentAPI({postId: id, content: comment}).unwrap();
    } catch (error) {
    } finally {
      setComment('');
    }
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`bg-[#00B4D8] flex-1 mb-2 rounded-[10px] mx-4 mt-4`}>
      <View style={tw`m-3 gap-3 flex-row`}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-11 h-11 rounded-full`}
        />
        <View>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-40 h-5 mb-2 rounded-md`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-30 h-4 rounded-md`}
          />
        </View>
      </View>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={tw`w-full h-40 mb-4`}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={tw`w-60 h-5 mb-2 mx-3 rounded-md`}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={tw`w-40 h-4 mb-2 mx-3 rounded-md`}
      />
    </View>
  );

  if (postDetailsLoading) {
    return renderShimmerPlaceholder();
  }

  const downloadAttachment = async (attachmentURL, setLoading) => {
    try {
      setLoading(true);
      const fileName = attachmentURL.substring(
        attachmentURL.lastIndexOf('/') + 1,
      );
      var destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      if (Platform.OS == 'ios') {
        destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }

      const options = {
        fromUrl: attachmentURL,
        background: true,
        discretionary: true,
        toFile: destinationPath,
      };

      await RNFS.downloadFile(options).promise;

      if (Platform.OS == 'ios') {
        await FileViewer.open(destinationPath);
      }

      showToast('success', 'File downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      showToast('error', `Failed to download file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    await downloadAttachment(postDetails.attachment, setLoading);
  };

  const handlePlayPress = () => {
    setIsPlaying(true);
  };

  return (
    <>
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={tw`mx-4 flex-row py-4 items-center`}>
            <View>
              <Image
                source={require('../../../assets/images/chevronlefticon.png')}
                style={tw`w-[26px] h-[26px]`}
              />
            </View>
            <Text style={tw`text-xl text-[#fff] font-semibold`}>
              Post Details
            </Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -20 : 0}>
        <View style={tw`flex-1`}>
          <View style={tw`bg-[#00B4D8] flex-1 mb-2 rounded-[10px] mx-4 mt-4`}>
            <View style={tw`m-3 gap-3 flex-row`}>
              <View
                style={tw`${
                  postDetails?.author?.is_leader ? 'w-11 h-10' : 'w-10 h-10'
                } rounded-full relative`}>
                {postDetails?.author?.is_leader && (
                  <Image
                    source={require('../../../assets/images/leadersframe.png')}
                    style={tw`absolute top-[-4px] left-[-2px] w-[50px] h-[50px] rounded-full`}
                  />
                )}
                <Image
                  source={
                    postDetails?.author?.profile_image
                      ? {uri: postDetails.author.profile_image}
                      : require('../../../assets/images/whiteplaceholder.png')
                  }
                  style={tw`${
                    postDetails?.author?.is_leader
                      ? 'w-9 h-9 left-1.3 top-0.7'
                      : 'w-11 h-11'
                  } rounded-full`}
                />
                {postDetails?.author?.featured && (
                  <Image
                    source={require('../../../assets/images/profilebadge.png')}
                    style={tw`w-[16px] h-[17px] absolute top-[7] left-[9.5]`}
                  />
                )}
              </View>
              <View>
                <Text style={tw`text-[#fff] text-[16px] font-medium`}>
                  {postDetails?.author?.full_name}
                </Text>
                <Text
                  style={tw`text-[#fff] opacity-90 text-[12px] font-medium`}>
                  {postDetails?.createdAt
                    ? formatDate(postDetails?.createdAt)
                    : 'NA'}
                </Text>
              </View>
            </View>

            {postDetails?.type === 'image' && (
              <Image
                source={{uri: postDetails.attachment}}
                style={tw`w-full h-26% mb-4`}
              />
            )}
            {postDetails?.type === 'pdf' && (
              <>
                <View style={tw`flex justify-center p-3 items-center`}>
                  <Image
                    source={require('../../../assets/images/graypdficon.png')}
                    style={tw`w-20 h-20 mb-4`}
                  />
                </View>
                <TouchableOpacity
                  style={tw`flex items-end mr-2`}
                  onPress={handleDownload}
                  disabled={loading}>
                  <View
                    style={tw`py-2 px-2 bg-white rounded-3 justify-center items-center`}>
                    {loading ? (
                      <View
                        style={tw`py-2 px-2 bg-white rounded-3 justify-center items-center`}>
                        <LoadingSpinner size="small" />
                      </View>
                    ) : (
                      <Image
                        source={require('../../../assets/images/bluedownloadicon.png')}
                        style={tw`w-5 h-5`}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </>
            )}
            {postDetails?.type === 'video' && (
              <CustomVideoPlayer 
              uri={postDetails.attachment}
              // uri={"https://www.sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4"}
               />
              // <VideoPlayer
              //   source={{uri: postDetails.attachment}}
              //   thumbnail={videoPostThumbnail}
              //   // autoplayS
              // />
              // <>
              //   {!isPlaying ? (
              //     <TouchableOpacity
              //       style={styles.playButton}
              //       onPress={handlePlayPress}>
              //       {/* <Text style={styles.playButtonText}>Play Video</Text> */}
              //       <Image
              //         source={videoPostThumbnail}
              //         style={tw`h-55 w-95`}
              //         resizeMode="cover"
              //       />
              //     </TouchableOpacity>
              //   ) : (
              //     <LibraryVideoPlayer
              //       // uri={
              //       //   'https://file-examples.com/storage/fe0d4ef3b467fe96a99bd97/2017/04/file_example_MP4_480_1_5MG.mp4'
              //       // }
              //       uri={postDetails?.attachment}
              //       playStatus={isPlaying}
              //       controlsStyles={{
              //         hideSeekBar: false,
              //         hideDuration: false,
              //         seekIncrementMS: 10000,
              //         hideNavigationBarOnFullScreenMode: true,
              //         hideNotificationBarOnFullScreenMode: true,
              //       }}
              //     />
              //   )}
              // </>
            )}
            {postDetails?.type === 'text' && (
              <View
                style={tw`p-4 bg-[#CAF0F8] h-26% flex justify-center items-center rounded-[10px] mx-3 mt-2 mb-2`}>
                <Text style={tw`text-[#000] text-[14px] text-center font-450`}>
                  {postDetails?.description}
                </Text>
              </View>
            )}

            <View style={tw`mx-3`}>
              <Text style={tw`text-[#fff] text-[17px] font-bold`}>
                {postDetails?.title}
              </Text>
              <Text style={tw`text-[14px] text-[#fff] `}>
                {postDetails?.type !== 'text' && (
                  <Text style={tw`text-[14px] text-[#fff] mb-2`}>
                    {postDetails?.description}
                  </Text>
                )}
              </Text>
              <View style={tw`border-b border-white opacity-40 mb-2 mt-2`} />
              <View>
                <View style={tw`flex-row justify-between items-center`}>
                  <View style={tw`flex-row gap-8 items-center`}>
                    <LikeUnlikeCount
                      postId={postId}
                      postLikedByUser={postDetails?.user_liked}
                      likesCount={postDetails?.likes_count}
                    />
                    <CommentsCount
                      postId={postId}
                      initialCommentsCount={postDetails?.comments_count}
                      showTheCommentsModal={false}
                    />
                  </View>
                  <View style={tw`flex-row gap-2 items-center`}>
                    <ShareAppInSocialLinks />
                    {/* <Image
                      source={require('../../../assets/images/shareicon.png')}
                      style={tw`w-6 h-6`}
                    />
                    <Text style={tw`text-[#fff] text-[16px] font-medium`}>
                      {postDetails?.shares_count}
                    </Text> */}
                  </View>
                </View>

                <View style={styles.inputbar}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <TextInput
                      placeholder="Write Comment"
                      placeholderTextColor="rgba(4, 6, 65, 0.7)"
                      value={comment}
                      onChangeText={setComment}
                      style={tw`flex-1 ml-3 text-black`}
                    />
                    <TouchableOpacity
                      onPress={() => handleCreateComment(postDetails._id)}>
                      <Image
                        source={require('../../../assets/images/commentsendicon.png')}
                        style={tw`mr-3 w-6 h-6 my-5 mx-4 `}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {/* Comments Section */}
            <PostComments postId={postId} fromModal={false} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  inputbar: {
    backgroundColor: '#fff',
    height: 44,
    borderRadius: 50,
    marginVertical: 10,
    marginTop: 15,
    justifyContent: 'center',
  },
});
