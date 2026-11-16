# Dental Prescription Generator (MVP)

A local-first prescription generator with editable clinical lists, a medicine catalogue,
clinic settings, and a print-ready A4 prescription.

## Stack
- React + Vite
- Node.js + Express
- MySQL (`mysql2`)
- Browser print-to-PDF 

## Requirements
- Node.js 20+
- MySQL 8+ (XAMPP MySQL is fine)
- npm

## 1. Database
Start MySQL in XAMPP, then import `database/schema.sql` using phpMyAdmin.
The script creates the `dental_prescription` database and sample editable options.
The sample medicine names/instructions are placeholders only; replace them with
a clinician-reviewed catalogue before clinical use.

## 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Edit `.env` with your MySQL username/password. Default API: http://localhost:5000

## 3. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Features
- Multi-select complaints, examination findings, diagnoses, investigations and advice.
- Add/edit/deactivate/delete selectable options from Settings.
- Add/edit/deactivate/delete medicines and their reusable instruction templates.
- Clinic name, doctor details, registration, contact information and footer settings.
- Print-ready A4 prescription. In the print dialog choose "Save as PDF".

## Important limitations before real clinic use
This is a development MVP, not a production-ready medical system. It intentionally has
no login, user permissions, audit trail, encrypted backups, or secure patient-record
storage. Do not expose it to the public internet or enter real patient data until
authentication, authorization, HTTPS, audit logging, backup/restore, privacy controls,
and a clinical review process have been implemented and tested.

The app does not diagnose or prescribe automatically. The clinician must review and
confirm every finding, diagnosis, medicine, dose, frequency and duration. Medicine
suggestions are catalogue entries only, not medical advice.
