import { useState, useEffect, useContext } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { userName, userId, habitId, teammemberId, firstname, token } =
    userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("Username: ", userName);
      console.log("User Id: ", userId);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstname);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    profilePic: "",
    email: "",
    habits: [],
    teammembers: [],
  });

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const retrieveProfile = async () => {
      if (!token) {
        console.error("No token available, authentication required.");
        setLoading(false);
        return;
      }

      console.log("Sending Request with Token:", token);

      try {
        const response = await fetch(
          `http://192.168.1.174:8000/user/${userName}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setDialogMessage(errorData.error || "We can't find you.");
          setShowDialog(true);
          console.log(`We can't find you.`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Retrieved Data:", data);
        setUserData(data);
      } catch (error) {
        setDialogMessage("An error occurred while retrieving your data.");
        setShowDialog(true);
        console.error("Data Retrieval Error:", error);
      }
      setLoading(false);
    };
    retrieveProfile();
  }, []);

  // const fetchUserData = async () => {
  //   try {
  //     if (!token) throw new Error("Authentication token is missing.");

  //     const [userResponse, habitsResponse, teamMemberResponse] =
  //       await Promise.all([
  //         fetch(`http://192.168.1.174:8000/user/${username}`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //         fetch(`http://192.168.1.174:8000/habit/${username}`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //         fetch(`http://192.168.1.174:8000/teammember/${username}`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //       ]);

  //     if (!userResponse.ok) throw new Error("Failed to fetch user data.");
  //     if (!habitsResponse.ok) throw new Error("Failed to fetch habit data.");
  //     if (!teamMemberResponse.ok)
  //       throw new Error("Failed to fetch team member data.");

  //     const userData = await userResponse.json();
  //     const habitData = await habitsResponse.json();
  //     const teamMemberData = await teamMemberResponse.json();

  //     console.log("User Data: ", userData);
  //     console.log("Habit Data: ", habitData);
  //     console.log("Team Member Data: ", teamMemberData);

  //     setProfileData((prev) => ({
  //       ...prev,
  //       firstName: userData?.firstName || "",
  //       lastName: userData?.lastName || "",
  //       profilePic: userData?.profilePic || "",
  //       email: userData?.email || "",
  //       habits: habitData?.habits || [],
  //       teammembers: [...teamMemberData?.teamMembers] || [],
  //     }));

  //     console.log("Profile Data: ", profileData);
  //     console.log("User First Name; ", profileData.firstName);
  //     console.log("Teammembers: ", profileData.teammembers);
  //   } catch (error) {
  //     console.error("Error with data retrieval:", error);
  //     setError(error.message);
  //   }
  // };

  // useEffect(() => {
  //   if (userName) {
  //     fetchUserData();
  //   }
  // }, [userName]);

  // if (loading) {
  //   return (
  //     <View style={styles.body}>
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  if (error) {
    return (
      <View style={styles.body}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const { firstName, lastName, profilePic, email, habits, teammembers } =
    profileData;

  console.log("ProfilePic: ", profilePic);

  const profilePicUrl = isValidUrl(profilePic)
    ? profilePic
    : profilePic
    ? `http://192.168.1.174:8000/data/${profilePic.trim()}`
    : "default-image-url-here";

  const testImage =
    "https://media.wired.com/photos/5cdefc28b2569892c06b2ae4/master/w_2560%2Cc_limit/Culture-Grumpy-Cat-487386121-2.jpg";

  const sendEmail = (email) => {
    if (email) {
      const mailtoURL = `mailto:${email}`;
      Linking.openURL(mailtoURL).catch((err) =>
        console.error("Failed to open email client", err)
      );
      setDialogMessage("Failed to open email client.");
      setShowDialog(true);
    } else {
      console.error("No email address provided");
      setDialogMessage("No email address provided");
      setShowDialog(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Profile</Text>
        </View>

        <View style={styles.profileDataBox}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profilePicMain} />
          ) : null}

          <Text style={styles.bodyTitleTextSub}>{userName}</Text>

          <View style={styles.profileDetails}>
            <View style={styles.profileMain}>
              <Text style={styles.profileData}>
                {firstName} {lastName}
              </Text>
              <Text style={styles.profileData}>{email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("EditAccountScreen")}>
            <Text style={styles.backButtonText}>◀ Edit Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => navigation.navigate("ReviewScreen")}>
            <Text style={styles.saveButtonText}>Review & Finish ▶</Text>
          </TouchableOpacity>
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
  bodyTitleTextSub: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  profileDataBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  profileDetails: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileMain: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileHabits: {
    marginBottom: 10,
  },
  profileTeams: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileData: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: 16,
  },
  profilePicMain: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
  },
  teammemberProfilePicMain: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 50,
    height: 50,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 50,
  },
  habitDataBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  habitBox: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  teamMemberBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  teamMemberDetails: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconsColumn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 80,
  },
  contactPersonButton: {
    backgroundColor: "#F8F8F8",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginTop: 15,
    marginBottom: 5,
    width: 350,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactPersonNameColumn: {
    flexDirection: "row",
    alignItem: "center",
    justifyContent: "space-around",
  },
  contactEmail: {
    fontSize: 10,
    color: "gray",
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
  saveButton: {
    backgroundColor: "#FFD700",
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
  backButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  backButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  teamMemberProfilePic: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 40,
    height: 40,
    marginBottom: 15,
    borderRadius: 50,
  },
});
