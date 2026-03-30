import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Play, Cpu, Settings } from 'lucide-react-native';

import GameScreen from './src/screens/GameScreen';
import EvolutionScreen from './src/screens/EvolutionScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  background: '#040406',
  panelBg: '#0D0D14',
  turkuaz: '#00F0FF',
  textMuted: '#686D76',
  border: '#1E1E28',
};

const CyberpunkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: '#000000',
    border: COLORS.border,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={CyberpunkTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.turkuaz,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingTop: 10,
            paddingBottom: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 1.5,
            paddingTop: 4,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let IconComponent;
            if (route.name === 'OYUN') IconComponent = Play;
            else if (route.name === 'EVRİM') IconComponent = Cpu;
            else if (route.name === 'AYARLAR') IconComponent = Settings;

            return (
              <View style={focused ? styles.glowIconWrapper : null}>
                <IconComponent color={color} size={focused ? 24 : 22} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="OYUN" component={GameScreen} />
        <Tab.Screen name="EVRİM" component={EvolutionScreen} />
        <Tab.Screen name="AYARLAR" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  glowIconWrapper: {
    shadowColor: COLORS.turkuaz,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  }
});
