
const triggerEmailAPI = async (payload) => {
    try {
        // Frontend URL from Railway Environment Variables
        const frontendUrl = process.env.FRONTEND_URL; 
        
        if (!frontendUrl) {
            console.error("❌ EMAIL CRITICAL: 'FRONTEND_URL' is missing in Railway variables.");
            console.error("👉 Add FRONTEND_URL=https://your-app.vercel.app in Railway Settings");
            return { success: false, error: "Configuration Error: FRONTEND_URL missing" };
        }

        // Ensure no trailing slash and correct API path
        const baseUrl = frontendUrl.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/api/send-email`;

        console.log(`🚀 Attempting to trigger email...`);
        console.log(`🎯 Target URL: ${apiUrl}`);
        console.log(`📧 Recipient: ${payload.to}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Railway-Backend' 
            },
            body: JSON.stringify(payload)
        });

        const contentType = response.headers.get("content-type");
        
        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ Vercel API Failed: ${response.status} ${response.statusText}`);
            console.error(`⚠️ Error Details: ${errText}`);
            
            if (response.status === 404) {
                console.error("💡 Hint: The URL is returning 404. Check 'vercel.json' routing or if deployment is successful.");
            }
            if (errText.includes("<!DOCTYPE html>")) {
                console.error("💡 Hint: Vercel returned HTML instead of JSON. This means the request hit the React App instead of the API. Check 'vercel.json' rewrites.");
            }
            
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Vercel Email API Success:", data);
        return { success: true, data };

    } catch (error) {
        console.error("❌ EMAIL SERVICE CRASH:", error.message);
        return { success: false, error: error.message };
    }
};

// 1. Send Order Confirmation
const sendOrderConfirmation = async (order, accountPassword = null) => {
    const subject = `Order Confirmed! #${order._id.toString().substring(0,6).toUpperCase()}`;
    
    let html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #E11D48;">Thank you for your purchase!</h2>
            <p>Hi ${order.customerName},</p>
            <p>We have received your order. It is currently being processed.</p>
            <p><strong>Order Total: Rs. ${order.total}</strong></p>
    `;

    if (accountPassword) {
        html += `
            <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 10px 0; border: 1px solid #b9e6fe;">
                <h3 style="margin-top: 0; color: #0284c7;">Account Created</h3>
                <p>We created an account for you to track your order.</p>
                <p><strong>Username:</strong> ${order.customerEmail}</p>
                <p><strong>Password:</strong> ${accountPassword}</p>
                <a href="${process.env.FRONTEND_URL}/login">Login here</a>
            </div>
        `;
    }

    html += `
            <p>Please find your invoice attached.</p>
            <p>Best Regards,<br/>Ladies Smart Choice Team</p>
        </div>
    `;

    // Prepare Invoice Data
    const invoiceData = {
        orderId: order._id,
        customerName: order.customerName,
        total: order.total,
        address: order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}` : '',
        items: order.items.map(item => ({
            name: item.productId && item.productId.name ? item.productId.name : "Product",
            price: item.productId && item.productId.price ? item.productId.price : 0,
            quantity: item.quantity
        }))
    };

    return await triggerEmailAPI({
        to: order.customerEmail,
        subject,
        html,
        invoiceData
    });
};

// 2. Send Welcome Email
const sendWelcomeEmail = async (user) => {
    return await triggerEmailAPI({
        to: user.email,
        subject: "Welcome to Ladies Smart Choice!",
        html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #eee;">
                <h1 style="color: #E11D48;">Welcome, ${user.name}!</h1>
                <p>We are thrilled to have you with us.</p>
                <p>Discover the latest trends in women's fashion.</p>
                <br/>
                <a href="${process.env.FRONTEND_URL}" style="background: #E11D48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
            </div>
        `
    });
};

// 3. Send Password Reset OTP
const sendPasswordResetEmail = async (email, otp) => {
    return await triggerEmailAPI({
        to: email,
        subject: "Reset Your Password - OTP",
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #E11D48; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested to reset your password. Please use the following OTP (One-Time Password) to verify your identity.</p>
                <div style="background: #f0f0f0; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 12px;">This OTP is valid for 10 minutes.</p>
            </div>
        `
    });
};

module.exports = { sendOrderConfirmation, sendWelcomeEmail, sendPasswordResetEmail };
