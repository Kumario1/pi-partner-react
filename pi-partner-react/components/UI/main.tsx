import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './HomePage';
import { ChatHistoryProvider } from './ChatHistoryProvider';

const Stack = createStackNavigator();

const App = () => {
  return (
    <ChatHistoryProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomePage}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ChatHistoryProvider>
  );
};

export default App;
