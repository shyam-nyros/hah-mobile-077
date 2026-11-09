import {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {startActivity, stopActivity} from '../utils/userActivity';

// Turns the admin "User Analytics" activity log (utils/userActivity.js) on for
// logged-in users and off at logout. Screen changes are reported separately,
// from the NavigationContainer in AppWrapper.jsx.
//
// PersistGate only renders the app once the saved login is restored, so a
// token present on the first render is a restored session (logged as a
// visit_start), while a token that appears later is a fresh login.
const ActivityTracker = () => {
  const {isLoggedIn, token} = useSelector(state => state.auth);
  const firstRun = useRef(true);

  useEffect(() => {
    if (isLoggedIn && token) {
      startActivity(token, {isLogin: !firstRun.current});
    } else {
      stopActivity({logout: true});
    }
    firstRun.current = false;
  }, [isLoggedIn, token]);

  return null;
};

export default ActivityTracker;
