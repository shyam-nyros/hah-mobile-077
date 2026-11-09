// Per-user activity log for the admin "User Analytics" screens - the app's
// version of the website's hah-website-dev/src/utils/userActivity.js. Goes to
// our own backend (POST /api/app/user/activity -> hah-backend-dev
// controllers/api/webuser/web_activity_controller.js record_app), where it's
// saved with platform "app" next to the website's activity. Only runs between
// startActivity (login / restored session) and stopActivity (logout); wired up
// by components/ActivityTracker.jsx.

import {useCallback, useEffect} from 'react';
import {AppState, Platform} from 'react-native';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {API_BASE_URL} from '../store/rootApiSlice';

const ENDPOINT = `${API_BASE_URL}/api/app/user/activity`;
const FLUSH_INTERVAL_MS = 15 * 1000;
// A screen left open this long is saved and continued as a "resumed" visit
// (adds time, not views), so the admin "active in last 30 min" count sees
// someone still on one screen
const CHECKPOINT_MS = 5 * 60 * 1000;
const MAX_BATCH = 50;
// Like GA4 and the website: a new session starts after 30 minutes without
// activity (e.g. the app sat in the background)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
// Shown as the browser/device on the admin user details page
const USER_AGENT = `HaH-App (${Platform.OS} ${Platform.Version})`;

// Login/signup screens aren't tracked - they're only ever seen logged out
const UNTRACKED_SCREENS = [
  'Onboard',
  'Signin',
  'Signup',
  'TermOfUse',
  'VerificationPending',
  'ForgotPassword',
  'ResetPassword',
  'Otp',
];

// Screen paths -> names shown in admin. Matches the website's grouped page
// names where there's an equivalent ("Home", "Library - Ebook", "Leader
// Profile"...), so admin "time spent" adds up the same page across both.
//
// A path is the route name, prefixed by its parent for screens inside a nested
// navigator ("Fellowship/Feed" vs "LiveActivitiesDetails/Feed" - see
// AppWrapper.jsx), and suffixed with the tab for screens with their own tab bar
// ("LiveChurchDetails/Events", see useTrackedTab). Popups aren't tracked: their
// time counts toward the screen underneath. Looked up by the full path, then
// by its last part; anything not listed shows as its route name split into
// words.
const SCREEN_NAMES = {
  // bottom tabs
  Today: 'Home',
  Library: 'Libraries',
  Livechurch: 'Live Churches',
  AIAssist: 'Ministry Assistant',
  Give: 'Give',
  'Fellowship/Feed': 'Fellowship - Feed',
  'Fellowship/Message': 'Fellowship - Messages',
  // library and leaders
  LibrarySearch: 'Library Search',
  BookDetails: 'Library - Ebook',
  VideoDetails: 'Library - Video',
  PodcastDetails: 'Library - Audio',
  PodcastPlayer: 'Audio Player',
  PlayerScreen: 'Audio Player',
  GlobalLeaderScreen: 'Leaders',
  LeaderProfile: 'Leader Profile',
  // churches, events, giving
  LiveChurchDetails: 'Church Profile',
  LiveActivitiesDetails: 'Live Activity',
  'LiveActivitiesDetails/Feed': 'Live Activity - Feed',
  'LiveActivitiesDetails/Bible': 'Live Activity - Bible',
  Events: 'Events',
  EventDetails: 'Event Details',
  EventSearch: 'Event Search',
  GiveDetails: 'Give Details',
  Homecampaign: 'Home Campaign',
  Prayercampaign: 'Prayer Campaign',
  NewsDetails: 'News Details',
  MinistryAssistantScreen: 'Ministry Assistant',
  // user and account
  Profile: 'Profile',
  Dashboard: 'Dashboard',
  Account: 'Account',
  Notifications: 'Notifications',
  Messages: 'Messages',
  OrderHistory: 'Order History',
  Favorites: 'Favorites',
  WeeklyActivityScreen: 'Weekly Activity',
  GrowthGoals: 'Growth Goals',
  GrowthGoalsFinal: 'Growth Goals - Summary',
  CurrentChurch: 'Current Church',
  Referral: 'Referral',
  ContactHah: 'Contact HaH',
  ChangePassword: 'Update Password',
  BlockedUsers: 'Blocked Users',
  PendingRequestList: 'Pending Requests',
  DeactivateAccount: 'Deactivate Account',
  DeleteAccount: 'Delete Account',
  DeleteAccountOtp: 'Delete Account - Verify',
  PrivacyPolicy: 'Privacy Policy',
  // fellowship
  CreatePost: 'Create Post',
  PostDetails: 'Post Details',
  Guidelines: 'Community Guidelines',
  Chat: 'Chat',
  GroupChat: 'Group Chat',
  IndividualProfile: 'Member Profile',
  GroupProfile: 'Group Profile',
  FollowingUsers: 'Following',
  AddMembersInGroup: 'Add Group Members',
  // tabs inside a screen (useTrackedTab)
  'LiveChurchDetails/Feed': 'Church Profile - Feed',
  'LiveChurchDetails/Bible': 'Church Profile - Bible',
  'LiveChurchDetails/Schedule': 'Church Profile - Schedule',
  'LiveChurchDetails/Events': 'Church Profile - Events',
  'LiveChurchDetails/Give': 'Church Profile - Give',
  'LiveChurchDetails/About': 'Church Profile - About',
};

