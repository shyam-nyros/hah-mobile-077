import {rootApiSlice} from '../../store/rootApiSlice';
import {Platform} from 'react-native';
import {GOOGLE_API_KEY} from '@env';
const AUTH_ENDPOINT = '/api/user';
// App-only signup endpoint (the website has its own). platform lets the
// backend record iOS vs Android as the signup source.
const SIGNUP_ENDPOINT = `${AUTH_ENDPOINT}/app/signup`;
const apiKey = GOOGLE_API_KEY;

export const authAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    checkEmailAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/check-email`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response, meta, arg) => {
        console.log(
          '[authApiSlice] checkEmailAPI response:',
          JSON.stringify(response),
        );
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error(
          '[authApiSlice] checkEmailAPI error:',
          JSON.stringify(response),
        );
        return response;
      },
    }),
    firebaseEmailLinkAuthAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/firebase/email-link`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response, meta, arg) => {
        console.log('[authApiSlice] firebaseEmailLinkAuthAPI SUCCESS');
        console.log(
          '[authApiSlice] firebaseEmailLinkAuthAPI response:',
          JSON.stringify(response),
        );
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('[authApiSlice] firebaseEmailLinkAuthAPI ERROR');
        console.error(
          '[authApiSlice] firebaseEmailLinkAuthAPI error response:',
          JSON.stringify(response),
        );
        return response;
      },
    }),
    loginAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/login`,
        method: 'POST',
        body: data,
      }),
      keepUnusedDataFor: 1,
      invalidatesTags: ['User'],
    }),
    signupAPI: builder.mutation({
      query: data => ({
        url: SIGNUP_ENDPOINT,
        method: 'POST',
        body: {
          platform: Platform.OS,
          ...data,
        },
      }),
      keepUnusedDataFor: 1,
    }),
    googleSignupAPI: builder.mutation({
      query: data => ({
        url: SIGNUP_ENDPOINT,
        method: 'POST',
        body: {
          platform: Platform.OS,
          ...data,
          provider: 'google',
        },
      }),
      keepUnusedDataFor: 1,
    }),
    appleSignupAPI: builder.mutation({
      query: data => ({
        url: SIGNUP_ENDPOINT,
        method: 'POST',
        body: {
          platform: Platform.OS,
          ...data,
          provider: 'apple',
        },
      }),
      keepUnusedDataFor: 1,
    }),
    // googleLoginAPI: builder.mutation({
    //   query: data => ({
    //     url: `${AUTH_ENDPOINT}/login`,
    //     method: 'POST',
    //     body: {
    //       ...data,
    //       provider: 'google',
    //     },
    //   }),
    //   keepUnusedDataFor: 1,
    //   transformResponse: response => ({
    //     ...response,
    //     // otpVerified: response?.otpVerified ?? response?.otp_verified ?? false,
    //   }),
    // }),
    googleLoginAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/login`,
        method: 'POST',
        body: {
          ...data,
          provider: 'google',
        },
      }),
      keepUnusedDataFor: 1,
      transformResponse: response => {
        // Google users are always verified, so if provider is google, set otpVerified to true
        const isGoogleUser = response?.provider === 'google';
        return {
          ...response,
          otpVerified: isGoogleUser
            ? true
            : response?.otpVerified ?? response?.otp_verified ?? false,
        };
      },
    }),
    appleLoginAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/login`,
        method: 'POST',
        body: {
          ...data,
          provider: 'apple',
        },
      }),
      keepUnusedDataFor: 1,
      transformResponse: response => {
        // Apple users are always verified
        const isAppleUser = response?.provider === 'apple';
        return {
          ...response,
          otpVerified: isAppleUser
            ? true
            : response?.otpVerified ?? response?.otp_verified ?? false,
        };
      },
    }),
    validateUserZipCode: builder.mutation({
      query: zipCode => ({
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`,
        method: 'POST',
        body: zipCode,
      }),
      keepUnusedDataFor: 1,
      invalidatesTags: ['User'],
    }),
    verifyOtpAPI: builder.mutation({
      query: data => ({
        // url: `${AUTH_ENDPOINT}/verify`, old endpoint
        url: `${AUTH_ENDPOINT}/verify/otp`,
        method: 'PUT',
        body: data,
      }),
      keepUnusedDataFor: 1,
    }),
    verifyUserAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/verify`,
        method: 'PUT',
        body: data,
      }),
      keepUnusedDataFor: 1,
    }),
    resendOtpAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/otp`,
        method: 'PUT',
        body: data,
      }),
      keepUnusedDataFor: 1,
    }),
    forgotPasswordAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/reset-password`,
        method: 'PUT',
        body: data,
      }),
      keepUnusedDataFor: 1,
    }),
    resetPasswordAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/verify-reset-password-otp`,
        method: 'PUT',
        body: data,
      }),
      keepUnusedDataFor: 1,
    }),
    changePasswordFromProfileAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/password`,
        method: 'PUT',
        body: data,
      }),
      keepUnusedDataFor: 1,
    }),
    updateUserAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User', 'Zipcode'],
    }),
    // same as updateUserAPI - but used for updating current church for the user
    updateCurrentChurchOfTheUser: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UpdateCurrentChurch'],
    }),
    updateProfileImage: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/profile_image`,
        method: 'PUT',
        body: data,
      }),
    }),
    userFollowedChurchesAPI: builder.query({
      query: data => ({
        url: `${AUTH_ENDPOINT}/churches`,
      }),
      providesTags: ['Church'],
      transformResponse: (response, meta, arg) => {
        return response.following_churches;
      },
    }),
    industriesAPI: builder.query({
      query: data => ({
        url: `api/industries`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.industries;
      },
    }),
    professionAPI: builder.query({
      query: data => ({
        url: `api/professions`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.professions;
      },
    }),
    spokenLanguagesAPI: builder.query({
      query: data => ({
        url: `api/languages`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.languages;
      },
    }),
    userDetails: builder.query({
      query: data => ({
        url: `${AUTH_ENDPOINT}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.user;
      },
      keepUnusedDataFor: 1,
      providesTags: ['User'],
    }),
    addAnotherChurchAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/churches`,
        method: 'PUT',
        body: data,
      }),
      // invalidatesTags: ['Church'],
    }),
    deleteAnotherChurchAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/churches`,
        method: 'DELETE',
        body: data,
      }),
      // invalidatesTags: ['Church'],
    }),
    requestAddChurchAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/church/request`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Church'],
    }),
    requestLeaderAccessAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/leader/request`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    userRequestAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/requests`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Activity'],
    }),
    contactHahAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/contacts`,
        method: 'POST',
        body: data,
      }),
    }),

    favoritesAPI: builder.query({
      query: data => ({
        url: `${AUTH_ENDPOINT}/libraries/bookmarks`,
      }),
      keepUnusedDataFor: 1,
      providesTags: ['Bookmarks'],
    }),
    getActivitiesAPI: builder.query({
      query: ({data, page, search}) => ({
        url: `${AUTH_ENDPOINT}/activities?timeframe=${data}&search=${
          search ? search : ''
        }&page=${page}`,
      }),
    }),
    createPurchase: builder.mutation({
      query: amount => ({
        url: `/api/payment/purchase`,
        method: 'POST',
        body: amount,
      }),
      transformResponse: async (response, meta, arg) => {
        return response?.data;
      },
    }),

    orderHistory: builder.query({
      query: ({q}) => ({
        url: `api/purchase?search=${q}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    downloadOrderInvoiceLink: builder.query({
      query: orderId => ({
        url: `api/purchase/${orderId}/invoice`,
        responseHandler: async response => {
          const blob = await response.blob();
          return blob;
        },
      }),
      keepUnusedDataFor: 0,
    }),

    // get otp to delete account
    otpToDeleteAccountAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/delete/otp`,
        method: 'POST',
      }),
    }),

    // delete account
    deleteAccountAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/delete`,
        method: 'DELETE',
        body: data,
      }),
    }),

    // deactivate account
    deactivateAccountAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/deactivate`,
        method: 'PUT',
      }),
    }),

    // notification list screen when clicked on bell icon
    homeNotifications: builder.query({
      query: currentPage => ({
        url: `${AUTH_ENDPOINT}/notifications?page=${currentPage}`,
      }),
      transformResponse: response => {
        // Assuming that 10 is the limit per page for notifications
        const hasMore = response.notifications.length === 5;

        return {
          hasMore,
          list: response.notifications,
          pendingFollowRequestsCount: response.pendingFollowRequestsCount || 0,
        };
      },
      serializeQueryArgs: ({endpointName}) => endpointName,
      merge: (currentCache, newItems, arg) => {
        // Merge logic to handle new data and maintain `hasMore`
        if (arg.arg === 1) {
          return newItems; // Reset cache if it's the first page
        }

        const mergedData = {
          list: [...currentCache.list, ...newItems.list],
          hasMore: newItems?.hasMore, // Update `hasMore` based on the latest response
        };

        return mergedData;
      },
      // Force refetch logic to trigger a fresh fetch under certain conditions
      // forceRefetch: ({currentArg, previousArg}) => currentArg !== previousArg,
      forceRefetch: ({currentArg, previousArg}) => {
        return !previousArg || currentArg !== previousArg;
      },
      keepUnusedDataFor: 0,
      providesTags: ['ConnectionStatus'],
    }),

    // follow request response for notifications
    followRequestResponse: builder.mutation({
      query: ({notificationId, response}) => ({
        url: `${AUTH_ENDPOINT}/request/${notificationId}`,
        method: 'Put',
        body: {response}, // "confirm" or "reject"
      }),
      invalidatesTags: ['User'],
    }),

    // initial notification count to show above bell icon in nav bar
    homeNotificationsCount: builder.query({
      query: data => ({
        url: `${AUTH_ENDPOINT}/notifications/count`,
      }),
      transformResponse: (response, meta, arg) => {
        // return response.unread_count;
        return response;
      },
    }),

    removeNotificationsCount: builder.mutation({
      query: () => ({
        url: `${AUTH_ENDPOINT}/notifications`,
        method: 'PUT',
      }),
    }),

    homeMessages: builder.query({
      query: ({page}) => ({
        url: `${AUTH_ENDPOINT}/conversations?page=${page}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.conversations;
      },
    }),
    calenderSaveAPI: builder.mutation({
      query: data => ({
        url: `${AUTH_ENDPOINT}/calender`,
        method: 'POST',
        body: data,
      }),
      keepUnusedDataFor: 1,
    }),
    appShareLinkAPI: builder.query({
      query: data => ({
        url: `/api/config`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.config;
      },
    }),
    // get blocked users list for the current user
    getBlockedUsersList: builder.query({
      query: data => ({
        url: `${AUTH_ENDPOINT}/blockedusers`,
      }),
    }),
    // unblock a user
    unblockUser: builder.mutation({
      query: unblockUserId => ({
        url: `${AUTH_ENDPOINT}/unblock/${unblockUserId}`,
        method: 'DELETE',
      }),
    }),
    // daily verse for today screen
    dailyVerseAPI: builder.query({
      query: () => ({
        url: `${AUTH_ENDPOINT}/daily-verse`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.daily_verse;
      },
      keepUnusedDataFor: 3600,
    }),

    getReferralStatsAPI: builder.query({
      query: () => ({
        url: `${AUTH_ENDPOINT}/referral`,
      }),
      providesTags: ['Referral'],
    }),

    getReferralHistoryAPI: builder.query({
      query: ({page = 1, limit = 10} = {}) => ({
        url: `${AUTH_ENDPOINT}/referral/history?page=${page}&limit=${limit}`,
      }),
      providesTags: ['Referral'],
    }),
  }),
});

