// Truncate text
export const truncateText = (txt, maxLength) => {
  if (txt?.length > maxLength) {
    return txt.substring(0, maxLength) + '...';
  }
  return txt;
};

export const formatFullAddress = (address, state, city, country) => {
  const addressParts = [];

  if (address) addressParts.push(address);
  if (city) addressParts.push(city);
  if (state) addressParts.push(state);
  if (country) addressParts.push(country);

  return addressParts.join(', ');
};

// Get Library Item Type
// example structure
// "attachment": {
//   "mimetype": "audio/mp3",
//   "path": "http://hah...com/uploads/libraries/1721973318751-file_example_MP3_1MG.mp3",
//   "name": "file_example_MP3_1MG.mp3"
// },

export const getLibraryType = item => {
  const {attachment} = item;
  
  if (attachment?.mimetype === 'audio/mp3') {
    return 'Audio';
  }
  if (attachment?.mimetype === 'video/mp4') {
    return 'Video';
  }
  if (attachment?.mimetype === 'application/pdf') {
    return 'Ebook';
  }
};
