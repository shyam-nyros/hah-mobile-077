import GroupSuggestions from './GroupSuggestions';
import PersonalInbox from './PersonalInbox';
import GroupInbox from './GroupInbox';

const Conversations = () => {
  return (
    <>
      {/* Personal */}
      <PersonalInbox />
      {/* Groups */}
      <GroupInbox />
      {/* Suggested Groups */}
      <GroupSuggestions />
    </>
  );
};

export default Conversations;
