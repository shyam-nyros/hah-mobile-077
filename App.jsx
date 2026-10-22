import AppWrapper from './AppWrapper';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import store, {persistor} from './src/store/store';
import Toast from 'react-native-toast-message';
import toastConfig from './src/utils/toast/configToast';
import BootSplash from 'react-native-bootsplash';
import {useEffect} from 'react';
import {LogBox} from 'react-native';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

LogBox.ignoreAllLogs();

const App = () => {
  useEffect(() => {
    const init = async () => {
      // add properties
    };

    init().finally(async () => {
      await BootSplash.hide({fade: true});
    });
  }, []);

  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();

        // Configure the player with notification settings
        await TrackPlayer.updateOptions({
          android: {
            appName: 'HaH',
            // Add a notification icon (required)
            icon: 'ic_launcher',
            // Make sure these colors match your app theme
            color: 0x000000,
            // Add notification actions
            capabilities: [
              TrackPlayer.CAPABILITY_PLAY,
              TrackPlayer.CAPABILITY_PAUSE,
              TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
              TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
            ],
            // Add notification channels (for Android 8+)
            notificationCapabilities: [
              TrackPlayer.CAPABILITY_PLAY,
              TrackPlayer.CAPABILITY_PAUSE,
              TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
              TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
            ],
            compactCapabilities: [
              TrackPlayer.CAPABILITY_PLAY,
              TrackPlayer.CAPABILITY_PAUSE,
            ],
          },
          // iOS settings
          ios: {
            appName: 'HaH',
          },
        });
        // Add tracks after setup
        // Example: await TrackPlayer.add(tracks);
      } catch (error) {}
    };

    setupPlayer();
  });

  return (
    <>
      {/* <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <SafeAreaView
              style={{flex: 1, backgroundColor: '#0273B2'}}
              edges={['top', 'bottom', 'left', 'right']}>
              <AppWrapper />
              <Toast config={toastConfig} position="top" topOffset={100} />
            </SafeAreaView>
          </SafeAreaProvider>
        </PersistGate>
      </Provider> */}
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <SafeAreaView
              style={{flex: 1, backgroundColor: '#0273B2'}}
              edges={['top', 'bottom', 'left', 'right']}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{flex: 1}}>
                <AppWrapper />
                <Toast config={toastConfig} position="top" topOffset={100} />
              </KeyboardAvoidingView>
            </SafeAreaView>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