const lastPart = path => String(path).split('/').pop();

export const getScreenName = path =>
  SCREEN_NAMES[path] ||
  SCREEN_NAMES[lastPart(path)] ||
  lastPart(path)
    .replace(/Screen$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2');

const isUntracked = path =>
  String(path)
    .split('/')
    .some(part => UNTRACKED_SCREENS.includes(part));

let token = null;
let queue = [];
let flushTimer = null;
let appStateSub = null;
// { id, last } - kept in memory: the app process is the "tab" here
let session = null;
// The screen currently open: { page_path, page_title, started_at, resumed, session_id }
let currentPage = null;
// The latest screen, remembered even while not tracking, so the screen shown
// right after login is counted however the navigation/login updates are ordered
let latestScreen = null;
let backgroundedScreen = null;
// Navigation route key of latestScreen, and the tab picked inside each open
// screen that has its own tab bar (useTrackedTab), by route key
let latestRouteKey = null;
const screenTabs = {};

// latestScreen plus the tab open inside it: "LiveChurchDetails/Events"
const currentScreenPath = () => {
  if (!latestScreen) {return null;}
  const tab = latestRouteKey && screenTabs[latestRouteKey];
  return tab ? `${latestScreen}/${tab}` : latestScreen;
};

// Renewed on every event. keepId continues the session a screen visit started
// in, so staying on one screen for over 30 minutes doesn't split the visit. A
// session started by anything but a login (opened while still logged in, back
// after 30+ minutes away) opens with a visit_start event.
const getSessionId = (type, keepId) => {
  const now = Date.now();
  if (keepId) {
    session = {id: keepId, last: now};
    return keepId;
  }
  if (!session?.id || now - session.last > SESSION_TIMEOUT_MS) {
    session = {
      id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    };
    if (type !== 'login') {
      queue.push({type: 'visit_start', at: now, session_id: session.id});
    }
  }
  session.last = now;
  return session.id;
};

const send = (events, authToken) => {
  fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({events}),
  }).catch(() => {
    // best effort - dropped batches aren't retried
  });
};

export const flushActivity = () => {
  if (!token || !queue.length) {return;}
  while (queue.length) {
    send(queue.splice(0, MAX_BATCH), token);
  }
};

export const logActivity = (type, data = {}) => {
  if (!token) {return;}
  queue.push({
    type,
    at: Date.now(),
    ...data,
    session_id: getSessionId(type, data.session_id),
  });
  if (queue.length >= MAX_BATCH) {flushActivity();}
};

// Closes the open screen visit as a page_view with the time spent on it
const endPage = () => {
  if (!currentPage) {return;}
  const {started_at, ...page} = currentPage;
  currentPage = null;
  logActivity('page_view', {
    ...page,
    at: started_at,
    engagement_sec: Math.round((Date.now() - started_at) / 1000),
  });
};

// The session is taken when the screen opens, matching the page_view's timestamp
const openPage = (path, resumed = false) => {
  if (isUntracked(path)) {return;}
  currentPage = {
    page_path: path,
    page_title: getScreenName(path),
    started_at: Date.now(),
    resumed,
    session_id: getSessionId('page_view'),
  };
};

const checkpointPage = () => {
  if (!currentPage || Date.now() - currentPage.started_at < CHECKPOINT_MS) {
    return;
  }
  const {page_path} = currentPage;
  endPage();
  openPage(page_path, true);
};

// Called whenever the focused screen changes (logged in or not), with the
// screen's path (see SCREEN_NAMES) and navigation route key.
export const startPage = (path, routeKey = null) => {
  if (!path) {return;}
  latestScreen = path;
  latestRouteKey = routeKey;
  if (!token) {return;}
  endPage();
  if (AppState.currentState === 'active') {openPage(currentScreenPath());}
};

