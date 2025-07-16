# WhatsApp OTP Test

A comprehensive test suite for verifying WhatsApp OTP functionality using Supabase authentication. Available in both HTML and React versions.

## 🚀 Quick Setup

1. **Update your `.env` file** with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

2. **Start your development server:**
   ```bash
   npm run dev
   ```

## 📱 Two Ways to Test

### Option 1: React Component (Recommended)
**URL**: `http://localhost:5173/whatsapp-otp-test`

- ✅ **Automatically uses your `.env` configuration**
- ✅ **Two-step process: Send OTP → Verify OTP**
- ✅ **Real-time configuration validation**
- ✅ **Integrated with your existing Supabase setup**

### Option 2: Standalone HTML Page
**URL**: `http://localhost:5173/whatsapp-otp-test.html`

- ✅ **Works independently of your React app**
- ✅ **Manual configuration** (edit the HTML file directly)
- ✅ **Useful for debugging**
- ⚠️ **Requires manual credential setup** (edit lines 84-85 in the HTML file)

## 🔧 Features

### Send OTP Step
- **Phone number validation** (must include country code)
- **WhatsApp channel specification** (`options: { channel: 'whatsapp' }`)
- **Loading states** with progress indicators
- **Error handling** with detailed messages

### Verify OTP Step
- **6-digit OTP validation**
- **Automatic phone number matching**
- **Session data display** on successful verification
- **Detailed error reporting**

### UI/UX Features
- **Step-by-step process** with visual feedback
- **Color-coded results** (green for success, red for errors)
- **Reset functionality** to start over
- **Keyboard shortcuts** (Enter key support)
- **Responsive design** works on mobile and desktop

## 📋 Step-by-Step Usage

### 1. Send OTP
1. Enter your phone number (e.g., `+60164446716`)
2. Click "📱 Send WhatsApp OTP"
3. Wait for the success message
4. Check your WhatsApp for the 6-digit code

### 2. Verify OTP
1. Enter the 6-digit OTP from WhatsApp
2. Click "✅ Verify OTP"
3. Review the verification result
4. Check console for session details

### 3. Reset (if needed)
1. Click "🔄 Reset & Send New OTP"
2. Start over with a new OTP request

## 🔍 Expected Responses

### Send OTP Success
```json
{
  "success": true,
  "phone": "+60164446716",
  "data": {
    "user": null,
    "session": null
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Verify OTP Success
```json
{
  "success": true,
  "phone": "+60164446716",
  "data": {
    "user": {
      "id": "user-id",
      "phone": "+60164446716",
      "email": null,
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "expires_in": 3600,
      "token_type": "bearer"
    }
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "phone": "+60164446716",
  "error": {
    "message": "Token has expired or is invalid",
    "status": 400
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## ⚙️ Configuration Requirements

### Supabase Setup
1. **Enable Phone Authentication** in your Supabase dashboard
2. **Configure Twilio** for WhatsApp messaging
3. **Set up WhatsApp Business API** (if required)
4. **Update RLS policies** for authentication

### React Component Configuration
```env
# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### HTML File Configuration
Edit `public/whatsapp-otp-test.html` around lines 84-85:
```javascript
// Replace these with your actual credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your_anon_key_here';
```

## 🛠️ Implementation Details

### Send OTP Code
```javascript
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+60164446716',
  options: { 
    channel: 'whatsapp' // ✅ WhatsApp channel
  }
});
```

### Verify OTP Code
```javascript
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+60164446716',
  token: '123456',
  type: 'sms' // ✅ Always 'sms' for phone OTPs (even WhatsApp)
});
```

## 🐛 Troubleshooting

### Common Issues

**❌ "sendOTP is not defined" (HTML version)**
- This happens when there's a JavaScript error in the HTML file
- Make sure you've updated the `SUPABASE_URL` and `SUPABASE_ANON_KEY` constants
- Check the browser console for any JavaScript errors

**❌ "Please update your .env file" (React version)**
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart your development server after updating `.env`

**❌ "Phone number must include country code"**
- Use international format: `+60164446716`
- Don't use local format: `0164446716`

**❌ "OTP must be 6 digits"**
- Enter exactly 6 digits
- No spaces or special characters

**❌ "Token has expired or is invalid"**
- Request a new OTP (tokens expire quickly)
- Check the OTP code carefully

**❌ "Error sending OTP"**
- Verify Twilio WhatsApp configuration
- Check Supabase auth settings
- Ensure phone number is valid

### Debug Steps
1. **Check browser console** for detailed error messages
2. **Verify Supabase configuration** in the dashboard
3. **Test with Supabase CLI** if available
4. **Check Twilio logs** for delivery issues

## 📁 File Locations

- **React Component**: `src/components/WhatsAppOTPTest.tsx`
- **HTML Version**: `public/whatsapp-otp-test.html`
- **Route**: `/whatsapp-otp-test` (React app)
- **Environment**: `.env` (create if not exists)

## 🔗 Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Supabase Phone Auth](https://supabase.com/docs/guides/auth/phone-login)

---

**Note**: This test page is for development and testing purposes. Ensure proper security measures are in place before using in production.