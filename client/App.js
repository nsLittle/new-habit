import React, { useCallback, useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider } from "./context/UserContext";
import { PaperProvider } from "react-native-paper";
import WelcomeScreen from "./screens/WelcomeScreen";
import CreateAccountScreen from "./screens/CreateAccountScreen";
import LoginScreen from "./screens/LoginScreen";
import ResetPasswordRequestScreen from "./screens/ResetPasswordRequestScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
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
import EndingCreditsScreen from "./screens/EndingCreditsScreen";
import FinalReviewScreen from "./screens/FinalReviewScreen";
import SuccessfulHabitCompletionScreen from "./screens/SuccessfulHabitCompletionScreen";
import NextTimeScreen from "./screens/NextTimeScreen";
import DefaultScreen from "./screens/DefaultScreen";
import Header from "./component/Header";

const Stack = createStackNavigator();

const linking = {
  prefixes: ["habitapp://"],
  config: {
    screens: {
      FeedbackRequestWelcomeScreen: "feedback-request/:teamMemberId/:token",
      ResetPasswordScreen: "password-reset/:token",
    },
  },
};

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFD700",
          alignItems: "center",
          justifyContent: "center",
        }}
        onLayout={onLayoutRootView}>
        <Text style={styles.tagline}>
          Build Better Habits, One Feedback at a Time
        </Text>
        <Image
          source={require("./assets/favicon.png")}
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
  }
  return (
    <PaperProvider>
      <UserProvider>
        <NavigationContainer
          linking={linking}
          fallback={<Text>Loading...</Text>}>
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
            <Stack.Screen
              name="ResetPasswordRequestScreen"
              component={ResetPasswordRequestScreen}
            />
            <Stack.Screen
              name="ResetPasswordScreen"
              component={ResetPasswordScreen}
            />
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
              name="EndingCreditsScreen"
              component={EndingCreditsScreen}
            />
            <Stack.Screen
              name="NoThankYouScreen"
              component={NoThankYouScreen}
            />
            <Stack.Screen
              name="FinalReviewScreen"
              component={FinalReviewScreen}
            />
            <Stack.Screen
              name="SuccessfulHabitCompletionScreen"
              component={SuccessfulHabitCompletionScreen}
            />
            <Stack.Screen name="NextTimeScreen" component={NextTimeScreen} />
            <Stack.Screen name="DefaultScreen" component={DefaultScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  tagline: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 30,
    justifyContent: "center",
    textAlign: "center",
  },
});
