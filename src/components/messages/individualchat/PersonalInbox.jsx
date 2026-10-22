import React from 'react';
import {Text, View} from 'react-native';
import tw from 'twrnc';
import {useSelector} from 'react-redux';
import PersonalConversationItem from './PersonalConversationItem';

const PersonalInbox = () => {
  const {personalConversationList} = useSelector(state => state.message);

  return (
    <>
      <View style={tw`flex-1`}>
        {personalConversationList.length > 0 && (
          <>
            <View style={tw`mx-4 mt-3 -z-100`}>
              <Text style={tw`text-[#040641] text-[18px] font-medium mb-3`}>
                personal
              </Text>
            </View>

            <View>
              {personalConversationList.map((item, index) => (
                <PersonalConversationItem
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

export default PersonalInbox;
