import React, {useState, useEffect} from 'react';
import {Text , StyleSheet} from 'react-native';
import tw from 'twrnc';
import moment from 'moment';

const TimeAgo = ({createdAt, ...otherProps}) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = moment();
      const timeDiffInMinutes = now.diff(moment(createdAt), 'minutes');
      const timeDiffInHours = now.diff(moment(createdAt), 'hours');
      const timeDiffInDays = now.diff(moment(createdAt), 'days');
      const timeDiffInMonths = now.diff(moment(createdAt), 'months');
      const timeDiffInYears = now.diff(moment(createdAt), 'years');

      let timeAgoText;

      if (timeDiffInMinutes === 0) {
        // Less than 1 minute, show "just now"
        timeAgoText = 'just now';
      } else if (timeDiffInMinutes < 60) {
        // Less than 1 hour, show in minutes
        timeAgoText = `${timeDiffInMinutes} min ago`;
      } else if (timeDiffInHours < 24) {
        // Less than 1 day, show in hours
        timeAgoText = `${timeDiffInHours} hr${
          timeDiffInHours > 1 ? 's' : ''
        } ago`;
      } else if (timeDiffInDays < 30) {
        // Less than 1 month, show in days
        timeAgoText = `${timeDiffInDays} day${
          timeDiffInDays > 1 ? 's' : ''
        } ago`;
      } else if (timeDiffInMonths < 12) {
        // Less than 1 year, show in months
        timeAgoText = `${timeDiffInMonths} month${
          timeDiffInMonths > 1 ? 's' : ''
        } ago`;
      } else {
        // More than 1 year, show in years
        timeAgoText = `${timeDiffInYears} year${
          timeDiffInYears > 1 ? 's' : ''
        } ago`;
      }

      setTimeAgo(timeAgoText);
    };

    calculateTimeAgo();

    const interval = setInterval(() => {
      calculateTimeAgo();
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    // <Text style={tw`text-[#040641] opacity-70 text-[14px] ml-1`}>
    //   {timeAgo}
    // </Text>
    <Text
      style={[
        // Default styles (fallback when no style is passed)
        tw`text-[#040641] opacity-70 text-[14px] ml-1`,
        // External style overrides (this will override the default styles)
        otherProps.style,
      ]}>
      {timeAgo}
    </Text>
  );
};

export default TimeAgo;
