
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// --- SMTP Configuration ---
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'noreply@apexnucleus.com',
        pass: process.env.EMAIL_PASS
    }
});

router.post('/', async (req, res) => {
    const { to, subject, html, text, invoiceData } = req.body;

    if (!to || !subject) {
        return res.status(400).json({ message: 'Missing required email fields' });
    }

    try {
        const attachments = [];

        // Generate PDF Invoice if requested
        if (invoiceData) {
            const pdfBuffer = await new Promise((resolve) => {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                let buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                // --- PDF Styling ---
                doc.fillColor('#444444')
                   .fontSize(20)
                   .text('INVOICE', 50, 57)
                   .fontSize(10)
                   .text('Ladies Smart Choice', 200, 50, { align: 'right' })
                   .moveDown();

                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

                // Order Details
                const shortId = invoiceData.orderId ? invoiceData.orderId.toString().substring(0, 8).toUpperCase() : 'N/A';
                doc.fontSize(10).text(`Invoice ID: ${shortId}`, 50, 115)
                   .text(`Date: ${new Date().toLocaleDateString()}`, 50, 130)
                   .text(`Total: Rs. ${invoiceData.total}`, 50, 145);

                // Customer Details
                doc.text('Bill To:', 300, 115)
                   .font('Helvetica-Bold').text(invoiceData.customerName || 'Customer', 300, 130)
                   .font('Helvetica').text(to, 300, 145);
                
                if (invoiceData.address) {
                    doc.text(`${invoiceData.address}`, 300, 160);
                }

                doc.moveDown();
                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 200).lineTo(550, 200).stroke();

                // Header
                let position = 220;
                doc.font('Helvetica-Bold').text("Item", 50, position);
                doc.text("Qty", 350, position, { width: 90, align: 'center' });
                doc.text("Price", 440, position, { width: 90, align: 'right' });
                doc.font('Helvetica');
                
                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, position + 15).lineTo(550, position + 15).stroke();

                // Items
                if (invoiceData.items && Array.isArray(invoiceData.items)) {
                    invoiceData.items.forEach(item => {
                        position += 30;
                        if (position > 700) { doc.addPage(); position = 50; }
                        
                        const name = item.name || "Product";
                        const price = item.price || 0;
                        const qty = item.quantity || 1;
                        
                        doc.text(name.substring(0, 50), 50, position, { width: 300 });
                        doc.text(qty.toString(), 350, position, { width: 90, align: 'center' });
                        doc.text(`Rs. ${price}`, 440, position, { width: 90, align: 'right' });
                    });
                }

                // Total
                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, position + 30).lineTo(550, position + 30).stroke();
                doc.font('Helvetica-Bold').text(`Total: Rs. ${invoiceData.total}`, 440, position + 45, { width: 90, align: 'right' });

                doc.end();
            });

            attachments.push({
                filename: `Invoice-${invoiceData.orderId || 'Order'}.pdf`,
                content: pdfBuffer
            });
        }

        // Send Email via SMTP
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Ladies Smart Choice'}" <${process.env.EMAIL_USER || 'noreply@apexnucleus.com'}>`,
            to: to,
            subject: subject,
            text: text || '',
            html: html,
            attachments: attachments
        });

        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        res.json({ success: true, messageId: info.messageId });

    } catch (error) {
        console.error("❌ SMTP Email Error:", error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

module.exports = router;
