
const fs = require('fs');
const path = require('path');

let nodemailer;
let PDFDocument;

// Robust Module Loading
try {
    nodemailer = require('nodemailer');
} catch (e) {
    console.error("❌ CRITICAL: 'nodemailer' module is missing. Emails will NOT work.");
    console.error("👉 Run this command in your backend folder: npm install nodemailer");
}

try {
    PDFDocument = require('pdfkit');
} catch (e) {
    console.error("❌ CRITICAL: 'pdfkit' module is missing. PDF Invoices will NOT work.");
    console.error("👉 Run this command in your backend folder: npm install pdfkit");
}

let transporter = null;

// Initialize Transporter (Real SMTP Only)
const initTransporter = async () => {
    if (!nodemailer) return null;
    
    if (transporter) return transporter;

    // 1. Get Credentials from Environment (Prioritize EMAIL_ prefix as per user config)
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = process.env.EMAIL_PORT || process.env.SMTP_PORT;
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (user && pass) {
        try {
            console.log(`🔌 Connecting to Email Server: ${host}:${port} as ${user}...`);
            
            transporter = nodemailer.createTransport({
                host: host,
                port: parseInt(port || '465'),
                secure: parseInt(port || '465') === 465, // True for 465 (SSL), false for 587 (TLS)
                auth: {
                    user: user,
                    pass: pass,
                },
            });

            // Verify connection configuration
            await transporter.verify();
            console.log("✅ Email Service: Connected to Real SMTP Server Successfully.");
        } catch (e) {
            console.error("❌ Email Service: Real SMTP Connection Failed.");
            console.error("   Error Details:", e.message);
            console.error("   Check your EMAIL_HOST, EMAIL_USER and EMAIL_PASS in .env file.");
            transporter = null; 
        }
    } else {
        console.error("❌ Email Service: Missing credentials in .env file.");
        console.error("   Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS.");
    }
    
    return transporter;
};

// Helper: Generate PDF Invoice Buffer
const generateInvoicePDF = (order) => {
    return new Promise((resolve, reject) => {
        if (!PDFDocument) {
            console.warn("⚠️ Skipping PDF generation: pdfkit not installed.");
            return resolve(null);
        }

        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => {
                console.error("PDF Generation Error:", err);
                resolve(null);
            });

            // --- PDF Content Styling ---
            doc.fillColor('#444444')
               .fontSize(20)
               .text('INVOICE', 50, 57)
               .fontSize(10)
               .text('Ladies Smart Choice', 200, 50, { align: 'right' })
               .text('123 Fashion Street', 200, 65, { align: 'right' })
               .text('Delhi, India', 200, 80, { align: 'right' })
               .moveDown();

            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

            doc.fontSize(10).text(`Invoice Number: ${order._id.toString().substring(0, 8).toUpperCase()}`, 50, 115)
               .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 130)
               .text(`Order Total: Rs. ${order.total}`, 50, 145);

            doc.text('Bill To:', 300, 115)
               .font('Helvetica-Bold').text(order.customerName, 300, 130)
               .font('Helvetica').text(order.customerEmail, 300, 145)
               .text(order.customerPhone || '', 300, 160);
               
            if (order.shippingAddress) {
                doc.text(`${order.shippingAddress.address}, ${order.shippingAddress.city}`, 300, 175);
            }

            doc.moveDown();
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 200).lineTo(550, 200).stroke();

            let i = 0;
            let position = 220;
            doc.font('Helvetica-Bold').text("Item", 50, position);
            doc.text("Qty", 350, position, { width: 90, align: 'center' });
            doc.text("Price", 440, position, { width: 90, align: 'right' });
            doc.font('Helvetica');
            
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, position + 15).lineTo(550, position + 15).stroke();

            order.items.forEach(item => {
                position += 30;
                // Populate safe check
                const productName = item.productId && item.productId.name ? item.productId.name : "Product Item";
                const productPrice = item.productId && item.productId.price ? item.productId.price : 0;
                
                doc.text(productName, 50, position, { width: 300 });
                doc.text(item.quantity.toString(), 350, position, { width: 90, align: 'center' });
                doc.text(`Rs. ${productPrice}`, 440, position, { width: 90, align: 'right' });
            });

            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, position + 30).lineTo(550, position + 30).stroke();
            doc.font('Helvetica-Bold').text(`Total: Rs. ${order.total}`, 440, position + 45, { width: 90, align: 'right' });

            doc.end();
        } catch (err) {
            console.error("PDF Generation Crash:", err);
            resolve(null);
        }
    });
};

// --- Function: Send Order Confirmation ---
const sendOrderConfirmation = async (order, accountPassword = null) => {
    const mailer = await initTransporter();
    if (!mailer) {
        console.error("⚠️ Cannot send order email: Email service not connected.");
        return { success: false, error: "Transporter not initialized" };
    }

    try {
        console.log(`🔄 Generating invoice for Order #${order._id}...`);
        const pdfBuffer = await generateInvoicePDF(order);
        const attachments = [];
        if (pdfBuffer) {
            attachments.push({
                filename: `Invoice-${order._id}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            });
        }

        // Determine Sender (Must match authenticated user for many hosts)
        const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@example.com';
        const senderName = "Ladies Smart Choice";

        // Prepare Email Content
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
                    <a href="https://${process.env.FRONTEND_URL || 'localhost:3000'}/login">Login here</a>
                </div>
            `;
        }

        html += `
                <p>Please find your invoice attached.</p>
                <p>Best Regards,<br/>Ladies Smart Choice Team</p>
            </div>
        `;

        const info = await mailer.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: order.customerEmail,
            subject: subject,
            html: html,
            attachments: attachments
        });

        console.log(`✅ Order Email sent to ${order.customerEmail}. Message ID: ${info.messageId}`);
        
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("❌ Error sending order email:", error);
        return { success: false, error: error.message };
    }
};

// --- Function: Send Welcome Email ---
const sendWelcomeEmail = async (user) => {
    const mailer = await initTransporter();
    if (!mailer) return;

    const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@example.com';

    try {
        const info = await mailer.sendMail({
            from: `"Ladies Smart Choice" <${senderEmail}>`,
            to: user.email,
            subject: "Welcome to the Family!",
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #eee;">
                    <h1 style="color: #E11D48;">Welcome, ${user.name}!</h1>
                    <p>We are thrilled to have you with us.</p>
                    <p>Discover the latest trends in women's fashion.</p>
                    <br/>
                    <a href="https://${process.env.FRONTEND_URL || 'localhost:3000'}" style="background: #E11D48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
                </div>
            `
        });

        console.log(`✅ Welcome Email sent to ${user.email}.`);
        return { success: true };
    } catch (error) {
        console.error("❌ Error sending welcome email:", error);
    }
};

// --- Function: Send Password Reset OTP ---
const sendPasswordResetEmail = async (email, otp) => {
    const mailer = await initTransporter();
    if (!mailer) {
        console.error("⚠️ Cannot send OTP: Email service not connected.");
        return { success: false, error: "Email service unavailable" };
    }

    const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@example.com';

    try {
        const info = await mailer.sendMail({
            from: `"Ladies Smart Choice" <${senderEmail}>`,
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
                    <p style="color: #666; font-size: 12px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `
        });

        console.log(`✅ OTP Email sent to ${email}.`);
        return { success: true };
    } catch (error) {
        console.error("❌ Error sending OTP email:", error);
        throw error;
    }
};

module.exports = { sendOrderConfirmation, sendWelcomeEmail, sendPasswordResetEmail };
