# SIS Control App

A high-performance, ultra-minimalist React Native application built for real-time remote control of ESP32 and Arduino-based hardware via Bluetooth.

## 🚀 Features

- **Arduino Robot Arm Control:** Smooth, real-time multi-axis slider controls with throttled Bluetooth transmission to prevent UI freezes. Includes Grip, Wrist, Elbow, Shoulder, Waist, and Speed settings.
- **ESP32 Car Remote:** Drive your hardware using hands-free voice-activated commands or intuitive gyroscope-based tilt steering.
- **Hardware Integration:** Reliable, low-latency communication with custom hardware over Bluetooth Classic (`react-native-bluetooth-classic`).
- **Premium UI/UX:** Clean, breathtaking, and responsive monochromatic design prioritizing whitespace and high-quality borderless components.
- **State Management:** Global Bluetooth context ensuring persistent connection state and auto-reconnection flows across all control interfaces (D-PAD, Matrix, Sliders, Voice).

## 🛠️ Technology Stack

- **Framework:** React Native (v0.72.6)
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **Hardware/Sensors:** `@react-native-community/slider`, `@react-native-voice/voice`, `react-native-sensors`
- **Bluetooth:** `react-native-bluetooth-classic`, `react-native-ble-plx`

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Prishu01/sis-control-app.git
   ```
2. Navigate into the directory:
   ```bash
   cd sis-control-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the application:
   ```bash
   npx react-native run-android
   ```

## 📡 Bluetooth Setup

1. Ensure your ESP32 or Arduino device is paired to your Android device via the system settings.
2. Launch the SIS Control app and navigate to the **Scan** tab.
3. Select your hardware device to establish the connection.
4. Navigate to your desired control module (Robot Arm, Car Remote, etc.) to start transmitting commands!

---
*Built with ❤️ for robotics and IoT automation.*
