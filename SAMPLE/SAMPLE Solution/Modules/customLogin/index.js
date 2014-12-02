var DIRECTORY_DS_NAME = 'Directory';
var ADMIN_GROUP_NAME = 'Admin';

//to force 401, return a "standard" error object
//http://doc.wakanda.org/Users-and-Groups/Directory/setLoginListener.301-871936.en.html
var LOGIN_ERROR = {
	'WRONG_NAME_OR_PASSWORD':{error:1, errorMessage:'User name or password is incorrect.'},
	'INVALID_NAME_OR_PASSWORD':{error:2, errorMessage:'User name or password is invalid.'}
}

var removeListener = function(){
	directory.setLoginListener('');
}

var setListener = function(listenerName){
	directory.setLoginListener(listenerName, ADMIN_GROUP_NAME);
	var loginListener = directory.getLoginListener();
	if(loginListener.length){
		console.log('custom login listener installed: %s', loginListener);	
	}else{
		console.error('failed to install custom login listener: %s', listenerName);		
	}
}

var directoryProject = (function(){
	var applicationName;
	for(var i = 0;i < solution.applications.length;++i){
		applicationName = solution.applications[i].name;
		if(DIRECTORY_DS_NAME === applicationName){
			return solution.applications[i];
		}
	}
	return null;
})();

var User = directoryProject ? directoryProject.ds.User : null;

//because class methods and events are not exported across projects
//they must be implemented and exposed here;
var createUser = function(userName, userFullName, userGroup, userPassword){
	var user = new User();
	user.account = userName;//avoid obfuscation of application.name 
	user.name = userFullName;
	setUserGroup(user, userGroup);	
	setUserPassword(user, userPassword);
	return saveUser(user);	
}

//because class methods and events are not exported across projects
//they must be implemented and exposed here;
function verifyUser(user, password){
	if(user && password){
		var sha1 = require('crypto').createHash('sha1');
		sha1.update(password);
		return user.password === sha1.digest('base64'); 			
	}
	return false;
}

//would have been events.set if cross project export was possible
function setUserGroup(user, groupName){
	user.group = null;
	var group = directory.group(groupName);
	if(group){
		user.group = group.ID;			
	}
}

//would have been events.set if cross project export was possible
function setUserPassword(user, password){
	user.password = null;
	if(password){
		var sha1 = require('crypto').createHash('sha1');
		sha1.update(password, 'utf8');
		user.password = sha1.digest('base64');		
	}
}

//simplistic API, true of false
function saveUser(user){
	try{
		return user.save();
	}catch(e){
		for(var i = 0;i < e.messages.length;++i){
			console.error('%s', e.messages[i]);			
		}
	}
	return false;
}

function findUser(userName){
	if(userName){
		return User.find('account ===  :1', userName);
	}else{
		return null;
	}
}

exports.login = function(userName, password, isKey){
	if(!isKey){	
    	if(User && userName){
    		//avoid obfuscation of application.name 
			var user = findUser(userName);
			if(!verifyUser(user, password)){
				return LOGIN_ERROR.WRONG_NAME_OR_PASSWORD;
			}
		
			var group = directory.group(user.group);
		
			return { 
	            'ID':user.id, 
	            'name':user.account, 
	            'fullName':user.name,
	            'belongsTo':[group.ID]
	    	};
    	}else{
    		console.error('the directory project is missing or not ready.');
    	}	
	}else{
		//starting from WAK10 the studio seems to send passwords as hash;
		//let's use the default directory instead
		console.log('password was provided to custom login as hash: ' + password);
		return false;
	}	
}

var clear = function(){
	User.remove();
};

var countUsers = function(){
	return User.length;
};

var getUser = function(userName){
	var user = findUser(userName);
	if(user){
		return {
			'account':user.account, 
			'name':user.name, 
			'group':directory.group(user.group).name};
	}
	return user;
};

var getUsers = function(){
	var users = [];
	User.all().forEach(function(user, i){
		users.push({
				'account':user.account, 
				'name':user.name, 
				'group':directory.group(user.group).name
			});
	});
	return users;
};

var removeUser = function(userName){
	var user = findUser(userName);
	if(user){
		user.remove();
		return !findUser(userName);
	}
	return false;
};

var changeUserPassword = function(userName, oldPassword, newPassword){
	var user = findUser(userName);
	if(verifyUser(user, oldPassword)){
		setUserPassword(user, newPassword);
		return saveUser(user);	
	}				
	return false;
}

//only authorized operations should be exported
exports.clear = clear;
exports.countUsers = countUsers;
exports.getUser = getUser;
exports.getUsers = getUsers;
exports.removeUser = removeUser;

exports.changeUserPassword = changeUserPassword;
exports.createUser = createUser;

exports.setListener = setListener;
exports.removeListener = removeListener;
