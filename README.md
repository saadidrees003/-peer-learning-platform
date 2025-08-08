# Peer Learning Platform

AI-powered peer learning platform that pairs students based on performance to improve weaker students through collaborative learning.

## Features

### 1. Smart Student Pairing
- Upload CSV/XLSX result sheets
- AI pairs high-performers with low-performers
- Teacher can edit/approve pairs
- Auto-regenerate pairs if no improvement detected

### 2. AI Lesson Summarization  
- Upload PDF textbooks once, reuse multiple times
- Specify page ranges taught per session
- Generate grade-appropriate summaries in simple English
- Save summaries linked to specific lessons

### 3. Performance Tracking
- Compare before/after peer learning results
- Dashboard showing improvement trends per student/pair
- Identify which pairings are most effective

### 4. Adaptive Pairing
- System detects lack of improvement automatically
- Suggests new pairings when current ones aren't working
- Teacher maintains override control

## User Stories

### User Story 1: Upload Result Sheet & Generate Pairs
As a teacher, I should be able to upload my class's result sheet for a subject so that AI can pair higher-performing students with lower-performing students for peer learning.

### User Story 2: Upload PDF Book & Generate Lesson Summary
As a teacher, I should be able to upload a PDF book and specify which pages I taught so that AI can create a short summary for peer teaching.

### User Story 3: Track Student Performance Trends
As a teacher, I should be able to upload a new result sheet so that I can see whether students have improved after peer learning.

### User Story 4: Auto-Adjust Pairs Based on No Improvement
As a teacher, I should be able to let AI automatically suggest new pairs if weaker students are not improving.

## Tech Stack

- Frontend: React.js + Vite
- Backend: Node.js/Express
- Database: MongoDB/PostgreSQL
- AI/ML: OpenAI API or similar
- File Processing: Multer for uploads

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
