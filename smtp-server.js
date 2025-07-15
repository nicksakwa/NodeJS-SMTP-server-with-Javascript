const {SMTPServer}= require('smtp-server');
const { simpleParser}= require('mailparse');

const server= new SMTPServer({
    onData(stream, session, callback){
        console.log('--- Incoming emails ---');
        console.log('Session ID: ${session.id}');
        console.log('Client IP: ${session.remoteAddress}');
        console.log('Mail from: ${session.envelope.mailFrom.address');
         console.log(`Recipients: ${session.envelope.rcptTo.map(r => r.address).join(', ')}`);


        simpleParser(stream, (err, parsed)=>{
            if(err){
                console.error('Error parsing email:', err);
                return callback(new Error('Error parsing email'));
            }
            console.log('Subject:', parsed.subject);
            console.log('From:', parsed.from?.text);
            console.log('To:', parsed.to?.text);
            console.log('Text Body:', parsed.text);
            console.log('HTML Body (first 200 chars):', parsed.html?.substring(0,200)+ '...');
            if (parsed.attachments.length>0){
                console.log('Attachments:'parsed.attachments.map(a=>a.filename || a.contentDisposition));
            }
            console.log('--- End of Email---');
            callback();
        });
        },
        onMailFrom(address, session, callback){
            console.log('Sender check:${address.address}');
            callback();
        }
});

server.on('error', (err)=>{
    if(err.code==='EADDRINUSE'){
        console.error('Port ${PORT} is already in use.Please choose another another port or stop the  conflicting process.');
    }else if (err.code==='EACCES'){
        console.error('Permission denied. You might need to run this  with sudo/administrator priviledges to listen on port ${PORT}.Try a port above 1024 like 2525. ');
    }else {
        console.error('Server error: ${err.message}');
    }
});