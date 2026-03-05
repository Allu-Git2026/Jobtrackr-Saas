# JobTrackr – AI-Powered Job Application Tracker

JobTrackr is a full-stack web application that helps job seekers organize and track their job applications in one place.  
Users can log in, add job applications, track their status, and manage follow-ups using an intuitive dashboard.

The application provides a Kanban-style board and table view to visualize the entire job search process from saved opportunities to offers and rejections.

---

# Live Demo

Frontend  
https://jobtrackr-saas.vercel.app

Backend API  
https://jobtrackr-saas.onrender.com

---

# Features

User Authentication  
Secure login and registration system with Google OAuth integration.

Application Tracking  
Users can store details about job applications including company, role, location, and notes.

Kanban Board  
Applications are visually organized by status such as:

Saved  
Applied  
Interview  
Offer  
Rejected

Dashboard Analytics  
Displays summary statistics including:

Total Applications  
Applied Jobs  
Offers  
Interviews  
Rejections

Search and Filtering  
Users can search applications and filter by status or priority.

Follow-up Tracking  
Allows users to track follow-up dates for applications.

Responsive UI  
Modern dark-theme interface designed for usability.

---

# Tech Stack

Frontend  
React  
Vite  
JavaScript  
CSS

Backend  
Node.js  
Express.js

Database  
PostgreSQL  
Prisma ORM

Authentication  
Google OAuth

Deployment  
Frontend: Vercel  
Backend: Render

Version Control  
Git  
GitHub

---

# System Architecture

Frontend (React)
        |
        | REST API
        |
Backend (Node.js + Express)
        |
        | Prisma ORM
        |
PostgreSQL Database

The React frontend communicates with the Node.js backend using REST APIs.  
The backend manages business logic and interacts with PostgreSQL through Prisma ORM.

---

# Project Structure

client/
React frontend application

server/
Node.js backend API

prisma/
Database schema and migrations

routes/
API routes for authentication and applications

controllers/
Business logic for application management

---

# Core Functionalities

User Login and Authentication

Users can create an account or log in using Google authentication.  
JWT tokens are used to manage user sessions securely.

Application Management

Users can:

Add new job applications  
Update application status  
Delete applications  
View applications in a dashboard

Dashboard Metrics

The system calculates statistics dynamically to help users understand their job search progress.

---

# Installation (Local Setup)

Clone the repository

git clone https://github.com/Allu-Git2026/Jobtrackr-Saas.git

Navigate to the project

cd Jobtrackr-Saas

Install dependencies

Server

cd server
npm install

Client

cd client
npm install

---

# Environment Variables

Create a .env file inside the server folder.

Example:

DATABASE_URL=your_postgres_database_url

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

JWT_SECRET=your_jwt_secret

PORT=5001

---

# Run the Application

Start the backend server

cd server
npm run dev

Start the frontend

cd client
npm run dev

Frontend will run on:

http://localhost:5173

Backend will run on:

http://localhost:5001

---

# Deployment

Frontend deployed using Vercel.

Backend deployed using Render.

PostgreSQL database hosted in the cloud.

---

# Future Improvements

AI resume match scoring  
Email reminders for follow-ups  
Job scraping integration  
Interview preparation assistant  
Application analytics charts

---

# Author

Chaitanya Allu

Master's in Computer Science  
Aspiring Software Engineer

GitHub  
https://github.com/Allu-Git2026

---

# License

This project is open source and available for educational and portfolio use.
