
# 🚀 AutoCosmic Website Deployment Guide (Beginner Friendly)

Yeh guide un logo ke liye hai jo pehli baar **React (Vercel)** aur **Node.js (Railway)** par website deploy kar rahe hain. Bas in steps ko dhyaan se follow karein.

---

## 🏗 Architecture (Yeh kaise kaam kar raha hai?)

Apki website 2 hisson mein bati hui hai (Split Deployment):

1.  **Frontend (Vercel par):**
    *   Yeh wo hissa hai jo user ko dikhta hai (Design, Buttons, Pages).
    *   Yeh `index.html` aur `src` folder se banta hai.
2.  **Backend (Railway par):**
    *   Yeh **"Serverless" nahi hai**. Yeh ek **Dedicated Server** hai jo 24/7 chalta hai.
    *   Main file: `backend/server.js`.
    *   Yeh Database (MongoDB) se juda rehta hai aur Frontend ko data bhejta hai.

---

## ✅ Step 1: Tayari (Preparation)
Deploy karne se pehle yeh 3 accounts bana lein (sab free hain):
1.  **GitHub:** [github.com](https://github.com/) (Code store karne ke liye).
2.  **Railway:** [railway.app](https://railway.app/) (Backend aur Database ke liye).
3.  **Vercel:** [vercel.com](https://vercel.com/) (Frontend website ke liye).

---

## 📂 Step 2: Code ko GitHub par dalna
Sabse pehle apna code internet par dalna hoga.

1.  **GitHub** par login karein.
2.  Top-right corner mein **+** sign par click karein aur **"New repository"** chunein.
3.  Repository ka naam dein (e.g., `autocosmic-shop`) aur **"Create repository"** par click karein.
4.  Ab apne computer par code folder mein jayein. Agar aapko Git commands aati hain toh push kar dein.
5.  **Agar Git nahi aata (Sabse Aasaan Tarika):**
    *   GitHub page par **"uploading an existing file"** link par click karein.
    *   Apne computer se saari files aur folders (sirf `node_modules` folder ko chhod kar) drag aur drop kar dein.
    *   Niche **"Commit changes"** button dabayein.

---

## 🚂 Step 3: Backend Deploy karna (Railway)
Backend wo engine hai jo data sambhalega.

1.  **Railway** par login karein (Login with GitHub karein).
2.  **"New Project"** button par click karein.
3.  **"Deploy from GitHub repo"** select karein.
4.  Apni `autocosmic-shop` wali repo select karein.
5.  **"Add Variables"** par click karein (Deploy mat karein abhi).

### ⚙️ Backend Settings (Bahut Zaroori Hai)
Railway project ki **Settings** tab mein jayein:

1.  **Root Directory:**
    *   Wahan "Root Directory" ka option hoga.
    *   Usme `/backend` likhein aur save karein. (Kyunki server ka code backend folder mein hai).

2.  **Variables (Environment Variables):**
    "Variables" tab mein jayein aur yeh add karein:
    *   `PORT` = `5001`
    *   `JWT_SECRET` = `kuchbhirandompassword` (ye security ke liye hai)
    *   `MONGO_URI` = *Iske liye niche dekhein* 👇

    **MongoDB (Database) Kaise Banayein Railway par:**
    *   Railway dashboard par wapas jayein.
    *   Apne project mein right click karein ya "New" dabayein -> **Database** -> **MongoDB** select karein.
    *   Jab MongoDB add ho jaye, uspar click karein -> **Connect** tab mein jayein -> **Mongo Connection URL** copy karein.
    *   Wapas apne Backend project ke **Variables** mein jayein aur `MONGO_URI` ke samne yeh URL paste kar dein.

3.  Ab backend **Redeploy** ho jayega automatically.
4.  **Settings** -> **Networking** mein jayein aur **"Generate Domain"** par click karein.
5.  Jo link milega (e.g., `backend-production.up.railway.app`) use **COPY** kar lein. Yeh apka **API URL** hai.

---

## ▲ Step 4: Frontend Deploy karna (Vercel)
Ab hum website ka design live karenge.

1.  **Vercel** par login karein.
2.  **"Add New..."** -> **"Project"** par click karein.
3.  GitHub wali repo `autocosmic-shop` ko **Import** karein.
4.  **"Environment Variables"** section ko kholo.
5.  Wahan yeh daalein:
    *   **Name:** `VITE_API_URL`
    *   **Value:** Woh Railway wala link jo copy kiya tha (e.g., `https://backend-production.up.railway.app`). **Dhyan rahe last mein slash `/` na ho.**
6.  **"Deploy"** button dabayein.

---

## 🎉 Step 5: Website Setup (Zaroori Step)
Jab Vercel deploy complete bol de, toh website khulegi par **khali dikhegi** kyunki database naya hai.

1.  Apni nayi website ke URL ke aage `/api/seed` laga kar browser mein kholein.
    *   Example: `https://autocosmic.vercel.app/api/seed` (Lekin backend URL use karna better hai seed ke liye agar frontend se na ho).
    *   *Best Tarika:* Apne **Railway wale URL** par jayein aur likhein: `https://apka-railway-link.app/api/seed`
2.  Aapko message dikhega: `Database seeded successfully`.
3.  Ab apni Vercel wali website refresh karein.
4.  **Mubarak ho!** Aapki website live hai products ke sath.

---

## 🛠 Common Errors & Solutions
*   **Website par "Network Error" aa raha hai?**
    *   Check karein ki Vercel mein `VITE_API_URL` sahi dala hai ya nahi.
    *   Railway backend ke logs check karein ki server "Connected" hai ya nahi.
*   **Login nahi ho raha?**
    *   Database seed karne ke baad naya account register karein.

Happy Coding! 🚀
