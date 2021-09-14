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
  username: {type:String, unique: true}
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
      if(err){
        res.json("username already taken");
      }
      else{
        res.json({"username":data.username, "_id":data.id});
      }
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
  const userId = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  date = req.body.date?req.body.date: Date.now();
  date = new Date(date).toDateString();
  User.findById(userId, (err,data)=>{
    if(!data){
      res.send("Unknown userId")
    }
    else{
      const user = data.username
      const newExercise = new Exercise({userId, description, duration, date})
      newExercise.save((err,resp)=>{
        res.json({"_id":userId,
                  "username":user, 
                  "date":date,
                  "duration": Number(duration),
                  "description":description })
      })
    }
  });
});
app.route('/api/users/:_id/logs').get((req,res)=>{
  const userId = req.params._id;
  let{from,to,limit} = req.query;

  User.find({_id:userId},(err, docs)=>{
    if(!docs){
      res.send("no user found");
    }
    else{
      console.log(docs[0]._id,docs[0].username);
      console.log("user found");
      Exercise.find({userId:userId,date:{$gte:from?from:new Date(-8640000000000000), $lte:to?to:new Date(8640000000000000)}}).limit(limit?Number(limit):1000).then((resp)=>{
          const count = resp.length;
          resp=JSON.parse(JSON.stringify(resp));
          console.log("this is the response",count,resp);
          for (var i=0;i<count;i++){
            resp[i].date = new Date(resp[i].date).toDateString();
            console.log(resp[i].date);
          }
          res.json({
            "username": docs[0].username,
            "count": count,
            "_id": userId,
            "log":resp
          })

      });
    }
  })
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
