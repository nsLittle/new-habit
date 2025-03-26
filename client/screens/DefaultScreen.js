import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function DefaultScreen() {
  return (
    <ScrollView>
      <View style={styles.body}>
        <Text style={styles.bodyTitleText}>Create Account</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
});
