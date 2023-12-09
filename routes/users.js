
var express = require('express');
var router = express.Router();
const {google} = require('googleapis');
const axios = require('axios');
const {promisify} = require("util");
const User = require('../Database/CampaignSchema');
const Message = require('../Database/MessageSchema');

async function watchUser(user){
  try{
    const request = {
      labelIds: ['INBOX'],
      topicName: 'projects/node-receive/topics/email-receive',
      userId: user.email
    }
  
    const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const redirectURL = process.env.REDIRECT_URI;
  
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, clientSecret, redirectURL);
  
    oauth2Client.setCredentials(user)
  
    const gmail = google.gmail({version: 'v1', auth: oauth2Client});

    const result = await gmail.users.watch(request);

    return result;
  } catch(err){
    console.log(err);
    return {error: err};
  }
}

async function stopWatch(user){
  try{
    const request = {
      labelIds: ['INBOX'],
      topicName: 'projects/node-receive/topics/email-receive',
      userId: user.email
    }
  
    const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const redirectURL = process.env.REDIRECT_URI;
  
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, clientSecret, redirectURL);
  
    oauth2Client.setCredentials(user)
  
    const gmail = google.gmail({version: 'v1', auth: oauth2Client});

    const result = await gmail.users.stop(request);

    return result;
  } catch(err){
    console.log(err);
    return {error: err};
  }
}

async function addUser(user, req, res){
  try{
    delete user.id;

    const rs = await watchUser(user);

    if (rs.data.historyId){
      const newUser = new User({
        ...user, 
        recentHistoryId: rs.data.historyId, 
        token_expired: false
      });

      newUser.save()
      .then(() => {
        console.log("Saved user");

        res.json({
          ...user, 
          recentHistoryId: rs.data.historyId, 
          token_expired: false
        });
      })
      .catch(err => {
        console.log(err);
        res.status(404);
        res.json(err);
      })
    }
  } catch(err){
    console.log(err);
    res.status(err);
    res.json(err)
  }
}

async function updateUser(id, user, req, res){
  try{ 
    delete user.id;

    await stopWatch(user)

    const rs = await watchUser(user);

    if (rs.data.historyId){

      User.findByIdAndUpdate(id, {
        ...user, 
        recentHistoryId: rs.data.historyId, 
        token_expired: false
      })
      .then(() => {
        console.log("Saved updated");
        res.json({
          ...user, 
          recentHistoryId: rs.data.historyId, 
          token_expired: false
        });
      })
      .catch(err => {
        console.log(err);
        res.status(404);
        res.json(err);
      })
    } else {
      console.log(rs);
    }
  } catch(err){
    console.log(err);
    res.status(err);
    res.json(err)
  }
}

const userEx = async function(user){
  try{
    const user = await User.findOne({email: user.email});

    if (user){
      return user;
    } else {
      return null;
    }
  } catch(err){
    return null;
  }
}

/* GET home page. */
router.post("/get-auth-url", function(req, res){
  const SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    'https://www.googleapis.com/auth/gmail.readonly'
  ];
  const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectURL = req.body.redirectUrl;

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, clientSecret, redirectURL);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent"
  });

  res.json({authUrl});
});

