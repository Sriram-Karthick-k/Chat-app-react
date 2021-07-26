const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
require("dotenv").config()
const bodyParser= require("body-parser")
const bcrypt=require("bcrypt")
const cors = require("cors")
const mongoose= require('mongoose')
const jwt = require("jsonwebtoken")
const transporter = require("./functions/mailer.js")
const fs=require("fs")
const multer = require('multer');
const UserInfo =require("./mongodb/UserInfos")
const ChatDetails=require("./mongodb/ChatDetails")

var usersOnline={}

io.on("connection", socket => {
  socket.on("send message",async body => {
      var chatFoundFrom=await ChatDetails.findOne({from:body.from,to:body.to}).exec()
      var chatFoundTo=await ChatDetails.findOne({from:body.to,to:body.from}).exec()
      //chat found from and updating to db
      if(chatFoundFrom){
        var chats=chatFoundFrom.chats
        chats.push(body)
        var user=await UserInfo.findOne({userName:body.from}).exec()
        var friends=user.friends
        var index=friends.indexOf (body.to)
        if(index>-1){
          friends.splice(index,1)
        }
        friends=[body.to,...friends]
        await ChatDetails.findOneAndUpdate({from:body.from,to:body.to},{$set:{chats:chats,lastMessage:body}}).exec()
        await UserInfo.findOneAndUpdate({userName:body.from},{$set:{friends:friends}}).exec()
        if(body.to in usersOnline){
          usersOnline[body.to].emit("message", body)
        }
      }else{
        var create=new ChatDetails({
          from:body.from,
          to:body.to,
          lastMessage:body,
          unSeenMessages:0,
          chats:[body]
        })
        var user=await UserInfo.findOne({userName:body.from}).exec()
        var friends=user.friends
        var index=friends.indexOf (body.to)
        if(index>-1){
          friends.splice(index,1)
        }
        friends=[body.to,...friends]
        await UserInfo.findOneAndUpdate({userName:body.from},{$set:{friends:friends}}).exec()
        create.save()
        if(body.to in usersOnline){
          usersOnline[body.to].emit("message", body)
        }
      }
      //chat found to and updating db
      if(chatFoundTo){
        var chats=chatFoundTo.chats
        chats.push(body)
        var user=await UserInfo.findOne({userName:body.to}).exec()
        var friends=user.friends
        var index=friends.indexOf (body.from)
        if(index>-1){
          friends.splice(index,1)
        }
        friends=[body.from,...friends]
        var unSeen=Number(chatFoundTo.unSeenMessages)+1
        await ChatDetails.findOneAndUpdate({from:body.to,to:body.from},{$set:{chats:chats,lastMessage:body,unSeenMessages:unSeen}}).exec()
        await UserInfo.findOneAndUpdate({userName:body.to},{$set:{friends:friends}}).exec()
      }else{
        var create=new ChatDetails({
          from:body.to,
          to:body.from,
          lastMessage:body,
          unSeenMessages:1,
          chats:[body]
        })
        var user=await UserInfo.findOne({userName:body.to}).exec()
        var friends=user.friends
        var index=friends.indexOf (body.from)
        if(index>-1){
          friends.splice(index,1)
        }
        friends=[body.from,...friends]
        await UserInfo.findOneAndUpdate({userName:body.to},{$set:{friends:friends}}).exec()
        create.save()
      }
  })
  socket.on("login",async details=>{
    socket.user=details.userName
    var user=await UserInfo.findOne({userName:details.userName}).exec()
    socket.friends=user.friends
    usersOnline[details.userName]=socket
    await UserInfo.findOneAndUpdate({userName:details.userName},{$set:{lastOnline:"Online"}}).exec()
  })

  socket.on("disconnect",async ()=>{
    delete usersOnline[socket.user]
    await UserInfo.findOneAndUpdate({userName:socket.handshake.query.userName},{$set:{lastOnline:new Date().toLocaleTimeString()}}).exec()
  })
})


//config
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json())
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}))
var upload = multer();

