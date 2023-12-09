
var express = require('express');
const nodemailer = require("nodemailer");
var HTMLParser = require('node-html-parser');
const handlebars = require("handlebars");
const Campaign = require('../Database/CampaignSchema');
var router = express.Router();

async function addCampaign(campaign, req, res){
  try{
    const newCampaign = new Campaign(campaign);

    const savedCampaign = await newCampaign.save();
    
    return savedCampaign;
  } catch(err){
    console.log(err);
    res.status(err);
    res.json(err)
  }
}

async function sendMails(campaign){
  try{

    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    for (let i = 0; i < campaign.recipients.length; i++){
      
      const templateBody = handlebars.compile(campaign.emailBody);
      const mailBody = templateBody({name: campaign.recipients[i].name});

      // console.log(getFullTemplate(mailBody, campaign.recipients[i].email, campaign._id));
    
      var mailOptions = {
        from: `"Isah Saidu" <${process.env.EMAIL}>`,
        to: `"${campaign.recipients[i].name}" <${campaign.recipients[i].email}>`,
        subject: "This is a demo subject",
        html: getFullTemplate(mailBody, campaign.recipients[i].email, campaign._id),
        text: 'That was easy!'
      };
      
      const info = await transporter.sendMail(mailOptions);

      console.log(console.log('Email sent: ' + info.response));

      processTracking(campaign, campaign.recipients[i].email, "sent")
    }
  } catch(err){
    console.log(err);
  }
}

router.get("/all-campaigns", async (req, res) => {
  try{
    const campaigns = await Campaign.find({});

    res.json(campaigns);
  } catch(err){
    console.log(err);
  }
})

/* GET users listing. */
router.post('/deploy-campaign', async function(req, res, next) {
  try{
    const campaign = await addCampaign(req.body)
    res.send('respond with a resource');

    sendMails(campaign);
  } catch(err){
    console.log(err);
  }
});

router.get("/process-opened/:campaignId/:emailAddress", async function(req, res){
  //console.log(req.params.campaignId, req.params.emailAddress);

  try{
    let campaignId = req.params.campaignId;
    let emailAddress = req.params.emailAddress;

    const campaign = await Campaign.findById(campaignId);

    processTracking(campaign, emailAddress, "opened")
    res.json({success: true})
  } catch(er){
    console.log(er);
  }
})

async function processTracking(campaign, email, type){
  try{

    const tempRecipients = [...campaign.recipients];

    let index = tempRecipients.findIndex(val => val.email === email);

    campaign.recipients[index][type] = true;

    campaign.save();

    // tempRecipients.splice(index, 1, {...tempRecipients[index], [type]: true});

    // const updatedData = await Campaign.findByIdAndUpdate(campaign._id, {recipients: tempRecipients});
  } catch(er){
    console.log(er);
  }
}

router.get("/process-clicked", async function(req, res){
  try{
    let {campaignId, emailAddress, link} = req.query;

    const campaign = await Campaign.findById(campaignId);

    processTracking(campaign, emailAddress, "clicked")

    res.json({success: true})
  } catch(err){
    console.log(err);
  }
})



function filterAnchorTag(html, email, campaignId){
  
  let rs = HTMLParser.parse(html).querySelectorAll("a");

  rs.forEach(val => {
    let link = val.attributes.href

    let obj = {
      link,
      email: email,
      campaignId
    }

    let str = new URLSearchParams(obj);

    html = html.replace(`href="${link}"`, `href="${process.env.FRONTEND_URL}/redirect?${str.toString()}"`);
  });

  return html;
};

function getFullTemplate(body, email, campaign){
  return ` 
    <html>
      <head>
        <style>
          *{
            margin-top: 0px !important;
            margin-bottom: 0px !important;
          }
        </style>
      </head>
      <body>
        ${filterAnchorTag(body, email, campaign._id)}
        <br/>
        <span style="display: none">${campaign._id}</span>
        <p>
          <img src="${process.env.BACKEND_URL}/campaign/process-opened/${campaign._id}/${email}" style="display: none"/>
        </p>
      </body>
    </html>
  `;
}

module.exports = router;
