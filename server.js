var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var morgan = require('morgan');
var mongoose = require('mongoose');
var User = require('./app/models/user');
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

mongoose.connect('mongodb://localhost:27017/test1', function(err){
	if(err){
		console.log('Not connected to the database ' + err);
	} else{
		console.log('Successfully connected to mongoDB');
	}
});

// http://localhost:8080/users
app.post('/users', function(req, res){ 
	var user = new User();
	user.username = req.body.username;
	user.password = req.body.password;
	user.email = req.body.email;
	//console.log("username: "+ user.username + "-------- password: " + user.password + "--------- email: "+ user.email);
	user.save();
	res.send('User created');
});

app.listen(port, function() {
	console.log('Running the server on port ' + port);
});