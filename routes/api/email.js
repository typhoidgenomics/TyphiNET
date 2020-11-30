var express = require('express');
var router = express.Router();
const nodemailer = require("nodemailer");
/* GET home page. */
router.post('/', async function (req, res, next) {

  email = req.body;


  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "typhinet@gmail.com", // generated ethereal user
      pass: "provet@20", // generated ethereal password
    },
  });


  let info = await transporter.sendMail({
    from: `"${email.firstName} ${email.lastName}" <typhinet@gmail.com>`, // sender address
    to: "lcerdeira@gmail.com", // list of receivers
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

module.exports = router;
