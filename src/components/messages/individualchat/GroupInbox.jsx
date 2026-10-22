import React from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import GroupConversationItem from '../groupchat/GroupConversationItem';
import tw from 'twrnc';

const GroupInbox = () => {
  const {groupConversationList} = useSelector(state => state.message);

  return (
    <>
      <View style={tw`flex-1`}>
        {groupConversationList.length > 0 && (
          <>
            <View style={tw`mx-4 mt-3 -z-100`}>
              <Text style={tw`text-[#040641] text-[18px] font-medium mb-3`}>
                Groups
              </Text>
            </View>
            <View>
              {groupConversationList.map((item, index) => (
                <GroupConversationItem
                  chatInfo={item}
                  key={item._id}
                  index={index}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default GroupInbox;
