🚨 FraudEx — Explainable Financial Fraud Detection

FraudEx that analyzes financial documents to detect anomalies and risk indicators using transparent, explainable forensic techniques.

Instead of black-box AI, FraudEx highlights why a transaction looks suspicious — helping auditors and investigators focus on what matters most.

🧠 Problem

Auditing financial records is:

Time-consuming

Manual

Reactive

Suspicious transactions are often buried inside thousands of rows of data.

💡 Solution

FraudEx allows users to upload a financial report and instantly:

Detect anomalous transactions

Identify risky spending patterns

Visualize red flags

Generate an explainable risk summary

FraudEx does not accuse — it provides risk indicators to guide investigation.

✨ Key Features

📂 Upload financial CSV files

🔍 Statistical anomaly detection

📊 Benford’s Law analysis

🧮 Vendor concentration & duplicate detection

⚠️ Risk score with explanations

📄 Clear, auditor-friendly output

🧪 Detection Techniques Used

Benford’s Law deviation

Outlier detection (Z-Score / IQR)

Round-number payment analysis

Vendor concentration analysis

Duplicate transaction detection

All techniques are explainable and transparent.

🛠️ Tech Stack

Frontend

Next.js

Tailwind CSS

Backend

Python

FastAPI

📂 Project Structure
FraudEx/
├── frontend/        # Next.js + Tailwind UI
├── backend/         # FastAPI backend
├── sample_data/     # Demo datasets
├── README.md
└── .gitignore

▶️ How to Run Locally
Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload


Runs at: http://localhost:8000

Environment
Copy backend/.env.example to backend/.env and fill in Supabase + Gemini values before running the backend.

Frontend
cd frontend
npm install
npm run dev


Runs at: http://localhost:3000

🧪 Demo Instructions (For Judges)

Start backend & frontend

Upload a CSV file from sample_data/

Click Analyze

View:

Risk score

Highlighted suspicious transactions

Benford’s Law chart

Explanation panel

⏱️ Full demo takes under 2 minutes.

⚠️ Disclaimer

FraudEx provides risk indicators, not legal judgments.
Results are intended to assist auditors and investigators, not replace them.

🚀 Future Improvements

PDF parsing

OCR for scanned documents

Historical trend analysis

Role-based access

Exportable audit reports

👥 Team

Built with ❤️ by 

Siddhart: https://github.com/siddismyusername

Shubham: https://github.com/BShubhamxx

Jay: https://github.com/jayvaidya30
