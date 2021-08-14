const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
var bodyParser = require('body-parser');

//Mongoose Connection
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

// parse application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));

const schema = new mongoose.Schema({
  username: String,
  exercise:[{
    description: String,
    duration: Number,
    date: Date
  }]
});
const User = mongoose.model('User',schema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users').post((req,res)=>{
    const user = new User({username:req.body.username});
    user.save((err,data)=>{
      if(err) return done (err);
      res.json({"user":data.username, "id":data.id});
    })
}).get((req,res)=>{
  User.find({}, (err,data)=>{
    usermap=[]
    data.forEach(function(data){
      userdetails={"id":data.id,"username":data.username};
      usermap.push(userdetails);
    })
    res.json(usermap)
  })
});

app.route('/api/users/:_id/exercises').post((req,res)=>{
    var exerciset={"description":req.body.description,"duration":req.body.duration,"date":req.body.date};
    User.find({"id":req.body._id},(err,data)=>{
      if (err) return done (err);
      data.exercise.push(exerciset);
      data.save((err,data)=>{
        if(err) return done (err);
        res.json({"_id":data.id,"username":data.username,"date":req.bod.date,"duration":req.body.duration,"description":req.body.description});
      });
    })

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
