
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

let PDFDocument;
try {
    PDFDocument = require('pdfkit');
} catch (e) {
    console.error("❌ CRITICAL: 'pdfkit' module is missing. PDF Invoices will NOT work.");
}

// Initialize Resend
// IMPORTANT: Ensure RESEND_API_KEY is set in Railway Variables
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_j1yD2n3u_E93K8Y4cJc1J4JUb144HnPNv';

if (!RESEND_API_KEY || RESEND_API_KEY.startsWith('re_123')) {
    console.warn("⚠️ WARNING: Resend API Key seems missing or invalid. Emails may fail.");
} else {
    console.log(`📧 Email Service Initialized with Key: ${RESEND_API_KEY.substring(0, 5)}...`);
}

const resend = new Resend(RESEND_API_KEY);

// Configuration for Sender
// Using a formatted name helps with inbox delivery
const DOMAIN_EMAIL = process.env.SENDER_EMAIL || 'noreply@apexnucleus.com';
const SENDER_EMAIL = `Ladies Smart Choice <${DOMAIN_EMAIL}>`;

// Helper: Generate PDF Invoice Buffer
const generateInvoicePDF = (order) => {
    return new Promise((resolve, reject) => {
        if (!PDFDocument) {
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

            let position = 220;
            doc.font('Helvetica-Bold').text("Item", 50, position);
            doc.text("Qty", 350, position, { width: 90, align: 'center' });
            doc.text("Price", 440, position, { width: 90, align: 'right' });
            doc.font('Helvetica');
            
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, position + 15).lineTo(550, position + 15).stroke();

            order.items.forEach(item => {
                position += 30;
                // Handle populated product or deleted product
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
    try {
        console.log(`🔄 Generating Invoice for: ${order.customerEmail}`);
        const pdfBuffer = await generateInvoicePDF(order);
        
        const attachments = [];
        if (pdfBuffer) {
            attachments.push({
                filename: `Invoice-${order._id}.pdf`,
                content: pdfBuffer,
            });
        }

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
                    <a href="https://${process.env.FRONTEND_URL || 'apexnucleus.com'}/login">Login here</a>
                </div>
            `;
        }

        html += `
                <p>Please find your invoice attached.</p>
                <p>Best Regards,<br/>Ladies Smart Choice Team</p>
            </div>
        `;

        console.log(`📤 Sending email via Resend...`);
        console.log(`   From: ${SENDER_EMAIL}`);
        console.log(`   To:   ${order.customerEmail}`);
        
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to: order.customerEmail, 
            subject: subject,
            html: html,
            attachments: attachments
        });

        if (error) {
            console.error("❌ Resend API Error:", JSON.stringify(error, null, 2));
            return { success: false, error: error };
        }

        console.log(`✅ Email Sent Successfully! Message ID: ${data.id}`);
        return { success: true, messageId: data.id };

    } catch (error) {
        console.error("❌ Unexpected Email Service Error:", error);
        return { success: false, error: error.message };
    }
};

// --- Function: Send Welcome Email ---
const sendWelcomeEmail = async (user) => {
    try {
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to: user.email,
            subject: "Welcome to the Family!",
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #eee;">
                    <h1 style="color: #E11D48;">Welcome, ${user.name}!</h1>
                    <p>We are thrilled to have you with us.</p>
                    <p>Discover the latest trends in women's fashion.</p>
                    <br/>
                    <a href="https://${process.env.FRONTEND_URL || 'apexnucleus.com'}" style="background: #E11D48; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
                </div>
            `
        });

        if (error) {
            console.error("❌ Resend Welcome Error:", error);
            return { success: false, error };
        }
        
        console.log(`✅ Welcome Email Sent: ${data.id}`);
        return { success: true };
    } catch (error) {
        console.error("❌ Failed to send Welcome Email:", error);
        return { success: false, error: error.message };
    }
};

// --- Function: Send Password Reset OTP ---
const sendPasswordResetEmail = async (email, otp) => {
    try {
        console.log(`📤 Sending OTP to ${email}`);
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
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

        if (error) {
            console.error("❌ Resend OTP Error:", JSON.stringify(error, null, 2));
            return { success: false, error };
        }
        
        console.log(`✅ OTP Email Sent Successfully: ${data.id}`);
        return { success: true };
    } catch (error) {
        console.error("❌ Failed to send OTP Email:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOrderConfirmation, sendWelcomeEmail, sendPasswordResetEmail };
