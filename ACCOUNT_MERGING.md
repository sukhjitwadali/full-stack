# Account Merging Implementation

## Overview

This implementation handles the merging of accounts between OAuth (Google) and credential-based authentication to prevent duplicate user records and ensure a unified user experience.

## How It Works

### 1. Account Merging Logic

When a user signs in with Google OAuth:

1. **Check for existing user** by email address
2. **If user exists with credentials only**:
   - Link the Google OAuth account to the existing user
   - Update user record with OAuth provider information
   - Maintain the same user ID for consistency
3. **If user exists with OAuth already**:
   - Use existing account (no duplicate creation)
4. **If no user exists**:
   - Create new user account with OAuth information

### 2. Database Schema

Users collection now includes:

```javascript
{
  _id: ObjectId,
  email: string,
  name: string,
  password?: string,        // Only for credential users
  oauthProvider?: string,   // "google" for OAuth users
  googleId?: string,        // Google's unique ID
  image?: string,           // Profile image from Google
  createdAt: Date,
  updatedAt?: Date
}
```

### 3. Session Consistency

- All users (OAuth or credentials) use the same session format
- User ID is consistent across authentication methods
- Session includes user email, name, and ID

## Security Features

### ✅ Implemented Safeguards

1. **Email Verification**: OAuth providers verify email addresses
2. **Unique Email Constraint**: MongoDB prevents duplicate emails
3. **Session Validation**: Server-side session checks
4. **Provider Tracking**: Clear audit trail of authentication methods

### 🔒 Best Practices

- **No Automatic Merging**: Only merges when same email is used
- **Provider Verification**: Validates OAuth provider tokens
- **Secure Storage**: Passwords hashed, OAuth tokens not stored
- **Audit Logging**: Console logs for debugging and monitoring

## Testing Scenarios

### Scenario 1: New OAuth User
1. User signs up with Google OAuth
2. New user record created with `oauthProvider: "google"`
3. User can sign in with Google going forward

### Scenario 2: Existing Credential User + OAuth
1. User previously registered with email/password
2. User signs in with Google using same email
3. Existing account is linked with OAuth provider
4. User can now sign in with either method

### Scenario 3: Existing OAuth User
1. User has previously signed in with Google
2. User signs in again with Google
3. Existing account is used (no duplicate creation)

## Console Logs

The system logs important events:

```
Linked Google OAuth to existing credential account: user@example.com
Created new OAuth user: user@example.com
Existing OAuth user signed in: user@example.com
```

## User Profile Display

The dashboard shows:
- **Authentication Method**: Email/Password or Google OAuth
- **Account Creation Date**: When the account was first created
- **Last Updated**: When OAuth was linked (if applicable)
- **Google ID**: Google's unique identifier (for OAuth users)

## Future Enhancements

1. **Multiple OAuth Providers**: Support for GitHub, Facebook, etc.
2. **Account Linking UI**: Allow users to manually link accounts
3. **Profile Image Sync**: Update profile images from OAuth providers
4. **Account Deletion**: Safe account removal with data cleanup 