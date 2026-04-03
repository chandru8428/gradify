# Gradify - AI-Powered Exam Analyser 🎓

**Gradify** is a full-stack, AI-driven educational platform designed to streamline the process of grading and analyzing student exam scripts. Built seamlessly with modern web technologies, it allows Teachers to upload handwritten student exams, instantly analyzes them using AI, and provides detailed feedback, marks, and insights directly to Students and Administrators.

## ✨ Features

### 👨‍🏫 Teacher Portal
- **Upload Exams**: Upload student answer scripts (images or text) to be graded by AI.
- **Dual-Model AI Grading**: Automatically analyzes submitted answers using:
  - **Gemini 3**: Precise final scoring and accuracy verification
  - **Kimi K2.5**: Enhanced feedback generation, explanations, and cheap processing
- **Student Assignment**: Track assigned students and monitor their performance over time.

### 👩‍🎓 Student Portal
- **Dashboard**: View a personalized timeline of all graded exams and recent scores.
- **Detailed Feedback**: Access in-depth part-by-part analysis of every question answered, including AI-generated suggestions for improvement from both models.

### 👑 Admin Dashboard
- **Role Management**: Easily add, edit, password-reset, and remove Teachers and Students.
- **Overview**: View comprehensive system statistics including total graded exams, system users, and system-wide broadcast messaging.
- **Exam Management**: Full access to view and delete any exam from the registry.

## 🛠️ Tech Stack
- **Frontend Framework**: React 18, Vite
- **Styling**: Pure CSS (Custom responsive Neo-brutalist / Glassmorphism UI with Dark/Light mode support)
- **Database & Authentication**: Firebase Auth & Cloud Firestore
- **AI Integration**: 
  - Google Gemini 3 API (Final Scoring & Accuracy)
  - Kimi K2.5 via NVIDIA API (Feedback & Explanations)
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
Create a `.env` or `.env.local` file in the **frontend** directory and add your Firebase, Gemini, and NVIDIA credentials:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# AI Model APIs
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_NVIDIA_API_KEY=your_nvidia_api_key  # For Kimi K2.5
```

**How to get your API keys:**
1. **Gemini API Key**: https://aistudio.google.com/apikey
2. **NVIDIA API Key**: https://build.nvidia.com/account (get API key for your NVIDIA account with Kimi K2.5 access)

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to view the application in your browser.

*Note: On the first successful boot, the system will automatically seed an initial `admin` account with the password locally.*

### ⚙️ AI Model Configuration

**Gemini 3** (Primary - Final Scoring):
- Performs final scoring with strict evaluation
- Assesses handwriting, presentation, and demonstration quality
- Awards marks within allocated limits

**Kimi K2.5** (Secondary - Feedback Enhancement):
- Generates detailed, encouraging feedback for each question
- Provides explanations of concepts
- Offers learning suggestions for students
- Cheaper processing for non-critical analysis tasks
- Fallback: If NVIDIA API is unavailable, system falls back to Gemini-only mode

## 🐳 Docker Deployment
To run the entire system inside a completely isolated container:
```bash
docker-compose up --build
```

Make sure to set environment variables in your deployment environment:
```bash
export VITE_GEMINI_API_KEY=your_gemini_api_key
export VITE_NVIDIA_API_KEY=your_nvidia_api_key
```

---
*Developed with modern educational environments in mind.*
