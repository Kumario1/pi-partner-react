import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './components/HomePage';
import ChatHistoryScreen from './screens/ChatHistoryScreen';
import { ChatHistoryProvider } from './context/ChatHistoryProvider';

const Stack = createStackNavigator();

export default function App() {
  return (
    // Ensure NavigationContainer wraps the app at the root level
    <ChatHistoryProvider>
        <Stack.Navigator initialRouteName="PiPartner">
          <Stack.Screen name="PiPartner" component={HomePage} />
          <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
        </Stack.Navigator>
    </ChatHistoryProvider>
  );
}
