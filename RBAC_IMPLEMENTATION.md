# Role-Based Access Control (RBAC) Implementation

## Overview

This implementation provides a comprehensive Role-Based Access Control system that manages user permissions through roles and protects routes and functionality based on user authorization levels.

## Roles Defined

### 1. **User** (Default)
- Basic access to dashboard and profile
- Can view their own information
- Default role for new registrations

### 2. **Moderator**
- All user permissions
- Can moderate content (future feature)
- Intermediate permission level

### 3. **Admin**
- Full system access
- User management capabilities
- Can promote/demote users
- Access to admin dashboard

## Implementation Details

### Database Schema

Users collection now includes:
```javascript
{
  _id: ObjectId,
  email: string,
  name: string,
  password?: string,        // For credential users
  role: "user" | "moderator" | "admin",
  oauthProvider?: string,   // For OAuth users
  googleId?: string,        // Google's unique ID
  createdAt: Date,
  updatedAt?: Date
}
```

### Authentication Flow

1. **Registration**: New users get `role: "user"` by default
2. **OAuth Sign-in**: OAuth users also get `role: "user"` by default
3. **Session**: Role is included in JWT and session
4. **Middleware**: Routes are protected based on role

### Security Features

#### ✅ **Server-Side Validation**
- Middleware checks roles before route access
- API routes validate admin permissions
- Session validation on all protected endpoints

#### ✅ **Client-Side UI**
- Role-based component rendering
- Admin-only navigation links
- Visual role indicators

#### ✅ **Database Security**
- Role field required for all users
- Default role assignment
- Role validation in API endpoints

## Protected Routes

### **Middleware Protection**
- `/dashboard/*` - Requires authentication
- `/profile/*` - Requires authentication  
- `/admin/*` - Requires admin role

### **API Protection**
- `/api/admin/users` - Admin only
- `/api/user/profile` - Authenticated users only

## Admin Features

### **User Management Interface**
- View all users in the system
- See user roles and authentication methods
- Promote/demote users between roles
- Real-time role updates

### **User Statistics**
- Total user count
- Role distribution (admins, moderators, users)
- Authentication method breakdown

## Usage Examples

### **Checking User Role in Components**
```typescript
const { data: session } = useSession();

if (session?.user?.role === "admin") {
  // Show admin features
}
```

### **Protected API Routes**
```typescript
const session = await getServerSession(authOptions);
if (!session || session.user.role !== "admin") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

### **Middleware Protection**
```typescript
// Automatically protects /admin/* routes
export const config = {
  matcher: ["/admin/:path*"]
};
```

## Promoting Users to Admin

### **Method 1: Database Direct Update**
```javascript
// In MongoDB shell or admin tool
db.users.updateOne(
  { email: "admin@example.com" }, 
  { $set: { role: "admin" } }
);
```

### **Method 2: Admin Interface**
1. Sign in as an existing admin
2. Navigate to `/admin/users`
3. Use the role dropdown to promote users

### **Method 3: API Call**
```bash
curl -X PATCH /api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id", "role": "admin"}'
```

## Security Best Practices

### ✅ **Implemented**
- Server-side role validation
- JWT token includes role information
- Middleware route protection
- API endpoint authorization
- No client-side role assignment

### 🔒 **Recommendations**
- Use HTTPS in production
- Implement role audit logging
- Regular security reviews
- Monitor admin actions
- Implement role expiration

## Testing Scenarios

### **Scenario 1: New User Registration**
1. User registers with email/password
2. Gets `role: "user"` by default
3. Can access dashboard but not admin areas

### **Scenario 2: Admin Access**
1. Admin signs in
2. Sees "Admin" link in navigation
3. Can access `/admin/users` page
4. Can manage other users' roles

### **Scenario 3: Role Promotion**
1. Admin promotes user to moderator
2. User immediately sees new permissions
3. Role badge updates in navigation

## Future Enhancements

1. **Role Hierarchies**: Nested permission systems
2. **Permission Granularity**: Fine-grained access control
3. **Role Expiration**: Temporary admin access
4. **Audit Logging**: Track role changes
5. **Multi-tenant Roles**: Organization-specific permissions 