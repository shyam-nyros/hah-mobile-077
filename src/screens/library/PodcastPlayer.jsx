import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import tw from 'twrnc';
import Sound from 'react-native-sound';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

Sound.setCategory('Playback');

const ProgressBar = ({progress, currentTime, duration}) => {
  const clampedProgress = Math.max(0, Math.min(progress, 100));

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={tw`w-full py-2 mt-4`}>
      <View style={tw`relative`}>
        <View style={tw`bg-[#0077B6] bg-opacity-30 rounded-full h-2`}>
          <View
            style={[
              tw`bg-[#0077B6] h-full rounded-full`,
              {width: `${clampedProgress}%`},
            ]}
          />
        </View>
      </View>
      <View style={tw`flex-row justify-between mt-2`}>
        <Text style={tw`text-xs text-[#040641]`}>
          {formatTime(currentTime)}
        </Text>
        <Text style={tw`text-xs text-[#040641]`}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const Podcast = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {podcastUrl, coverImage} = route.params;

  const dispatch = useDispatch();
  const {stickyPlayerOpen} = useSelector(state => state.auth);

  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.release();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sound]);

  const togglePlayback = () => {
    if (isPlaying) {
      sound.pause();
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      if (sound) {
        sound.play(() => {
          setIsPlaying(false);
          clearInterval(intervalRef.current);
          setProgress(100);
        });

        intervalRef.current = setInterval(() => {
          sound.getCurrentTime(currentTime => {
            const progressPercentage = (currentTime / duration) * 100;
            setCurrentTime(currentTime);
            setProgress(progressPercentage);
          });
        }, 1000);

        setIsPlaying(true);
      } else {
        const newSound = new Sound(podcastUrl, null, error => {
          if (error) {
            
            return;
          }

          setDuration(newSound.getDuration());
          setSound(newSound);
          newSound.play(() => {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            setProgress(100);
          });

          intervalRef.current = setInterval(() => {
            newSound.getCurrentTime(currentTime => {
              const progressPercentage =
                (currentTime / newSound.getDuration()) * 100;
              setCurrentTime(currentTime);
              setProgress(progressPercentage);
            });
          }, 1000);

          setIsPlaying(true);
        });
      }
    }
  };

  const skipForward = () => {
    if (sound) {
      sound.getCurrentTime(currentTime => {
        const newTime = Math.min(currentTime + 30, duration);
        sound.setCurrentTime(newTime);
        setCurrentTime(newTime);
        setProgress((newTime / duration) * 100);
      });
    }
  };

  const skipBackward = () => {
    if (sound) {
      sound.getCurrentTime(currentTime => {
        const newTime = Math.max(currentTime - 30, 0);
        sound.setCurrentTime(newTime);
        setCurrentTime(newTime);
        setProgress((newTime / duration) * 100);
      });
    }
  };

  const closeStickyPlayer = () => {
    dispatch(closeStickyPlayer());
  };

  const navigateToPreviousScreen = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <>
      <View style={tw`flex-1 bg-white`}>
        <SafeAreaView style={tw`mx-2 flex-row py-4`}>
          <TouchableOpacity
            style={tw`flex-row  items-center`}
            onPress={navigateToPreviousScreen}>
            <Image
              source={require('../../assets/images/backnavicon.png')}
              style={[tw`w-9 h-9`, {transform: [{rotate: '-90deg'}]}]}
            />
          </TouchableOpacity>
          <Text
            style={tw`text-[#040641] text-[18px] mr-4 font-semibold text-center flex-1`}>
            Now Playing
          </Text>
        </SafeAreaView>

        <ScrollView style={tw`bg-white`}>
          <View style={tw`mx-4 mt-6`}>
            <Image
              source={{uri: coverImage}}
              style={tw`w-full h-80 rounded-lg `}
            />
            <View style={tw`mt-4 justify-center items-center`}>
              <View
                style={tw`bg-[#040641] px-[5px] bg-opacity-20 gap-2 justify-center items-center flex-row rounded-full py-[5px]`}>
                <Image
                  source={require('../../assets/images/leader1.png')}
                  style={tw`w-6 h-6 rounded-full`}
                />
                <Text style={tw`text-[#040641] text-[14px]`}>Joel Osteen</Text>
              </View>
              <View style={tw`mt-3`}>
                <Text style={tw`text-[#040641] text-[18px] font-semibold`}>
                  How to Walk in The Light
                </Text>
                <Text
                  style={tw`text-[#040641] text-[14px] mt-2 opacity-60 text-center font-medium`}>
                  Lakewood Church
                </Text>
              </View>
            </View>

            <View style={tw`flex-1 justify-center items-center bg-white`}>
              <ProgressBar
                progress={progress}
                currentTime={currentTime}
                duration={duration}
              />
              <View
                style={tw`flex-row mt-4 w-[80%] justify-between items-center`}>
                <TouchableOpacity>
                  <Image
                    source={require('../../assets/images/skipbackicon.png')}
                    style={tw`w-6 h-6`}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={skipBackward}>
                  <Image
                    source={require('../../assets/images/replayicon.png')}
                    style={tw`w-6 h-6`}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayback}>
                  <Image
                    source={
                      isPlaying
                        ? require('../../assets/images/pauseicon.png')
                        : require('../../assets/images/playbutton.png')
                    }
                    style={tw`w-22 h-22`}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={skipForward}>
                  <Image
                    source={require('../../assets/images/forwardicon.png')}
                    style={tw`w-6 h-6`}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image
                    source={require('../../assets/images/skipforwardicon.png')}
                    style={tw`w-6 h-6`}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Podcast;
