# Full-Stack Next.js Application

A comprehensive full-stack web application built with Next.js 15, featuring authentication, role-based access control, user management, and modern UI design.

## 🚀 Features

### Authentication & Authorization
- **Multi-provider Authentication**: Email/password and Google OAuth
- **Account Merging**: Seamless linking of OAuth and credential accounts
- **Role-Based Access Control (RBAC)**: User, Moderator, and Admin roles
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Secure JWT-based sessions

### User Management
- **User Registration**: Email/password registration with validation
- **Password Reset**: Secure email-based password reset functionality
- **User Profiles**: Detailed user information and authentication history
- **Admin Dashboard**: Complete user management interface
- **Role Management**: Real-time role promotion/demotion

### Security Features
- **Password Hashing**: Bcrypt-based password security
- **Email Verification**: OAuth provider email verification
- **Session Validation**: Server-side session checks
- **Route Protection**: Middleware-based authorization
- **Audit Logging**: Comprehensive system logging

### Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Email**: Nodemailer with SMTP
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Google OAuth credentials (optional)
- SMTP server for email functionality

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd full-stack-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-key-here

   # MongoDB Connection
   MONGODB_URI=your-mongodb-connection-string

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Email Configuration (Optional)
   SMTP_SERVER=your-smtp-server
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   ```

4. **Generate a secure secret**
   ```bash
   openssl rand -base64 32
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
full-stack-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── admin/         # Admin-only endpoints
│   │   │   ├── user/          # User profile endpoints
│   │   │   ├── register/      # User registration
│   │   │   └── reset/         # Password reset
│   │   ├── admin/             # Admin pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── reset/             # Password reset pages
│   ├── components/            # Reusable components
│   ├── lib/                   # Utility libraries
│   └── middleware.ts          # Route protection
├── public/                    # Static assets
└── docs/                      # Documentation files
```

## 🔐 Authentication System

### Supported Providers
- **Credentials**: Email/password authentication
- **Google OAuth**: Social login with Google

### Account Merging
The system automatically handles account merging when users sign in with Google using an email that already exists in the system:
- Links OAuth accounts to existing credential accounts
- Maintains consistent user IDs across authentication methods
- Preserves user data and roles

### Session Management
- JWT-based sessions with 30-day expiration
- Automatic session updates every 24 hours
- Secure session validation on all protected routes

## 👥 Role-Based Access Control

### User Roles
1. **User** (Default): Basic access to dashboard and profile
2. **Moderator**: Enhanced permissions for content moderation
3. **Admin**: Full system access and user management

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires admin role
- `/profile/*` - Requires authentication

## 🎯 Key Features

### User Registration
- Email validation and duplicate checking
- Secure password hashing with bcrypt
- Automatic role assignment (default: user)

### Password Reset
- Secure token generation
- Email-based reset links
- 1-hour token expiration
- SMTP integration for reliable delivery

### Admin Dashboard
- Complete user management interface
- Real-time role updates
- User statistics and analytics
- Authentication method tracking

### User Profiles
- Detailed account information
- Authentication method display
- Account creation and update timestamps
- Google OAuth integration details

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `POST /api/register` - User registration
- `POST /api/reset` - Password reset request
- `POST /api/reset/[token]` - Password reset confirmation

### User Management
- `GET /api/user/profile` - Get user profile data
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/role` - Update user role (admin only)

### Debug & Testing
- `GET /api/debug/user` - Debug user session
- `GET /api/test-db` - Test database connection

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
MONGODB_URI=your-production-mongodb-uri
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
SMTP_SERVER=your-production-smtp-server
SMTP_USER=your-production-smtp-user
SMTP_PASS=your-production-smtp-password
```

## 🔒 Security Considerations

### Implemented Security Features
- Password hashing with bcrypt
- JWT session management
- Route protection with middleware
- Server-side role validation
- Email verification for OAuth
- Secure token generation for password reset

### Best Practices
- Use HTTPS in production
- Keep environment variables secure
- Regular security updates
- Monitor admin actions
- Implement audit logging

## 📚 Additional Documentation

- [Account Merging Guide](ACCOUNT_MERGING.md) - Detailed account linking implementation
- [RBAC Implementation](RBAC_IMPLEMENTATION.md) - Role-based access control details
- [Google OAuth Setup](GOOGLE_OAUTH_SETUP.md) - OAuth configuration guide

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Schema
```javascript
// Users Collection
{
  _id: ObjectId,
  email: string,
  name: string,
  password?: string,        // For credential users
  role: "user" | "moderator" | "admin",
  oauthProvider?: string,   // For OAuth users
  googleId?: string,        // Google's unique ID
  image?: string,           // Profile image
  createdAt: Date,
  updatedAt?: Date
}

// Password Resets Collection
{
  _id: ObjectId,
  userId: ObjectId,
  token: string,
  expires: Date,
  createdAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation files
2. Review the console logs for debugging
3. Check the browser's network tab for API errors
4. Verify environment variables are set correctly

---

**Built with ❤️ using Next.js, React, TypeScript, and MongoDB**
