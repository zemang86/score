# WhatsApp OTP Test Page

A simple test page to verify WhatsApp OTP functionality using Supabase authentication.

## How to Use

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Access the test page:**
   Open your browser and go to: `http://localhost:5173/whatsapp-otp-test.html`

3. **Fill in the required fields:**
   - **Supabase URL**: Your Supabase project URL (format: `https://YOUR_PROJECT.supabase.co`)
   - **Supabase Anon Key**: Your Supabase anonymous key
   - **Phone Number**: Pre-filled with `+60164446716` (as specified in your code)
   - **OTP Token**: Enter the 6-digit OTP you received via WhatsApp

4. **Click "Verify OTP"** to test the verification

## Features

- ✅ Clean, responsive UI using Tailwind CSS
- ✅ Form validation (checks for required fields and 6-digit OTP)
- ✅ Loading indicator during verification
- ✅ Color-coded results (green for success, red for errors)
- ✅ Detailed JSON response display
- ✅ Console logging for debugging
- ✅ Enter key support for quick testing

## Expected Response

**Success Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "session": { ... }
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Token has expired or is invalid",
    "status": 400
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Notes

- The phone number is set to `+60164446716` as specified in your code
- The OTP type is set to `'sms'` even though it's WhatsApp (as per Supabase documentation)
- Make sure your Supabase project is configured for phone authentication
- Ensure Twilio WhatsApp integration is properly set up in your Supabase dashboard

## Troubleshooting

- **"Please fill in all fields"**: Make sure all required fields are completed
- **"OTP must be 6 digits"**: Ensure the OTP token is exactly 6 digits
- **Network errors**: Check your Supabase URL and key are correct
- **Token expired**: Request a new OTP and try again quickly

## File Location

The test page is located at: `public/whatsapp-otp-test.html`