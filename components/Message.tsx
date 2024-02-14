// External Dependencies
import { Text, View } from 'react-native';

// Relative Dependency
import { IMessage } from '@/types/types';
import { cn } from '@/utils/utils';
import LoadingIndicator from '@/components/LoadingIndicator';

interface IMessageProps {
  message: IMessage;
}

const Message = ({ message: { content, role } }: IMessageProps) => {
  return (
    <View
      className={cn(
        'bg-gray-200 p-3 rounded-xl',
        role === 'user'
          ? 'text-white bg-green-700 ml-auto'
          : 'text-black bg-gray-200 ml-0',
        content === '' && 'flex items-center'
      )}
      style={{ width: '90%' }}
    >
      <Text className={cn(role === 'user' ? 'text-white' : 'text-black')}>
        {content !== '' ? content : <LoadingIndicator />}
      </Text>
    </View>
  );
};

export default Message;