router.post("/add-user", async function(req, res){

  try{
    const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const redirectURL = req.body.redirectUrl;

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, clientSecret, redirectURL);

    oauth2Client.getToken(req.body.code, (err, token) => {
      if (err){
        res.status(404);
        res.json(err)
      
        return;
      }

      if (!token.scope.includes("https://www.googleapis.com/auth/gmail.readonly")){

        res.json({invalidAuth: "Invalid authentication"});
        return;
      }

      oauth2Client.setCredentials(token);

      axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token.access_token}`, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: 'application/json'
        }
      })
      .then(async (result) => {
        const exists = await User.exists({email: result.data.email});
        
        if (exists){
          updateUser(exists._id, {...result.data, ...token}, req, res)
        } else {
          addUser({...result.data, ...token}, req, res);
        }
      })
      .catch((err) => {
        console.log(err)
        res.status(404);
        res.json(err)
      });
    });
  } catch(err){
    console.log(err);
    res.json(err)
  }
});

router.get("/test", async (req, res) => {
  try{
    let body = {emailAddress: "isahsaidu308@gmail.com", "historyId": 128586};

    let user = await User.findOne({email: body.emailAddress});

    const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const redirectURL = process.env.REDIRECT_URI;
  
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, clientSecret, redirectURL);
  
    oauth2Client.setCredentials(user)
  
    const gmail = google.gmail({version: 'v1', auth: oauth2Client});
  
    const gmailGetHistoriesAsync = promisify(gmail.users.history.list.bind(gmail));
  
    let rs = await gmailGetHistoriesAsync({
      auth: oauth2Client,
      userId: "me",
      startHistoryId: body.historyId,
      historyTypes: ["messageAdded"],
      labelId: 'INBOX'
    });

    const history = rs.data.history;

    const gmailGetMessagesAsync = promisify(gmail.users.messages.get.bind(gmail));

    for (let i = 0; i < history.length; i++){
      if (history[i].messagesAdded){
        const message = history[i].messagesAdded[0].message;

        const messageExists = await Message.exists({messageId: message.id});

        if (!messageExists){
  
          rs = await gmailGetMessagesAsync({
            auth: oauth2Client,
            userId: "me",
            id: message.id
          });
  
          const headers = rs.data.payload.headers;
          const body = new Buffer.from(rs.data.payload.parts[0].body.data, "base64").toString().trim();

          const newMessage = new Message({
            messageId: message.id,
            headers,
            body,
            ownerId: user._id
          })

          await newMessage.save()
          
          console.log("Saved Message");
        } else {
          console.log("Message Exists");
        }
      }
    } 
  
    //console.log(rs.data.history[0].messagesAdded);
  
    //let id = rs.data.history[0]//.messagesAdded[0].message.id;

    //console.log(id);
  
    // const gmailGetMessagesAsync = promisify(gmail.users.messages.get.bind(gmail));
  
    // rs = await gmailGetMessagesAsync({
    //   auth: oauth2Client,
    //   userId: "me",
    //   id: id,  
    // });
  
    // console.log(rs.data.payload);
    res.json({success: "Ok"})
  } catch(err){
    console.log(err.message)
    res.status(404);
    res.json(err)
  }
  
  // let body_content = JSON.stringify(rs.data.payload.parts[0].body.data);
  // let data, buff, text;
  // data = body_content;
  // buff = new Buffer.from(body_content, "base64");
  // mailBody = buff.toString();
  // // display the result
  // console.log(mailBody);
})

router.get("/test2", async (req, res) => {
  let exists = await User.exists({email: "isahsaidu308@gmail.com", given_name: "usah"})

  console.log(exists);

  res.json(exists)
})

router.get("/all-users", async (req, res) => {
  try{
    let users = await User.find();

    res.json(users)
  } catch(err){
    res.status(404);
    res.send(err)
  }
})
 
router.post("/webhook", async (req, res) => {
    let data = req.body.message.data
  
    let webhookBody = Buffer.from(data, 'base64').toString('utf8');

    webhookBody = JSON.parse(webhookBody);

    console.log(webhookBody)

    res.send("done")

    User.findOne({email: webhookBody.emailAddress})
    .then(async user => {
      try{
        const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
        const clientSecret = process.env.GMAIL_CLIENT_SECRET;
        const redirectURL = process.env.REDIRECT_URI;
      
        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, clientSecret, redirectURL);
      
        oauth2Client.setCredentials(user)
      
        const gmail = google.gmail({version: 'v1', auth: oauth2Client});
      
        const gmailGetHistoriesAsync = promisify(gmail.users.history.list.bind(gmail));
      
        let rs = await gmailGetHistoriesAsync({
          auth: oauth2Client,
          userId: "me",
          startHistoryId: user.recentHistoryId,
          historyTypes: ["messageAdded"],
          labelId: 'INBOX'
        });

        const history = rs.data.history;

        const gmailGetMessagesAsync = promisify(gmail.users.messages.get.bind(gmail));

        for (let i = 0; i < history.length; i++){
          if (history[i].messagesAdded){
            const message = history[i].messagesAdded[0].message;

            const messageExists = await Message.exists({messageId: message.id});

            if (!messageExists){
      
              rs = await gmailGetMessagesAsync({
                auth: oauth2Client,
                userId: "me",
                id: message.id
              });
      
              const headers = rs.data.payload.headers;
              const body = new Buffer.from(rs.data.payload.parts[0].body.data, "base64").toString().trim();

              const newMessage = new Message({
                messageId: message.id,
                headers,
                body,
                ownerId: user._id
              })

              await newMessage.save()

              await User.findByIdAndUpdate(user._id, {recentHistoryId: webhookBody.historyId})
              
              console.log("Saved Message");
            } else {
              console.log("Message Exists");
            }
          }
        }
      } catch(err){
        console.log(err.message);
      }
    })
    .catch(er => {
      console.log(er.message);
    })
});

router.post("/user-messages", async (req, res) => {
  try{
    const messages = await Message.find({ownerId: req.body.id});

    res.json(messages)
  } catch(err){
    res.status(404);
    res.json(err)
  }
});

module.exports = router;