//chat-details
app.get("/chat-details",async function(req,res){
  var chat=await ChatDetails.findOne({from:req.query.from,to:req.query.to}).exec()
  var lastOnline=await UserInfo.findOne({userName:req.query.to},{lastOnline:1,_id:0}).exec()
  if(chat){
    res.send({exist:true,lastOnline:lastOnline.lastOnline,chat:chat.chats})
  }else{
    res.send({exist:false,lastOnline:lastOnline.lastOnline})
  }
})

//chat list
app.get("/chat-list",async function(req,res){
  var user=await UserInfo.findOne({userName:req.query.userName},{friends:1,_id:0}).exec()
  var out=[]
  for(var i=0;i<user.friends.length;i++){
    var chatDetails=await ChatDetails.findOne({from:req.query.userName,to:user.friends[i]},{to:1,lastMessage:1,_id:0,unSeenMessages:1}).exec()
    var image=await UserInfo.findOne({userName:user.friends[i]},{userProfileImage:1,_id:0}).exec()
    var chatDetails={image:image.userProfileImage,to:chatDetails.to,lastMessage:chatDetails.lastMessage,unSeenMessages:chatDetails.unSeenMessages}
    out.push(chatDetails)
  }
  res.send(out)
})

app.get("/clearUnseen",async function(req,res){
  var chats=await ChatDetails.findOne({from:req.query.from,to:req.query.to},{_id:0,unSeenMessages:1}).exec()
  if(chats){
    await ChatDetails.findOneAndUpdate({from:req.query.from,to:req.query.to},{$set:{unSeenMessages:0}}).exec()
  }
  res.send(true)
})

// app.get("/getStatusOnline",async function(req,res){
//   var lastOnline=await UserInfo.findOne({userName:req.query.userName}).exec()
//   if(lastOnline!=null){
//     res.send(lastOnline.lastOnline)
//   }else{
//     res.send('')
//   }
// })

app.post("/sign-up",async function(req,res){
  var foundMail = await UserInfo.find({mail:req.body.mail}).exec()
  var foundUser=await UserInfo.find({userName:req.body.userName}).exec()
  var error={mail:[0,""],userName:[0,""],password:[0,""],confirmPassword:[0,""]}
  if(foundMail.length!=0){
    error.mail=[1,"The mail alread exists."]
  }
  if(foundUser.length!=0){
    error.userName=[1,"The user name alread exits."]
  }
  if(req.body.password.length<8){
    error.password=[1,"The password should contain atleast 8 characters."]
  }
  if(!passwordValidation(req.body.password) && error.password[0]===0){
    error.password=[1,"The password should contain atleast one character, one upper letter, one lower letter and one number."]
  }
  if(!stringCompare(req.body.password,req.body.confirmPassword)){
    error.confirmPassword=[1,"The password and confirm password doesn't match."]
  }
  if(error.mail[0]===0 && error.userName[0]===0 && error.password[0]===0 && error.confirmPassword[0]===0){
    var hashedPassword=await bcrypt.hash(req.body.password,10)
    var verification=generateNumber(6)
    var mailOptions = {
      from: "Your mailId",
      to: req.body.mail,
      subject: "verfication code",
      html: "<h4>Hi " + req.body.userName + ", Thanks for signing in with Chat App,Your verification number is " + verification + "<h4>"
    };
    sendMail(mailOptions)
    const create = new UserInfo({
      userName: req.body.userName,
      mail: req.body.mail,
      password: hashedPassword,
      wrongAttempt:5,
      lock: "NO",
      oneTimePassword: null,
      userProfileImage:false,
      friends:[],
      verification:[verification,"NO"]
    })
    create.save()
    res.send({valid:true})
  }else{
    res.send(error)
  }
})

