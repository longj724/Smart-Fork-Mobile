// External Dependencies
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useRef, useState } from 'react';

// Relative Dependencies
import Message from '@/components/Message';
import { IMessage } from '@/types/types';
import { useMessagesQuery } from '@/hooks/useMessagesQuery';
import { useSendMessagesMutation } from '@/hooks/useSendMessageMutation';

const Page = () => {
  const { userId } = useAuth();

  const { data: messageData, isLoading: isLoadingMessages } =
    useMessagesQuery(userId);

  const [messages, setMessages] = useState<IMessage[] | undefined>([]);
  const [currentInput, setCurrentInput] = useState('');
  const messagesRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    setMessages(messageData);
    messagesRef.current?.scrollToEnd({ animated: true });
  }, [messageData]);

  useEffect(() => {}, []);

  const sendMessageMutation = useSendMessagesMutation(userId);

  const onSend = () => {
    const userMessage: IMessage = {
      role: 'user',
      content: currentInput,
    };
    setMessages((existingMessages) => [
      ...(existingMessages as IMessage[]),
      userMessage,
      {
        role: 'system',
        content: '',
      },
    ]);
    setCurrentInput('');
    messagesRef.current?.scrollToEnd({ animated: true });
    sendMessageMutation.mutate(currentInput, {
      onSettled: (response) => {
        const newMessage: IMessage = response?.data.message;
        setMessages((existingMessages) => {
          existingMessages?.pop();
          return [...(existingMessages as IMessage[]), newMessage];
        });
      },
    });
  };

  return (
    <View className="flex flex-col h-full">
      <View className="flex flex-col pl-3 pt-2 pr-3 flex-1">
        <FlatList
          contentContainerStyle={{ gap: 10, paddingBottom: 75 }}
          data={messages}
          ref={messagesRef}
          renderItem={({ item }) => <Message message={item} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="absolute bottom-0 left-0 right-0 bg-white p-2 border-t border-gray-200"
        keyboardVerticalOffset={Platform.select({ ios: 90, android: 500 })}
      >
        <View className="flex-row items-center mb-2">
          <TextInput
            onPressIn={() => {
              if (currentInput === '') {
                messagesRef.current?.scrollToEnd({ animated: true });
              }
            }}
            multiline={true}
            placeholder="Ask AI a message about your goals"
            className="flex-1 bg-gray-100 p-3 rounded-md"
            value={currentInput}
            onChangeText={setCurrentInput}
          />
          <Pressable className="ml-2">
            <Ionicons
              name="send"
              size={24}
              color="#15803D"
              onPress={onSend}
              disabled={isLoadingMessages || currentInput === ''}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Page;
