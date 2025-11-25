
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// --- Vercel Serverless Function for Email & Invoice Generation ---

module.exports = async (req, res) => {
  // 1. Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { to, subject, html, text, invoiceData } = req.body;

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ message: 'Missing required email fields' });
  }

  // 2. Configure Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const attachments = [];

    // 3. Generate PDF Invoice if invoiceData is provided
    if (invoiceData) {
        const pdfBuffer = await new Promise((resolve) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fillColor('#444444')
               .fontSize(20)
               .text('INVOICE', 50, 57)
               .fontSize(10)
               .text('Ladies Smart Choice', 200, 50, { align: 'right' })
               .moveDown();

            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

            // Order Details
            const shortId = invoiceData.orderId ? invoiceData.orderId.substring(0, 8).toUpperCase() : 'N/A';
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

            // Table Header
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
                    // Prevent writing off page
                    if (position > 700) {
                        doc.addPage();
                        position = 50;
                    }
                    
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

    // 4. Send Email
    console.log(`[Vercel SMTP] Sending email to: ${to}`);
    
    const info = await transporter.sendMail({
      from: `"Ladies Smart Choice" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: text || '',
      html: html,
      attachments: attachments
    });

    console.log(`[Vercel SMTP] Success: ${info.messageId}`);
    return res.status(200).json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error('[Vercel SMTP] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
