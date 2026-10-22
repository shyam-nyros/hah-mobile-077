import {Text, View} from 'react-native';
import AcceptConnection from './AcceptConnection';
import WithdrawConnection from './WithdrawConnection';
import RemoveConnection from './RemoveConnection';
import IgnoreConnection from './IgnoreConnection';
import SendRequestConnection from './SendRequestConnection';
import {
  useGetConnectionStatusQuery,
  useListenForRequestConnectionUpdatesQuery,
} from '../../../../features/messages/messageApiSlice';
import LoadingSpinner from '../../../LoadingSpinner';
import {useSelector} from 'react-redux';

const ConnectionStatusInfo = ({oppositeUserId}) => {
  const {currentUserId} = useSelector(state => state.auth);

  const {data, isLoading, isFetching, isError, error} =
    useGetConnectionStatusQuery(oppositeUserId);


  // Listen for connection updates using current user ID
  useListenForRequestConnectionUpdatesQuery(
    {currentUserId, oppositeUserId},
    {skip: !oppositeUserId}, // Skip if no current user ID
  );

  // Show loading spinner while loading
  if (isLoading || isFetching) {
    return <LoadingSpinner size={'small'} />;
  }
  

  

  // Handle error state
  if (isError) {
    return <Text style={{color: 'red'}}>Something went wrong</Text>;
  }

  return (
    <View>
      {data?.buttonState === 'connect' && (
        <SendRequestConnection oppositeUserId={oppositeUserId} />
      )}

      {data?.buttonState === 'accept_ignore' && (
        <AcceptConnection oppositeUserId={oppositeUserId} />
      )}

      {data?.buttonState === 'accept_ignore' && (
        <IgnoreConnection oppositeUserId={oppositeUserId} />
      )}

      {data?.buttonState === 'remove' && (
        <RemoveConnection oppositeUserId={oppositeUserId} />
      )}

      {data?.buttonState === 'withdraw' && (
        <WithdrawConnection oppositeUserId={oppositeUserId} />
      )}
    </View>
  );
};

export default ConnectionStatusInfo;
