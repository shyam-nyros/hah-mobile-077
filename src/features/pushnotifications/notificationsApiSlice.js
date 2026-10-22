import { rootApiSlice } from "../../store/rootApiSlice";
const NOTIFICATIONS_ENDPOINT = '/api/user/notifications';

export const notificationsAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    registerFCMToken: builder.mutation({
      query: ({token, platform}) => ({
        url: `${NOTIFICATIONS_ENDPOINT}/register`,
        method: 'POST',
        body: { platform, token},
      }),
    }),
    // old code - pass only the token
    // registerFCMToken: builder.mutation({
    //   query: token => ({
    //     url: `${NOTIFICATIONS_ENDPOINT}/register`,
    //     method: 'POST',
    //     body: token,
    //   }),
    // }),
  }),
});

export const {useRegisterFCMTokenMutation} = notificationsAPISlice;
