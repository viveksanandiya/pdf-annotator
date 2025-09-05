# PDF Annotator

A full-stack web application for uploading, viewing, and annotating PDF documents with persistent text highlighting functionality.

## 🚀 Installation & Setup

### 1. Clone the Repository

git clone https://github.com/yourusername/pdf-annotator.git

### 2. Backend Setup
cd backend

#### Install dependencies
npm install

#### Create environment file for backend
Create a .env file in the backend directory:

PORT = 
MONGODB_URL = =
JWT_SECRET = 
FRONTEND_URL = http://localhost:5173/

#### Start the backend server
npm run dev
# or
npm start

### 3. Frontend Setup

#### Open a new terminal and navigate to frontend directory
cd frontend

#### Install dependencies
npm install

#### Create environment file (optional)
API_BASE_URL =

#### Start the frontend development server
npm run dev

## 🎯 Usage

### 1. **Register/Login**
- Demo credentials (if you want to create them):
  - Email: test@gmail.com
  - Password: test123

## 🌐 Environment Variables

### Backend & Frontend

npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)
