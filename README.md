# Student Management System (RBAC) – Full Stack

Tech Stack:
- Frontend: Next.js (TypeScript, TSX) + ShadCN UI
- Backend: Node.js + Express + Prisma + MySQL
- Authentication: JWT
- Authorization: Role-based (ADMIN, USER)

---

## Features

### Admin
- Create, update, and soft-delete any student.
- Can view all students including inactive (`isActive = false`).
- Can see student details: Rank, Name, Email, Course, Year, Score, Active status.
- Pagination: 10 students per page.

### User / Viewer
- Can only view **active** students (`isActive = true`).
- Can filter by Name, Email, Course, and Graduation Year.
- Students displayed in descending order of **marks** (highest first).
- Pagination: 10 students per page.

---

## Run

## Environment Configuration (.env)

Create a `.env` file in your **backend** folder with the following content:

```env
# MySQL Database URL
DATABASE_URL="mysql://root:Shreyash1%40%23@localhost:3306/sms"

# JWT Secret for authentication
JWT_SECRET="your_jwt_secret_here"

# Backend server port
PORT=4000

root → MySQL username

Shreyash1%40%23 → MySQL password (Shreyash1@# URL-encoded as %40%23)

localhost → Database host

3306 → Database port

sms → Database name

JWT_SECRET → Use a strong secret for signing JWT tokens

PORT → Port your backend server will run on
```

### Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
API Base: `http://localhost:4000`

### Frontend
```bash
cd frontend
cp env.example .env.local
npm install
npm run dev
```
App: `http://localhost:3000`

---
## Screenshots

### Signup Viewer or User
<img src="images/signup.png" alt="Admin Dashboard" width="400"/>

### Login for Viewer or Admin
<img src="images/login.png" alt="User Dashboard" width="400"/>

### Dashboard for Admin
<img src="images/AdminView.png" alt="Create Student Form" width="400"/>

### User View
<img src="images/UserView.png" alt="Student List" width="400"/>

## API Endpoints

### 1. Auth Routes

#### Register User
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "role": "USER"
}
```

#### Login User
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

### 2. Student Routes (Protected – JWT Required)
**Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

#### Get Students
```
GET /api/students
```
**Query Params (Optional):**
```
page=1
limit=10
q=search_text   // search name/email
course=B.Tech
year=2026
```

**Response (ADMIN sees all, USER sees active only):**
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "data": [
    {
      "id": 1,
      "fullName": "Alice",
      "email": "alice@example.com",
      "course": "B.Tech",
      "graduationYear": 2025,
      "score": 95,
      "isActive": true,
      "ownerId": 1,
      "rank": 1
    }
  ]
}
```

#### Create Student (ADMIN Only)
```
POST /api/students
```
**Body:**
```json
{
  "fullName": "Bob Smith",
  "email": "bob@example.com",
  "course": "MCA",
  "graduationYear": 2026,
  "score": 88
}
```

**Response:**
```json
{
  "message": "Student created successfully",
  "student": {
    "id": 2,
    "fullName": "Bob Smith",
    "email": "bob@example.com",
    "course": "MCA",
    "graduationYear": 2026,
    "score": 88,
    "isActive": true,
    "ownerId": 1
  }
}
```

#### Update Student (ADMIN Only)
```
PUT /api/students/:id
```
**Body:**
```json
{
  "fullName": "Bob S.",
  "score": 90,
  "isActive": false
}
```

**Response:**
```json
{
  "message": "Student updated successfully",
  "student": {
    "id": 2,
    "fullName": "Bob S.",
    "email": "bob@example.com",
    "course": "MCA",
    "graduationYear": 2026,
    "score": 90,
    "isActive": false,
    "ownerId": 1
  }
}
```

#### Soft Delete Student (ADMIN Only)
```
DELETE /api/students/:id
```
**Response:**
```json
{
  "message": "Student deleted successfully",
  "student": {
    "id": 2,
    "fullName": "Bob S.",
    "email": "bob@example.com",
    "course": "MCA",
    "graduationYear": 2026,
    "score": 90,
    "isActive": false,
    "ownerId": 1
  }
}
```

---

### Notes
- **Ranking:** Dense ranking is applied: highest marks = rank 1, ties share rank, next distinct score +1.  
- **Pagination:** 10 students per page.  
- **Filtering:** Users can filter by `name/email`, `course`, or `year`.  
- **RBAC:**  
  - ADMIN          → Full CRUD, see active & inactive.  
  - VIEWER OR USER → View only active students.

