var DIRECTORY_DS_NAME = 'Directory';
var ADMIN_GROUP_NAME = 'Admin';

//to force 401, return a "standard" error object
//http://doc.wakanda.org/Users-and-Groups/Directory/setLoginListener.301-871936.en.html
var LOGIN_ERROR = {
	'WRONG_NAME_OR_PASSWORD':{error:1, errorMessage:'User name or password is incorrect.'},
	'INVALID_NAME_OR_PASSWORD':{error:2, errorMessage:'User name or password is invalid.'}
}

var setListener = function(listenerName){
	directory.setLoginListener(listenerName, ADMIN_GROUP_NAME);
	return !!directory.getLoginListener().length;
}

var User = (function(){
	var applicationName;
	for(var i = 0;i < solution.applications.length;++i){
		applicationName = solution.applications[i].name;
		if(DIRECTORY_DS_NAME === applicationName){
			return solution.applications[i].ds.User;
		}
	}
	return null;
})();

//because class methods and events are not exported across projects,
//they must be implemented and exposed here;
var createUser = function(userName, userGroup, userPassword){
	var user = new User();
	user.name = userName;//avoid obfuscation of application.name 
	setUserGroup(user, userGroup);	
	setUserPassword(user, userPassword);
	return saveUser(user);	
}

//because class methods and events are not exported across projects,
//they must be implemented and exposed here;
function verifyUser(user, password){
	if(user && password){
		var sha1 = require('crypto').createHash('sha1');
		sha1.update(password);
		return user.password === sha1.digest('base64'); 			
	}
	return false;
}

//would have been events.set if cross project export was possible)
function setUserGroup(user, groupName){
	user.group = null;
	var group = directory.group(groupName);
	if(group){
		user.group = group.ID;			
	}
}

//would have been events.set if cross project export was possible)
function setUserPassword(user, password){
	user.password = null;
	if(password){
		var sha1 = require('crypto').createHash('sha1');
		sha1.update(password, 'utf8');
		user.password = sha1.digest('base64');		
	}
}

//just to supress the errors
function saveUser(user){
	try{
		return user.save();
	}catch(e){
		console.log(JSON.stringify(e));
	}
	return false;
}

//this one will be exported	
var changeUserPassword = function(user, oldPassword, newPassword){
	if(verifyUser(user, oldPassword)){
		setUserPassword(user, newPassword);
		return saveUser(user);	
	}			
	return false;
}

exports.login = function(userName, password, isKey){
	if(!isKey){	
    	if(User && userName){
    		//avoid obfuscation of application.name 
			var user = User.find('name ===  :1', userName);
		
			if(!verifyUser(user, password)){
				return LOGIN_ERROR.WRONG_NAME_OR_PASSWORD;
			}
		
			var group = directory.group(user.group);
		
			return { 
	            'ID':user.uuid, 
	            'name':user.name, 
	            'fullName':user.name,
	            'belongsTo':[group.ID]
	    	};
    	}else{
    		console.error('The Directory project is missing.');
    	}	
	}else{
		//starting from WAK10 the studio seems to send passwords as hash;
		//let's use the default directory instead
		console.log('password was provided to custom login as hash: ' + password);
		return false;
	}	
}

//shame class methods and events can't be exported across projects
exports.changeUserPassword = changeUserPassword;
exports.createUser = createUser;
exports.setListener = setListener;

//an alias to the Directory project's dataclass
exports.User = User;
