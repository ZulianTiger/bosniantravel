var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var nameValidator = [ /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/, "No special characters, must have space in between name and must be min. 3 characters." ];

var usernameValidator = [
	validate({
		validator: 'isAlphanumeric',
		message: 'Username can only contain letters and numbers.'
	}),
	validate({
		validator: 'isLength',
		arguments: [3, 30],
		message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters.'
	})
];

var passwordValidator = [
	validate({
		validator: 'isLength',
		arguments: [6, 30],
		message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters.'
	})
];

var emailValidator = [
	validate({
		validator: 'isEmail',
		message: 'Invalid E-mail address!'
	}),
	validate({
		validator: 'isLength',
		arguments: [3, 30],
		message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters.'
	})
];

var UserSchema = new Schema({
	name: {type: String, required: true, match: nameValidator},
	username: {type: String, required: true, unique: true, validate: usernameValidator},
	password: {type: String, required: true, validate: passwordValidator, select: false},
	email: {type: String, required: true, unique: true, validate: emailValidator},
	active: {type: Boolean, required: true, default: false},
	temporaryToken: {type: String, required: true}
});

UserSchema.pre('save', function(next){
	//encrypt password before saving
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.hash(user.password, null, null, function(err, hash){
		if(err) return next(err);
		user.password = hash;
		next();
	});	
});

UserSchema.plugin(titlize, {
	paths: ['name']
});

UserSchema.methods.comparePassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);