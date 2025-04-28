# Authentication and Authorization built with Encore


## Project Structure

```
/encore_jwt
├── encore.app
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
├── encore.service.ts           // Service definition
│
├── auth                        // Authentication system
│   ├── jwt.ts                  // JWT handling
│   ├── 2fa.ts                  // 2FA implementation
│
├── user                         // User management system
│   ├── users.ts                // User operations
│   └── types.ts                // User and auth types
│
├── api                          // API gateway system
│   ├── api.ts                  // API endpoints
│   └── gateway.ts              // Gateway configuration
│
└── migrations                   // Database migrations
    ├── 001_auth_tables.up.sql
    ├── 002_add_email_verified_column.up.sql
    ├── 003_add_user_role_column.up.sql
    ├── 007_add_2fa_columns.up.sql
    ├── 008_add_otp_cleanup.up.sql
    └── 009_add_roles.up.sql
```


### Authentication System
- JWT-based authentication
- Two-Factor Authentication (2FA)
- Email verification
- Password reset functionality
- Session management
- Role-based access control

### User Management
- User registration and profile management
- Role assignment and management

### API Gateway
- Centralized API routing
- Request validation
- Rate limiting
- Error handling
- API documentation

## Tech Stack

### Backend
- **Framework**: Encore
- **Language**: TypeScript
- **Database**: PostgreSQL

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: React Context
- **UI Components**: Custom components

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Encore CLI

### Backend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```
4. Run migrations:
   ```bash
   encore run migrate
   ```
5. Start the development server:
   ```bash
   encore run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API documentation is available at `/api/docs` when running the server.

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `POST /auth/2fa/enable` - Enable 2FA
- `POST /auth/2fa/verify` - Verify 2FA
- `POST /auth/reset-password` - Password reset

### User Endpoints
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/roles` - Get user roles
- `PUT /user/roles` - Update user roles

## Security Features
- JWT token-based authentication
- Two-factor authentication support
- Password hashing with bcrypt
- CORS protection
- SQL injection prevention
- XSS protection

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
