import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import LoadingSpinner from '../../components/LoadingSpinner';
import {formatDate} from '../../utils/formattedDate';
import {
  useDeleteCommentAPIMutation,
  useNewCommentsByPostIdAPIQuery,
} from '../../features/feed/feedApiSlice';
import {useSelector} from 'react-redux';

const PostComments = ({postId, fromModal, showCommentDeletIcon}) => {
  const {currentUserId} = useSelector(state => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [refreshingComments, setrefreshingComments] = useState(false);

  const {
    data: comments,
    isLoading: commentsLoading,
    isFetching: commentsFetching,
    error: commentsError,
  } = useNewCommentsByPostIdAPIQuery({
    postId,
    page: currentPage,
  });

  const [deleteCommentAPI, {isLoading: deletingComment, isError}] =
    useDeleteCommentAPIMutation();

  const handleRefresh = () => {
    setCurrentPage(1);
    setrefreshingComments(true);
  };

  // when flat list reaches the bottom then increment the current page
  const handleEndReached = () => {
    if (comments?.hasMore && !commentsFetching) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // delete a comment
  const handleDeleteComment = async commentId => {
 

    try {
      const response = await deleteCommentAPI({postId, commentId}).unwrap();
    
    } catch (error) {
     
    }
  };

  useEffect(() => {
    if (!commentsFetching) {
      setrefreshingComments(false);
    }
  }, [commentsFetching, comments, commentsError, refreshingComments]);

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
    <>
      {deletingComment && <LoadingSpinner size={'small'} />}
      {commentsLoading ? (
        <View>
          {Array.from({length: 8}).map((_, index) => (
            <View key={index}>{renderShimmerPlaceholder()}</View>
          ))}
        </View>
      ) : commentsError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>Failed to load comments</Text>
        </View>
      ) : (
        <FlatList
          data={comments?.list}
          style={fromModal ? {} : styles.container}
          keyExtractor={item => item._id}
          refreshing={refreshingComments}
          initialNumToRender={10}
          onRefresh={handleRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => (
            <View style={tw`${fromModal ? ' pt-4' : 'mx-3 pt-4'}`}>
              <View style={tw`flex-row items-start`}>
                <View style={tw`my-2 gap-3 flex-row`}>
                  <View
                    style={tw`${
                      item?.authorDetails?.is_leader
                        ? 'w-10 top-[-10px]'
                        : 'w-10 top-[-10px]'
                    } rounded-full relative`}>
                    {item?.authorDetails?.is_leader && (
                      <Image
                        source={require('../../assets/images/leadersframe.png')}
                        style={tw`absolute top-[-4px] left-[-2px] w-[50px] h-[50px] rounded-full`}
                      />
                    )}
                    <Image
                      source={
                        item?.authorDetails?.profile_image
                          ? {uri: item.authorDetails.profile_image}
                          : require('../../assets/images/whiteplaceholder.png')
                      }
                      style={tw`${
                        item?.authorDetails?.is_leader
                          ? 'w-9 h-9 left-1.3 top-0.7'
                          : 'w-11 h-11'
                      } rounded-full`}
                    />
                    {item?.authorDetails?.featured && (
                      <Image
                        source={require('../../assets/images/profilebadge.png')}
                        style={tw`w-[16px] h-[17px] absolute top-[8] left-[9]`}
                      />
                    )}
                  </View>
                </View>
                <View style={tw`ml-4  flex-1`}>
                  <View style={tw`flex-row justify-between `}>
                    <View style={tw`flex-1 `}>
                      <Text
                        style={tw`${
                          fromModal ? 'text-black' : 'text-black'
                        } font-medium`}>
                        {item.authorDetails.full_name}
                      </Text>
                      <Text
                        style={tw`${fromModal ? 'text-black' : 'text-black'}`}>
                        {item.content}
                      </Text>
                    </View>
                    <View style={tw``}>
                      {item?.authorDetails?._id === currentUserId && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(item._id)}
                          style={tw`justify-center items-center p-2 opacity-70`}>
                          <Image
                            source={require('../../assets/images/removegrayicon.png')}
                            style={tw`w-5 h-5`}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <Text
                    style={tw`text-[#fff] opacity-90 text-[10px] font-medium`}>
                    {item?.createdAt ? formatDate(item.createdAt) : 'NA'}
                  </Text>
                </View>
              </View>
              {/* Border line for comments */}
              {index < comments?.list?.length - 1 && (
                <View style={tw`border-b border-[#ccc] opacity-20 `} />
              )}
            </View>
          )}
          ListFooterComponent={
            <View style={{marginBottom: 20}}>
              {!commentsFetching && comments?.list?.length === 0 && (
                <View style={tw`flex-1 justify-center items-center mt-5`}>
                  <Text style={tw`text-center text-black`}>
                    No comments available
                  </Text>
                </View>
              )}
              {commentsFetching && <LoadingSpinner color="blue" size="small" />}
              {!comments?.hasMore &&
                !commentsFetching &&
                comments?.list?.length > 0 && (
                  <Text style={tw`text-center text-gray-500 mb-10`}>
                    No more comments to load
                  </Text>
                )}
            </View>
          }
        />
      )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default PostComments;
