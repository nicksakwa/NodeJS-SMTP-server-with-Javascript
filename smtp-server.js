const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');

const server = new SMTPServer({
  // Optional: Enable authentication (for sending *through* this server, not for receiving)
  // For a simple receiving server, you often don't need authentication.
  // If you enable onAuth, clients would need to provide username/password.
  // onAuth(auth, session, callback) {
  //   console.log('Authentication attempt:', auth.username, session.id);
  //   if (auth.username === 'testuser' && auth.password === 'testpass') {
  //     return callback(null, { user: 'testuser' });
  //   }
  //   return callback(new Error('Invalid username or password'));
  // },

  // This is the core for receiving mail:
  onData(stream, session, callback) {
    console.log('--- Incoming Email ---');
    console.log(`Session ID: ${session.id}`);
    console.log(`Client IP: ${session.remoteAddress}`);
    console.log(`Mail From: ${session.envelope.mailFrom.address}`);
    console.log(`Recipients: ${session.envelope.rcptTo.map(r => r.address).join(', ')}`);

    // Parse the email stream
    simpleParser(stream, (err, parsed) => {
      if (err) {
        console.error('Error parsing email:', err);
        return callback(new Error('Error parsing email'));
      }

      console.log('Subject:', parsed.subject);
      console.log('From:', parsed.from?.text);
      console.log('To:', parsed.to?.text);
      console.log('Text Body:', parsed.text);
      console.log('HTML Body (first 200 chars):', parsed.html?.substring(0, 200) + '...');
      if (parsed.attachments.length > 0) {
        console.log('Attachments:', parsed.attachments.map(a => a.filename || a.contentDisposition));
      }
      console.log('--- End of Email ---');
      callback(); // Acknowledge successful reception
    });
  },

  onRcptTo(address, session, callback) {
    // You can implement logic here to accept or reject recipients
    // For a simple logging server, we'll accept everything.
    console.log(`Recipient check: ${address.address}`);
    // Example: Reject specific address
    // if (address.address === 'bad@example.com') {
    //   return callback(new Error('550 Not allowed'));
    // }
    callback(); // Accept the recipient
  },

  onMailFrom(address, session, callback) {
    // You can implement logic here to accept or reject senders
    console.log(`Sender check: ${address.address}`);
    callback(); // Accept the sender
  },

  // Enable STARTTLS for secure communication (recommended)
  // You'll need to provide your own SSL/TLS certificate and key here.
  // For simple testing, you can skip this, but real servers need it.
  // tls: {
  //   key: fs.readFileSync('server.key'), // From your HTTPS setup
  //   cert: fs.readFileSync('server.cert') // From your HTTPS setup
  // }
});

const PORT = 25; // Standard SMTP port
// For local testing, you might need a port > 1024 if not running as root, e.g., 2525
// Note: Port 25 is often blocked by ISPs or firewalls. You might need to use a different port for testing.

server.listen(PORT, () => {
  console.log(`SMTP Server running on port ${PORT}`);
  console.log('Waiting for incoming emails...');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose another port or stop the conflicting process.`);
  } else if (err.code === 'EACCES') {
    console.error(`Permission denied. You might need to run this with sudo/administrator privileges to listen on port ${PORT}. Try a port above 1024 like 2525.`);
  } else {
    console.error(`Server error: ${err.message}`);
  }
});