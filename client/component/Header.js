import { useState, useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function Header(props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const [profileMenuPosition, setProfileMenuPosition] = useState({
    left: 0,
    top: 0,
  });

  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { habitContextId } = userContext || {};

  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  const toggleMenu = () => {
    setMenuVisible(true);
    setProfileMenuVisible(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuVisible(true);
    setMenuVisible(false);
  };

  const closeMenus = () => {
    setTimeout(() => {
      setMenuVisible(false);
      setProfileMenuVisible(false);
    }, 2000);
  };

  const navigateToScreen = (screenName, params = {}) => {
    closeMenus();
    navigation.navigate(screenName, {
      ...params,
      userName: userContext.userName,
      habitContextId,
    });
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        {currentRoute !== "WelcomeScreen" &&
          currentRoute !== "LoginScreen" &&
          currentRoute !== "ResetPasswordScreen" &&
          currentRoute !== "LogoutScreen" &&
          currentRoute !== "CreateAccountScreen" &&
          currentRoute !== "ProfileScreen" &&
          currentRoute !== "EditAccountScreen" &&
          currentRoute !== "CreateHabitScreen" &&
          currentRoute !== "HabitDescriptionScreen" &&
          currentRoute !== "TeamInviteScreen" &&
          currentRoute !== "CadenceScreen" &&
          currentRoute !== "ReminderScreen" &&
          currentRoute !== "ReviewScreen" &&
          currentRoute !== "EditReviewScreen" &&
          currentRoute !== "FeedbackRequestScreen" &&
          currentRoute !== "FeedbackRequestWelcomeScreen" &&
          currentRoute !== "FeedbackRequestRatingScreen" &&
          currentRoute !== "FeedbackRequestThanksRatingScreen" &&
          currentRoute !== "FeedbackRequestQualitativeScreen" &&
          currentRoute !== "NoThankYouScreen" &&
          currentRoute !== "EndingCreditsScreen" &&
          currentRoute !== "ResetPasswordRequestScreen" &&
          currentRoute !== "ResetPasswordScreen" &&
          currentRoute !== "FeedbackDataScreen" &&
          currentRoute !== "SuccessfulHabitCompletionScreen" && (
            <TouchableOpacity
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setMenuPosition({ left: x, top: y });
              }}
              onPress={toggleMenu}
              onPressOut={closeMenus}>
              <Ionicons
                name="menu"
                size={32}
                style={[styles.menuIcon]}></Ionicons>
            </TouchableOpacity>
          )}

        <Text style={styles.headerText}>Habit</Text>
        {currentRoute !== "WelcomeScreen" &&
          currentRoute !== "LoginScreen" &&
          currentRoute !== "ResetPasswordScreen" &&
          currentRoute !== "LogoutScreen" &&
          currentRoute !== "CreateAccountScreen" &&
          currentRoute !== "FeedbackRequestWelcomeScreen" &&
          currentRoute !== "FeedbackRequestRatingScreen" &&
          currentRoute !== "FeedbackRequestThanksRatingScreen" &&
          currentRoute !== "FeedbackRequestQualitativeScreen" &&
          currentRoute !== "NoThankYouScreen" &&
          currentRoute !== "EndingCreditsScreen" &&
          currentRoute !== "ResetPasswordRequestScreen" &&
          currentRoute !== "ResetPasswordScreen" &&
          currentRoute !== "SuccessfulHabitCompletionScreen" && (
            <TouchableOpacity
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setMenuPosition({ left: x + width, top: y + height });
              }}
              onPress={toggleProfileMenu}
              onPressOut={closeMenus}>
              <Ionicons
                name="person"
                size={32}
                style={styles.profileIcon}></Ionicons>
            </TouchableOpacity>
          )}
      </View>

      {menuVisible && (
        <View
          style={[styles.menuList, { left: 25, top: menuPosition.top + 10 }]}>
          {currentRoute !== "CreateHabitScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("CreateHabitScreen", {
                  userName: userContext.userName,
                  habitContextId,
                })
              }>
              <Text style={styles.menuItem}>Create Habit</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "HabitDescriptionScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("HabitDescriptionScreen", {
                  userName: userContext.userName,
                  habitContextId,
                })
              }>
              <Text style={styles.menuItem}>Habit Description</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "CadenceScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("CadenceScreen", {
                  userName: userContext.userName,
                  habitId: userContext.habitId,
                })
              }>
              <Text style={styles.menuItem}>Feedback Cadence</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "ReminderScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("ReminderScreen", {
                  userName: userContext.userName,
                  habitId: userContext.habitId,
                })
              }>
              <Text style={styles.menuItem}>Reminder Cadence</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "TeamInviteScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("TeamInviteScreen", {
                  userName: userContext.userName,
                  habitId: userContext.habitId,
                })
              }>
              <Text style={styles.menuItem}>Team Invite</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "ReviewScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("ReviewScreen", {
                  userName: userContext.userName,
                  habitId: userContext.habitId,
                })
              }>
              <Text style={styles.menuItem}>Review</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "EditReviewScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("EditReviewScreen", {
                  userName: userContext.userName,
                  habitContextId,
                })
              }>
              <Text style={styles.menuItem}>Edit Review</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "FeedbackDataScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("FeedbackDataScreen", {
                  userName: userContext.userName,
                  habitId: userContext.habitId,
                })
              }>
              <Text style={styles.menuItem}>Feedback Data</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "FinalReviewScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("FinalReviewScreen", {
                  userName: userContext.userName,
                  habitId: userContext.habitId,
                })
              }>
              <Text style={styles.menuItem}>Final Review</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {profileMenuVisible && (
        <View
          style={[
            styles.menuProfileList,
            { right: 25, top: profileMenuPosition.top + 50 },
          ]}>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("EditAccountScreen", {
                userName: userContext.userName,
              })
            }>
            <Text style={styles.menuItem}>Edit Account</Text>
          </TouchableOpacity>
          {currentRoute !== "ReviewScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("ReviewScreen", {
                  userName: userContext.userName,
                })
              }>
              <Text style={styles.menuItem}>Review</Text>
            </TouchableOpacity>
          )}
          {currentRoute !== "EditReviewScreen" && (
            <TouchableOpacity
              onPress={() =>
                navigateToScreen("EditReviewScreen", {
                  userName: userContext.userName,
                })
              }>
              <Text style={styles.menuItem}>Edit Review</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("LogoutScreen", {
                userName: userContext.userName,
              })
            }>
            <Text style={styles.menuItem}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("FeedbackRequestWelcomeScreen", {
                userName: userContext.userName,
              })
            }>
            <Text style={styles.menuItem}>Feedback Request Loop</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FFD700",
    height: 200,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 5,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 70,
  },
  headerText: {
    textAlign: "center",
    flex: 1,
    fontSize: 36,
  },
  menuIcon: {
    color: "#000",
    zIndex: 20,
    position: "relative",
  },
  menuList: {
    zIndex: 9999,
    elevation: 10,
    backgroundColor: "#FFF",
    position: "absolute",
    top: 100,
    left: 20,
    padding: 10,
    width: "80%",
    maxWidth: 250,
    borderRadius: 5,
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  profileIcon: {
    color: "#000",
    zIndex: 20,
    position: "relative",
  },
  menuProfileList: {
    zIndex: 9999,
    elevation: 10,
    backgroundColor: "#FFF",
    position: "absolute",
    top: 100,
    right: 10,
    padding: 10,
    width: "80%",
    maxWidth: 250,
    borderRadius: 5,
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  menuItem: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  subMenuItem: {
    padding: 10,
    paddingLeft: 30,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
});
