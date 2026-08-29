# Wysa Assignment: Sleep Conversation Flow

This repository contains a full-stack web application designed for a state-driven conversation flow. The project is split into a React (Vite) frontend and a Node.js/Express backend connected to MongoDB.

## Tech Stack
*   **Frontend:** React, Vite, Tailwind CSS, Axios
*   **Backend:** Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT)

## Project Structure
*   `/frontend`: Contains the React application.
*   `/backend`: Contains the Node.js API server and database models.

---

## Local Setup Instructions

Follow these steps to run the application locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file in the `backend` directory is configured correctly:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. **Seed the Database:** Run the seed script to populate the database with the initial conversation flow graph.
   ```bash
   node seed.js
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Access the Application
Once both servers are running, open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`). 

*   Register a new user to begin the flow.
*   The application will enforce strict state transitions backed by the API.

---

## Deployment
See the deployment strategy documentation for deploying to Render (Backend) and Netlify(Frontend).
