var User = require('../models/user');

module.exports = function(router) {

	// http://localhost:8080/api/users
	// USER REGISTRATION ROUTE
	router.post('/users', function(req, res){ 
	var user = new User();
	user.username = req.body.username;
	user.password = req.body.password;
	user.email = req.body.email;

	if(req.body.username == null || req.body.password == null || req.body.email == null || req.body.username == "" || req.body.password == "" || req.body.email == ""){
		res.json({
			success: false, message: 'Username, password and email cannot be empty!'
		});
	} else{
		user.save(function(err){
		if(err) {
			res.json({success: false, message: 'Username or E-mail already exists!'});
		} else{
			res.json({success: true, message: 'User created'});
		}
	});	
	}
	});

	// http://localhost:8080/api/authenticate
	// USER LOGIN ROUTE
	router.post('/authenticate', function(req, res){
		User.findOne({ username: req.body.username }).select('email username password').exec(function(err, user){
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
				} else{
					res.json({success: true, message: 'User authenticated!'});
				}
			}
		})
	});

	return router;
}