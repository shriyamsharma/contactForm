const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://contactformtask.firebaseio.com"
});


const express = require('express');
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
// const ejs = require('ejs');
const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: false }));

const cors = require('cors');
app.use( cors( { origin: true } ) );

app.set('view engine', 'ejs');


//routes



// app.post('/contact', async(req, res) => {
//     try {       
//         const contact = {
//             name: req.body.name,
//             email: req.body.email,
//             phone: req.body.phone,
//             message: req.body.message
//         }
//         await db.collection('contacts').add(contact); 
//         return res.status(200).send('Recieved!');
//     } catch(err) {
//         return res.status(500).send(err);
//     }
// });


async function insertFormData(request){
    const writeResult = await db.collection('contacts').add({
                name: request.body.name,
                email: request.body.email,
                phone: request.body.phone,
                message: request.body.message
    })
    .then(function() {console.log("Document successfully written!");})
    .catch(function(error) {console.error("Error writing document: ", error);});
    }


    app.post('/contact',async (request,response) =>{
        var insert = await insertFormData(request);
        // return response.sendStatus(200);

        const output = `
        <p>You have a new contact request</p>
        <h3>Contact Details</h3>
        <ul>  
          <li>Name: ${request.body.name}</li>
          <li>Email: ${request.body.email}</li>
          <li>Phone: ${request.body.phone}</li>
        </ul>
        <h3>Message</h3>
        <p>${request.body.message}</p>
      `;

       // create reusable transporter object using the default SMTP transport
       const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'codersharma676@gmail.com',
          pass: '*************'
        }
      });

    let mailOptions = {
        from: '"KarmaSharma" <codersharma676@gmail.com>', // sender address
        to: 'sharmashriyam676@gmail.com,', // list of receivers
        subject: 'Test Contact Request', // Subject line
        text: 'Hello world?', // plain text body
        html: output // html body 
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        return response.send("Email sent");
    });
});

    app.get('/', (req, res) => {
        return res.render('home');  
    });

// app.post('/contact', (req, res) => {

//     (async () => {

//         try {
//             const contact = await db.collection('contacts').add({
//                 name: req.body.name,
//                 email: req.body.email,
//                 phone: req.body.phone,
//                 message: req.body.message
//             });

//             return res.redirect('submitted');
//             console.log(contact);
//         } catch (err) {
//             console.log(err);
//             return res.status(500).send(err);
//         }

//     })();

// });


//export api to call cloud functions
exports.app = functions.https.onRequest(app);

