import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

const track1 = {
  _id: '111',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  cover:
    'https://plus.unsplash.com/premium_photo-1682125773446-259ce64f9dd7?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  title: 'Hello World',
  artist: 'Tom Hardy',
};
const track2 = {
  _id: '222',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  cover:
    'https://plus.unsplash.com/premium_photo-1681488357470-a087afd4988a?q=80&w=2010&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  title: 'Welcom to World',
  artist: 'Arnold Smith',
};
const track3 = {
  _id: '333',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  cover:
    'https://plus.unsplash.com/premium_photo-1669652639337-c513cc42ead6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  title: 'LOREM IPSUM',
  artist: 'VICTOR VAAS',
};
const PlayerCards = track => {
  const navigation = useNavigation();

  const handleNav = (track) => {

    navigation.navigate('PlayerScreen', {track});
  };
  return (
    <>
      <TouchableOpacity onPress={() => handleNav(track1)}>
        <Text>Track 1</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleNav(track2)}>
        <Text>Track 2</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleNav(track3)}>
        <Text>Track 3</Text>
      </TouchableOpacity>
    </>
  );
};

export default PlayerCards;
