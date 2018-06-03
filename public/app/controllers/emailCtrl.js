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
})

.controller('usernameCtrl', function(User){
	app = this;
	app.sendUsername = function(userData, valid){
		app.errorMsg = false;
		app.disabled = false;
		if(!app.userData) {
			console.log('No mail provided');
		} else{
			if(valid){
				User.sendUsername(app.userData.email).then(function(data){
					if(data.data.success){
						app.disabled = true;
						app.successMsg = data.data.message;
					} else{
						app.disabled = false;
						app.errorMsg = data.data.message;
					}
				});
			} else{
				app.disabled = false;
				app.errorMsg = 'Please enter a valid e-mail';
			}
			
		}
		
	};
})

.controller('passwordCtrl', function(User){
	app = this;

	app.sendPassword = function(resetData, valid){
		app.errorMsg = false;
		app.disabled = false;
		if(!app.resetData) {
			console.log('No username provided');
		} else{
			if(valid){
				User.sendPassword(app.resetData).then(function(data){
					if(data.data.success){
						app.disabled = true;
						app.successMsg = data.data.message;
					} else{
						app.disabled = false;
						app.errorMsg = data.data.message;
					}
				});
			} else{
				app.disabled = false;
				app.errorMsg = 'Please enter a valid username';
			}
			
		}
		
	};
})

.controller('resetCtrl', function(User, $routeParams, $scope, $timeout, $location){

	app = this;
	app.hide = true;

	User.resetUser($routeParams.token).then(function(data){
		if(data.data.success){
			app.hide = false;
			app.successMsg = 'Please enter a new password';
			$scope.username = data.data.user.username;
			console.log($scope.username);
		} else{
			app.errorMsg = data.data.message.message;
		}
	});

	app.savePassword = function(regData, valid){
		app.errorMsg = false;
		app.disabled = true;

		if(valid){
			app.regData.username = $scope.username;
			app.disabled = true;
			User.savePassword(app.regData).then(function(data){
				if(data.data.success){
					app.disabled = true;
					app.successMsg = data.data.message + '...Redirecting';
					$timeout(function(){
						$location.path('/login');
					}, 1500);
				} else{
					app.disabled = false;
					app.errorMsg = data.data.message;
				}
			});
		}
		else{
			app.disabled = false;
			app.errorMsg = 'Please make sure you have entered the new password!';
		}
	}

});

