# Smart College Issue Reporting & Management System

A comprehensive college issue reporting and facility management system featuring a React (Vite) frontend and a Python (Flask) backend, with integrated Google Gemini AI for intelligent categorization, duplicate detection, automated summaries, quality analysis, and real-time alerts.

---

## 🔗 Project & Deployment Links

| Deployment | URL | Status | Description |
| :--- | :--- | :--- | :--- |
| **🚀 Vercel Production Dashboard** | [https://frontend-six-gilt-19.vercel.app](https://frontend-six-gilt-19.vercel.app) | `Active` | Live cloud deployment on Vercel CDN |
| **🌐 Vercel Direct Deployment** | [https://frontend-90h7p5rlk-dinesh626981.vercel.app](https://frontend-90h7p5rlk-dinesh626981.vercel.app) | `Active` | Production build deployment instance |
| **💻 Localhost Frontend** | [http://localhost:5173](http://localhost:5173) | `Local` | Local Vite development server |
| **⚙️ Localhost Backend API** | [http://127.0.0.1:5001](http://127.0.0.1:5001) | `Local` | Local Flask REST API service |
| **📦 GitHub Repository** | [https://github.com/dinesh626981/smart-college-issue-reporting-and-management-system-](https://github.com/dinesh626981/smart-college-issue-reporting-and-management-system-) | `Active` | Source code repository |

---

## ✨ Features

- **Modern Frontend**: Built with React 18, Vite, and Tailwind CSS for a fast, responsive user interface. Features dynamic analytics and status charts powered by Chart.js.
- **Robust Backend**: Powered by Flask, SQLAlchemy (ORM), and SQLite/MySQL with JWT authentication.
- **Flexible Authentication**: Supports both **Email Address** and **Mobile Number** login for staff and students with 1-click demo autofill.
- **Staff Operations & Proof of Work**: Dedicated completed tasks showcase, resolution proof image upload, and direct notification dispatch to administrators upon completion.
- **Email & Real-Time Notifications**: Integrated with Flask-Mail and in-app Notification Center. Staff work completions directly alert Administrators in real-time.
- **AI Integration**: Powered by Google Gemini AI, offering intelligent complaint categorization, duplicate detection, smart summaries, quality analysis, resolution suggestions, and an interactive chatbot.
- **Role-Based Portals**:
  - **Student Portal**: Lodge complaints, track status, view notifications, interact with AI assistant.
  - **Staff Portal**: View assigned complaints, update progress, upload proof of work, track work history.
  - **Administrator Portal**: System overview, department management, staff assignment, analytics & reports.

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/dinesh626981/smart-college-issue-reporting-and-management-system-.git
cd smart-college-issue-reporting-and-management-system-
```

### 2. Backend Setup
```powershell
# Install Python dependencies
pip install -r backend/requirements.txt

# Configure environment variables
# Copy backend/.env.example to backend/.env and add your GEMINI_API_KEY if using AI features
copy backend\.env.example backend\.env

# Run the Flask backend
python -m backend.app
```
*Backend runs locally at: `http://127.0.0.1:5001`*

### 3. Frontend Setup
```powershell
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*Frontend runs locally at: `http://localhost:5173`*

---

## 👥 Default Demo Credentials

You can use the **1-Click Auto-Fill** buttons on the Login page (`/login`) to instantly sign in:

| Role | Login Identifier | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@college.com` | `admin123` | Full administrative control & analytics |
| **Department Staff** | `staff@college.com` or `9876543212` | `staff123` | Assigned complaints & completion workflow |
| **Student** | `student@college.com` | `student123` | Raise & track campus issues |

*Admin Registration is also available at `/register?role=admin` using Security Key: `admin123`.*

---

## 🛠️ Technologies Used

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Chart.js, Axios, React Icons, React Toastify
- **Backend**: Python 3, Flask, Flask-SQLAlchemy, Flask-CORS, Flask-Mail, PyJWT, Werkzeug
- **AI & Analytics**: Google Generative AI (Gemini Pro), Predictive analytics algorithms
- **Hosting & Deployment**: Vercel (Edge CDN & Frontend Hosting), GitHub Actions CI/CD
