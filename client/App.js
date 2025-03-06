import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider } from "./context/UserContext";
import { PaperProvider } from "react-native-paper";
import WelcomeScreen from "./screens/WelcomeScreen";
import CreateAccountScreen from "./screens/CreateAccountScreen";
import LoginScreen from "./screens/LoginScreen";
import LogoutScreen from "./screens/LogoutScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EditAccountScreen from "./screens/EditAccountScreen";
import CreateHabitScreen from "./screens/CreateHabitScreen";
import HabitDescriptionScreen from "./screens/HabitDescriptionScreen";
import TeamInviteScreen from "./screens/TeamInviteScreen";
import AddTeammemberScreen from "./screens/AddTeammemberScreen";
import EditTeammemberScreen from "./screens/EditTeammemberScreen";
import CadenceScreen from "./screens/CadenceScreen";
import ReminderScreen from "./screens/ReminderScreen";
import ReviewScreen from "./screens/ReviewScreen";
import FeedbackRequestScreen from "./screens/FeedbackRequestScreen";
import FeedbackRequestWelcomeScreen from "./screens/FeedbackRequestWelcomeScreen";
import FeedbackRequestRatingScreen from "./screens/FeedbackRequestRatingScreen";
import FeedbackRequestThanksRatingScreen from "./screens/FeedbackRequestThanksRatingScreen";
import FeedbackRequestQualitativeScreen from "./screens/FeedbackRequestQualitativeScreen";
import FeedbackDataScreen from "./screens/FeedbackDataScreen";
import NoThankYouScreen from "./screens/NoThankYouScreen";
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
            <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen
              name="EditAccountScreen"
              component={EditAccountScreen}
            />
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
              name="AddTeammemberScreen"
              component={AddTeammemberScreen}
            />
            <Stack.Screen
              name="EditTeammemberScreen"
              component={EditTeammemberScreen}
            />
            <Stack.Screen name="CadenceScreen" component={CadenceScreen} />
            <Stack.Screen name="ReminderScreen" component={ReminderScreen} />
            <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
            <Stack.Screen
              name="FeedbackRequestScreen"
              component={FeedbackRequestScreen}
            />
            <Stack.Screen
              name="FeedbackRequestWelcomeScreen"
              component={FeedbackRequestWelcomeScreen}
            />
            <Stack.Screen
              name="FeedbackRequestRatingScreen"
              component={FeedbackRequestRatingScreen}
            />
            <Stack.Screen
              name="FeedbackRequestThanksRatingScreen"
              component={FeedbackRequestThanksRatingScreen}
            />
            <Stack.Screen
              name="FeedbackRequestQualitativeScreen"
              component={FeedbackRequestQualitativeScreen}
            />
            <Stack.Screen
              name="FeedbackDataScreen"
              component={FeedbackDataScreen}
            />
            <Stack.Screen
              name="NoThankYouScreen"
              component={NoThankYouScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </PaperProvider>
  );
}
