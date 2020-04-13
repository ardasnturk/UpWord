import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import * as React from "react";

import FirstScreen from "../screens/FirstScreen";
import GameScreen from "../screens/GameScreen";

const Stack = createStackNavigator();
const INITIAL_ROUTE_NAME = "FirstScreen";

export default function AppNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerShown: false });

  return (
    <Stack.Navigator initialRouteName={INITIAL_ROUTE_NAME} headerMode="none">
      <Stack.Screen name="FirstScreen" component={FirstScreen} />
      <Stack.Screen name="GameScreen" component={GameScreen} />
    </Stack.Navigator>
  );
}
