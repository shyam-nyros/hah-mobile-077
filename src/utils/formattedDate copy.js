import moment from 'moment';
import {DateTime} from 'luxon';

/**
 * Formats an ISO date string into a readable format.
 * @param {string} startDateISO - The start date in ISO format.
 * @param {string} endDateISO - The end date in ISO format.
 * @returns {string} - The formatted date string.
 */

// new format setup
// export const convertEventTime = (startDate, startTime, eventTZ) => {
//   const finalEventTZ = eventTZ || "America/New_York";
//   const eventUTC = DateTime.fromISO(startDate, { zone: eventTZ }).plus({ seconds: startTime });
//   // const eventLocal = eventUTC.setZone(finalEventTZ);
//   const userLocal = eventUTC.setZone(DateTime.local().zoneName);
//   return userLocal.toFormat("EEE, MMM d, yyyy 'at' h:mm a ZZZZ")
// };
// export const convertEventTime = (startDate, startTime, eventTZ) => {
//   const finalEventTZ = eventTZ || "America/New_York";
//   const eventUTC = DateTime.fromISO(startDate, { zone: 'utc' }).plus({ seconds: startTime });
//   const eventLocal = eventUTC.setZone(finalEventTZ);
//   const userLocal = eventLocal.setZone(DateTime.local().zoneName);
//   return eventLocal.toFormat("EEE, MMM d, yyyy 'at' h:mm a ZZZZ")
// };
// export const convertEventTime = (startDate, startTime, eventTZ) => {
//   const finalEventTZ = eventTZ || "America/New_York";

//   // Step 1: Interpret the startDate in the selected time zone, not UTC
//   const eventInAdminTZ = DateTime.fromISO(startDate, { zone: finalEventTZ });

//   // Step 2: Add the start time (in seconds)
//   const eventWithTime = eventInAdminTZ.plus({ seconds: startTime });

//   // Step 3: Return the correctly formatted date in the selected time zone
//   return eventWithTime.toFormat("EEE, MMM d, yyyy 'at' h:mm a ZZZZ");
// };


// working
// export const convertEventTime = (startDate, startTime, eventTZ) => {
//   const finalEventTZ = eventTZ || "America/New_York";

//   // Step 1: Extract just the date part (YYYY-MM-DD) from startDate
//   const eventDateOnly = DateTime.fromISO(startDate, { zone: "utc" }).toFormat("yyyy-MM-dd");

//   // Step 2: Reconstruct it in the selected time zone at **midnight**
//   const eventInAdminTZ = DateTime.fromISO(eventDateOnly, { zone: finalEventTZ }).startOf("day");

//   // Step 3: Add the start time (in seconds)
//   const eventWithTime = eventInAdminTZ.plus({ seconds: startTime });

//   // Step 4: Format the final output
//   return eventWithTime.toFormat("EEE, MMM d, yyyy 'at' h:mm a ZZZZ");
// };

export const convertEventTime = (startDate, startTime, eventTZ) => {
  const finalEventTZ = eventTZ || "America/New_York";

  // Step 1: Extract just the date part (YYYY-MM-DD) from startDate
  const eventDateOnly = DateTime.fromISO(startDate, { zone: "utc" }).toFormat("yyyy-MM-dd");

  // Step 2: Reconstruct it in the selected time zone at **midnight**
  const eventInAdminTZ = DateTime.fromISO(eventDateOnly, { zone: finalEventTZ }).startOf("day");

  // Step 3: Add the start time (in seconds)
  const eventWithTime = eventInAdminTZ.plus({ seconds: startTime });

  // Step 4: Convert to the **user's local time zone**
  const eventInUserTZ = eventWithTime.setZone(DateTime.local().zoneName);

  // Step 5: Format the final output
  return eventInUserTZ.toFormat("EEE, MMM d, yyyy 'at' h:mm a ZZZZ");
};

// to get only the time in am or pm
// export const getEventTimeAMPM = (startDate, startTime, eventTZ) => {
//   const finalEventTZ = eventTZ || "America/New_York";

//   // Step 1: Extract just the date part (YYYY-MM-DD) from startDate
//   const eventDateOnly = DateTime.fromISO(startDate, { zone: "utc" }).toFormat("yyyy-MM-dd");

//   // Step 2: Reconstruct it in the selected time zone at **midnight**
//   const eventInAdminTZ = DateTime.fromISO(eventDateOnly, { zone: finalEventTZ }).startOf("day");

