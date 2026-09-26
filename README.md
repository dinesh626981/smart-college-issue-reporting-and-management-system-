# Smart College System

A comprehensive college management system featuring a React frontend and a Python (Flask) backend, with integrated AI capabilities for predictive analytics.

## Features
- **Modern Frontend**: Built with React, Vite, and Tailwind CSS for a fast, responsive user interface. Features data visualization using Chart.js.
- **Robust Backend**: Powered by Flask, SQLAlchemy (ORM), and PyMySQL for robust data handling.
- **AI Integration**: Powered by Google Gemini AI, offering intelligent complaint categorization, duplicate detection, smart summaries, quality analysis, resolution suggestions, and an interactive chatbot.
- **Authentication**: JWT-based secure authentication supporting Email or Mobile Number login.
- **Email & Real-Time Notifications**: Integrated with Flask-Mail and in-app Notification Center. Staff work completions directly alert Administrators in real-time.
- **Staff Operations & Proof of Work**: Dedicated completed tasks showcase, resolution proof image upload, and direct notification dispatch.

## Prerequisites
To run this project locally, you will need:
- **Node.js** (v18 or higher recommended)
- **Python** (v3.9 or higher recommended)
- **Google Gemini API Key**: Get one from Google AI Studio.

## Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-college-system
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory by copying the example:
```bash
cp backend/.env.example backend/.env
```
Ensure you add your Google Gemini API Key to `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

### 3. Backend Setup
Navigate to the root directory and use the built-in python executable (or your virtual environment):

```powershell
# Install requirements
python -m pip install -r backend/requirements.txt

# Run the Flask backend
python -m backend.app
```
The backend will run at `http://127.0.0.1:5001`.

### Default Demo Accounts (Pre-configured)
You can use the **1-Click Auto-Fill** buttons on the Login page (`/login`) to instantly fill any of these:
- **Administrator**: `admin@college.com` / `admin123`
- **Student**: `student@college.com` / `student123`
- **Department Staff**: `staff@college.com` or `9876543212` / `staff123` (supports Email or Mobile Number login)
- **Admin Registration**: Accessible via the "Register as Administrator" button on `/login` or `/register?role=admin` (Security Key: `admin123`).

### 4. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the development server:

```powershell
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
The frontend will run at `http://localhost:5173`.

## Technologies Used
**Frontend**: React, Vite, Tailwind CSS, React Router, Chart.js, Axios
**Backend**: Python, Flask, SQLAlchemy, PyMySQL, PyJWT, Google Generative AI (Gemini)

## Contributing
Feel free to submit issues or pull requests to improve the system.
