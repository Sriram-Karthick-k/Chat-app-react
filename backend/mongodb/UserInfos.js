//user info schema
const mongoose=require("./Main.js")
var Schema = mongoose.Schema;
var userinfo = new Schema({
  userName: String,
  mail: String,
  password: String,
  wrongAttempt: Number,
  lock: String,
  oneTimePassword: String,
  userProfileImage:String,
  lastOnline:String,
  verification:[],
  friends:[]
})
var UserInfo = mongoose.model("UserInfo", userinfo);
module.exports=UserInfo