//   // Step 3: Add the start time (in seconds)
//   const eventWithTime = eventInAdminTZ.plus({ seconds: startTime });

//   // Step 4: Convert to the **user's local time zone**
//   const eventInUserTZ = eventWithTime.setZone(DateTime.local().zoneName);

//   // Step 5: Return only the time in "h:mm a" format (e.g., "8:00 AM" or "3:30 PM")
//   return eventInUserTZ.toFormat("h:mm a");
// };

export const getEventTimeAMPM = (startDate, startTime, eventTZ) => {
  const finalEventTZ = eventTZ || "America/New_York";

  // Step 1: Extract just the date part (YYYY-MM-DD) from startDate
  const eventDateOnly = DateTime.fromISO(startDate, { zone: "utc" }).toFormat("yyyy-MM-dd");

  // Step 2: Reconstruct it in the selected time zone at **midnight**
  const eventInAdminTZ = DateTime.fromISO(eventDateOnly, { zone: finalEventTZ }).startOf("day");

  // Step 3: Add the start time (in seconds)
  const eventWithTime = eventInAdminTZ.plus({ seconds: startTime });

  // Step 4: Convert to the **user's local time zone**
  const eventInUserTZ = eventWithTime.setZone(DateTime.local().zoneName);

  // Step 5: Return only the time in AM/PM format
  return eventInUserTZ.toFormat("h:mm a ZZZZ");
};

export const getEventDateFormatted = (startDate, startTime, eventTZ) => {
  const finalEventTZ = eventTZ || "America/New_York";

  // Step 1: Extract just the date part (YYYY-MM-DD) from startDate
  const eventDateOnly = DateTime.fromISO(startDate, { zone: "utc" }).toFormat("yyyy-MM-dd");

  // Step 2: Reconstruct it in the selected time zone at **midnight**
  const eventInAdminTZ = DateTime.fromISO(eventDateOnly, { zone: finalEventTZ }).startOf("day");

  // Step 3: Add the start time (in seconds)
  const eventWithTime = eventInAdminTZ.plus({ seconds: startTime });

  // Step 4: Convert to the **user's local time zone**
  const eventInUserTZ = eventWithTime.setZone(DateTime.local().zoneName);

  // Step 5: Return the formatted date (e.g., "Tue, 10, 2025")
  return eventInUserTZ.toFormat("EEE, d, yyyy");
};


// export const convertEventTime = (startDate, startTime, eventTZ) => {
//   const finalEventTZ = eventTZ || "America/New_York";
//   const eventUTC = DateTime.fromISO(startDate, { zone: 'utc' }).plus({ seconds: startTime });
//   const eventLocal = eventUTC.setZone(finalEventTZ);
//   const userLocal = eventLocal.setZone(DateTime.local().zoneName);
//   return userLocal.toFormat("EEE, MMM d, yyyy 'at' h:mm a ZZZZ")
// };

// export const convertEventTime = (startDate, startTime, eventTZ) => {
//   // Convert event start date from UTC
//   const eventUTC = DateTime.fromISO(startDate, {zone: 'utc'}).plus({
//     seconds: startTime,
//   });

//   // Convert to user's time zone
//   const eventTime = eventUTC.setZone(eventTZ);

//   // Format it in an American-friendly way
//   return eventTime.toFormat("EEEE, MMMM d, yyyy 'at' h:mm a ZZZZ"); // Example: "Saturday, February 15, 2025 at 8:00 AM EST"
// };

// convert UTC start date to local start date
export const formattedLocalDate = startDate => {

  const utcTime = '2024-02-10T15:30:00Z'; // 3:30 PM UTC
  const newYorkTime = DateTime.fromISO(startDate, {zone: 'utc'}) // Ensure it's treated as UTC
    .setZone('America/New_York') // Convert to New York time
    .toFormat('yyyy-MM-dd hh:mm a z'); // Format output


  const localTime = DateTime.fromISO(startDate, {
    zone: 'America/New_York',
  }).toLocal();

  return localTime.toFormat('ccc, LLL dd'); // Example format: January 21, 2025 - 6:30 PM
};

