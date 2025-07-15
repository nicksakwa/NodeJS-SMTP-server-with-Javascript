const nodemailer = require('nodemailer');

async function sendTestEmail() {
  let transporter = nodemailer.createTransport({
    host: 'localhost', // Your local SMTP server
    port: 25,          // Or 2525 if that's what your server is listening on
    secure: false,     // No TLS/SSL for this simple local test
    // You might need to disable TLS verification for self-signed certs if you enable TLS on your server
    // tls: { rejectUnauthorized: false }
  });

  let info = await transporter.sendMail({
    from: '"My Test App" <myapp@mycompany.com>', // sender address
    to: "user@yourdomain.com", // list of receivers
    subject: "Hello from Nodemailer to Local SMTP ✔", // Subject line
    text: "This is a test email sent from Nodemailer to your custom SMTP server!", // plain text body
    html: "<b>This is a test email sent from Nodemailer to your custom SMTP server!</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // Only works with Ethereal/Mailtrap
}

sendTestEmail().catch(console.error);