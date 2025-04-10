import { StyleSheet, Platform } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export const sharedStyles = StyleSheet.create({
  // LAYLOUT
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 220,
    paddingBottom: 100,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingHorizontal: wp("5%"),
  },
  body: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: Platform.OS === "web" ? hp("20%") : hp("2%"),
  },
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },

  // TYPOGRAPHY
  title: {
    fontSize: 32,
    textAlign: "center",
    paddingBottom: 30,
    width: wp("65%"),
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    paddingBottom: 10,
  },
  buttonText: {
    fontSize: 12,
    color: "black",
    textAlign: "center",
  },
  linkText: {
    fontSize: 12,
    paddingTop: 20,
    color: "#6A8CAF",
    textDecorationLine: "underline",
    fontWeight: "bold",
    textAlign: "center",
  },

  // BUTTONS
  yellowButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: 200,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  greyButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: 200,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 50,
  },
  buttonColumn: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 30,
  },

  // INPUT FIELDS
  inputContainer: {
    width: "85%",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "#A9A9A9",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    width: "85%",
    justifyContent: "center",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: 40,
    padding: 10,
    backgroundColor: "transparent",
  },
  filledInput: {
    backgroundColor: "#E6F0FF",
    borderColor: "#87CEFA",
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    marginBottom: 10,
    overflow: "hidden",
  },

  // PICTURES
  profilePicMain: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
  },
  pictureContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    marginBottom: 10,
  },

  // DIALOGS
  dialog: {
    backgroundColor: "white",
  },
  dialogTitleAlert: {
    color: "red",
    fontWeight: "bold",
  },
  dialogTitleInfo: {
    color: "blue",
    fontWeight: "bold",
  },
  dialogButtonConfirm: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
  },
  dialogButtonCancel: {
    color: "red",
    fontWeight: "bold",
    fontSize: 18,
  },

  // ICONS
  iconButton: {
    padding: 10,
    height: "100%",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  // ETC
  charCount: {
    paddingTop: 5,
    textAlign: "right",
    color: "gray",
    fontSize: 12,
  },
});
