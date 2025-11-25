
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

module.exports = async (req, res) => {
  console.log("📨 Vercel API: Received email request");

  // 1. Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { to, subject, html, text, invoiceData } = req.body;

  if (!to || !subject) {
    console.error("❌ Vercel API: Missing 'to' or 'subject'");
    return res.status(400).json({ message: 'Missing required fields: to, subject' });
  }

  // Environment Variable Check
  if (!process.env.EMAIL_PASS) {
    console.error("❌ Vercel API Error: EMAIL_PASS environment variable is missing!");
    return res.status(500).json({ message: 'Server Config Error: EMAIL_PASS is missing.' });
  }

  const host = process.env.EMAIL_HOST || 'smtp.hostinger.com';
  const user = process.env.EMAIL_USER || 'noreply@apexnucleus.com';
  const pass = process.env.EMAIL_PASS;
  const port = parseInt(process.env.EMAIL_PORT || '465');

  console.log(`🔌 Connecting to SMTP: ${host}:${port} with user ${user}`);

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
        rejectUnauthorized: false // Helps with some strict server configurations
    }
  });

  try {
    // Verify SMTP connection first
    await transporter.verify();
    console.log("✅ SMTP Connection Established");

    const attachments = [];

    // Generate PDF Invoice if data is provided
    if (invoiceData) {
      console.log('📄 Generating PDF Invoice...');
      try {
          const pdfBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header
            doc.fillColor('#444444').fontSize(20).text('INVOICE', 50, 57)
               .fontSize(10).text('Ladies Smart Choice', 200, 50, { align: 'right' })
               .moveDown();

            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

            // Info
            doc.fontSize(10)
               .text(`Invoice #: ${invoiceData.orderId ? String(invoiceData.orderId).substring(0, 8).toUpperCase() : 'N/A'}`, 50, 115)
               .text(`Date: ${new Date().toLocaleDateString()}`, 50, 130)
               .text(`Total: Rs. ${invoiceData.total}`, 50, 145);

            doc.text('Bill To:', 300, 115)
               .font('Helvetica-Bold').text(invoiceData.customerName || 'Customer', 300, 130)
               .font('Helvetica').text(String(to), 300, 145);

            if (invoiceData.address) {
                doc.text(String(invoiceData.address), 300, 160);
            }

            doc.moveDown();
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 200).lineTo(550, 200).stroke();

            // Items Table
            let y = 220;
            doc.font('Helvetica-Bold').text('Item', 50, y);
            doc.text('Qty', 350, y, { width: 90, align: 'center' });
            doc.text('Price', 440, y, { width: 90, align: 'right' });
            doc.font('Helvetica');
            
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y + 15).lineTo(550, y + 15).stroke();

            if (invoiceData.items && Array.isArray(invoiceData.items)) {
                invoiceData.items.forEach(item => {
                    y += 30;
                    if (y > 700) { doc.addPage(); y = 50; }
                    doc.text(item.name.substring(0, 50), 50, y, { width: 300 });
                    doc.text(String(item.quantity), 350, y, { width: 90, align: 'center' });
                    doc.text(`Rs. ${item.price}`, 440, y, { width: 90, align: 'right' });
                });
            }

            // Total
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y + 30).lineTo(550, y + 30).stroke();
            doc.font('Helvetica-Bold').text(`Total: Rs. ${invoiceData.total}`, 440, y + 45, { width: 90, align: 'right' });

            doc.end();
          });

          attachments.push({
            filename: `Invoice-${invoiceData.orderId || 'Order'}.pdf`,
            content: pdfBuffer,
          });
          console.log("✅ PDF Generated");
      } catch (pdfError) {
          console.error("⚠️ PDF Generation Failed (Sending mail without invoice):", pdfError);
      }
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Ladies Smart Choice'}" <${user}>`,
      to: to,
      subject: subject,
      text: text || '',
      html: html || '<p>Please find the details attached.</p>',
      attachments: attachments,
    });

    console.log(`✅ Email Sent! Message ID: ${info.messageId}`);
    res.status(200).json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error('❌ Fatal Email Error:', error);
    res.status(500).json({ error: error.message, details: "Check Vercel Function Logs" });
  }
};