// given startTime in seconds
export const formattedLocalTime = startTime => {
  if (!startTime) {
    return '';
  }
  const hours = Math.floor(startTime / 3600);
  const minutes = Math.floor((startTime % 3600) / 60);
  // Convert to 12-hour format with AM/PM
  const time = moment()
    .set('hours', hours)
    .set('minutes', minutes)
    .format('hh:mm A'); // 'hh' is for 12-hour, 'A' for AM/PM
  return time;
};

// convert give UTC seconds to local readable time
// example 16200 UTC seconds as 10:00 AM in local
// export const formattedLocalTime = (startTime) => {
//   // Convert UTC seconds to a Luxon DateTime object
//   const localTime = DateTime.fromSeconds(startTime, { zone: 'utc' }).toLocal();

//   // Format the local time in the desired format (e.g., 10:00 AM)
//   return localTime.toFormat('hh:mm a');
// };

// working
// export const formattedLocalTime = startTime => {
//   // Create a DateTime object from the UTC seconds
//   const dt = DateTime.fromSeconds(startTime, {zone: 'utc'});

//   // Convert the DateTime object to local time
//   const localDt = dt.toLocal();

//   // Format the local DateTime object as desired (e.g., "hh:mm a")
//   const timeString = localDt.toFormat('hh:mm a');

//   return timeString;
// };

export const formattedDateTime = (startDateISO, endDateISO) => {
  const startDate = new Date(startDateISO);
  const endDate = new Date(endDateISO);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsOfYear = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const formatTime = date => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr}${ampm}`;
  };

  const dayOfWeek = daysOfWeek[startDate.getDay()];
  const day = startDate.getDate();
  const month = monthsOfYear[startDate.getMonth()];
  const startTime = formatTime(startDate);
  const endTime = formatTime(endDate);

  return `${dayOfWeek}, ${day} ${month}, ${startTime} - ${endTime}`;
};

/**
 * Formats an ISO date string into a readable date format (without time).
 * @param {string} startDateISO - The start date in ISO format.
 * @param {string} endDateISO - The end date in ISO format.
 * @returns {string} - The formatted date string.
 */
export const formattedDateOnly = (startDateISO, endDateISO) => {
  const startDate = new Date(startDateISO);
  const endDate = new Date(endDateISO);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsOfYear = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dayOfWeek = daysOfWeek[startDate.getDay()];
  const day = startDate.getDate();
  const month = monthsOfYear[startDate.getMonth()];
  const endDay = endDate.getDate();
  const endMonth = monthsOfYear[endDate.getMonth()];

  if (day === endDay && month === endMonth) {
    return `${dayOfWeek}, ${day} ${month}`;
  }

  return `${dayOfWeek}, ${day} ${month} - ${endDay} ${endMonth}`;
};

export const formatDate = inputDate => {
  const date = new Date(inputDate);

  // Array of abbreviated month names
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Array of abbreviated weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get day of the week, day of the month, month, and year
  const dayOfWeek = weekdays[date.getUTCDay()];
  const dayOfMonth = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  // Format the date
  // return `${dayOfWeek}, ${month} ${dayOfMonth} - ${year}`;
  return `${dayOfWeek}, ${month} ${dayOfMonth}`;
};
// Example usage
// const isoDate = '2024-09-18T13:16:12.536Z';
// const formattedDate = formatDate(isoDate);


// USED IN EVENTS
// Format date for events
// start data, start time, end time may or may not be present
// format based on which is present
const requiredFormat = date => moment(date).format('MMMM Do, YYYY');

// export const getFormattedDate = (start_date, start_time, end_time) => {
//   if (start_date && start_time && end_time) {
//     return `${requiredFormat(start_date)} ${start_time} - ${end_time}`;
//   } else if (start_date && start_time) {
//     return `${requiredFormat(start_date)} ${start_time}`;
//   } else if (start_date && end_time) {
//     return `${requiredFormat(start_date)} ${end_time}`;
//   } else if (start_date) {
//     return `${requiredFormat(start_date)}`;
//   } else if (start_time) {
//     return `${start_time}`;
//   } else if (end_time) {
//     return `${end_time}`;
//   } else {
//     return 'N/A';
//   }
// };

// updated format
export const getFormattedDate = (start_date, start_time, end_time) => {
  const startOfDay = moment(start_date).utc().startOf('day');
  const readableDate = moment(startOfDay).format('MMMM Do YYYY');
  return `${readableDate} ${start_time}  ${end_time}`;
};
