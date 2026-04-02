# Gradify - AI-Powered Exam Analyser 🎓

**Gradify** is a full-stack, AI-driven educational platform designed to streamline the process of grading and analyzing student exam scripts. Built seamlessly with modern web technologies, it allows Teachers to upload handwritten student exams, instantly analyzes them using AI (Google Gemini), and provides detailed feedback, marks, and insights directly to Students and Administrators.

## ✨ Features

### 👨‍🏫 Teacher Portal
- **Upload Exams**: Upload student answer scripts (images or text) to be graded by AI.
- **AI Grading**: Automatically analyzes submitted answers against a master grading key using Google Gemini AI, awarding marks, identifying strengths, and suggesting improvements.
- **Student Assignment**: Track assigned students and monitor their performance over time.

### 👩‍🎓 Student Portal
- **Dashboard**: View a personalized timeline of all graded exams and recent scores.
- **Detailed Feedback**: Access in-depth part-by-part analysis of every question answered, including AI-generated suggestions for improvement.

### 👑 Admin Dashboard
- **Role Management**: Easily add, edit, password-reset, and remove Teachers and Students.
- **Overview**: View comprehensive system statistics including total graded exams, system users, and system-wide broadcast messaging.
- **Exam Management**: Full access to view and delete any exam from the registry.

## 🛠️ Tech Stack
- **Frontend Framework**: React 18, Vite
- **Styling**: Pure CSS (Custom responsive Neo-brutalist / Glassmorphism UI with Dark/Light mode support)
- **Database & Authentication**: Firebase Auth & Cloud Firestore
- **AI Integration**: Google Gemini API (@google/genai)
- **Containerization**: Docker & Docker Compose Support

## 🚀 Local Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/chandru8428/gradify-app.git
cd gradify-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` or `.env.local` file in the root directory and add your Firebase and Gemini credentials:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to view the application in your browser.

*Note: On the first successful boot, the system will automatically seed an initial `admin` account with the password locally.*

## 🐳 Docker Deployment
To run the entire system inside a completely isolated container:
```bash
docker-compose up --build
```

---
*Developed with modern educational environments in mind.*
