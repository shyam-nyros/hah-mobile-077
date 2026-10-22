import React, {useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import CommentsModal from './CommentsModal';
import {useGetCommentsCountQuery} from '../../features/feed/feedApiSlice';

const CommentsCount = ({
  postId,
  initialCommentsCount,
  showTheCommentsModal,
}) => {
  const {data, isLoading} = useGetCommentsCountQuery(postId);

  const [commentsTotalCount, setCommentsTotalCount] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // when a new comment is posted by current user or some other user
  // new data is received through socket connection
  // in this case increment the count by one
  // initially the data.comments will be 0 and gets incremented when a new comment is posted

  useEffect(() => {
    if (!isLoading && data) {
      const comments =
        typeof data?.comments === 'number'
          ? data.comments
          : initialCommentsCount;
    
      setCommentsTotalCount(comments);
    }
  }, [data, isLoading, initialCommentsCount]);

  return (
    <>
      {modalVisible && showTheCommentsModal && (
        <CommentsModal
          modalVisible={modalVisible}
          closeModal={closeModal}
          postId={postId}
        />
      )}
      <TouchableOpacity onPress={openModal} disabled={!showTheCommentsModal}>
        <View style={tw`flex-row gap-2 items-center`}>
          <Image
            source={require('../../assets/images/commenticon.png')}
            style={tw`w-6 h-6`}
          />
          <Text style={tw`text-[#fff] text-[16px] font-medium`}>
            {commentsTotalCount}
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default CommentsCount;