app.post("/sign-in",async function(req,res){
  var foundMail = await UserInfo.find({mail:req.body.mail}).exec()
  var foundUser=await UserInfo.find({userName:req.body.mail}).exec()
  var error={mail:[0,""],password:[0,""]}
  if(foundMail.length===0 && foundUser.length===0){
    error.mail=[1,"Invalid User details"]
  }
  if(error.mail[0]===1){
    res.send(error)
  }else{
    if(foundMail.length!==0 && foundUser.length===0){
      if(foundMail[0].lock!="YES"){
        if(await bcrypt.compare(req.body.password,foundMail[0].password)){
          await UserInfo.findOneAndUpdate({mail:req.body.mail},{$set:{wrongAttempt:5}}).exec()
          var id=foundMail[0]._id
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: 3600 * 24
          })
          res.json({ auth: true, token: token, user: { loggedIn: true, userName: foundMail[0].userName, mail: foundMail[0].mail, verification: foundMail[0].verification } })
        }else{
          if(foundMail[0].wrongAttempt===1){
            error.password=[1,"Your account is locked please reset your password."]
            await UserInfo.findOneAndUpdate({mail:foundMail[0].mail},{$set:{wrongAttempt:0,lock:"YES"}})
            res.send(error)
          }else{
            error.password=[1,"Password and user name doesn't match.The attempts remaining is "+(foundMail[0].wrongAttempt-1)]
            await UserInfo.findOneAndUpdate({mail:foundMail[0].mail},{$set:{wrongAttempt:(foundMail[0].wrongAttempt-1)}})
            res.send(error)
          }
        }
      }else{
        error.password=[1,"Your account is locked please reset your password."]
        res.send(error)
      }
    }else if(foundUser.length!==0 && foundMail.length===0){
      if(foundUser[0].lock!="YES"){
        if(await bcrypt.compare(req.body.password,foundUser[0].password)){
          await UserInfo.findOneAndUpdate({mail:req.body.mail},{$set:{wrongAttempt:5}}).exec()
          var id=foundUser[0]._id
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: 3600 * 24
          })
          res.json({ auth: true, token: token, user: { loggedIn: true, userName: foundUser[0].userName, mail: foundUser[0].mail, verification: foundUser[0].verification } })
        }else{
          if(foundUser[0].wrongAttempt===1){
            error.password=[1,"Your account is locked please reset your password."]
            await UserInfo.findOneAndUpdate({mail:foundUser[0].mail},{$set:{wrongAttempt:0,lock:"YES"}})
            res.send(error)
          }else{
            error.password=[1,"Password and user name doesn't match.The attempts remaining is "+(foundUser[0].wrongAttempt-1)]
            await UserInfo.findOneAndUpdate({mail:foundUser[0].mail},{$set:{wrongAttempt:(foundUser[0].wrongAttempt-1)}})
            res.send(error)
          }
        }
      }else{
        error.password=[1,"Your account is locked please reset your password."]
        res.send(error)
      }
    }
  }
})

function verifyJWT(req, res, next) {
  const token = req.headers["x-access-token"]
  if (!token) {
    res.json({ loggedIn: false })
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.json({ loggedIn: false })
      } else {
        req.userId = decoded.id
        next();
      }
    })
  }
}
//isAuth
app.get("/isAuth", verifyJWT, function (req, res) {
  res.json({ loggedIn: true })
})

//Forgot
app.post("/forgot", async function (req, res) {
  var found = await UserInfo.find({ mail: req.body.mail }).exec()
  var out = { mail: [0, ""], reset: [0, ""], password: [0, ""], confirmPassword: [0, ""] }
  if (found.length == 0) {
    out.mail = [1, "The mail is not found"]
    res.json(out)
  } else {
    var verfication = generateNumber(6)
    var mailOptions = {
      from: "Your mailId",
      to: req.body.mail,
      subject: "Reset code",
      html: "<h4>Your code for password reset is : " + verfication + "<h4>"
    };
    sendMail(mailOptions)
    await UserInfo.findOneAndUpdate({ mail: req.body.mail }, { $set: { oneTimePassword: verfication } }).exec()
    res.json(null)
  }
})

