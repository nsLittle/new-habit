import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { UserContext } from "../context/UserContext";

export default function FeedbackRequestThanksRatingScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    username,
    userId,
    habitId,
    habitinput,
    teammemberId,
    firstName,
    token,
  } = userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Name: ", username);
      console.log("User Id: ", userId);
      console.log("Habit Input: ", habitinput);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const route = useRoute();
  const {
    teamMemberId,
    teamMemberFirstName,
    teamMemberLastName,
    teamMemberEmail,
    teamMemberProfilePic,
  } = route.params || {};

  console.log("Received from FeedbackRequestThreeScreen:", route.params);
  console.log("Team Member Id: ", teamMemberId);
  console.log("Team Member First Name: ", teamMemberFirstName);
  console.log("Team Member Last Name: ", teamMemberLastName);
  console.log("Team Memeber Email: ", teamMemberEmail);
  console.log("Team Member Profile Pic: ", teamMemberProfilePic);

  const [ratingValue, setRatingValue] = useState("");
  const [existingRating, setExistingRating] = useState("");
  console.log("Rating Value: ", ratingValue);

  const ratings = [
    { value: 1, label: "No perceptible follow-up", color: "#DC143C" }, // Crimson
    { value: 2, label: "Little follow-up", color: "#FF4500" }, // Red-Orange
    { value: 3, label: "Some follow-up", color: "#FFD700" }, // Yellow
    { value: 4, label: "Frequent follow-up", color: "#90EE90" }, // Light Green
    { value: 5, label: "Constructive follow-up", color: "#008000" }, // Green
  ];

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.174:8000/feedback/${username}/${habitId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("No existing feedback found.");
          return;
        }

        const data = await response.json();
        console.log("Retrieved Feedback:", data);
        if (data.feedback.length > 0) {
          setFeedbackId(data.feedback[0].feedbackId); // Store feedbackId in state
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  const handleSave = async () => {
    if (!ratingValue) {
      setDialogMessage("Please select a feedback rating.");
      setShowDialog(true);
      return;
    }

    const requestBody = {
      teamMemberId: teamMemberId,
      feedbackThanksRating: ratingValue,
    };

    console.log(
      "PATCH Request:",
      `http://192.168.1.174:8000/feedback/${username}/${habitId}`
    );
    console.log("Request Body:", JSON.stringify(requestBody));

    try {
      const response = await fetch(
        `http://192.168.1.174:8000/feedback/${username}/${habitId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setDialogMessage("Feedback rating updated successfully.");
      setShowDialog(true);
      navigation.navigate("FeedbackRequestQualitativeScreen");
    } catch (error) {
      setDialogMessage("Failed to update rating. Please try again.");
      setShowDialog(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>
            Did {firstName} thank you and ask for more suggestions from last
            feedback?
          </Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <View style={styles.ratingContainer}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating.value}
                style={[
                  styles.ratingButton,
                  ratingValue === rating.value && {
                    borderColor: rating.color,
                    backgroundColor: "#F0F0F0",
                  },
                ]}
                onPress={() => setRatingValue(rating.value)}>
                <View
                  style={[
                    styles.circle,
                    ratingValue === rating.value && {
                      backgroundColor: rating.color,
                      borderColor: rating.color,
                    },
                  ]}
                />
                <Text style={styles.label}>{rating.label}</Text>
                <View
                  style={[styles.numberBox, { backgroundColor: rating.color }]}>
                  <Text style={styles.number}>{rating.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                console.log("Save button pressed");
                handleSave();
              }}>
              <Text
                style={styles.saveButtonText}
                onPress={() => {
                  console.log("Navigating with params:", {
                    teamMemberId,
                    teamMemberFirstName,
                    teamMemberLastName,
                    teamMemberEmail,
                    teamMemberProfilePic,
                  });

                  navigation.navigate("FeedbackRequestQualitativeScreen", {
                    teamMemberId,
                    teamMemberFirstName,
                    teamMemberLastName,
                    teamMemberEmail,
                    teamMemberProfilePic,
                  });
                }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
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
  bodyTitleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  ratingContainer: {
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    width: "85%",
    padding: 10,
    marginVertical: 3,
    borderWidth: 2,
    borderColor: "#D3D3D3",
    borderRadius: 10,
    backgroundColor: "white",
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D3D3D3",
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  numberBox: {
    width: 25,
    height: 25,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    color: "white",
    fontWeight: "bold",
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
  // backButton: {
  //   backgroundColor: "#FFD700",
  //   borderRadius: 25,
  //   paddingVertical: 15,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  //   width: 150,
  //   height: 45,
  //   justifyContent: "center",
  // },
  // backButtonText: {
  //   color: "black",
  //   fontSize: 12,
  //   textAlign: "center",
  //   fontWeight: "bold",
  // },
  saveButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
});
