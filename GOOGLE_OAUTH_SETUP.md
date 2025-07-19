# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Developer Console](https://console.developers.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web Application** and provide:
   - **Authorized JavaScript Origins**: `http://localhost:3000`
   - **Authorized Redirect URI**: `http://localhost:3000/api/auth/callback/google`
6. Save the **Client ID** and **Client Secret**

## Step 2: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://full-stack-9rzy.vercel.app/
NEXTAUTH_SECRET=your-random-secret-key-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string
```

## Step 3: Generate a Secure Secret

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use an online generator for development.

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected to the dashboard

## Security Notes

- Use HTTPS in production
- Keep your client secret secure
- Update authorized origins for production domains
- Consider using environment-specific OAuth apps 