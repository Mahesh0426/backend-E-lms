# 🎓 GyanX Server — E-Learning Backend API

The backend REST API for the **GyanX Personalized E-Learning Management System**. Built with Node.js, Express, and MongoDB, this server handles authentication, course management, student progress tracking, assessments, payments, and personalized course recommendations powered by TensorFlow.js.

## 🔗 Related Repositories

- **Frontend:** [https://github.com/Mahesh0426/fronten-E-lms](https://github.com/Mahesh0426/fronten-E-lms)

## 🌐 Live Demo

[View Live Application](https://www.gyanx.cloud/)

---

## ✨ Features

- 🔒 **Authentication & Authorization** — JWT-based access/refresh token auth with role-based access control (Student, Instructor, Admin)
- 📚 **Course Management** — Full CRUD for courses with advanced search, filtering, and sorting
- 📈 **Student Progress Tracking** — Track course enrollment, lecture completion, and learning progress
- 🧠 **Personalized Recommendations** — TensorFlow.js-powered ML model for tailored course suggestions
- 📝 **Quizzes & Assignments** — Create, manage, and grade assessments with a marks tracking system
- 💳 **PayPal Payments** — Integrated PayPal SDK for course purchases and order management
- 🖼️ **Cloudinary Media Uploads** — Image and video file uploads via Multer + Cloudinary
- ⭐ **Course Reviews** — Students can rate and review courses
- 📧 **Email Notifications** — Transactional emails via Nodemailer (Brevo SMTP)

---

## 💻 Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Runtime        | Node.js 22 (ES Modules)                         |
| Framework      | Express.js                                      |
| Database       | MongoDB Atlas (Mongoose ODM)                    |
| Authentication | JWT (Access + Refresh Tokens), bcrypt.js         |
| File Uploads   | Multer + Cloudinary                             |
| Payments       | PayPal REST SDK                                 |
| ML Engine      | TensorFlow.js (`@tensorflow/tfjs`)              |
| Email          | Nodemailer (SMTP via Brevo)                     |
| Containerization | Docker, Docker Compose                        |

---

## 📂 Project Structure

```
Server/
├── server.js              # Entry point — Express app setup & route mounting
├── config/                # Database connection configuration
├── Router/                # API route definitions
│   ├── useRouter.js       # User auth routes (signup, login, profile)
│   ├── courseRouter.js     # Course CRUD routes
│   ├── uploadRouter.js    # File upload routes (Cloudinary)
│   ├── quizRouter/        # Quiz management routes
│   ├── assignmentRouter/  # Assignment management routes
│   ├── marksRouter/       # Marks & grading routes
│   └── studentRouter/     # Student-specific routes
│       ├── studentCourseRouter.js    # Course browsing & enrollment
│       ├── orderRouter.js            # PayPal payment & orders
│       ├── myCoursesRouter.js        # Purchased courses
│       ├── courseProgressRouter.js    # Lecture progress tracking
│       └── reviewRouter.js           # Course reviews & ratings
├── Schema/                # Mongoose schema definitions
├── model/                 # Database model operations
├── middleware/            # Auth middleware (JWT verification)
├── utility/               # Helper functions
│   ├── bcryptHelper.js    # Password hashing
│   ├── jwtHelper.js       # Token generation & verification
│   ├── nodemailerHelper.js # Email sending
│   ├── paymentHelper.js   # PayPal integration
│   ├── filter&SortingHelper.js # Query filtering & sorting
│   └── reponseHelper.js   # Standardized API responses
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Container orchestration
└── .env                   # Environment variables (not committed)
```

---

## 🛣️ API Endpoints

| Method   | Endpoint                         | Description                     |
| -------- | -------------------------------- | ------------------------------- |
| `*`      | `/api/user`                      | Auth & user management          |
| `*`      | `/api/course`                    | Course CRUD                     |
| `*`      | `/api/upload`                    | Media file uploads              |
| `*`      | `/api/studentCourse`             | Student course browsing         |
| `*`      | `/api/order`                     | PayPal orders & payments        |
| `*`      | `/api/student/my-courses`        | Enrolled courses                |
| `*`      | `/api/student/course-progress`   | Lecture progress tracking       |
| `*`      | `/api/quiz`                      | Quiz management                 |
| `*`      | `/api/assignment`                | Assignment management           |
| `*`      | `/api/marks`                     | Marks & grading                 |
| `*`      | `/api/reviews`                   | Course reviews & ratings        |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=8000
CLIENT_ROOT_URL=http://localhost:5173

# Database
DB_CONNECT_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/

# JWT Secrets
JWT_ACCESS_SECRET=<your-access-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# PayPal
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_CLIENT_SECRET=<your-paypal-client-secret>

# Email (SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>
SENDER_MAIL=<your-sender-email>
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **Yarn** (v1)
- **MongoDB Atlas** account (or local MongoDB instance)

### Local Development

```bash
# 1. Install dependencies
yarn install

# 2. Create .env file with your credentials (see above)

# 3. Start development server (with hot-reload)
yarn dev
```

The server will start at **http://localhost:8000**.

---

## 🐳 Docker

### Build & Run with Docker

```bash
# Build the image
docker build -t gyanx-server .

# Run the container
docker run -p 8000:8000 --env-file .env gyanx-server
```

### Run with Docker Compose

```bash
docker compose up --build
```

This will start the server container with all environment variables loaded from `.env`.

---

## 📜 Scripts

| Command      | Description                              |
| ------------ | ---------------------------------------- |
| `yarn dev`   | Start dev server with Nodemon hot-reload |
| `yarn start` | Start production server with Node        |
| `yarn build` | Compile TypeScript (if applicable)       |

---

## 📄 License

This project is licensed under the **MIT License**.
