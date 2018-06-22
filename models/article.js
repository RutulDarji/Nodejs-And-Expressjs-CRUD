let  mongoose = require('mongoose');

// article schema
let articleSchema =  mongoose.Schema({
  title : {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});
// export schema
let Article = module.exports = mongoose.model('Article' , articleSchema);
