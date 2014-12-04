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

*Examples of using the module*
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

*Testing the module*

Open a browser and go to [http://127.0.0.1:8081/testServer?path=tests/customLogin.js](http://127.0.0.1:8081/testServer?path=tests/customLogin.js).

The module also publishes a method to activate custom login, which is called in the bootstraps of SAMPLE.

*Boostrap Code*
```
var modulesFolder = FileSystemSync('Modules');
var customLogin = require(modulesFolder.path + 'customLogin');

//pass the name of the function you defined in solution/required.js
customLogin.setListener('userLogin');
```

The custom login method, in the solution's require.js, also calls the module. Code to access the Directory project and validate the login credentials are implemented inside the module so the only method you need to know is login. 

*Required.js*
```
function userLogin(userName, password, isKey){	
	var modulesFolder = FileSystemSync('Modules');
	var customLogin = require(modulesFolder.path + 'customLogin');
	return customLogin.login(userName, password, isKey);
}
```

Install
-------
The module can be installed in any solution.

* Create a solution level filesystems.js, if you don't already have one, and follow the example.
```
  {
  "name":"Modules",
  "parent":"SOLUTION",
  "path":"Modules",
  "writable":true
  }  
```

* Create a solution level required.js, if you don't already have one, and follow the example.
```
function userLogin(userName, password, isKey){	
	var modulesFolder = FileSystemSync('Modules');
	var customLogin = require(modulesFolder.path + 'customLogin');
	return customLogin.login(userName, password, isKey);
}
```

* Create a boostrap in your project, if you don't already have one, and follow the example.
```
var modulesFolder = FileSystemSync('Modules');
var customLogin = require(modulesFolder.path + 'customLogin');
customLogin.setListener('userLogin');
```
* Add an admin user to the Admin group, if you don't already have one. (to activate the directory system)

That' it!

When you start the solution from the Studio, you need to enter the admin user/password from the directory. This is because the ServerAdmin project is always started before any of your own projects, and therefore the custom login is yet to be activated.

After that, you can only login using credentials registered in the Directory project. You can CRUD users using the module's exported methods.


