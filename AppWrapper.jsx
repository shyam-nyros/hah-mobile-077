import {NavigationContainer, useNavigation} from '@react-navigation/native';
import RootStack from './src/navigation/RootStack';
import {useSelector} from 'react-redux';
import Sticky from './src/components/player/Sticky';
import {useEffect, useRef} from 'react';
import TrackPlayer from 'react-native-track-player';
import FloatingChatIcon from './src/components/ministryassistant/ministryicon';
// Firebase email-link (deep link) login is not used in the app right now -
// its imports and handler below are commented out. The hahmobile://__/auth/action
// deep link itself stays registered (AndroidManifest.xml / Info.plist): the
// backend's /api/app-link/open page uses it to open the app from emails.
// import {useDispatch} from 'react-redux';
// import {Linking} from 'react-native';
// import {login, userIntro} from './src/features/auth/authSlice';
// import {useFirebaseEmailLinkAuthAPIMutation} from './src/features/auth/authApiSlice';
// import {
  //  readPendingFirebaseEmail,
  //  clearPendingFirebaseEmail,
// } from './src/utils/firebaseEmailLinkStorage';
// import {showToast} from './src/utils/toast/showToast';

const AppWrapper = () => {
  // const dispatch = useDispatch();
  // const [firebaseEmailLinkAuthAPI] = useFirebaseEmailLinkAuthAPIMutation();
  // const linkHandlingRef = useRef(false);
  const navigationRef = useRef();

  const {
    isLoggedIn,
    showStickyPlayer,
    showFloatingChatIcon,
    showMinistryIcon,
  } = useSelector(state => state.auth);

  useEffect(() => {
    setupPlayer();
  }, []);

  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
  };

  // Email-link login - disabled, see the note at the top of this file.
  // // Helper to extract oobCode from URL
  // const extractOobCode = url => {
  //   if (!url) return null;
  //   console.log('[AppWrapper] Extracting oobCode from URL:', url);
  //   const match = url.match(/[?&]oobCode=([^&]+)/);
  //   const code = match ? decodeURIComponent(match[1]) : null;
  //   console.log(
  //     '[AppWrapper] Extracted oobCode:',
  //     code ? code.substring(0, 20) + '...' : 'null',
  //   );
  //   return code;
  // };

  // // Global Firebase email link handler
  // const handleFirebaseEmailLink = async url => {
  //   console.log('[AppWrapper] ========================================');
  //   console.log('[AppWrapper] handleFirebaseEmailLink called');
  //   console.log('[AppWrapper] URL:', url);

  //   if (!url || !url.includes('oobCode')) {
  //     console.log('[AppWrapper] URL does not contain oobCode - ignoring');
  //     return;
  //   }

  //   if (linkHandlingRef.current) {
  //     console.log('[AppWrapper] Already processing a link - aborting');
  //     return;
  //   }

  //   linkHandlingRef.current = true;

  //   try {
  //     console.log('[AppWrapper] Reading pending email from AsyncStorage...');
  //     const pendingPayload = await readPendingFirebaseEmail();
  //     const pendingEmail = pendingPayload?.email;
  //     console.log('[AppWrapper] Pending email:', pendingEmail);
  //     console.log(
  //       '[AppWrapper] Pending payload:',
  //       JSON.stringify(pendingPayload),
  //     );

  //     if (!pendingEmail) {
  //       console.log('[AppWrapper] No pending email - showing error');
  //       showToast(
  //         'error',
  //         'Could not match this link to an email. Please try signing in again on this device.',
  //       );
  //       return;
  //     }

  //     const oobCode = extractOobCode(url);
  //     if (!oobCode) {
  //       console.log('[AppWrapper] No oobCode found in URL');
  //       showToast('error', 'Invalid sign-in link.');
  //       return;
  //     }

  //     console.log('[AppWrapper] Building request body...');
  //     const body = {
  //       oobCode,
  //       email: pendingEmail, // Required by backend for Firebase verification
  //     };
  //     if (pendingPayload?.first_name) {
  //       body.first_name = pendingPayload.first_name;
  //     }
  //     if (pendingPayload?.last_name) {
  //       body.last_name = pendingPayload.last_name;
  //     }
  //     console.log(
  //       '[AppWrapper] Request body:',
  //       JSON.stringify({
  //         ...body,
  //         oobCode: body.oobCode?.substring(0, 20) + '...',
  //       }),
  //     );

  //     console.log('[AppWrapper] Calling backend API...');
  //     let response;
  //     let lastError;
  //     for (let attempt = 1; attempt <= 3; attempt++) {
  //       try {
  //         console.log(`[AppWrapper] API attempt ${attempt}/3`);
  //         response = await firebaseEmailLinkAuthAPI(body).unwrap();
  //         lastError = null;
  //         break;
  //       } catch (err) {
  //         lastError = err;
  //         const isNetworkError =
  //           err?.status === 'FETCH_ERROR' ||
  //           err?.error?.includes?.('Network request failed');
  //         if (isNetworkError && attempt < 3) {
  //           const delay = attempt * 1500;
  //           console.log(
  //             `[AppWrapper] Network error on attempt ${attempt}, retrying in ${delay}ms...`,
  //           );
  //           await new Promise(resolve => setTimeout(resolve, delay));
  //         } else {
  //           throw err;
  //         }
  //       }
  //     }
  //     if (lastError) throw lastError;
  //     console.log('[AppWrapper] API response received');
  //     console.log('[AppWrapper] Response keys:', Object.keys(response || {}));
  //     console.log('[AppWrapper] Has token:', !!response?.token);
  //     console.log(
  //       '[AppWrapper] Registration completed:',
  //       response?.registration_completed,
  //     );

  //     if (response?.registration_completed) {
  //       console.log('[AppWrapper] New user - dispatching userIntro()');
  //       dispatch(userIntro());
  //     }

  //     console.log('[AppWrapper] Dispatching login() with token');
  //     dispatch(login({token: response?.token}));

  //     console.log('[AppWrapper] Clearing pending email from AsyncStorage...');
  //     await clearPendingFirebaseEmail();
  //     console.log('[AppWrapper] Pending email cleared');

  //     showToast('success', 'You are now signed in.');
  //     console.log('[AppWrapper] ✅ Firebase email link authentication SUCCESS');
  //   } catch (error) {
  //     console.error(
  //       '[AppWrapper] ❌ Firebase email link authentication ERROR:',
  //       error,
  //     );
  //     console.error('[AppWrapper] Error type:', typeof error);
  //     console.error('[AppWrapper] Error message:', error?.message);
  //     console.error('[AppWrapper] Error data:', error?.data);

  //     let errorMessage = 'Failed to sign in with this link.';
  //     if (error?.data?.msg) {
  //       errorMessage = error.data.msg;
  //     } else if (error?.message) {
  //       errorMessage = error.message;
  //     }

  //     showToast('error', errorMessage);
  //   } finally {
  //     linkHandlingRef.current = false;
  //     console.log('[AppWrapper] Link processing complete');
  //     console.log('[AppWrapper] ========================================');
  //   }
  // };

  // // Set up deep link listeners
  // useEffect(() => {
  //   console.log('[AppWrapper] Setting up deep link listeners...');

  //   // Handle app opened from closed state
  //   const handleInitialUrl = async () => {
  //     console.log('[AppWrapper] Checking for initial URL...');
  //     const initialUrl = await Linking.getInitialURL();
  //     console.log('[AppWrapper] Initial URL:', initialUrl);
  //     if (initialUrl) {
  //       // Small delay to allow iOS network stack to initialize on cold start
  //       await new Promise(resolve => setTimeout(resolve, 800));
  //       await handleFirebaseEmailLink(initialUrl);
  //     }
  //   };

  //   // Handle app opened from background state
  //   const subscription = Linking.addEventListener('url', ({url}) => {
  //     console.log('[AppWrapper] Deep link received:', url);
  //     handleFirebaseEmailLink(url);
  //   });

  //   handleInitialUrl();

  //   return () => {
  //     console.log('[AppWrapper] Cleaning up deep link listeners');
  //     subscription.remove();
  //   };
  // }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack isLoggedIn={isLoggedIn} />
      {showStickyPlayer && <Sticky />}
      {/* {isLoggedIn && showMinistryIcon && <FloatingChatIcon />} */}
    </NavigationContainer>
  );
};

export default AppWrapper;
