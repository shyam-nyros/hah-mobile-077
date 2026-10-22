import {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import tw from 'twrnc';
import {formatDate} from '../../utils/formattedDate';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import CommentsCount from './CommentsCount';
import LikeUnlikeCount from './LikeUnlikeCount';
import ShareAppInSocialLinks from './ShareAppInSocialLinks';
import ReportPostForm from './ReportPost';
import ReportUserForm from './ReportUser';
import {useSelector} from 'react-redux';
import LibraryVideoPlayer from '../../utils/videoplayer/LibraryVideoPlayer';
import videocoverImg from '../../assets/images/defaults/videothumbnail.png';
import CustomVideoPlayer from '../../utils/videoplayer/CustomVideoPlayer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const PostItem = ({postInfo, isItemVisible = false}) => {
  const isFocused = useIsFocused();

  const {currentUserId} = useSelector(state => state.auth);

  const navigation = useNavigation();
  const dotMenuRef = useRef(null);

  // report post
  const [showDotMenu, setShowDotMenu] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({top: 0, left: 0});

  const [isPlaying, setIsPlaying] = useState(false);

  // report user
  const [showReportUserPopup, setShowReportUserPopup] = useState(false);

  // hide a post when its reported successfully
  const [hidePost, setHidePost] = useState(false);
  

  // Reset video playing state when visibility changes
  useEffect(() => {
    if (!isItemVisible || !isFocused) {
      setIsPlaying(false);
    }
  }, [isItemVisible, isFocused]);

  const handlePostDetails = id => {
    navigation.navigate('PostDetails', {postId: id});
  };

  const toggleDropdown = () => {
    if (dotMenuRef.current) {
      dotMenuRef.current.measure((fx, fy, width, height, px, py) => {
        let calculatedLeft = px;

        const dropdownWidth = 100;
        if (px + dropdownWidth > SCREEN_WIDTH) {
          calculatedLeft = SCREEN_WIDTH - dropdownWidth - 55;
        }

        setDropdownPosition({top: py + height, left: calculatedLeft});
        setDropdownVisible(!dropdownVisible);
      });
    }
  };


  return (
    <>
      {!hidePost && (
        <View style={tw`bg-[#00B4D8] rounded-[10px]`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`m-3 gap-3 flex-row`}>
              {/* Profile */}
              <View
                style={tw`${
                  postInfo?.author?.is_leader ? 'w-11 h-10' : 'w-10 h-10'
                } rounded-full relative`}>
                {postInfo?.author?.is_leader && (
                  <Image
                    source={require('../../assets/images/leadersframe.png')}
                    style={tw`absolute top-[-4px] left-[-2px] w-[50px] h-[50px] rounded-full`}
                  />
                )}
                <Image
                  source={
                    postInfo?.author?.profile_image
                      ? {uri: postInfo.author.profile_image}
                      : require('../../assets/images/whiteplaceholder.png')
                  }
                  style={tw`${
                    postInfo?.author?.is_leader
                      ? 'w-9 h-9 left-1.3 top-0.7'
                      : 'w-11 h-11'
                  } rounded-full`}
                />
                {postInfo?.author?.featured && (
                  <Image
                    source={require('../../assets/images/profilebadge.png')}
                    style={tw`w-[16px] h-[17px] absolute top-[7] left-[9.5]`}
                  />
                )}
              </View>

              <View>
                <Text style={tw`text-[#fff] text-[16px] font-medium`}>
                  {postInfo?.author?.full_name}
                </Text>
                <Text
                  style={tw`text-[#fff] opacity-90 text-[12px] font-medium`}>
                  {postInfo?.createdAt ? formatDate(postInfo?.createdAt) : 'NA'}
                </Text>
              </View>
            </View>

            {/* dot menu */}
            {/* show dot menu for posts created by other authors */}
            {postInfo?.author?._id !== currentUserId && (
              <TouchableOpacity ref={dotMenuRef} onPress={toggleDropdown}>
                <View>
                  <Image
                    source={require('../../assets/images/dotmenuicon.png')}
                    style={tw`w-7 h-7 mr-3`}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View>
            {postInfo?.type === 'image' && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePostDetails(postInfo._id)}>
                <Image
                  source={{uri: postInfo.attachment}}
                  style={tw`w-full h-55`}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            {postInfo?.type === 'pdf' && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePostDetails(postInfo._id)}>
                <View style={tw`flex justify-center items-center p-3`}>
                  <Image
                    source={require('../../assets/images/graypdficon.png')}
                    style={tw`w-20 h-20`}
                  />
                </View>
              </TouchableOpacity>
            )}
            {postInfo?.type === 'video' && (
              <View style={tw`h-55`}>
                <CustomVideoPlayer
                  isVisible={isItemVisible}
                  isFocused={isFocused}
                  uri={postInfo.attachment}
                  onPress={() => handlePostDetails(postInfo._id)}
                  controlsStyles={{
                    hideSeekBar: false,
                    hideDuration: false,
                    seekIncrementMS: 10000,
                    hideNavigationBarOnFullScreenMode: true,
                    hideNotificationBarOnFullScreenMode: true,
                  }}
                />
              </View>
            )}
            {postInfo?.type === 'text' && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePostDetails(postInfo._id)}>
                <View
                  style={tw`p-4 bg-[#CAF0F8] h-55 flex justify-center items-center rounded-[10px] mx-3 mt-2`}>
                  <Text
                    numberOfLines={7}
                    style={tw`text-[#000] text-center text-[16px] leading-6 font-450`}>
                    {postInfo?.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          <View style={tw`m-3`}>
            <TouchableOpacity onPress={() => handlePostDetails(postInfo._id)}>
              <Text
                numberOfLines={1}
                style={tw`text-[#fff] text-[16px] font-medium`}>
                {postInfo?.title}
              </Text>
              {postInfo?.type !== 'text' && (
                <Text numberOfLines={2} style={tw`text-[#fff] text-[14px]`}>
                  {postInfo?.description}
                </Text>
              )}
            </TouchableOpacity>
            <View style={tw`border-b border-white opacity-40 mb-2 mt-2`} />
            {/* Like, Comment & Share */}
            <View>
              <View style={tw`flex-row justify-between items-center`}>
                <View style={tw`flex-row gap-8 items-center`}>
                  <View style={tw`flex-row gap-2 items-center`}>
                    <LikeUnlikeCount
                      postId={postInfo._id}
                      postLikedByUser={postInfo?.user_liked}
                      likesCount={postInfo?.likes_count}
                    />
                  </View>
                  <CommentsCount
                    postId={postInfo._id}
                    initialCommentsCount={postInfo.comments_count}
                    showTheCommentsModal={true}
                  />
                </View>
                <ShareAppInSocialLinks />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Dropdown Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={[styles.modalOverlay]}>
            <View
              style={[
                styles.dropdownContainer,
                {
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                },
              ]}>
              <TouchableOpacity
                onPress={() => {
                  setDropdownVisible(false);
                  setShowReportPopup(true);
                }}>
                <Text style={tw`text-red-500 p-1`}>Report Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDropdownVisible(false);
                  setShowReportUserPopup(true);
                }}>
                <Text style={tw`text-red-500 p-1`}>Report User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Report Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showReportPopup}
        onRequestClose={() => {
          setDropdownVisible(false);
          setShowReportPopup(false);
        }}>
        <View style={[styles.modalOverlay, {justifyContent: 'flex-end'}]}>
          <View style={styles.bottomModalContainer}>
            <View
              style={tw`flex flex-row items-center justify-between mb-4 mr-2`}>
              {/* Report Post Text */}
              <Text style={tw`text-black text-xl font-bold`}>Report Post</Text>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowReportPopup(false);
                }}
                style={tw`px-3 py-2 bg-[#00B4D8] bg-opacity-10 rounded-full`}>
                <Text style={tw`text-[#00B4D8] font-bold text-md`}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Report Form */}
            <ReportPostForm
              postId={postInfo._id}
              setShowReportPopup={setShowReportPopup}
              setHidePost={setHidePost}
            />
          </View>
        </View>
      </Modal>

      {/* Report User Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showReportUserPopup}
        onRequestClose={() => {
          setDropdownVisible(false);
          setShowReportUserPopup(false);
        }}>
        <View style={[styles.modalOverlay, {justifyContent: 'flex-end'}]}>
          <View style={styles.bottomModalContainer}>
            <View style={tw`flex flex-row items-center justify-between mb-4`}>
              {/* Report Post Text */}
              <Text style={tw`text-black text-xl font-bold`}>Report User</Text>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowReportUserPopup(false);
                }}
                style={tw`px-3 py-2 bg-[#00B4D8] bg-opacity-10 rounded-full`}>
                <Text style={tw`text-[#00B4D8] font-bold text-md`}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Report User Form */}
            <ReportUserForm
              postId={postInfo._id}
              setShowReportUserPopup={setShowReportUserPopup}
              setHidePost={setHidePost}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PostItem;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },
  bottomModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 4,
  },
});
