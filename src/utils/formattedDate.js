import moment from 'moment';
import {DateTime} from 'luxon';

/**
 * Formats an ISO date string into a readable format.
 * @param {string} startDateISO - The start date in ISO format.
 * @param {string} endDateISO - The end date in ISO format.
 * @returns {string} - The formatted date string.
 */

export const convertEventTime = (startDate, startTime, eventTZ) => {
  const finalEventTZ = eventTZ || 'America/New_York';

  // Step 1: Extract just the date part (YYYY-MM-DD) from startDate
  const eventDateOnly = DateTime.fromISO(startDate, {zone: 'utc'}).toFormat(
    'yyyy-MM-dd',
  );

  // Step 2: Reconstruct it in the selected time zone at **midnight**
  const eventInAdminTZ = DateTime.fromISO(eventDateOnly, {
    zone: finalEventTZ,
  }).startOf('day');

  // Step 3: Add the start time (in seconds)
  const eventWithTime = eventInAdminTZ.plus({seconds: startTime});

  // Step 4: Convert to the **user's local time zone**
  const eventInUserTZ = eventWithTime.setZone(DateTime.local().zoneName);

  // Step 5: Format the final output
  return eventInUserTZ.toFormat("EEE, MMM d, yyyy 'at' h:mm a ZZZZ");
};

export const getEventTimeAMPM = (startDate, startTime, eventTZ) => {
  const finalEventTZ = eventTZ || 'America/New_York';

  // Step 1: Extract just the date part (YYYY-MM-DD) from startDate
  const eventDateOnly = DateTime.fromISO(startDate, {zone: 'utc'}).toFormat(
    'yyyy-MM-dd',
  );

  // Step 2: Reconstruct it in the selected time zone at **midnight**
  const eventInAdminTZ = DateTime.fromISO(eventDateOnly, {
    zone: finalEventTZ,
  }).startOf('day');

  // Step 3: Add the start time (in seconds)
  const eventWithTime = eventInAdminTZ.plus({seconds: startTime});

  // Step 4: Convert to the **user's local time zone**
  const eventInUserTZ = eventWithTime.setZone(DateTime.local().zoneName);

  // Step 5: Return only the time in AM/PM format
  return eventInUserTZ.toFormat('h:mm a ZZZZ');
};

export const getEventDateFormatted = (startDate, startTime, eventTZ) => {
  const finalEventTZ = eventTZ || 'America/New_York';

  // Step 1: Extract just the date part (YYYY-MM-DD) from startDate
  const eventDateOnly = DateTime.fromISO(startDate, {zone: 'utc'}).toFormat(
    'yyyy-MM-dd',
  );

  // Step 2: Reconstruct it in the selected time zone at **midnight**
  const eventInAdminTZ = DateTime.fromISO(eventDateOnly, {
    zone: finalEventTZ,
  }).startOf('day');

  // Step 3: Add the start time (in seconds)
  const eventWithTime = eventInAdminTZ.plus({seconds: startTime});

  // Step 4: Convert to the **user's local time zone**
  const eventInUserTZ = eventWithTime.setZone(DateTime.local().zoneName);

  // Step 5: Return the formatted date (e.g., "Tue, 10, 2025")
  return eventInUserTZ.toFormat('EEE, d, yyyy');
};

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

// updated format
export const getFormattedDate = (start_date, start_time, end_time) => {
  const startOfDay = moment(start_date).utc().startOf('day');
  const readableDate = moment(startOfDay).format('MMMM Do YYYY');
  return `${readableDate} ${start_time}  ${end_time}`;
};
