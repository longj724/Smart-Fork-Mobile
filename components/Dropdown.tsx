// External Dependencies
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Entypo } from '@expo/vector-icons';

const DropdownMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View className="relative inline-block text-left">
      <TouchableOpacity
        onPress={() => setMenuVisible(!menuVisible)}
        className="inline-flex w-full justify-center gap-x-1.5 items-center rounded-md bg-white px-3 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
        aria-expanded={menuVisible}
      >
        {/* <Text>Options</Text> */}
        <Entypo
          // className="h-5 w-5 text-gray-400"
          name="chevron-down"
          size={5}
          color="gray"
        />
      </TouchableOpacity>

      {menuVisible && (
        <View className="absolute right-0 z-100 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <Pressable
            className="text-gray-700 block px-4 py-2 text-base"
            onPress={() => console.log('Account settings')}
          >
            <Text>Account settings</Text>
          </Pressable>
          <Pressable
            className="text-gray-700 block px-4 py-2 text-base"
            onPress={() => console.log('Support')}
          >
            <Text>Support</Text>
          </Pressable>
          <Pressable
            className="text-gray-700 block px-4 py-2 text-base"
            onPress={() => console.log('License')}
          >
            <Text>License</Text>
          </Pressable>
          <Pressable
            className="text-gray-700 block w-full px-4 py-2 text-left text-base"
            onPress={() => console.log('Sign out')}
          >
            <Text>Sign out</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default DropdownMenu;
