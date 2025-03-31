import { useContext } from "react";
import { Platform, ScrollView, StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function ThankYouScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext, resetUserContext } =
    useContext(UserContext) || {};
  const {
    // userIdContext,
    // userNameContext,
    firstNameContext,
    // lastNameContext,
    // emailContext,
    // profilePicContext,
    // habitContextId,
    // habitContextInput,
    // descriptionContextInput,
    // teamMemberContextId,
    // token,
  } = userContext || {};

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <View style={sharedStyles.body}>
        <View style={sharedStyles.titleContainer}>
          <Text style={sharedStyles.title}>Thank You</Text>
        </View>

        <View style={sharedStyles.bodyIntroContainer}>
          <Text style={sharedStyles.bodyText}>
            {firstNameContext} appreciates your time!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
