import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatHistoryProvider } from './context/ChatHistoryProvider';
import HomePage from './components/HomePage';
import ChatHistoryScreen from './screens/ChatHistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ChatHistoryProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ChatHistoryProvider>
  );
}