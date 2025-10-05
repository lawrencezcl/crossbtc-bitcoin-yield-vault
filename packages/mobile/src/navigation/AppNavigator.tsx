import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Spacing } from '@/theme';
import VaultScreen from '@/screens/VaultScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const VaultStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="VaultHome"
        component={VaultScreen}
        options={{
          title: 'Bitcoin Vault',
          headerStyle: {
            backgroundColor: Colors.bitcoin,
            borderBottomWidth: 0,
          },
          headerTintColor: Colors.textInverse,
        }}
      />
      {/* Add more vault-related screens here */}
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.bitcoin,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 80,
          paddingBottom: Spacing.sm,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Vault"
        component={VaultStack}
        options={{
          tabBarLabel: 'Vault',
          // Add icon here
        }}
      />
      {/* Add more tabs here */}
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};