//Reset
app.post("/reset", async function (req, res) {
  var found = await UserInfo.find({ mail: req.body.mail}).exec()
  var out = { mail: [1, req.body.mail], reset: [0, ""], password: [0, ""], confirmPassword: [0, ""] }
  if (String(found[0].oneTimePassword) != String(req.body.reset)) {
    out.reset = [1, "The reset code didn't match"]
  }
  if (req.body.password.length < 8) {
    out.password = [1, "The password must atleast contains 8 characters."]
  }
  var dummy = 0
  if (out.password[0] == 0) {
    passwordValidation(req.body.password) ? dummy = 1 : out.password = [1, "The password should contain atlease one character, one upper letter, one lower letter and one number."]
  }
  var compare = stringCompare(req.body.password, req.body.confirmPassword) ? dummy = 1 : out.confirmPassword = [1, "The password and confirm password should be same."]
  if (out.mail[0] != 1 || out.reset[0] != 0 || out.password[0] != 0 || out.confirmPassword[0] != 0) {
    res.json(out)
  } else {
    var hashedPassword = await bcrypt.hash(req.body.password, 10);
    await UserInfo.findOneAndUpdate({ mailId: req.body.mail }, { $set: { oneTimePassword: "", password: hashedPassword, lock: "NO", wrongAttemp: 5, } }).exec()
    res.json(null)
  }
})
app.post("/verification",async function(req,res){
  var foundUser = await UserInfo.findOne({userName:req.body.userName}).exec()
  var out=req.body
  if(foundUser.verification[0]==req.body.verification[0]){
    await UserInfo.findOneAndUpdate({mail:req.body.mail},{$set:{verification:[req.body.verification[0],"YES"]}}).exec()
    out.verification=[req.body.verification[0],"YES"]
    res.send(out)
  }else{
    res.send(out)
  }
})

app.get("/profile",async function(req,res){
  var user=await UserInfo.findOne({mail:req.query.mail},{userName:1,mail:1,profle:1}).exec()
  res.send(user)
})

app.get("/profileImage",async function(req,res){
  var user=await UserInfo.findOne({mail:req.query.mail},{userProfileImage:1}).exec()
  if(user.userProfileImage){
    res.send({image:user.userProfileImage})
  }else{
    res.send({image:false})
  }
  
})

app.post('/upload', upload.single('file'),async (req, res, next) => {
  var data=req.file.buffer
  await UserInfo.findOneAndUpdate({mail:req.body.mail},{$set:{userProfileImage:data.toString('base64')}})
  res.send({status:true})
});

app.get("/search",function(req,res){
  UserInfo.find({
    "userName": {
      $regex:req.query.userName ,$options:"i"
    }
  }, {
    userName:1,
    userProfileImage:1,
    _id: 0,
  }, function(err, result) {
    if (err) console.log(err);
    else {
      res.send(result)
    }
  });
})


function passwordValidation(password) {
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  var number = "1234567890";
  var characters = "abcdefghijklmnopqrstuvwxyz"
  var Ccharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  count = 0
  //password character checking
  if (format.test(password)) {
    count += 1
  }
  for (var i = 0; i < password.length; i++) {
    var key = count
    for (var j = 0; j < number.length; j++) {
      if (String(password[i]) === number[j]) {
        count += 1
        break
      }
    }
    if (key < count) {
      break
    }
  }
  for (var i = 0; i < password.length; i++) {
    var key = count
    for (var j = 0; j < characters.length; j++) {
      if (String(password[i]) === characters[j]) {
        count += 1
        break
      }
    }
    if (key < count) {
      break
    }
  }
  for (var i = 0; i < password.length; i++) {
    var key = count
    for (var j = 0; j < Ccharacters.length; j++) {
      if (String(password[i]) === Ccharacters[j]) {
        count += 1
        break
      }
    }
    if (key < count) {
      break
    }
  }
  if (count < 4) {
    return false
  } else {
    return true
  }
}

function stringCompare(str1, str2) {
  if (str1.localeCompare(str2) === 0) {
    return true
  } else {
    return false
  }
}

function sendMail(mailOptions) {
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    }
  })
}

function generateNumber(number) {
  var verificatinNumber = "";
  for (var i = 0; i < number; i++) {
    verificatinNumber += Math.floor(Math.random() * 10)
  }
  return verificatinNumber
}


server.listen(3001, () => console.log("server is running on port 3001"));