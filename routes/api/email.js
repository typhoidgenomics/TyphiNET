import express from 'express';
import nodemailer from "nodemailer";

const router = express.Router();
/* GET home page. */

//Route POST to send an email body 
router.post('/', async function(req, res, next) {

    let email = req.body;

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // generated ethereal user
            pass: process.env.EMAIL_PASSWD, // generated ethereal password
        },
    });


    let info = await transporter.sendMail({
        from: `"${email.firstName} ${email.lastName}" <typhinet@gmail.com>`, // sender address 
        to: "user@gmail.com", // list of receivers
        subject: `Company ${email.company} intertest`, // Subject line
        text: "", // plain text body
        html: `
              <p><b>Company Name: </b></p><p>${email.company}</p>
              <p><b>E-mail: </b>${email.email}</p>
              <p><b>First Name: </b>${email.firstName}</p>    
              <p><b>Last Name: </b>${email.lastName}</p>    
              <p><b>Address: </b>${email.address}</p> 
              <p><b>City: </b>${email.city}</p>
              <p><b>Country: </b>${email.country}</p>  
              <p><b>PostalCode: </b>${email.postalCode}</p>
              <p><b>Additional Information: </b>${email.additionalInformation}</p>        
        `, // html body
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));


    res.send('send sucessed!');
});

export default router