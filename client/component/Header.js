import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";

export default function Header() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const [profileMenuPosition, setProfileMenuPosition] = useState({
    left: 0,
    top: 0,
  });
  const { userContext, setUserContext, habitId } = useContext(UserContext);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUserContext((prev) => ({ ...prev, username: storedUsername }));
        }
      } catch (error) {
        console.error("Error retrieving username:", error);
      }
    };

    fetchUsername();
  }, []);

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
      username: userContext.username,
      habitId,
    });
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setMenuPosition({ left: x, top: y });
          }}
          onPress={toggleMenu}
          onPressOut={closeMenus}>
          <Ionicons name="menu" size={32} style={[styles.menuIcon]}></Ionicons>
        </TouchableOpacity>

        <Text style={styles.headerText}>HabitApp</Text>
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
      </View>

      {menuVisible && (
        <View
          style={[styles.menuList, { left: 25, top: menuPosition.top + 10 }]}>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("CreateHabitScreen", {
                username: userContext.username,
                habitId: userContext.habitId,
              })
            }>
            <Text style={styles.menuItem}>Create Habit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("HabitDescriptionScreen", {
                username: userContext.username,
                habitId: userContext.habitId,
              })
            }>
            <Text style={styles.menuItem}>Habit Description</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("TeamInviteScreen", {
                username: userContext.username,
                habitId: userContext.habitId,
              })
            }>
            <Text style={styles.menuItem}>Team Invite</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() =>
              navigateToScreen("AddTeammemberScreen", {
                username: userContext.username,
                habitId: userContext.habitId,
              })
            }>
            <Text style={styles.subMenuItem}>Add Team Member</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            onPress={() =>
              navigateToScreen("EditTeammemberScreen", {
                username: userContext.username,
                habitId: userContext.habitId,
              })
            }>
            <Text style={styles.subMenuItem}>Edit Team Member</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("CadenceScreen", {
                username: userContext.username,
                habitId: userContext.habitId,
              })
            }>
            <Text style={styles.menuItem}>Feedback Cadence</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("ReminderScreen", {
                username: userContext.username,
                habitId: userContext.habitId,
              })
            }>
            <Text style={styles.menuItem}>Reminder Cadence</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("ReviewScreen", {
                username: userContext.username,
                habitId: userContext.habitId,
              })
            }>
            <Text style={styles.menuItem}>Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {profileMenuVisible && (
        <View
          style={[
            styles.menuProfileList,
            { right: 25, top: profileMenuPosition.top + 50 },
          ]}>
          {/* <TouchableOpacity
            onPress={() =>
              navigateToScreen("WelcomeScreen", {
                username: userContext.username,
              })
            }>
            <Text style={styles.menuItem}>Welcome</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            onPress={() =>
              navigateToScreen("LoginScreen", {
                username: userContext.username,
              })
            }>
            <Text style={styles.menuItem}>Login</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("EditAccountScreen", {
                username: userContext.username,
              })
            }>
            <Text style={styles.menuItem}>Edit Account</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() =>
              navigateToScreen("CreateAccountScreen", {
                username: userContext.username,
              })
            }>
            <Text style={styles.menuItem}>Create Account</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("ProfileScreen", {
                username: userContext.username,
              })
            }>
            <Text style={styles.menuItem}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("SettingsScreen", {
                username: userContext.username,
              })
            }>
            <Text style={styles.menuItem}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("ProgressScreen", {
                username: userContext.username,
              })
            }>
            <Text style={styles.menuItem}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigateToScreen("LogoutScreen", {
                username: userContext.username,
              })
            }>
            <Text style={styles.menuItem}>Logout</Text>
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
    fontSize: 30,
    margin: 0,
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
