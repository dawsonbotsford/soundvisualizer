// You need to install express locally with npm install. Global won't work.
var express = require('express');
var mongoskin = require('mongoskin');
var app = express();

var username = 'readuser'; // TODO
var password = 'ReadUserPassword'; // TODO
var url = '104.236.60.203'; // TODO
var db = mongoskin.db('mongodb://'+username+':'+password+'@'+url+':27018/sound', {safe:true})

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/',function(req,res){
  var query;
  db.collection('noise').findOne(function(err, result) {
    if (err) throw err;
    console.log(result.noise.avg60s);
    res.send(result);
  });
});

// path to Austin's equalizer
app.get('/equalizer', function(req,res){
  res.render('equalizer/equalizer.html');
});

// path to Dawson's noise recorder
app.get('/livedaily',function(req,res){
  res.render('livedaily/livedaily.html');
});

// Dawson's mongo data collection
app.get('/livevisualdata',function(req,res){
  data = db.collection('noise').find({location:'microphone'}).sort({"date":-1}).limit(1).toArray(function(err,result){
   if (err) throw err;
   res.json(result);
  })
});

//this was supposed to be the API, depricated as of now.
app.get('/measures',function(req,res){
  query = req.query;

  if (!query.hasOwnProperty('start')){
    res.send('Bad start parameter, use format: /measures?start=55&finish=55')
  }

  if (!query.hasOwnProperty('finish')){ 
    res.send('Bad finish parameter, use format: /measures?start=55&finish=55')
  }
  else {
    start = parseInt(query.start);
    finish =  parseInt(query.finish);
    res.send('Measures ' + start + ' ' + finish);
    //make mongo query here using start and finish params
    //this is where we put the datafile to be sent.
    //res.sendfile('sample_data.csv')
  }
});

app.listen(13000);
console.log('listening on port 13000');

