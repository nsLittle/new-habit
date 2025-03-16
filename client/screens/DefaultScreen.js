import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
} from "react-native";

const DATA = [...Array(50)].map((_, index) => ({
  id: index.toString(),
  title: `Item ${index + 1}`,
}));

const Item = ({ title }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

export default function DefaultScreen() {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.wrapper}>
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Item title={item.title} />}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
          style={styles.flatList} // ✅ Forces scrolling on Web
          showsVerticalScrollIndicator={true} // ✅ Makes scrollbar visible
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  wrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: Platform.OS === "web" ? "auto" : "visible", // ✅ Fixes Web scrolling
  },
  flatList: {
    flexGrow: 1,
    height: "100%",
  },
  listContainer: {
    padding: 20,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
  },
});
