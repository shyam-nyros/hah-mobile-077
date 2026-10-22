import React, {useState} from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import {useSearchAPIQuery} from '../../features/home/homeApiSlice';
import {useNavigation} from '@react-navigation/native';
import useDebounce from '../../utils/customhooks/useDebounce';
import LoadingSpinner from '../LoadingSpinner';

import bookcoverImg from '../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../assets/images/podcastplaceholder.png';

const SearchModal = ({showSearchOverlay, setShowSearchOverlay}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const navigation = useNavigation();

  const {
    data: searchResults,
    error,
    isLoading,
  } = useSearchAPIQuery(searchTerm || '', debouncedSearchTerm, {
    skip: !debouncedSearchTerm,
    refetchOnMountOrArgChange: true,
  });

  const handleLeaderClickNavigation = leaderId => {
    navigation.navigate('LeaderProfile', {leaderId});
    setShowSearchOverlay(false);
  };

  const handleVideoClickNavigation = libraryItemId => {
    navigation.navigate('VideoDetails', {libraryItemId});
    setShowSearchOverlay(false);
  };

  const handlePodcastClickNavigation = libraryItemId => {
    navigation.navigate('PodcastDetails', {libraryItemId});
    setShowSearchOverlay(false);
  };
  const handleBookClickNavigation = libraryItemId => {
    navigation.navigate('BookDetails', {libraryItemId});
    setShowSearchOverlay(false);
  };
  const handleEventsClickNavigation = eventId => {
    navigation.navigate('EventDetails', {eventId});
    setShowSearchOverlay(false);
  };

  const handleLiveChurchClickNavigation = liveChurchId => {
    navigation.navigate('LiveChurchDetails', {liveChurchId});
    setShowSearchOverlay(false);
  };

  const hasNoResults =
    debouncedSearchTerm &&
    searchResults &&
    !searchResults.leaders?.length &&
    !searchResults.audio?.length &&
    !searchResults.video?.length &&
    !searchResults.ebook?.length &&
    !searchResults.events?.length &&
    !searchResults.live_churches?.length;

  return (
    <Modal
      animationType="slideOutDown"
      transparent={true}
      visible={showSearchOverlay}
      onRequestClose={() => setShowSearchOverlay(false)}>
      <SafeAreaView
        style={[
          tw`h-80% rounded-5  bg-white mx-4`,
          {marginTop: Platform.OS === 'ios' ? 50 : 12},
        ]}>
        <View style={tw`flex-1`}>
          {/* Search Input */}
          <View style={tw`p-1 border-b border-gray-300`}>
            <View style={tw`flex-row items-center`}>
              <TextInput
                placeholder="Search"
                placeholderTextColor="rgba(4, 6, 65, 0.7)"
                style={tw`ml-3 text-[15px]  font-medium flex-1 text-black`}
                value={searchTerm}
                onChangeText={text => setSearchTerm(text)}
              />
              <TouchableOpacity
                style={tw`px-4 py-3 `}
                onPress={() => setShowSearchOverlay(false)}>
                <Image
                  source={require('../../assets/images/closeicon.png')}
                  style={tw`w-7 h-7`}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Results */}
          <ScrollView style={tw`flex-1 p-4 mb-4`}>
            {isLoading ? (
              <View style={tw`flex-1 justify-center items-center`}>
                <LoadingSpinner />
              </View>
            ) : error ? (
              <Text style={tw`text-center text-red-500`}>
                Error loading data
              </Text>
            ) : (
              searchResults && (
                <>
                  {hasNoResults && (
                    <Text
                      style={tw`text-center text-gray-400 text-[13px] mt-6`}>
                      No data found
                    </Text>
                  )}
                  {/* Leaders Section */}
                  {searchResults.leaders?.length > 0 && (
                    <View>
                      <Text
                        style={tw`text-[#040641] text-[15px] font-semibold`}>
                        Leaders
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        {searchResults.leaders.map(leader => (
                          <TouchableOpacity
                            key={leader._id}
                            onPress={() =>
                              handleLeaderClickNavigation(leader._id)
                            }>
                            <View style={tw`flex-1 mr-3`}>
                              <View style={tw`items-center mt-2`}>
                                <View>
                                  <Image
                                    source={require('../../assets/images/leadersframe.png')}
                                    style={tw`w-16 h-16`}
                                  />
                                  <Image
                                    source={{uri: leader.profile_image}}
                                    style={tw`w-[48px] h-[48px] absolute top-[8px] rounded-full right-[8px]`}
                                  />
                                </View>
                                {leader.featured && (
                                  <Image
                                    source={require('../../assets/images/profilebadge.png')}
                                    style={tw`w-[10px] h-[10px] absolute top-[58px] right-[3px]`}
                                  />
                                )}
                                <Text
                                  style={tw`text-[14px] text-center text-[#0077B6] font-medium mt-1`}>
                                  {leader.first_name}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Videos Section */}
                  {searchResults.video?.length > 0 && (
                    <View>
                      <Text
                        style={tw`text-[#040641] text-[15px] mt-4 mb-2 font-semibold`}>
                        Videos
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        {searchResults.video.map(video => (
                          <TouchableOpacity
                            key={video._id}
                            onPress={() =>
                              handleVideoClickNavigation(video._id)
                            }>
                            <View style={tw`mr-3`}>
                              <Image
                                source={
                                  video.cover_image
                                    ? {uri: video.cover_image}
                                    : require('../../assets/images/defaults/videothumbnail.png')
                                }
                                style={tw`bg-[#D9D9D9] h-[60px] w-[90px] rounded-[10px]`}
                              />
                              <Text
                                numberOfLines={2}
                                style={tw`text-[12px] text-[#0077B6] font-medium mt-1 w-[90px]`}>
                                {video.title}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  {searchResults.audio?.length > 0 && (
                    <View>
                      <Text
                        style={tw`text-[#040641] text-[15px] mt-4 mb-2 font-semibold`}>
                        Podcasts
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        {searchResults.audio.map(podcast => (
                          <TouchableOpacity
                            key={podcast._id}
                            onPress={() =>
                              handlePodcastClickNavigation(podcast._id)
                            }>
                            <View style={tw`mr-3`}>
                              <Image
                                source={
                                  podcast.cover_image
                                    ? {uri: podcast.cover_image}
                                    : require('../../assets/images/podcastplaceholder.png')
                                }
                                style={tw`bg-[#D9D9D9] h-[60px] w-[90px] rounded-[10px]`}
                              />
                              <Text
                                numberOfLines={2}
                                style={tw`text-[12px] text-[#0077B6] font-medium mt-1 w-[90px]`}>
                                {podcast.title}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Books Section */}
                  {searchResults.ebook?.length > 0 && (
                    <View>
                      <Text
                        style={tw`text-[#040641] text-[15px] mt-4 mb-2 font-semibold`}>
                        Books
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        {searchResults.ebook.map(ebook => (
                          <TouchableOpacity
                            key={ebook._id}
                            onPress={() =>
                              handleBookClickNavigation(ebook._id)
                            }>
                            <View style={tw`mr-3`}>
                              <Image
                                source={
                                  ebook.cover_image
                                    ? {uri: ebook.cover_image}
                                    : require('../../assets/images/defaults/bookplaceholder.png')
                                }
                                style={tw`bg-[#D9D9D9] h-[60px] w-[90px] rounded-[10px]`}
                              />
                              <Text
                                numberOfLines={2}
                                style={tw`text-[12px] text-[#0077B6] font-medium mt-1 w-[90px]`}>
                                {ebook.title}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  {/* Events Section */}
                  {searchResults.events?.length > 0 && (
                    <View>
                      <Text
                        style={tw`text-[#040641] text-[15px] mt-4 mb-2 font-semibold`}>
                        Events
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        {searchResults.events.map(events => (
                          <TouchableOpacity
                            key={events._id}
                            onPress={() =>
                              handleEventsClickNavigation(events._id)
                            }>
                            <View style={tw`mr-3`}>
                              <Image
                                source={
                                  events.cover_image
                                    ? {uri: events.cover_image}
                                    : require('../../assets/images/defaults/eventslarge.png')
                                }
                                style={tw`bg-[#D9D9D9] h-[60px] w-[90px] rounded-[10px]`}
                              />
                              <Text
                                numberOfLines={2}
                                style={tw`text-[12px] text-[#0077B6] font-medium mt-1 w-[90px]`}>
                                {events.title}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Live Churches Section */}
                  {searchResults.live_churches?.length > 0 && (
                    <View>
                      <Text
                        style={tw`text-[#040641] text-[15px] mt-4 mb-2 font-semibold`}>
                        Live Churches
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}>
                        {searchResults.live_churches.map(church => (
                          <TouchableOpacity
                            key={church._id}
                            onPress={() =>
                              handleLiveChurchClickNavigation(church._id)
                            }>
                            <View style={tw`mr-3`}>
                              <Image
                                source={
                                  church.cover_image
                                    ? {uri: church.cover_image}
                                    : require('../../assets/images/defaults/eventslarge.png')
                                }
                                style={tw`bg-[#D9D9D9] h-[60px] w-[90px] rounded-[10px]`}
                              />
                              <Text
                                numberOfLines={2}
                                style={tw`text-[12px] text-[#0077B6] font-medium mt-1 w-[90px]`}>
                                {church.title}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              )
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SearchModal;
