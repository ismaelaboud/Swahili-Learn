# Learning Management System (LMS)

A comprehensive online learning platform built with Next.js, Express.js, and PostgreSQL.

## Features

- Course Management
- Content Creation (Text, Video, Quiz)
- Student Progress Tracking
- Rich Text Editor
- File Upload Support
- Interactive Quizzes

## Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- TipTap Editor
- UploadThing

### Backend
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- TypeScript

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd lms_system
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Backend (.env):
```
DATABASE_URL="postgresql://[user]:[password]@localhost:5432/lms_db"
JWT_SECRET="your-secret-key"
PORT=3001
```

Frontend (.env.local):
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

4. Initialize the database:
```bash
cd backend
npx prisma generate
npx prisma db push
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
