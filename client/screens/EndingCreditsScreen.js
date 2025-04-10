import { ScrollView, StyleSheet, View, Text } from "react-native";
import { sharedStyles } from "../styles/sharedStyles";

export default function EndingCreditsScreen() {
  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <View style={sharedStyles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={sharedStyles.title}>Ending Credits</Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <Text style={sharedStyles.bodyText}>App Concept by:</Text>
          <Text style={styles.bodyIntroLink}>
            Greg Zlevor of Westwood International
          </Text>

          <Text style={sharedStyles.bodyText}>Design Concept by:</Text>
          <Text style={styles.bodyIntroLink}>Dan Holmgren of ImageMakers</Text>

          <Text style={sharedStyles.bodyText}>Favicon designed by:</Text>
          <a
            style={styles.bodyIntroLink}
            href="https://www.flaticon.com/free-icons/daily"
            title="daily icons">
            by Awicon - Flaticon
          </a>

          <Text style={sharedStyles.bodyText}>Default icon by:</Text>
          <a
            href="https://uxwing.com/default-profile-picture-female-icon/"
            title="default profile">
            by UXWing
          </a>

          <View style={sharedStyles.buttonRow}></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bodyIntroLink: {
    textAlign: "center",
    fontSize: 14,
    paddingBottom: 15,
    width: 225,
  },
});
