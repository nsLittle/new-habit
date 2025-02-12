import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider } from "./context/UserContext";
import { PaperProvider } from "react-native-paper";
import WelcomeScreen from "./screens/WelcomeScreen";
import CreateAccountScreen from "./screens/CreateAccountScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EditAccountScreen from "./screens/EditAccountScreen";
import CreateHabitScreen from "./screens/CreateHabitScreen";
import HabitDescriptionScreen from "./screens/HabitDescription";
import TeamInviteScreen from "./screens/TeamInviteScreen";
import Header from "./component/Header";

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="WelcomeScreen"
            screenOptions={{
              header: (props) => <Header {...props} />,
            }}>
            <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen
              name="CreateAccountScreen"
              component={CreateAccountScreen}
            />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen
              name="CreateHabitScreen"
              component={CreateHabitScreen}
            />
            <Stack.Screen
              name="HabitDescriptionScreen"
              component={HabitDescriptionScreen}
            />
            <Stack.Screen
              name="TeamInviteScreen"
              component={TeamInviteScreen}
            />
            <Stack.Screen
              name="EditAccountScreen"
              component={EditAccountScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </PaperProvider>
  );
}
