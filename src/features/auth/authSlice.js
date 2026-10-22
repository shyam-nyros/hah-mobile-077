import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import socket from '../../socket/socket';

const initialState = {
  currentUserId: null,
  isInstalled: false,
  isLoggedIn: false,
  token: null,
  firstName: '',
  lastName: '',
  profilePicture: null,
  addRequestForm: false,
  liveModalForm: false,
  currentChurchModal: false,
  location: {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.09,
    longitudeDelta: 0.02,
    country: null,
    state: null,
    city: null,
    address: null,
    zipcode: null,
  },
  industry: {
    id: null,
    name: null,
  },
  profession: {
    id: null,
    name: null,
  },
  socialLinks: [],
  dob: null,
  spokenLanguages: [],
  email: null,
  gender: null,
  userIntroStepsDone: false,
  selectedChurch: null,
  selectedChurchId: null,
  selectedChurchName: null,
  selectedChurchAddress: null,
  selectedChurchCount: 0,
  isLeader: false,
  showAddChurch: true,
  followedChurchList: [],
  interestedContent: [],
  aboutMeDescription: null,
  newPostCreated: false,
  currentTrackInfo: null,
  isPlaying: false,
  showStickyPlayer: false,
  showFloatingChatIcon: true,
  postLiked: false,
  appShareLinks: {
    android: null,
    ios: null,
  },
  // to set the list of online users
  currentOnlineUsers: [],
  bellNotificationCount: 0,
  messageNotificationCount: 0,
  showMinistryIcon: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsInstalled: state => {
      state.isInstalled = true;
    },
    signup: (state, action) => {
      (state.firstName = action.payload.firstName),
        (state.lastName = action.payload.lastName),
        (state.email = action.payload.email);
      state.token = action.payload.token;
      state.userIntroStepsDone = false;
      (state.selectedChurch = null),
        (state.selectedChurchId = null),
        (state.isLeader = false),
        (state.showAddChurch = true),
        (state.followedChurchList = []);
      state.interestedContent = [];
    },
    verifyOtp: (state, action) => {
      state.isLoggedIn = true;
    },
    userIntro: state => {
      state.userIntroStepsDone = true;
    },
    login: (state, action) => {
      socket.initialize(action.payload.token);
      state.isLoggedIn = true;
      state.token = action.payload.token;
    },
    setUserInfo: (state, action) => {
      state.currentUserId = action.payload._id;
      state.firstName = action.payload.first_name;
      state.lastName = action.payload.last_name;
      state.isLeader = action?.payload?.is_leader;
      state.gender = action.payload?.gender || state.gender;
      state.email = action.payload.email;
      state.selectedChurchId = action.payload.church?._id;
      state.selectedChurchName = action.payload.church?.name;
      state.industry.name =
        action.payload?.industry?.name || state.industry.name;
      state.industry.id = action.payload?.industry?._id || state.industry.id;
      state.profession.name =
        action.payload?.profession?.name || state.profession.name;
      state.profession.id =
        action.payload?.profession?._id || state.profession.id;
      state.aboutMeDescription =
        action.payload?.about || state.aboutMeDescription;
      state.spokenLanguages =
        action.payload?.languages || state.spokenLanguages;
      state.interestedContent =
        action.payload?.interests || state.interestedContent;
      state.socialLinks = action.payload?.social_links || state.socialLinks;
      state.dob = action.payload?.dob || state.dob;
      state.profilePicture =
        action.payload?.profile_image || state.profilePicture;
    },
    updateUserNameFromProfile: (state, action) => {
      state.firstName = action.payload.first_name || state.firstName;
      state.lastName = action.payload.last_name || state.lastName;
      state.gender = action.payload?.gender || state.gender;
      state.industry.id = action.payload.id || state.industry.id;
      state.industry.name = action.payload.name || state.industry.name;
      // state.profession.id = action.payload.id || state.profession.id;
      state.profession.name = action.payload.name || state.profession.name;
      state.aboutMeDescription =
        action.payload.about || state.aboutMeDescription;
      state.socialLinks = action.payload.socialLinks || state.socialLinks;
      state.spokenLanguages =
        action.payload?.languages || state.spokenLanguages;
      state.interestedContent =
        action.payload?.interests || state.interestedContent;
      state.dob = action.payload?.dob || state.dob;
      state.profilePicture =
        action.payload?.profile_image || state.profilePicture;
    },

    logout: (state, action) => {
      socket.disconnect();
      return {
        ...initialState, // reset the entire user state on logout
        isInstalled: state.isInstalled, // Keep the isInstalled flag
      };
    },

    setLocation: (state, action) => {
      state.location.latitude =
        action.payload.latitude || state.location.latitude;
      state.location.longitude =
        action.payload.longitude || state.location.longitude;
      state.location.country = action.payload.country || state.location.country;
      state.location.state = action.payload.state || state.location.state;
      state.location.city = action.payload.city || state.location.city;
      state.location.address = action.payload.address || state.location.address;
      state.location.zipcode = action.payload.zipcode || state.location.zipcode;
    },
    setSelectedChurch: (state, action) => {
      state.selectedChurch = action.payload.name;
      state.selectedChurchName = action.payload.name;
      state.selectedChurchId = action.payload.id;
      state.selectedChurchAddress = action.payload.address;
    },
    removeSelectedChurch: (state, action) => {
      state.selectedChurch = null;
      state.selectedChurchName = null;
      state.selectedChurchId = null;
      state.selectedChurchAddress = null;
    },
    incrementSelectedChurchCount: (state, action) => {
      state.selectedChurchCount++;
    },
    decrementSelectedChurchCount: (state, action) => {
      state.selectedChurchCount--;
    },
    removeItemFromFollowedChurchList: (state, action) => {
      const {id} = action.payload;
      state.followedChurchList = state.followedChurchList.filter(
        church => church._id !== id,
      );
    },
    setIsLeader: (state, action) => {
      state.isLeader = true;
    },
    unsetIsLeader: (state, action) => {
      state.isLeader = false;
    },
    setShowAddChurch: (state, action) => {
      state.showAddChurch = !state.showAddChurch;
    },
    setFollowedChurches: (state, action) => {
      state.followedChurchList = action.payload;
    },
    setInterestedContent: (state, action) => {
      state.interestedContent = action.payload;
    },
    setNewPostCreated: state => {
      state.newPostCreated = !state.newPostCreated;
    },
    setCurrentTrackInfo: (state, action) => {
      state.currentTrackInfo = action.payload;
    },
    setPlayerStart: state => {
      state.isPlaying = true;
    },
    setPlayerPause: state => {
      state.isPlaying = false;
    },
    setShowStickyPlayer: state => {
      state.showStickyPlayer = true;
    },
    setHideStickyPlayer: state => {
      state.showStickyPlayer = false;
    },
    resetAndCloseStickyPlayer: state => {
      state.isPlaying = false;
      state.showStickyPlayer = false;
    },

    setShowMinistryIcon: (state, action) => {
      state.showMinistryIcon = true;
    },
    setHideMinistryIcon: (state, action) => {
      state.showMinistryIcon = false;
    },
    setPostLiked: state => {
      state.postLiked = true;
    },
    setPostUnLiked: state => {
      state.postLiked = false;
    },
    showAddRequestForm: state => {
      state.addRequestForm = true;
    },
    hideAddRequestForm: state => {
      state.addRequestForm = false;
    },
    showLiveModalForm: state => {
      state.liveModalForm = true;
    },
    hideLiveModalForm: state => {
      state.liveModalForm = false;
    },
    setAppShareLinks: (state, action) => {
      state.appShareLinks.android = action.payload?.android;
      state.appShareLinks.ios = action.payload?.ios;
    },
    setCurrentOnlineUsers: (state, action) => {
      state.currentOnlineUsers = action.payload;
    },
    setBellNotificationCount: (state, action) => {
      state.bellNotificationCount = action.payload;
    },
    resetBellNotificationCount: (state, action) => {
      state.bellNotificationCount = 0;
    },
    setMessageNotificationCount: (state, action) => {
      state.messageNotificationCount = action.payload;
    },
    showCurrentChurchModal: state => {
      state.currentChurchModal = true;
    },
    hideCurrentChurchModal: state => {
      state.currentChurchModal = false;
    },
  },
});

export const {
  setIsInstalled,
  signup,
  verifyOtp,
  userIntro,
  login,
  logout,
  setUserInfo,
  updateUserNameFromProfile,
  setLocation,
  setSelectedChurch,
  removeSelectedChurch,
  incrementSelectedChurchCount,
  decrementSelectedChurchCount,
  removeItemFromFollowedChurchList,
  setIsLeader,
  unsetIsLeader,
  setShowAddChurch,
  setFollowedChurches,
  setInterestedContent,
  setNewPostCreated,
  setCurrentTrackInfo,
  setPlayerStart,
  setPlayerPause,
  setShowStickyPlayer,
  setHideStickyPlayer,
  resetAndCloseStickyPlayer,
  setPostLiked,
  setPostUnLiked,
  showAddRequestForm,
  hideAddRequestForm,
  showLiveModalForm,
  hideLiveModalForm,
  showCurrentChurchModal,
  hideCurrentChurchModal,
  setAppShareLinks,
  setCurrentOnlineUsers,
  setBellNotificationCount,
  resetBellNotificationCount,
  setMessageNotificationCount,
  setShowMinistryIcon,
  setHideMinistryIcon,
} = authSlice.actions;

export default authSlice.reducer;
