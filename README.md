wak-custom-login
================

Custom login module for Wakanda

Sample
------
1. Run the solution.
* If the Studio asks for credentials, enter user:admin, password:wafwaf. (at this point, the default directory is used)
* the solution includes 2 projects; Directory and SAMPLE. Run the index page of SAMPLE. There is a login widget.
* Enter user:admin, password:wafwaf, as you did with the Studio. It will be rejected. (custom login is now active)
* Enter user:miyako, pass:password. It is accepted.  
* Click "See Bottstrap Example". The page uses Bootstraps and other JS frameworks instead of Wakanda Widgets.
* Enter user:admin, pass:wafwaf. It is rejected.
* Enter user:miyako, pass:password. It is accepted.




* The main project is SAMPLE.
* It has a Bootstraps folder, with 1 file, customLogin.js.
* The bootstrap file is therefore customLogin.js.
* The script activates custom login. 
* Custom login consults the Directory project for user/password validation.
* There is just 1 user registered, user:miyako, pass:password.
