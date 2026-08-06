# OTP Email Delivery Analysis

## Goal
Analyze the frontend and backend code to identify all possible causes why OTP email sending appears to fail from the frontend, without changing any application code.

---

## Summary of findings

The most likely issue is not in the React request logic itself, but in how the frontend routes `/api/auth` requests to the backend. The frontend code is fine in terms of calling the API, but the Docker/nginx proxy configuration likely points to the wrong backend target.

Secondary issues include backend email delivery timing and SMTP environment correctness, which can make frontend OTP actions appear slow or fail if the backend waits for email delivery.

---

## Frontend analysis

### Auth API requests

`Frontend/src/api/auth.api.js` defines a single axios instance:

```js
const authApi = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});
```

This means all frontend OTP actions depend on `/api/auth` being proxied correctly to the backend.

### OTP-related pages use the correct API calls

- `Register.jsx` calls `registerUserApi(payload)` to POST `/api/auth/register`
- `VerifyEmail.jsx` calls `resendRegistrationOtpApi(payload)` to POST `/api/auth/resend-registration-otp`
- `ForgotPassword.jsx` calls `forgotPasswordRequestApi(payload)` to POST `/api/auth/forgot-password/send-otp`

There is no obvious payload mismatch in these frontend calls.

### Potential frontend issues

- `VerifyEmail.jsx` sends `payload = { email: email, otp: otp }` to `resendRegistrationOtpApi`, but the backend only needs `email`. This is not a blocking issue, but the extra `otp` field is unnecessary.
- There is no `proxy` configuration in `vite.config.js` to forward `/api` in local dev. That means in Vite dev mode, the frontend would only work if a dev proxy or backend host were configured elsewhere.

### Important frontend routing issue

The frontend Docker/Nginx config in `Frontend/nginx/default.conf` routes API requests to:

```nginx
location /api/ {
    proxy_pass https://qwikcart-backend.onrender.com;
    proxy_ssl_server_name on;
    proxy_http_version 1.1;
    proxy_set_header Host qwikcart-backend.onrender.com;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

This is a likely root cause if your frontend is served from Docker locally:

- `docker-compose.yaml` brings up a local backend service on `backend:3000`.
- The frontend container should proxy to the local backend service, not `https://qwikcart-backend.onrender.com`.
- If `qwikcart-backend.onrender.com` is unreachable or is a different deployment than your local backend, frontend `/api/auth` calls will fail even though the backend works via Postman directly.

This mismatch means:

- Postman testing directly against the backend may succeed.
- Frontend browser requests may still fail because nginx is forwarding them to the wrong target.

---

## Backend analysis

### Email sending implementation

`Backend/src/services/email.service.js` currently uses Gmail SMTP via nodemailer:

```js
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

Potential backend causes:

- If `EMAIL_USER` or `EMAIL_PASS` are wrong or not available in the environment, SMTP will fail.
- Gmail SMTP can also block connections from Docker containers or unfamiliar hosts.
- The service verifies the connection at startup, but only logs the result; it does not change request routing.

### Backend route behavior

`Backend/src/controllers/auth.controller.js` defines:

- `POST /register` which creates the user and then calls `await sendRegistrationMail(...)`
- `POST /verify-otp` to verify the OTP
- `POST /forgot-password/send-otp` to trigger forgot-password OTP email
- `POST /forgot-password/reset` to reset password
- `POST /resend-registration-otp` to resend OTP

The backend route definitions match the frontend API endpoints.

### Backend performance issue

`registerController` currently awaits `sendRegistrationMail` before responding. That can make registration look slow if SMTP takes time.

If the frontend user sees a long delay after signup, it may be because the backend is waiting for email delivery before returning `201`.

The `forgotPasswordRequest` route calls `sendForgotPasswordMail` without `await`, but the registration route does wait.

### Error mode from user context

Your earlier error showed an SMTP timeout:

```
Error: Connection timeout
code: 'ETIMEDOUT'
command: 'CONN'
```

That error is backend-side, often caused by:

- network/firewall blocking outbound SMTP
- incorrect SMTP server/port
- Gmail blocking access from the container
- connection to the wrong email host

This would appear as an OTP failure from the frontend if the backend cannot send the mail.

---

## Deployment / environment implications

### Docker compose vs nginx proxy mismatch

The `docker-compose.yaml` file defines local containers:

- `backend` on `3000`
- `frontend` on `80`

But the frontend proxy config is not pointing at the local backend service. That is the strongest candidate for a frontend-only failure.

### Local backend access and Postman

If you tested the backend with Postman against `http://localhost:3000`, that proves the backend can work in that environment.

However, it does not prove the frontend is using the same backend endpoint. The frontend may still be proxying to a different host or wrong domain.

### No Vite proxy config for development

`vite.config.js` contains only file-watch settings and no proxy config. In development mode, this means frontend requests to `/api/auth` must be handled by the dev server or by explicit proxy configuration elsewhere.

If your frontend is run via Dockerized nginx, the only proxy path is in `Frontend/nginx/default.conf`.

---

## Most likely causes

1. **Frontend proxy configuration is wrong**
   - `location /api/` forwards to `https://qwikcart-backend.onrender.com` instead of the local backend container, which likely breaks frontend OTP requests.

2. **Frontend and backend are not on the same network target**
   - Your local `docker-compose` deployment expects backend at `backend:3000`, but nginx is not configured for that.

3. **Backend waits for SMTP delivery on registration**
   - `POST /register` awaits `sendRegistrationMail(...)`, so the registration request may be slow if email delivery is delayed.

4. **Backend SMTP/network issue**
   - The error `ETIMEDOUT` indicates the backend could not connect to Gmail SMTP in some environment. This is a backend email issue, not frontend code.

---

## Recommendations

### If you want to fix routing without code changes to app logic

- In local Docker, configure `Frontend/nginx/default.conf` to proxy to the local backend service, e.g. `http://backend:3000` instead of `https://qwikcart-backend.onrender.com`.
- Or run the frontend dev server with a proper Vite proxy for `/api` to `http://localhost:3000`.

### If you want to isolate the failure

- Test frontend API calls in browser network tab and confirm whether `/api/auth/register` is reaching backend or returning proxy/host errors.
- Compare the URL used by frontend requests with the backend service address you test in Postman.

### If email still fails after routing is fixed

- Verify backend env variables: `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST`, `EMAIL_PORT`.
- Check backend logs for nodemailer SMTP errors.
- Use a test account or Ethereal mail to confirm email sending independently.

---

## Conclusion

Your frontend OTP behavior is likely caused by request routing/proxy misconfiguration rather than the React OTP submission logic. The backend route definitions and frontend API calls are aligned, but the nginx proxy host in `Frontend/nginx/default.conf` does not match the local Docker backend.

If frontend OTP still does not work after fixing proxy routing, the next issue is backend SMTP connectivity (`ETIMEDOUT`) and Gmail SMTP environment settings.
