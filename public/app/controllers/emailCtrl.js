angular.module('emailController', ['userServices'])

.controller('emailCtrl', function($routeParams, User, $timeout, $location){

	app = this;

	User.activateAccount($routeParams.token).then(function(data){
		app.successMsg = false;
		app.errorMsg = false;

		if(data.data.success) {
			app.successMsg = data.data.message + '...Redirecting';
			$timeout(function(){
				$location.path('/login');
			}, 2000);
		} else{
			app.errorMsg = data.data.message+ '...Redirecting';
			$timeout(function(){
				$location.path('/');
			}, 2000);
		}
	});
})

.controller('resendCtrl', function(User){

	app = this;

	app.checkCredentials = function(loginData){
		app.disabled = false;
		app.errorMsg = false;
		app.successMsg = false;

		User.checkCredentials(app.loginData).then(function(data){
			if(data.data.success){
				//resend link
				app.disabled = true;
				User.resendLink(app.loginData).then(function(data){
					if(data.data.success){
						app.successMsg = data.data.message;
					}
				});
			} else{
				//error message
				app.disabled = false;
				app.errorMsg = data.data.message;
			}
		});
	};
});