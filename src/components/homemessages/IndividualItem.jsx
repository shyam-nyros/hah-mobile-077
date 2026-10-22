import React from 'react';
import {Text, View} from 'react-native';
import tw from 'twrnc';
import {useSelector} from 'react-redux';
import PersonalConversationItem from '../messages/individualchat/PersonalConversationItem';

const individualItem = () => {
  const {personalConversationList} = useSelector(state => state.message);

  if (!personalConversationList.length) {
    return null;
  }

  return (
    <View>
      {personalConversationList.map((item, index) => (
        <PersonalConversationItem
          chatInfo={item}
          key={item._id}
          index={index}
        />
      ))}
    </View>
  );
};

export default React.memo(individualItem);
