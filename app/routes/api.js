var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'supersaiyan';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function(router) {




	var options = {
		auth: {
			api_user: 'ZulianTiger',
			api_key: '061186180aA'
		}
	}

	var client = nodemailer.createTransport(sgTransport(options));


	// http://localhost:8080/api/users
	// USER REGISTRATION ROUTE
	router.post('/users', function(req, res){ 
	var user = new User();
	user.username = req.body.username;
	user.password = req.body.password;
	user.email = req.body.email;
	user.name = req.body.name;
	user.temporaryToken = jwt.sign({username: user.username, email: user.email}, secret, {expiresIn: '72h'});

	if(req.body.username == null || req.body.password == null || req.body.email == null || req.body.username == "" || req.body.password == "" || req.body.email == "" || req.body.name == null || req.body.name == ""){
		res.json({
			success: false, message: 'Username, password and email cannot be empty!'
		});
	} else{
		user.save(function(err){
		if(err) {
			
			if(err.errors != null){
				if(err.errors.name){
					res.json({success: false, message: err.errors.name.message});
				} else if(err.errors.email){
					res.json({success: false, message: err.errors.email.message});
				} else if(err.errors.username){
					res.json({success: false, message: err.errors.username.message});
				} else if(err.errors.password){
					res.json({success: false, message: err.errors.password.message});
				} else{
					res.json({success: false, message: err.message});
				}
			} else if(err){
				if(err.message[58] == 'e')
						res.json({success: false, message: "E-mail is already taken"});
					else if(err.message[58] == 'u')
						res.json({success: false, message: "Username is already taken"});
					else 
						res.json({success: false, message: err.message});
			}
		} else{

			var email = {
				from: 'Localhost Staff, staff@localhost.com',
				to: user.email,
				subject: 'Localhost activation link',
				text: 'Hello '+user.name+', thank you for registering to bosniantravel.com. Please click the link below to activate your account. http://localhost:8080/activate/'+user.temporaryToken,
				html: 'Hello <strong>' + user.name + '</strong>,<br><br>Thank you for registering to bosniantravel.com. Please click the link below to activate your account.<br><br><a href="http://localhost:8080/activate/'+user.temporaryToken+'">http://localhost:8080/activate/</a>'
			};

			client.sendMail(email, function(err, info){
			if(err){
				console.log(err);
			} else{
				console.log('Message sent: ', info.response);
				}
			});

			res.json({success: true, message: 'Account registered! Please check your e-mail for activation link.'});
		}
	});	
	}
	});

	// http://localhost:8080/api/authenticate
	// USER LOGIN ROUTE
	router.post('/authenticate', function(req, res){
		User.findOne({ username: req.body.username }).select('email username password active').exec(function(err, user){
			if(err) throw err;

			if(!user) {
				res.json({success: false, message: 'Could not authenticate user'});
			} else if(user){
				if(req.body.password) {
					var validPassword = user.comparePassword(req.body.password)
				} else{
					res.json({success:false, message:'No password provided'});
				}
				if(!validPassword) {
					res.json({success: false, message: 'Wrong password!'});
				} 
				else if(!user.active){
					res.json({success: false, message: 'Account is not yet activated! Please check your e-mail for activation link.', expired: true});
				}
				else{
					var token = jwt.sign({ username: user.username, email: user.email }, secret, {expiresIn: '72h'});
					res.json({success: true, message: 'User authenticated!', token: token});
				}
			}
		})
	});

	router.put('/activate/:token', function(req, res){
		User.findOne({temporaryToken: req.params.token}, function(err, user){
			if(err) throw err;
			var token = req.params.token;

			jwt.verify(token, secret, function(err, decoded){
				if(err) {
					res.json({success: false, message: 'Activation link has expired'});
				} else if(!user){
					res.json({success: false, message: 'Activation link is not valid'});
				} else{
					user.temporaryToken = false;
					user.active = true;
					user.save(function(err){
						if(err) {
							console.log(err);
						} else{

							var email = {
								from: 'Localhost Staff, staff@localhost.com',
								to: user.email,
								subject: 'Localhost Account Activated',
								text: 'Hello '+user.name+', thank you for registering to bosniantravel.com. Your account has been successfully activated!',
								html: 'Hello <strong>' + user.name + '</strong>,<br><br>Your bosniantravel.com account has been successfully activated!'
							};

							client.sendMail(email, function(err, info){
								if(err){
									console.log(err);
								} else{
									console.log('Message sent: ', info.response);
								}
							});

							res.json({success: true, message: 'Account activated!'});

						}

					});

					
				}
			});

		});
	});

	router.post('/resend', function(req, res){
		User.findOne({ username: req.body.username }).select('username password active').exec(function(err, user){
			if(err) throw err;

			if(!user) {
				res.json({success: false, message: 'Could not authenticate user'});
			} else if(user){
				if(req.body.password) {
					var validPassword = user.comparePassword(req.body.password)
				} else{
					res.json({success:false, message:'No password provided'});
				}
				if(!validPassword) {
					res.json({success: false, message: 'Wrong password!'});
				} 
				else if(user.active){
					res.json({success: false, message: 'Account is already activated.'});
				}
				else{
					res.json({success: true, user: user});
				}
			}
		})
	});

	router.put('/resend', function(req, res){
		User.findOne({username: req.body.username}).select('username name email temporaryToken').exec(function(err, user){
			if(err) throw err;

			user.temporaryToken = jwt.sign({username: user.username, email: user.email}, secret, {expiresIn: '72h'});
			user.save(function(err){
				if(err) {
					console.log(err);
				} else{
					var email = {
						from: 'Localhost Staff, staff@localhost.com',
						to: user.email,
						subject: 'Localhost activation link request',
						text: 'Hello '+user.name+', since you requested a new account activation link, here it is. Please click the link below to activate your account. http://localhost:8080/activate/'+user.temporaryToken,
						html: 'Hello <strong>' + user.name + '</strong>,<br><br>Since you requested a new account activation link, here it is. Please click the link below to activate your account.<br><br><a href="http://localhost:8080/activate/'+user.temporaryToken+'">http://localhost:8080/activate/</a>'
					};

					client.sendMail(email, function(err, info){
						if(err){
							console.log(err);
						} else{
							console.log('Message sent: ', info.response);
						}
					});
					res.json({success: true, message: 'Activation link has been sent to '+ user.email + '!'});
				}
			});
		})
	});

	router.get('/resetusername/:email', function(req, res){
		User.findOne({email: req.params.email}).select('email name username').exec(function(err, user){
			if(err) {
				res.json({success: false, message: err});
			} else{
				if(!user){
					res.json({success: false, message: 'Email was not found'});
				} else{
					var email = {
						from: 'Localhost Staff, staff@localhost.com',
						to: user.email,
						subject: 'Localhost forgotten username',
						text: 'Hello '+user.name+', you recently requested to be reminded of your username, so here it is: '+user.username,
						html: 'Hello <strong>' + user.name + '</strong>,<br><br>you recently requested to be reminded of your username, so here it is: <strong>'+user.username+'</strong>' 
					};

					client.sendMail(email, function(err, info){
						if(err){
							console.log(err);
						} else{
							console.log('Message sent: ', info.response);
						}
					});
					res.json({success: true, message: 'Username has been sent to e-mail!'});
				}
			}
		});
	});

	router.put('/resetpassword', function(req, res){

		User.findOne({username: req.body.username}).select('username active email resettoken name').exec(function(err, user){
			if(err) throw err;
			if(!user) {
				res.json({success: false, message: 'Username was not found.'});
			} else if(!user.active){
				res.json({success: false, message: 'Account has not yet been activated!'});
			} else{
				user.resettoken = jwt.sign({username: user.username, email: user.email}, secret, {expiresIn: '72h'});
				user.save(function(err){
					if(err){
						res.json({success: false, message: err});
					} else{
						var email = {
						from: 'Localhost Staff, staff@localhost.com',
						to: user.email,
						subject: 'Localhost forgotten password',
						text: 'Hello '+user.name+', you recently requested to reset your password. Please click the link below to reset your password. http://localhost:8080/reset/'+user.resettoken,
						html: 'Hello <strong>' + user.name + '</strong>,<br><br>you recently requested to reset your password. Please click the link below to reset your password.<br><br><a href="http://localhost:8080/reset/'+user.resettoken+'">http://localhost:8080/reset/</a>' 
					};

					client.sendMail(email, function(err, info){
						if(err){
							console.log(err);
						} else{
							console.log('Message sent: ', info.response);
						}
					});

						res.json({success: true, message: 'Please check your email for password reset link.'});
					}
				});
			}
		});

	});

	router.get('/resetpassword/:token', function(req, res){
		User.findOne({resettoken: req.params.token}).select('resettoken username email name').exec(function(err, user){
			if(err) throw err;
			var token = req.params.token;
			//verify token
			jwt.verify(token, secret, function(err, decoded){
				if(err){
					res.json({success: false, message: err});
				} else {
					if(!user){
						res.json({success: false, message: 'Password link has expired'});
					} else{
						res.json({success: true, user: user});
					}
				}
			});
		});
	});

	router.put('/savepassword', function(req, res){
		User.findOne({username: req.body.username}).select('username email name password resettoken').exec(function(err, user){
			if(err) throw err;
			if(req.body.password == null || req.body.password == ''){
				res.json({success: false, message: 'Password not provided.'});
			}else{
				user.password = req.body.password;
				user.resettoken = false;
				user.save(function(err){
					if(err){
						res.json({success: false, message: err});
					}else{
						res.json({success: true, message: 'Password has been reset!'});
					}
				});
			}
			
		});
	});

	router.use(function(req, res, next){
		var token = req.body.token || req.body.query || req.headers['x-access-token'];
		if(token) {
			//verify token
			jwt.verify(token, secret, function(err, decoded){
				if(err){
					res.json({success: false, message: 'Token invalid'});
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else{
			res.json({success: false, message: 'No token provided'});
		}
	});

	router.post('/me', function(req, res){
		res.send(req.decoded);
	})

	return router;
}