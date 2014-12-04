wak-custom-login
================

Custom login module for Wakanda

Sample
------
1. Run the solution.
* If the Studio asks for credentials, enter user:admin, password:wafwaf. (at this point, the default directory is used)
* The solution includes 2 projects; Directory and SAMPLE. Run the index page of SAMPLE. There is a login widget.
* Enter user:admin, password:wafwaf, as you did with the Studio. It will be rejected. (custom login is now active)
* Enter user:miyako, pass:password. It is accepted.  
* Click "See Bottstrap Example". The page uses Bootstraps and other JS frameworks instead of Wakanda Widgets.
* Enter user:admin, pass:wafwaf. It is rejected.
* Enter user:miyako, pass:password. It is accepted.

Overview
--------
So what's going on? 

Directory is a local project, that is, it does not get published by the HTTP server. Check out project settings. It has journaling and auto-restore enabled, but all other service related settings are disabled. This means that the project's data store (there is a "User" data class) is not accesible through REST or Data Provider (XHR), it is only accesible by server-side JS. 

There is a solution level module, customLogin, which publishes API to access to the Directory project. The idea is that you always access the custom directory (in this example, the Directory project) using these APIs.

```
var modulesFolder = FileSystemSync('Modules');
var customLogin = require(modulesFolder.path + 'customLogin');

//to remove all users
customLogin.clear();

//to add a user
customLogin.createUser('miyako', 'Keisuke Miyako', 'Admin', 'password');

//to change the password
customLogin.changeUserPassword('miyako', 'password', 'new-password');

//does not return the entity or collection for security, only a flat object or array or objects.
customLogin.getUser('miyako');
customLogin.getUsers();

//to get the number of users
customLogin.countUsers();

//to remove a user
customLogin.removeUser('miyako')
```

It also publishes a method to activate custom login, which is called in the bootstraps of SAMPLE.

```
//the module should be installed in the solution's modules folder
//the directory should be made accesible by the solution's filesystems.json
var modulesFolder = FileSystemSync('Modules');
var customLogin = require(modulesFolder.path + 'customLogin');

//pass the name of the function defined in solution/required.js
customLogin.setListener('userLogin');
```

The custom login method, in the solution's require.js, also calls the module.

```
//must be a function published in the global context
//http://doc.wakanda.org/Users-and-Groups/Directory/setLoginListener.301-871936.en.html 
function userLogin(userName, password, isKey){	
	var modulesFolder = FileSystemSync('Modules');
	var customLogin = require(modulesFolder.path + 'customLogin');
	return customLogin.login(userName, password, isKey);
}
```


* The main project is SAMPLE.
* It has a Bootstraps folder, with 1 file, customLogin.js.
* The bootstrap file is therefore customLogin.js.
* The script activates custom login. 
* Custom login consults the Directory project for user/password validation.
* There is just 1 user registered, user:miyako, pass:password.
