//user info schema
const mongoose=require("./Main.js")
var Schema = mongoose.Schema;
var chatdetails = new Schema({
  from:String,
  to:String,
  lastMessage:Object,
  unSeenMessages:String,
  chats:[]
})
var ChatDetails = mongoose.model("ChatDetails", chatdetails);
module.exports=ChatDetails
