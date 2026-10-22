import {useNavigation} from '@react-navigation/native';
import {
  View,
  Image,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  Linking,
} from 'react-native';
import tw from 'twrnc';
import bookcoverImg from '../../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../../assets/images/podcastplaceholder.png';
import eventscoverImg from '../../../assets/images/defaults/eventslarge.png';
import churchcoverImg from '../../../assets/images/livechurchplaceholder.png';
import eventsIcon from '../../../assets/images/ycaevents.png';
import liveChurchIcon from '../../../assets/images/ycalivechurch.png';
import giveProjectIcon from '../../../assets/images/ycagiveprojects.png';
import libraryIcon from '../../../assets/images/ycalibrary.png';
import leaderIcon from '../../../assets/images/personoutlineicons.png';
import leadercoverImg from '../../../assets/images/leaderplaceholder.png';
import websiteIcon from '../../../assets/images/website.png';
import websitecoverImg from '../../../assets/images/webplaceholder.png';

import HomeRequestForm from '../HomeRequestForm';
import LiveChurchAddModal from '../LiveChurchAddModal';
import moment from 'moment';
import {convertEventTime} from '../../../utils/formattedDate';

const {width, height} = Dimensions.get('screen');

const SlideItem = ({item, index, isLast}) => {



  const navigation = useNavigation();
  const translateYImage = new Animated.Value(40);

  Animated.timing(translateYImage, {
    toValue: 0,
    duration: 1000,
    useNativeDriver: true,
    easing: Easing.bounce,
  }).start();

  const handleNavigation = activityType => {
    switch (activityType) {
      case 'event':
        navigation.navigate('EventDetails', {eventId: item._id});
        break;
      case 'live_church':
        navigation.navigate('LiveChurchDetails', {churchId: item._id});
        break;
      case 'live_activities':
        navigation.navigate('LiveActivitiesDetails', {
          liveActivityId: item._id,
        });
        break;
      case 'give_project':
        navigation.navigate('GiveDetails', {giveProjectId: item._id});
        break;
      case 'ebook':
        navigation.navigate('BookDetails', {libraryItemId: item._id});
        break;
      case 'video':
        navigation.navigate('VideoDetails', {libraryItemId: item._id});
        break;
      case 'audio':
        navigation.navigate('PodcastDetails', {libraryItemId: item._id});
        break;
      case 'leaders':
        navigation.navigate('LeaderProfile', {leaderId: item._id});
        break;
      case 'externalwebsite':
        if (item?.inputUrl) {
          Linking.openURL(item.inputUrl).catch(err =>
            console.error('Failed to open URL:', err),
          );
        }
        break;
    }
  };

  const getDefaultImage = type => {
    switch (type) {
      case 'ebook':
        return bookcoverImg;
      case 'video':
        return videocoverImg;
      case 'audio':
        return audiocoverImg;
      case 'event':
        return eventscoverImg;
      case 'live_church':
        return churchcoverImg;
      case 'live_activities':
        return churchcoverImg;
      case 'leaders':
        return leadercoverImg;
      case 'externalwebsite':
        return websitecoverImg;
      default:
        return bookcoverImg;
    }
  };

  const getIcon = type => {
    switch (type) {
      case 'event':
        return eventsIcon;
      case 'live_church':
        return liveChurchIcon;
      case 'live_activities':
        return liveChurchIcon;
      case 'give_project':
        return giveProjectIcon;
      case 'ebook':
      case 'video':
      case 'audio':
        return libraryIcon;
      case 'leaders':
        return leaderIcon;
      case 'externalwebsite':
        return websiteIcon;
      default:
        return null;
    }
  };

  if (item.type === 'last_card_1') {
    return (
      <View style={styles.container}>
        <HomeRequestForm />
      </View>
    );
  }

  if (item.type === 'last_card_2') {
    return (
      <View style={styles.container}>
        <LiveChurchAddModal />
      </View>
    );
  }

  return (
    <TouchableOpacity
      key={item._id}
      onPress={() => handleNavigation(item.type)}>
      <View style={styles.container}>
        <>
          {item?.aigenerated && (
            <Image
              source={{uri: item?.ai_cover_image}}
              resizeMode="cover"
              style={[styles.image]}
            />
          )}
          {!item?.aigenerated && (
            <Image
              source={
                item.cover_image?.path
                  ? {uri: item.cover_image.path}
                  : item.profile_image
                  ? {uri: item.profile_image}
                  : getDefaultImage(item.type)
              }
              resizeMode="cover"
              style={[styles.image]}
            />
          )}
          {/* for type live church and in progress  */}
          {item?.type === 'live_church' &&
            item?.slotInfo?.status === 'inprogress' && (
              <View style={styles.livecontainer}>
                <Image
                  source={require('../../../assets/images/liveiconred.png')}
                  // style={tw`w-7 h-7 absolute top-2 left-2`}
                  style={styles.icon}
                />
                <Text style={styles.text}>Live</Text>
              </View>
            )}

          {/* for type live activities and in progress  */}
          {item?.type === 'live_activities' &&
            item?.activityInfo?.status === 'inprogress' && (
              <View style={styles.livecontainer}>
                <Image
                  source={require('../../../assets/images/liveiconred.png')}
                  // style={tw`w-7 h-7 absolute top-2 left-2`}
                  style={styles.icon}
                />
                <Text style={styles.text}>Live</Text>
              </View>
            )}

          {/* for type live church */}
          {item?.type === 'live_church' &&
            item?.slotInfo?.status === 'upcoming' && (
              <Image
                source={getIcon(item.type)}
                style={tw`w-7 h-7 absolute top-2 left-2`}
              />
            )}
          {/* for other types */}
          {item?.type !== 'live_church' && (
            <Image
              source={getIcon(item.type)}
              style={tw`w-7 h-7 absolute top-2 left-2`}
            />
          )}
          {item?.activities_from && (
            <View
              style={tw`bg-[#CCEDFF] bg-opacity-85 absolute px-2 py-1 rounded-full top-2 right-2`}>
              <Text
                style={tw`text-[#040641] font-medium`}>{` ${item.activities_from}`}</Text>
            </View>
          )}
        </>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title
              ? item.title
              : `${item.first_name || ''} ${item.last_name || ''}`.trim()}
          </Text>

          {item.start_date ? (
            <Text
              style={[tw`py-[4px] font-medium`, styles.description]}
              numberOfLines={2}>
              {/* {`${moment(item?.start_date).format('MMMM Do YYYY')} ${
                item?.start_time || ''
              }`} */}
              {/* {convertEventTime(
                item?.start_date,
                item?.slotInfo?.start_time,
                item?.timezone?.tzCode,
              )} */}
              {convertEventTime(
               item?.start_date,
                item?.type === 'live_activities'
                ? item?.start_time
               : item?.slotInfo?.start_time,
                item?.timezone?.tzCode,
          )}
            </Text>
          ) : (
            <Text
              style={[tw`py-[4px] font-medium`, styles.description]}
              numberOfLines={1}>
              {item?.long_description || item?.description}
            </Text>
          )}
          <Text style={[tw``, styles.description]} numberOfLines={1}>
            {/* {item?.church?.name} */}
            {item?.church?.name ||
              item?.organization?.name ||
              item?.christian_organization?.name ||
              ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SlideItem;

const styles = StyleSheet.create({
  container: {
    width: width / 1.1,
    // maxWidth: 350,
    height: height / 3.2,
    backgroundColor: '#0077B6',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    position: 'absolute',
    top: 0,
  },
  content: {
    width: '100%',
    height: 75,
    backgroundColor: '#0077B6',
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'start',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'start',
  },
  livecontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,

    alignSelf: 'flex-start',
    position: 'absolute',
    top: 7,
    left: 10,
    zIndex: 1,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 4,
    tintColor: 'white', // Make icon white (optional if your icon is already white)
    resizeMode: 'contain',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
