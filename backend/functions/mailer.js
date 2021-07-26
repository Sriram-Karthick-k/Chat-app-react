const nodemailer = require("nodemailer")
//nodemailer
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "Your mail",
    pass: "Your Password"
  }
})

module.exports=transporter
