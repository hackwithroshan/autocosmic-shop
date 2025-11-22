
# 🚀 Hostinger VPS Deployment Guide (Manual Setup)

Agar aap Railway/Vercel use nahi karna chahte aur **Hostinger VPS** (Virtual Private Server) par sab kuch khud host karna chahte hain, toh yeh guide follow karein.

**Prerequisites (Zaroori Cheezein):**
1.  **Hostinger VPS Plan:** Kam se kam **KVM 1** or **KVM 2** plan (Ubuntu 22.04 OS select karein).
2.  **Domain Name:** e.g., `autocosmic.com` (Jo aapke VPS IP se connected ho).
3.  **Putty or Terminal:** Server se connect karne ke liye.

---

## 🛠 Step 1: Server Login karein

Jab aap Hostinger se VPS kharidenge, aapko ek **IP Address** aur **Root Password** milega.

Apne computer ke terminal ya CMD mein likhein:

```bash
ssh root@YOUR_VPS_IP_ADDRESS
# Enter dabayein, fir password dalein (password type karte waqt dikhega nahi).
```

---

## 📦 Step 2: Zaroori Softwares Install karein

Server khali hota hai, humein usme Node.js, Nginx (Web Server), aur Git dalna hoga. Niche diye gaye commands ek-ek karke run karein:

```bash
# 1. Server update karein
sudo apt update && sudo apt upgrade -y

# 2. Curl install karein
sudo apt install curl -y

# 3. Node.js (Version 18) Install karein
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Git aur Nginx install karein
sudo apt install git nginx -y

# 5. PM2 Install karein (Ye server ko 24/7 chalaye rakhega)
sudo npm install -g pm2
```

---

## 🗄️ Step 3: MongoDB Setup (Database)

Hum Database bhi isi server par install karenge.

```bash
# MongoDB ki key add karein
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# MongoDB ki repository add karein
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update aur Install karein
sudo apt update
sudo apt install -y mongodb-org

# Database start karein
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 📂 Step 4: Code Download karein

Ab hum aapka code GitHub se server par layenge.

```bash
# Web directory mein jayein
cd /var/www

# Apna code clone karein (Apna GitHub link use karein)
git clone https://github.com/YOUR_USERNAME/autocosmic-shop.git

# Folder ka naam chhota kar lete hain aasaani ke liye (Optional)
mv autocosmic-shop myapp

# Folder mein jayein
cd myapp
```

---

## ⚙️ Step 5: Backend Setup

Backend ko start karte hain.

1.  **Dependencies Install karein:**
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Variables Set karein:**
    ```bash
    nano .env
    ```
    Is file ke andar yeh paste karein (Right click se paste hota hai):
    ```env
    PORT=5001
    MONGO_URI=mongodb://127.0.0.1:27017/autocosmic
    JWT_SECRET=koi_bhi_secret_password_likho
    ```
    Save karne ke liye: `Ctrl + X`, fir `Y`, fir `Enter` dabayein.

3.  **Database Seed karein (First time setup):**
    ```bash
    node seed.js
    ```
    Agar "Database seeded successfully" aaye toh badhiya hai.

4.  **Server Start karein (PM2 ke sath):**
    ```bash
    pm2 start server.js --name "backend"
    ```

---

## 🎨 Step 6: Frontend Setup (React Build)

Ab Frontend ko "Build" karenge taaki woh HTML/CSS ban jaye.

1.  **Frontend folder mein jayein:**
    ```bash
    cd ../
    # Ab aap wapas main folder mein hain
    ```

2.  **Dependencies Install karein:**
    ```bash
    npm install
    ```

3.  **Frontend Build karein:**
    Build karne se pehle, humein batana hoga ki backend kahan hai.
    ```bash
    # Linux/Mac style command ek line mein:
    export VITE_API_URL=http://YOUR_VPS_IP_ADDRESS/api && npm run build
    ```
    *(Note: Agar aap Domain connect kar chuke hain, toh IP ki jagah `http://yourdomain.com/api` likhein).*

4.  **Files ko Nginx folder mein copy karein:**
    ```bash
    # Build banne ke baad 'dist' folder banega. Use public folder mein dalte hain.
    sudo mkdir -p /var/www/html/autocosmic
    sudo cp -r dist/* /var/www/html/autocosmic/
    ```

---

## 🌐 Step 7: Nginx Configuration (Website Live karna)

Nginx ek Traffic Police hai. Woh user ko Frontend dikhayega aur API calls ko Backend pe bhejega.

1.  **Config file kholein:**
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```

2.  **Purana sab mita dein aur yeh naya code paste karein:**

    ```nginx
    server {
        listen 80;
        server_name YOUR_DOMAIN.COM www.YOUR_DOMAIN.COM; # Yahan apna domain likhein ya IP address

        root /var/www/html/autocosmic;
        index index.html;

        # Frontend (React) ke liye
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Backend (API) ke liye Reverse Proxy
        location /api {
            proxy_pass http://localhost:5001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Save karein (`Ctrl+X`, `Y`, `Enter`).

3.  **Nginx Restart karein:**
    ```bash
    sudo systemctl restart nginx
    ```

---

## 🔒 Step 8: Firewall & SSL (Security)

1.  **Ports open karein:**
    ```bash
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    sudo ufw enable
    # 'y' dabayein confirm karne ke liye
    ```

2.  **SSL Certificate (HTTPS) lagayein:**
    (Iske liye zaroori hai ki aapka Domain aapke VPS IP se connected ho Hostinger DNS mein).
    
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d YOUR_DOMAIN.COM -d www.YOUR_DOMAIN.COM
    ```
    Email dalein aur terms accept karein.

---

## 🎉 Mubarak Ho!
Ab apne browser mein apna domain ya IP address kholein. Aapki website live honi chahiye!

### Debugging Commands (Agar kuch na chale):
*   Backend logs check karein: `pm2 logs backend`
*   Nginx status check karein: `sudo systemctl status nginx`
