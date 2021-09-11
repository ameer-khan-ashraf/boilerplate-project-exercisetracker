const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
var bodyParser = require('body-parser');
var moment = require('moment');
//Mongoose Connection
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

// parse application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));

const personSchema = new mongoose.Schema({
  username: String
});
const User = mongoose.model('User',personSchema);

const exerciseSchema = new mongoose.Schema({userId:String, description: String, duration: Number, date: Date})
const Exercise = mongoose.model('Exercise',exerciseSchema)
app.use(cors())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users').post((req,res)=>{
    const user = new User({username:req.body.username});
    user.save((err,data)=>{
      if(err) return done (err);
      res.json({"username":data.username, "_id":data.id});
    })
}).get((req,res)=>{
  User.find({}, (err,data)=>{
    usermap=[]
    data.forEach(function(data){
      userdetails={"username":data.username,"_id":data.id};
      usermap.push(userdetails);
    })
    res.json(usermap)
  })
});

app.route('/api/users/:_id/exercises').post((req,res)=>{
  let{userId,description,duration,date} = req.body;
  date = date?date:moment().format("MMM DD YY");
  User.findById(userId, (err,data)=>{
    if(!data){
      res.send("Unknown userId")
    }
    else{
      const user = data.username
      const newExercise = new Exercise({userId, description, duration, date})
      newExercise.save((err,data)=>{
        dateres =moment(data.date).format("MMM DD YYYY");
        console.log(data);
        res.json({"_id":data.userId,
                  "username":user, 
                  "date":dateres,
                  "duration":data.duration,
                  "description":data.description })
      })
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
