# Habit-App - Community-Driven Habit Formation

## Overview

**Habit-App** is a **habit formation tool** that reinforces behavior change through **community engagement**. Designed for **corporate teams**, it allows users to set personal habits and receive **feedback** from their selected support network.

The application is developed for **Westwood International** and **Greg Zlevor**, with **design leadership from Image Makers and Dan Holmgren**.

---

## Tech Stack

- **React Native** (with Expo) – Mobile-first development framework
- **Node.js & Express** – Backend API for authentication and data management
- **MongoDB** – Stores user data, habits, and team feedback
- **JWT Authentication** – Secure login with token-based authentication
- **Expo** – Simplifies mobile development workflow

---

## Features

- **User Authentication** – Simple username + password login
- **Habit Tracking** – Users define a custom habit
- **Feedback Flow** – Users invite team members to submit ratings & notes
- **Progress Review** – View cycles of feedback and reflect after each cycle
- **Reminders** – Optional text/email prompts for consistency

---

## Project Structure

````plaintext
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

## How to Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) running locally or access to a MongoDB Atlas instance
- [Expo Go](https://expo.dev/client) app installed on your mobile device (iOS or Android)

---

1. Clone repo: git clone https://github.com/nsLittle/habit-app.git
2. Type: mongosh
3. Find: server
4. Type: npm install
5. Type: npm run dev
6. Find: client
7. Type: npm install
8. Type: npx expo start
9. Scan: QR code to run app on phone (OR)
10. Type: W to run app on browser

---

## Demo Login (Seeded User)

To test the app immediately without creating a new account:

1. Find: server
2. Type: node scripts/seed.js
3. Login credentials:
    **Username**: `Sheep`
    **Password**: `Password1!`

This account includes:
- **Habit**: *"I want to become a sheep dog like Babe"*
- **Description**: *"I will herd sheep in cool formations and bring home blue ribbons galore"*
- **Cadence**: Biweekly (every 14 days)
- **Reminder**: Email on Wednesdays at 3pm
- **Team**:
  - 🐱 Kitty Kat
  - 🐶 Doggy Dog
  - 🐭 Mousey Mouse

---

## Android Build

### Download the Standalone App

You can download the latest Android build here:

[Download Habit App (.apk)](https://expo.dev/artifacts/eas/wUVFxaeNw3eBPpo79Sy9RN.aab)

Note: `.aab` files are intended for publishing to the Google Play Store. If you need a version that can be installed directly on an Android device, use the `.apk` format instead (see below).

---

### For Testing Without Publishing to Play Store

To generate an installable `.apk` for direct distribution:

```bash
eas build -p android --profile preview


---

## Contact Me

[GitHub](https://github.com/nsLittle)
[LinkedIn](https://www.linkedin.com/in/mutsumihata)
[Portfolio](https://www.mutsumi.io)

Feel free to reach out for collaboration, job opportunities, or questions about my work!

---
````
