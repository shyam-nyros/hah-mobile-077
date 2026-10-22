import React from 'react';
import {Text, View} from 'react-native';
import tw from 'twrnc';
import {useSelector} from 'react-redux';
import GroupConversationItem from '../messages/groupchat/GroupConversationItem';

const GroupItem = () => {
  const {groupConversationList} = useSelector(state => state.message);

  if (!groupConversationList.length) {
    return null;
  }

  return (
    <View>
      {groupConversationList.map((item, index) => (
        <GroupConversationItem chatInfo={item} key={item._id} index={index} />
      ))}
    </View>
  );
};

export default GroupItem;
