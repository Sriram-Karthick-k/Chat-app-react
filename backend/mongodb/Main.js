const mongoose = require("mongoose")
mongoose.connect('mongodb://localhost:27017/Chat-Db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
module.exports=mongoose
