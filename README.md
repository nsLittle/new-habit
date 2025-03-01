in# Habit-App - Community-Driven Habit Formation

## 🚀 Overview

**Habit-App** is a **habit formation tool** that reinforces behavior change through **community engagement**. Designed for **corporate teams**, it allows users to set personal habits and receive **real-time feedback** from their selected support network.

The application is developed for **Westwood International** and **Greg Zlevor**, with **design leadership from Image Makers and Dan Homglen**.

---

## 🛠 Tech Stack

- **React Native** (with Expo) – Mobile-first development framework
- **Node.js & Express** – Backend API for authentication and data management
- **MongoDB** – Stores user data, habits, and team feedback
- **JWT Authentication** – Secure login with token-based authentication
- **Expo** – Simplifies mobile development workflow
- **Nodemailer & Twilio** – Enables email/SMS notifications for habit feedback

---

## 📌 Features

- **User Accounts**: Secure login with JWT authentication (username & password)
- **Habit Declaration**: Users define personal habits to track
- **Community Feedback**: Send text/email prompts to selected team members
- **Feedback Storage**: Users and team members can review past responses
- **Review Dashboard**: Track progress and insights over time
- **Future Enhancements**:
  - **Google Authentication**: Alternative login option
  - **Gamification**: Habit streaks and milestone rewards
  - **Enhanced UI/UX**: Improved team member engagement tools

---

## 📂 Project Structure

```plaintext
habit-app
│── client/                     # React Native frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── screens/            # Screen views for navigation
│   │   ├── context/            # Global state management with Context API
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper functions
│   │   ├── services/           # API calls and async storage
│   │   ├── navigation/         # Stack navigation setup
│   │   ├── App.js              # Root app component
│   │   ├── package.json        # Dependencies
│── server/                      # Backend API
│   ├── models/                 # MongoDB schema definitions
│   ├── routes/                 # Express API routes
│   ├── controllers/            # Business logic
│   ├── middleware/             # Authentication & validation
│   ├── config/                 # Environment variables & settings
│   ├── index.js                # Server entry point
│   ├── package.json            # Dependencies
│── .env                         # Environment variables (JWT secret, DB URL)
│── README.md                    # Project documentation

---

## How to Run Habit-App Locally

1. Clone repo: git clone https://github.com/nsLittle/habit-app.git
2. Type: mongosh
3. Find: server
4. Type: npm install
5. Type: npm run dev
6. Find: client
7. Type: npm install
8. Type: npx expo start

---

### Image Attribution

habit by Rudez Studio from <a href="https://thenounproject.com/browse/icons/term/habit/" target="_blank" title="habit Icons">Noun Project</a> (CC BY 3.0)---

---

## 💡 Contact Me

🔗 [GitHub](https://github.com/nsLittle)
🔗 [LinkedIn](https://www.linkedin.com/in/mutsumihata)

Feel free to reach out for collaboration, job opportunities, or questions about my work!

---
```
