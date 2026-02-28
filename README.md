BookBot 📚

BookBot is an AI-powered library management system built with React, FastAPI, and Supabase.
It allows administrators to manage books and members to browse, borrow, and receive AI-powered book recommendations.

🔗 Live Demo: https://bookbot-one.vercel.app/

✨ Features  

AI Features  

AI Assistant chat powered by Groq (Llama 3.3 70B)  
Automatic book metadata filling from title input  
AI-generated reading tips on dashboard  

Core Functionality  


Admin-only book CRUD operations  
Borrow & return system (14-day period)  
Overdue detection with visual indicators  
Role-based access (Admin / Member) 

🛠 Tech Stack    


Frontend: React + TypeScript + TailwindCSS

Backend: FastAPI

Database & Auth: Supabase (PostgreSQL + Google OAuth)

AI: Groq API (Llama 3.3 70B)

🚀 Running Locally  
1️⃣ Clone the repository  
git clone https://github.com/your-username/bookbot.git  
cd bookbot  
2️⃣ Backend Setup
cd bookbot-backend  
pip install -r requirements.txt  
uvicorn app.main:app --reload  

Create a .env file inside bookbot-backend:

DATABASE_URL=your_database_url  
SUPABASE_URL=your_supabase_url  
SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_KEY=your_service_key  
FRONTEND_URL=http://localhost:8080  
GROQ_API_KEY=your_groq_key  


Backend runs at:
👉 http://localhost:8000  


3️⃣ Frontend Setup  

cd bookbot-frontend  
npm install  
npm run dev  

Create a .env file inside bookbot-frontend:

VITE_API_URL=http://localhost:8000  
VITE_SUPABASE_URL=your_supabase_url  
VITE_SUPABASE_ANON_KEY=your_anon_key  


Frontend runs at:
👉 http://localhost:5173
 (or your Vite default)

📌 Notes

Requires Supabase project setup.  
Requires Groq API key for AI features.  
Admin role must be configured in the database.  
