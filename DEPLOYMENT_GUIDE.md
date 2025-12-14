# 🚀 Deployment Guide: Cold Calling App

This guide will walk you through deploying your **Client (Vite/React)** to **Vercel** and your **Server (Node/Express)** to **Render**. Both platforms offer generous free tiers.

---

## 📋 Prerequisites

1.  **GitHub Account**: You need to push your code to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Render Account**: Sign up at [render.com](https://render.com).
4.  **Database**: A PostgreSQL database. You can create one for free on [Render](https://render.com) (New -> PostgreSQL) or [Neon.tech](https://neon.tech).

---

## 1️⃣ Push to GitHub

Ensure your code is safe and updated on GitHub.

```bash
git add .
git commit -m "Prepared for deployment: Updated API URL and added render blueprint"
git push origin master
```

---

## 2️⃣ Deploy Server (Render)

We will deploy the backend first because the frontend needs the backend URL.

1.  **Create Service**:
    *   Go to your [Render Dashboard](https://dashboard.render.com).
    *   Click **New +** -> **Blueprints**.
    *   Connect your GitHub repository.
    *   Render will detect the `server/render.yaml` file. Click **Apply**.
2.  **Configure Environment Variables**:
    *   Render will ask for values for the environment variables defined in `render.yaml`.
    *   Fill in the details using your local `.env` values (except `DATABASE_URL` if you are creating a new one on Render).

    > **Required Variables:**
    > *   `TWILIO_ACCOUNT_SID`
    > *   `TWILIO_AUTH_TOKEN`
    > *   `TWILIO_API_KEY`
    > *   `TWILIO_API_SECRET`
    > *   `TWILIO_TWIML_APP_SID`
    > *   `TWILIO_CALLER_ID`
    > *   `ELEVENLABS_API_KEY`
    > *   `ELEVENLABS_AGENT_ID`
    > *   `BASE_URL` (Wait! You will get this *after* the first deploy starts, it will look like `https://cold-calling-server.onrender.com`. For now, put a placeholder or your ngrok url).
    > *   `DATABASE_URL` (The External Connection String from your hosted database).

3.  **Deploy**:
    *   Click **Apply Changes**. Render will start building your server.
    *   Once confirmed, copy your new **Server URL** (e.g., `https://your-app-name.onrender.com`).
    *   **CRITICAL**: Go back to the **Environment** tab in Render and update `BASE_URL` to this real URL.

---

## 3️⃣ Configure Twilio

Now that your server has a public URL, tell Twilio to use it.

1.  Go to the [Twilio Console](https://console.twilio.com).
2.  Navigate to **Phone Numbers** -> **Manage** -> **Active Numbers**.
3.  Click your phone number.
4.  Scroll to **Voice & Fax**.
5.  Under **A Call Comes In**, choose **Webhook**.
6.  Paste your Render Server URL with the path: `https://your-app-name.onrender.com/voice/start`
7.  **Save**.

---

## 4️⃣ Deploy Client (Vercel)

Now we deploy the frontend.

1.  **Import Project**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **Add New...** -> **Project**.
    *   Import your GitHub repository.
2.  **Configure Build**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click `Edit` and select `client`. (This is import!)
3.  **Environment Variables**:
    *   Expand the **Environment Variables** section.
    *   Add: `VITE_API_URL`
    *   Value: Your Render Server URL (e.g., `https://your-app-name.onrender.com`). **IMPORTANT**: Do not add a trailing slash `/`.
4.  **Deploy**:
    *   Click **Deploy**.
    *   Wait for the build to finish. You will get a live URL (e.g., `https://your-app.vercel.app`).

---

## ✅ Deployment Complete!

Visit your Vercel URL. Your app should now be live, enabling you to upload Excel sheets, configure prompts, and make AI calls entirely from the cloud!
