import {NavigationContainer, useNavigation} from '@react-navigation/native';
import RootStack from './src/navigation/RootStack';
import {useSelector} from 'react-redux';
import Sticky from './src/components/player/Sticky';
import {useEffect} from 'react';
import TrackPlayer from 'react-native-track-player';
import FloatingChatIcon from './src/components/ministryassistant/ministryicon';

const AppWrapper = () => {
  const {
    isLoggedIn,
    userIntroStepsDone,
    showStickyPlayer,
    showFloatingChatIcon,
    showMinistryIcon
  } = useSelector(state => state.auth);

  useEffect(() => {
    setupPlayer();
  }, []);

  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
  };
  return (
    <NavigationContainer>
      <RootStack
        isLoggedIn={isLoggedIn}
        userIntroStepsDone={userIntroStepsDone}
      />
      {showStickyPlayer && <Sticky />}
      {isLoggedIn && showMinistryIcon && <FloatingChatIcon />}
    </NavigationContainer>
  );
};

export default AppWrapper;
