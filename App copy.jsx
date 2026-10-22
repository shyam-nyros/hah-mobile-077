import AppWrapper from './AppWrapper';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import store, {persistor} from './src/store/store';
import Toast from 'react-native-toast-message';
import toastConfig from './src/utils/toast/configToast'; 
import BootSplash from 'react-native-bootsplash';
import {useEffect} from 'react';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(); 

const App = () => {
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({fade: true});
    });
  }, []);

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppWrapper />
          <Toast config={toastConfig} position="top" topOffset={100} />
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
