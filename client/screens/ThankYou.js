import { useContext } from "react";
import { Platform, ScrollView, StyleSheet, View, Text } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function ThankYouScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext, resetUserContext } =
    useContext(UserContext) || {};
  const {
    userIdContext,
    userNameContext,
    firstNameContext,
    lastNameContext,
    emailContext,
    profilePicContext,
    habitContextId,
    habitContextInput,
    descriptionContextInput,
    teamMemberContextId,
    token,
  } = userContext || {};

  // useEffect(() => {
  //   if (userContext) {
  //     console.log("UserContext:", userContext);
  //     console.log("User Id Context: ", userIdContext);
  //     console.log("UserName Context: ", userNameContext);
  //     console.log("First Name Context: ", firstNameContext);
  //     console.log("Last Name Context: ", lastNameContext);
  //     console.log("Email Context: ", emailContext);
  //     console.log("Profile Pic Context: ", profilePicContext);
  //     console.log("Habit Id Context: ", habitContextId);
  //     console.log("Habit Input Context: ", habitContextInput);
  //     console.log("Description Input Context: ", descriptionContextInput);
  //     console.log("TeamMember Id Context: ", teamMemberContextId);
  //     console.log("Token: ", token);
  //   }
  // }, [userContext]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Thank You</Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <Text style={styles.bodyIntroText}>
            {firstNameContext} appreciates your time!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingHorizontal: wp("5%"),
  },
  body: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingTop: Platform.OS === "web" ? hp("20%") : hp("2%"),
  },
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
