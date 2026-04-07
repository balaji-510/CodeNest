# Email Configuration for Render Deployment

## Current Issue
Render's free tier has network restrictions that may block outgoing SMTP connections to Gmail (smtp.gmail.com:587), causing email sending to timeout.

## Solutions

### Option 1: Use Render's Paid Plan (Recommended for Production)
Upgrade to Render's paid plan which doesn't have SMTP restrictions.
- Cost: $7/month for web service
- Benefit: Full SMTP access, no cold starts, better performance

### Option 2: Use a Transactional Email Service (Best for Free Tier)
Replace Gmail SMTP with a service that provides HTTP API:

**Recommended Services:**
1. **SendGrid** (Free: 100 emails/day)
   - Sign up: https://sendgrid.com
   - Get API key
   - Install: `pip install sendgrid`
   
2. **Mailgun** (Free: 100 emails/day for 3 months)
   - Sign up: https://mailgun.com
   - Get API key
   
3. **Resend** (Free: 100 emails/day)
   - Sign up: https://resend.com
   - Modern, developer-friendly

### Option 3: Disable Email Verification Temporarily
For testing purposes only:
- Comment out OTP email sending
- Auto-verify all signups
- Add a note that email verification is disabled

## Quick Fix: Try Current Setup First

1. Redeploy backend on Render
2. Test OTP sending
3. If it still times out, implement Option 2 (SendGrid)

## Environment Variables Needed (Current Setup)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=codenestadmin@gmail.com
EMAIL_HOST_PASSWORD=opiv pnes occm ljwo
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

Make sure these are set in Render Dashboard → Backend Service → Environment
