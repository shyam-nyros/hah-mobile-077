import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  Image,
  Dimensions,
  Linking,
  SafeAreaView,
  Button,
} from 'react-native';
import Swiper from 'react-native-swiper';
import React, {useEffect, useState, useRef} from 'react';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import {
  useEventDetailsAPIQuery,
  useRsvpAPIMutation,
} from '../../features/events/eventsApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import {formatFullAddress, truncateText} from '../../utils/helpers';
import Tooltip from 'react-native-walkthrough-tooltip';
import EventModal from '../../components/events/EventModal';
import {
  convertEventTime,
  formattedLocalDate,
  formattedLocalTime,
  getFormattedDate,
} from '../../utils/formattedDate';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import CustomVideoPlayer from '../../utils/videoplayer/CustomVideoPlayer';
import {URL} from 'react-native-url-polyfill';
import YouTubePlayer from 'react-native-youtube-iframe';
import {useSelector} from 'react-redux';

// CustomButton Component
const CustomButton = ({onPress, title, buttonStyle, textStyle}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw`bg-white border border-[1.42px] border-[#0077B6] py-1 px-3 rounded-full`}>
      <Text style={tw`text-[#0077B6] text-[12px]`}>{title}</Text>
    </TouchableOpacity>
  );
};

const EventDetailsScreen = ({route}) => {
  const {eventId} = route.params;
  const {searchQuery} = useSelector(state => state.events);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const [attending, setAttending] = useState('default');
  const [attendingCount, setAttendingCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [playVideoIndex, setPlayVideoIndex] = useState(null);

  const [ytVideoId, setYTVideoId] = useState('');
  const [googleMeetLink, setGoogleMeetLink] = useState('');
  const [zoomLink, setZoomLink] = useState('');

  const handlePlayVideo = index => {
    setPlayVideoIndex(index);
  };

  const [rsvpAPI, {isLoading: rsvpLoading, isError}] = useRsvpAPIMutation();

  const toggleTooltip = () => {
    setIsTooltipVisible(!isTooltipVisible);
  };

  const {width: screenWidth} = Dimensions.get('window');
  const navigation = useNavigation();

  const {
    data: eventDetails,
    isLoading: eventDetailsLoading,
    isFetching: eventDetailsFetching,
    error: eventDetailsError,
  } = useEventDetailsAPIQuery(eventId, {refetchOnMountOrArgChange: true});

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const concatAddress = event => {
    if (event.church) {
      return formatFullAddress(
        event.church.address,
        event.church.state,
        '',
        event.church.country,
      );
    }
    if (event.organization) {
      return formatFullAddress(
        event.organization.address,
        event.organization.state,
        '',
        event.organization.country,
      );
    }
    if (event.christian_organization) {
      return formatFullAddress(
        event.christian_organization.address,
        event.christian_organization.state,
        '',
        event.christian_organization.country,
      );
    }
  };

  const openLinkInBrowser = urlLink => {
    // const url = eventDetails.event.rsvp;
    const url = urlLink.trim();

    Linking.openURL(url).catch(err =>
      console.error('Error opening link:', err),
    );
  };

  useEffect(() => {
    if (eventDetails && eventDetails?.event?.currentUserResponse) {
      setAttending(eventDetails?.event?.currentUserResponse || 'default');
      setAttendingCount(eventDetails?.event?.attendeesCount);
    }
  }, [eventDetailsLoading, eventDetails]);

  const checkStatus = async () => {
    setModalVisible(true);
  };

  const handleEventConfirmation = async actionType => {
    try {
      const response = await rsvpAPI({
        id: eventId,
        rsvp: actionType,
        groupBy: searchQuery.groupBy,
        page: searchQuery.page,
        search: searchQuery.search,
      }).unwrap();

      setAttendingCount(response.event_attendee.attendeesCount);
      if (response.event_attendee.rsvp === 'Attending') {
        setAttending('Attending');
      } else {
        setAttending('Not Attending');
      }
    } catch (error) {
    } finally {
      setModalVisible(false);
    }
  };

  //Example Format: May 5th, 2025

  // const attachments =
  //   eventDetails?.event?.attachments?.length > 0
  //     ? eventDetails.event.attachments
  //     : [
  //         {
  //           path: require('../../assets/images/defaults/eventslarge.png'),
  //         },
  //       ];

  // const enhancedAttachments = eventDetails?.event?.streaming_link
  //   ? [
  //       {type: 'youtube', url: eventDetails.event.streaming_link},
  //       ...attachments,
  //     ]
  //   : attachments;

  // useEffect(() => {
  //   if (!eventDetailsLoading && eventDetails) {
  //     const parsedUrl = new URL(eventDetails?.event?.streaming_link);
  //     const videoId = parsedUrl.searchParams.get('v');
  //     if (videoId) {
  //       setYTVideoId(videoId);
  //     }
  //   }
  // }, [eventDetails, eventDetailsLoading]);

  const streamingLink = eventDetails?.event?.streaming_link;

  const isYouTubeLink = streamingLink
    ? streamingLink.includes('youtube.com/watch?v=') ||
      streamingLink.includes('youtu.be/')
    : false;

  const attachments =
    eventDetails?.event?.attachments?.length > 0
      ? eventDetails.event.attachments
      : [
          {
            path: require('../../assets/images/defaults/eventslarge.png'),
          },
        ];

  const enhancedAttachments = isYouTubeLink
    ? [{type: 'youtube', url: streamingLink}, ...attachments]
    : attachments;

  // check for link type - youtube or google meet link or zoom link
  useEffect(() => {
    if (!eventDetailsLoading && eventDetails?.event?.streaming_link) {
      const streamingLink = eventDetails.event.streaming_link;

      try {
        const parsedUrl = new URL(streamingLink);

        if (
          parsedUrl.hostname.includes('youtube.com') ||
          parsedUrl.hostname.includes('youtu.be')
        ) {
          // Extract YouTube video ID
          const videoId = parsedUrl.hostname.includes('youtu.be')
            ? parsedUrl.pathname.substring(1) // For "https://youtu.be/{videoId}"
            : parsedUrl.searchParams.get('v'); // For "https://www.youtube.com/watch?v={videoId}"

          if (videoId) {
            setYTVideoId(videoId);
            setGoogleMeetLink('');
            setZoomLink('');
          }
        } else if (parsedUrl.hostname.includes('meet.google.com')) {
          // It's a Google Meet link
          setGoogleMeetLink(streamingLink);
          setYTVideoId('');
          setZoomLink('');
        } else if (parsedUrl.hostname.includes('zoom.us')) {
          // It's a Zoom link
          setZoomLink(streamingLink);
          setYTVideoId('');
          setGoogleMeetLink('');
        } else {
          // If it's neither YouTube, Google Meet, nor Zoom, reset all states
          setYTVideoId('');
          setGoogleMeetLink('');
          setZoomLink('');
        }
      } catch (error) {
        console.error('Invalid URL:', streamingLink);
      }
    }
  }, [eventDetails, eventDetailsLoading]);
  console.log(eventDetails);

  return (
    <>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <View style={tw`mx-2 py-4`}>
          <TouchableOpacity
            onPress={navigateToPreviousScreen}
            style={tw`mx-2 bg-white w-9 h-9 justify-center items-center rounded-full py-4`}>
            <Image
              source={require('../../assets/images/backnavicon.png')}
              style={tw`w-[18px] h-[30px] mr-[7px] mb-[1px]`}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {eventDetailsLoading ? (
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
              style={tw`h-15 w-50 mt-4 rounded-full ml-25`}
            />
          </View>
        </ScrollView>
      ) : eventDetailsError ? (
        <View style={tw`flex-1 mb-4 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to load event details</Text>
        </View>
      ) : (
        <ScrollView style={tw`h-10 bg-[#0077B6] `}>
          {/** Carousel **/}
          {!eventDetailsLoading && eventDetails && eventDetails?.event && (
            <View style={tw`h-60 bg-[#0077B6]`}>
              <Swiper
                style={tw`h-60 overflow-hidden`}
                showsButtons={false}
                dotStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  margin: 3,
                }}
                activeDotStyle={{
                  backgroundColor: '#fff',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  margin: 3,
                }}>
                {/* for items that are manually created by admin */}
                {!eventDetails?.event?.aigenerated && //check for ai generated as false because this is created by admin
                  enhancedAttachments.map((attachment, index) => {
                    const isVideo = attachment?.path?.endsWith('.mp4');
                    const isYouTube = attachment?.type === 'youtube';

                    return (
                      <>
                        <View
                          key={index}
                          style={{
                            width: screenWidth,
                            height: 200,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          {isYouTube ? (
                            <View>
                              <YouTubePlayer
                                height={200}
                                width={320}
                                play={true}
                                videoId={ytVideoId}
                              />
                            </View>
                          ) : isVideo ? (
                            playVideoIndex === index ? (
                              <View style={styles.videoWrapper}>
                                <CustomVideoPlayer uri={attachment.path} />
                              </View>
                            ) : (
                              <TouchableOpacity
                                style={styles.playButtonContainer}
                                onPress={() => handlePlayVideo(index)}>
                                <Image
                                  source={require('../../assets/images/blueplayicon.png')}
                                  style={styles.playIcon}
                                />
                                <Image
                                  source={{uri: attachment.path}}
                                  style={styles.videoThumbnail}
                                />
                              </TouchableOpacity>
                            )
                          ) : (
                            <Image
                              source={{uri: attachment.path}}
                              style={styles.image}
                            />
                          )}
                        </View>
                      </>
                    );
                  })}
                {/* for items that are generated by ai */}
                {eventDetails?.event?.aigenerated && ( //check for ai generated as true because this is generated by ai
                  <View
                    style={{
                      width: screenWidth,
                      height: 200,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <YouTubePlayer
                      height={200}
                      width={320}
                      play={true}
                      videoId={ytVideoId}
                    />
                  </View>
                )}
              </Swiper>
            </View>
          )}
          {rsvpLoading && (
            <View>
              <LoadingSpinner />
            </View>
          )}
          {/** Body **/}

          <View style={tw`h-full bg-white  rounded-t-[34px]`}>
            <View style={tw`mx-4`}>
              <View style={tw`flex-row justify-between items-center mt-6`}>
                <Text style={tw`text-[#040641] text-[20px] font-medium`}>
                  {eventDetails?.event?.title}
                </Text>
                {eventDetails?.event?.is_featured_event && (
                  <Tooltip
                    isVisible={isTooltipVisible}
                    content={<Text style={tw`text-white`}>Featured Event</Text>}
                    placement="left"
                    onClose={toggleTooltip}
                    showChildInTooltip={true}
                    tooltipStyle={styles.tooltip}
                    contentStyle={styles.tooltipContent}>
                    <TouchableHighlight
                      style={styles.touchable}
                      onPress={toggleTooltip} // Ensure you have an interaction to toggle tooltip visibility
                    >
                      <Image
                        source={require('../../assets/images/featuredicon.png')} // Ensure the path is correct
                        style={tw`w-6 h-6`}
                      />
                    </TouchableHighlight>
                  </Tooltip>
                )}
              </View>
              {/* <Text
                style={tw`text-[#040641] text-[14px] font-medium opacity-50 mt-1`}>
                {!eventDetailsLoading && eventDetails?.event?.church?.name}
              </Text> */}
              {/* {eventDetails?.event?.event_type === 'online' && (
                <Text
                  style={tw`text-[#040641] text-[14px] font-medium opacity-50 mt-1`}>
                  {eventDetails?.event?.church?.name
                    ? eventDetails?.event?.church?.name
                    : eventDetails?.event?.organization?.name}
                </Text>
              )} */}
              {eventDetails?.event?.event_type === 'online' && (
                <Text
                  style={tw`text-[#040641] text-[14px] font-medium opacity-50 mt-1`}>
                  {eventDetails?.event?.church?.name
                    ? eventDetails.event.church.name
                    : eventDetails?.event?.organization?.name
                    ? eventDetails.event.organization.name
                    : eventDetails?.event?.christian_organization?.name}
                </Text>
              )}

              <View style={tw`flex-1 items-start bg-white`}>
                <View style={tw`mt-3 p-1 px-3  rounded-[8px]  bg-[#0077B6] `}>
                  <Text style={tw`text-[13px] text-[#ffff] font-medium`}>
                    {`$ ${eventDetails?.event?.price}`}
                  </Text>
                </View>
              </View>
              <View>
                <View style={tw`flex-row  mt-5`}>
                  <Image
                    source={require('../../assets/images/personoutlineicon.png')}
                    style={tw`w-6 h-6 mr-3 `}
                  />
                  <View
                    style={tw`flex-row flex-1 justify-between  items-center `}>
                    <View style={tw`flex-row items-center `}>
                      <View style={tw`relative mr-11 `}>
                        <Image
                          source={require('../../assets/images/placeholder.png')}
                          style={tw`w-5 h-5 rounded-full absolute bg-white -top-2 left-0`}
                        />
                        <Image
                          source={require('../../assets/images/placeholder.png')}
                          style={tw`w-5 h-5 rounded-full absolute bg-white -top-2 left-2`}
                        />
                        <Image
                          source={require('../../assets/images/placeholder.png')}
                          style={tw`w-5 h-5 rounded-full absolute bg-white -top-2 left-4`}
                        />
                      </View>

                      <Text style={tw`text-[13px] text-[#040641] font-medium`}>
                        {attendingCount} Attending
                      </Text>
                    </View>

                    {(attending === 'default' ||
                      attending === 'Not Attending') && (
                      <TouchableOpacity>
                        <CustomButton
                          title="Confirm Attendance"
                          onPress={() => handleEventConfirmation(1)}
                          buttonStyle={styles.customButtonStyle} // Apply custom styles
                          textStyle={styles.customTextStyle} // Apply custom text styles
                        />
                      </TouchableOpacity>
                    )}
                    {/* {(attending === 'default' ||
                      attending === 'Not Attending') && (
                      <TouchableOpacity>
                        <CustomButton
                          title="Confirm Attendance"
                          onPress={checkStatus}
                          buttonStyle={styles.customButtonStyle} // Apply custom styles
                          textStyle={styles.customTextStyle} // Apply custom text styles
                        />
                      </TouchableOpacity>
                    )} */}

                    {attending === 'Attending' && (
                      <Image
                        source={require('../../assets/images/attendingicon.png')}
                        style={tw`w-6 h-6 mr-3`}
                      />
                    )}
                  </View>
                </View>

                <View style={tw`flex-row items-center mt-3`}>
                  <Image
                    source={require('../../assets/images/calendertimeicon.png')}
                    style={tw`w-6 h-6 mr-3`}
                  />
                  {/* all 3 present start date, start/end time*/}
                  <View>
                    <Text style={tw`text-[13px] text-[#040641] font-medium`}>
                      {/* {`${formatDate(eventDetails?.event.start_date)}, ${
                            eventDetails?.event.start_time
                          } - ${eventDetails?.event.end_time}`} */}

                      {/* {getFormattedDate(
                        eventDetails?.event?.start_date,
                        eventDetails?.event?.start_time,
                        eventDetails?.event?.end_time,
                      )} */}
                      {convertEventTime(
                        eventDetails?.event?.start_date,
                        eventDetails?.event?.start_time,
                        eventDetails?.event?.timezone?.tzCode,
                      )}

                      {/* {`${formattedLocalDate(
                        eventDetails?.event?.start_date,
                      )} - ${formattedLocalTime(
                        eventDetails?.event?.start_time,
                      )} -${formattedLocalTime(eventDetails?.event?.end_time)}`} */}
                    </Text>
                  </View>
                </View>

                <View style={tw`flex-row flex-1 mr-3 items-center mt-3`}>
                  <Image
                    source={require('../../assets/images/locationicon1.png')}
                    style={tw`w-6 h-6 mr-3`}
                  />
                  <View style={tw`flex-1`}>
                    {eventDetails?.event?.event_type &&
                      eventDetails?.event?.event_type === 'online' && (
                        <Text
                          style={tw`text-[13px] text-[#040641] font-medium`}
                          numberOfLines={2}>
                          {/* {eventDetails?.event?.church?.address
                            ? truncateText(
                                eventDetails?.event?.church?.address,
                                150,
                              )
                            : eventDetails?.event?.organization?.address
                            ? truncateText(
                                eventDetails?.event?.organization?.address,
                                150,
                              )
                            : truncateText(
                                eventDetails?.event?.organization?.city,
                                150,
                              )} */}
                          {eventDetails?.event?.church?.address
                            ? truncateText(
                                eventDetails.event.church.address,
                                150,
                              )
                            : eventDetails?.event?.organization?.address
                            ? truncateText(
                                eventDetails.event.organization.address,
                                150,
                              )
                            : eventDetails?.event?.christian_organization
                                ?.address
                            ? truncateText(
                                eventDetails.event.christian_organization
                                  .address,
                                150,
                              )
                            : truncateText(
                                eventDetails?.event?.christian_organization
                                  ?.city,
                                150,
                              )}
                        </Text>
                      )}
                    {eventDetails?.event?.event_type &&
                      eventDetails?.event?.event_type === 'offline' && (
                        <View>
                          <Text
                            style={tw`text-[13px] text-[#040641] font-medium`}
                            numberOfLines={2}>
                            {eventDetails.event.address}
                            {/* {truncateText(eventDetails?.event?.address, 150)} */}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>

                <View
                  style={tw`border-b border-gray-300 opacity-80 mb-4 mt-4`}
                />
                <View style={{paddingBottom: 30}}>
                  <Text style={tw`text-[16px]  text-[#040641] font-medium`}>
                    Event Details
                  </Text>
                  <Text style={tw`text-[13px] text-[#040641] opacity-50 mt-2`}>
                    {eventDetails?.event.long_description
                      ? eventDetails?.event.long_description
                      : ' - '}
                  </Text>
                </View>

                {googleMeetLink && (
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      onPress={() => openLinkInBrowser(googleMeetLink)}
                      style={tw`mt-10 w-[280px] h-[44px] rounded-[30px] border-[1.5px] border-[#0077B6] flex-row-reverse justify-center items-center`}>
                      {/* <Image
                        source={require('../../assets/images/rsvpicon.png')}
                        style={tw`w-7 h-7 ml-4`}
                      /> */}
                      <Text style={tw`text-[#0077B6]  text-[17px] font-medium`}>
                        Join Event
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {zoomLink && (
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      onPress={() => openLinkInBrowser(zoomLink)}
                      style={tw`mt-10 w-[280px] h-[44px] rounded-[30px] border-[1.5px] border-[#0077B6] flex-row-reverse justify-center items-center`}>
                      {/* <Image
                        source={require('../../assets/images/rsvpicon.png')}
                        style={tw`w-7 h-7 ml-4`}
                      /> */}
                      <Text style={tw`text-[#0077B6]  text-[17px] font-medium`}>
                        Join Event
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* show RSVP only for non AI generated items  */}
                {!eventDetails?.event?.aigenerated && (
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      onPress={() => openLinkInBrowser(eventDetails.event.rsvp)}
                      style={tw`mt-10 mb-10 w-[280px] h-[44px] rounded-[30px] border-[1.5px] border-[#0077B6] flex-row-reverse justify-center items-center`}>
                      <Image
                        source={require('../../assets/images/rsvpicon.png')}
                        style={tw`w-7 h-7 ml-4`}
                      />
                      <Text style={tw`text-[#0077B6]  text-[17px] font-medium`}>
                        RSVP
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* <EventModal
            setModalVisible={setModalVisible}
            modalVisible={modalVisible}
            eventInfo={eventDetails?.event}
            handleEventConfirmation={handleEventConfirmation}
          /> */}
        </ScrollView>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tooltipContent: {
    color: '#fff',
    padding: 10,
    backgroundColor: '#000',
  },
  touchable: {
    borderRadius: 10,
    backgroundColor: 'white',
  },

  videoWrapper: {
    width: '88%',
    height: 200,
  },
  playButtonContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '88%',
    height: 200,
  },
  playIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    zIndex: 1,
  },
  videoThumbnail: {
    width: '100%',
    // height: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'fill',
  },
  image: {
    width: '88%',
    height: 200,
    resizeMode: 'fill',
    marginBottom: 10,
  },
});

export default EventDetailsScreen;
