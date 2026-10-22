import {setInterestedContent} from '../features/auth/authSlice';

/**
 * Automatically assign random interests to a user who hasn't selected any.
 * This function is called when the user lands on the Today screen.
 *
 * @param {Object} params - The parameters object
 * @param {Array} params.contentList - List of all available interests
 * @param {Array} params.currentInterests - User's currently selected interests
 * @param {Function} params.updateUserAPI - API mutation to update user
 * @param {Function} params.dispatch - Redux dispatch function
 * @returns {Promise<boolean>} - Returns true if interests were assigned, false otherwise
 */
export const autoAssignRandomInterests = async ({
  contentList,
  currentInterests,
  updateUserAPI,
  dispatch,
}) => {
  try {
    // Check if user already has interests
    if (currentInterests && currentInterests.length > 0) {
      console.log('User already has interests selected');
      return false;
    }

    // Check if content list is available
    if (!contentList || contentList.length === 0) {
      console.log('No content list available');
      return false;
    }

    // Randomly select 3 interests
    const shuffled = [...contentList].sort(() => 0.5 - Math.random());
    const randomInterests = shuffled.slice(0, 3);
    const randomInterestIds = randomInterests.map(interest => interest._id);

    console.log(
      'Auto-assigning random interests:',
      randomInterests.map(i => i.name),
    );

    // Update user via API
    const response = await updateUserAPI({
      interests: JSON.stringify(randomInterestIds),
    }).unwrap();

    console.log('Successfully updated user with random interests');

    // Update Redux store
    dispatch(setInterestedContent(randomInterestIds));

    return true;
  } catch (error) {
    console.error('Error auto-assigning interests:', error);
    return false;
  }
};

/**
 * Get a random selection of interests
 * @param {Array} contentList - List of all available interests
 * @param {number} count - Number of interests to select (default: 3)
 * @returns {Array} - Array of randomly selected interest IDs
 */
export const getRandomInterests = (contentList, count = 3) => {
  if (!contentList || contentList.length === 0) {
    return [];
  }

  const shuffled = [...contentList].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, contentList.length));
  return selected.map(interest => interest._id);
};