export const {
  useCheckEmailAPIMutation,
  useFirebaseEmailLinkAuthAPIMutation,
  useLoginAPIMutation,
  useSignupAPIMutation,
  useValidateUserZipCodeMutation,
  useVerifyOtpAPIMutation,
  useVerifyUserAPIMutation,
  useResendOtpAPIMutation,
  useForgotPasswordAPIMutation,
  useResetPasswordAPIMutation,
  useChangePasswordFromProfileAPIMutation,
  useUpdateUserAPIMutation,
  useUpdateCurrentChurchOfTheUserMutation,
  useUserFollowedChurchesAPIQuery,
  useAddAnotherChurchAPIMutation,
  useRequestLeaderAccessAPIMutation,
  useDeleteAnotherChurchAPIMutation,
  useUserDetailsQuery,
  useIndustriesAPIQuery,
  useProfessionAPIQuery,
  useSpokenLanguagesAPIQuery,
  useUpdateProfileImageMutation,
  useRequestAddChurchAPIMutation,
  useContactHahAPIMutation,
  useGetActivitiesAPIQuery,
  useCreatePurchaseMutation,
  useOrderHistoryQuery,
  useDownloadOrderInvoiceLinkQuery,
  useHomeNotificationsQuery,
  useHomeNotificationsCountQuery,
  useRemoveNotificationsCountMutation,
  useFollowRequestResponseMutation,
  useHomeMessagesQuery,
  useUserRequestAPIMutation,
  useCalenderSaveAPIMutation,
  useFavoritesAPIQuery,
  useAppShareLinkAPIQuery,
  useDeactivateAccountAPIMutation,
  useOtpToDeleteAccountAPIMutation,
  useDeleteAccountAPIMutation,
  useGetBlockedUsersListQuery,
  useUnblockUserMutation,
  useGoogleSignupAPIMutation,
  useGoogleLoginAPIMutation,
  useAppleLoginAPIMutation,
  useAppleSignupAPIMutation,
  useDailyVerseAPIQuery,
  useGetReferralStatsAPIQuery,
  useGetReferralHistoryAPIQuery,
} = authAPISlice;
