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
```Ranking Logic

We used Dense Ranking for student scores:

Step 1: Fetch all students (active only for USER, active + inactive for ADMIN).

Step 2: Sort students by score in descending order.

Step 3: Assign ranks:

First student gets Rank 1.

If multiple students have the same score, they share the same rank.

The next different score increases the rank by +1 (not skipping).

Example
Name	Score	Rank
Alice	98	1
Bob	95	2
Carol	95	2
Dave	92	3
Eve	90	4

Alice has the highest score → Rank 1.

Bob & Carol both scored 95 → they share Rank 2.

Dave’s score (92) is next distinct → Rank 3.

Eve gets Rank 4.

This ensures fairness and avoids rank gaps.

Challenges Faced & Solutions
1. RBAC Enforcement

Challenge: Ensuring that USER could only modify their own data, while ADMIN had full control.

Solution: Implemented middleware that:

Decodes JWT, attaches req.user.

Checks ownership (student.ownerId === req.user.id) for USER.

Grants override to ADMIN.

2. Ranking Calculation

Challenge: Prisma/MySQL does not provide a built-in dense ranking function that works well with filtering/pagination.

Solution:

Retrieved filtered results.

Sorted in memory by score.

Applied custom dense ranking algorithm in Node.js.

Attached rank before sending response.

3. Soft Delete vs Hard Delete

Challenge: Users wanted to "delete" students but keep history.

Solution: Added isActive field instead of removing records.

ADMIN sees both active/inactive.

USER sees only active.

4. Frontend RBAC UI

Challenge: Preventing USER from seeing admin-only buttons (edit/delete for others).

Solution:

Used user.role from JWT payload in frontend state.

Conditionally rendered buttons.

Also validated again in backend for security.

5. Password Security

Challenge: Storing credentials securely.

Solution: Used bcryptjs for hashing before saving to DB.

Login compares with hash.

Tokens are signed with JWT_SECRET.

6. Pagination & Filtering

Challenge: Combining search, filters, and pagination without performance loss.

Solution: Prisma’s where + skip + take queries, with dynamic filtering (name, email, course, year).```