// A tab picked inside a screen with its own tab bar (not a navigator) counts
// as its own screen: "LiveChurchDetails/Events"
const setScreenTab = (routeKey, tab) => {
  if (!routeKey) {return;}
  screenTabs[routeKey] = tab;
  // a screen in the background: picked up when it's shown again
  if (routeKey !== latestRouteKey || !token) {return;}
  const path = currentScreenPath();
  if (currentPage?.page_path === path) {return;}
  // The screen was just opened before its tab was known: name that visit by
  // the tab instead of logging a 0-second visit of the bare screen
  if (currentPage?.page_path === latestScreen && !currentPage.resumed) {
    currentPage.page_path = path;
    currentPage.page_title = getScreenName(path);
    return;
  }
  endPage();
  if (AppState.currentState === 'active') {openPage(path);}
};

// Tracks the tab open inside the current screen, e.g.
// useTrackedTab(activeTab) in LiveChurchDetailsScreen. Add the
// "<Screen>/<tab>" names to SCREEN_NAMES.
export const useTrackedTab = tab => {
  const routeKey = useRoute().key;
  useEffect(() => {
    if (tab) {setScreenTab(routeKey, tab);}
  }, [routeKey, tab]);
  useEffect(
    () => () => {
      delete screenTabs[routeKey];
    },
    [routeKey],
  );
};

// Backgrounded: close the visit and send now, since the app may be killed
// there. Back in the foreground: reopen the same screen as a "resumed" visit.
// "inactive" (iOS app switcher, control centre, calls) is left alone.
const handleAppStateChange = state => {
  if (state === 'background') {
    if (currentPage) {backgroundedScreen = currentPage.page_path;}
    endPage();
    flushActivity();
  } else if (state === 'active' && token) {
    if (backgroundedScreen) {openPage(backgroundedScreen, true);}
    backgroundedScreen = null;
  }
};

// isLogin: the user just signed in (rather than opening the app while still
// logged in), logged as a "login" that starts a new session
export const startActivity = (authToken, {isLogin = false} = {}) => {
  if (!authToken || token === authToken) {return;}
  if (token) {stopActivity();}
  token = authToken;

  if (isLogin) {
    session = null;
    logActivity('login');
  }
  if (latestScreen && AppState.currentState === 'active') {
    openPage(currentScreenPath());
  }

  appStateSub = AppState.addEventListener('change', handleAppStateChange);
  flushTimer = setInterval(() => {
    checkpointPage();
    flushActivity();
  }, FLUSH_INTERVAL_MS);
};

// Stops collecting after sending what's left with the old token. logout: the
// user signed out (not just a token swap), shown on their admin timeline.
export const stopActivity = ({logout = false} = {}) => {
  if (!token) {return;}
  endPage();
  if (logout) {logActivity('logout');}
  flushActivity();
  backgroundedScreen = null;
  token = null;
  queue = [];
  session = null;
  clearInterval(flushTimer);
  flushTimer = null;
  appStateSub?.remove();
  appStateSub = null;
};

// Logs `type` ("library_view", "leader_view", "church_view") with
// { [idKey]: id, engagement_sec } for the time the screen was focused with the
// app in the foreground. Sent when the screen loses focus (back, or another
// screen opened on top) - and when the app is backgrounded, since it may be
// killed there; time after coming back is sent as a "resumed" part, which adds
// time without counting another view.
export const useEngagementTimer = (type, idKey, id) => {
  useFocusEffect(
    useCallback(() => {
      if (!id) {return undefined;}

      let visibleMs = 0;
      let visibleSince = AppState.currentState === 'active' ? Date.now() : null;
      let resumed = false;

      const pause = () => {
        if (visibleSince) {
          visibleMs += Date.now() - visibleSince;
          visibleSince = null;
        }
      };

      const sendPart = () => {
        pause();
        const engagement_sec = Math.round(visibleMs / 1000);
        visibleMs = 0;
        if (engagement_sec < 1) {return;}
        logActivity(type, {[idKey]: id, engagement_sec, resumed});
        resumed = true;
      };

      const sub = AppState.addEventListener('change', state => {
        if (state === 'active') {
          if (!visibleSince) {visibleSince = Date.now();}
        } else if (state === 'background') {
          sendPart();
          flushActivity();
        } else {
          pause();
        }
      });

      return () => {
        sub.remove();
        sendPart();
      };
    }, [type, idKey, id]),
  );
};
