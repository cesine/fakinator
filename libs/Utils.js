/**
 * @class Utils provides a number of utility functions which are handy
 *        around the app.
 * 
 * @property {Boolean} debugMode This boolean can be changed from true to
 *           false to speed up the app.
 * @property {Boolean} productionMode This boolean can be changed from false to
 *           true to point the app to production servers rather than development servers.
 * @constructs
 */
var Utils = Utils || {};

Utils.debugMode = true;
Utils.productionMode = false;

Utils.couchUrl = "https://localhost:6984/default";
Utils.activityFeedCouchUrl = "https://localhost:6984/activity_feed";
Utils.authUrl = "https://localhost:3036";
/**
 * The parameters of the default couch server.
 */
Utils.defaultCouchConnection = function() {
  return {
    protocol : "https://",
    domain : "localhost",
    port : "6984",
    pouchname : "default"
  }; 
};

if(Utils.productionMode){
	Utils.authUrl = "https://dyslexdisorthgame.ilanguage.ca";
	Utils.couchUrl = "https://dyslexdisorthgame.iriscouch.com/default";
	Utils.activityFeedCouchUrl = "https://dyslexdisorthgame.iriscouch.com/activity_feed";
	
	Utils.defaultCouchConnection = function() {
	  return {
	    protocol : "https://",
	    domain : "dyslexdisorthgame.iriscouch.com",
	    port : "443",
	    pouchname : "default"
	  }; 
	};
}
/**
 * The address of the TouchDB-Android database on the Android.
 */
Utils.touchUrl = "http://localhost:8888/db";

/**
 * The address of the PouchDB database on the browser.
 */
Utils.pouchUrl = "idb://db";
/**
 * A message for users if they need help which brings them to our contact us form
 */
Utils.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

/**
 * Console logs out, if not on Internet Explorer. Only logs out if
 * debugMode is true.
 */
Utils.debug = function(message, secondmessage) {
	if(navigator.appName == 'Microsoft Internet Explorer') {
		return;
	}
	if(this.debugMode) {
		console.log(message);
		if(secondmessage){
	    console.log(secondmessage);
		}
	}
};

/**
 * Simple Pub/sub plugin to create a decoupled javascript app
 * http://answers.oreilly.com/topic/2190-two-examples-of-the-observer-pattern-in-javascript/
 * 
 * How to use it:
var hub = {};
makePublisher(hub);

hub.subscribe(
  "probeCommand",
  function(arg) {
    debug("Receiving command " + arg);
  }, self);
    
hub.publish(
    "probeResponse",
"Command not valid.")
    
var right = document.getElementById("rightSideReading");
hub.unsubscribe('probeResponse', null, center);
hub.subscribe('probeResponse', function(arg) {
  debug("Putting probe's response in the right input field.");
  var cleanedMessage = arg.replace(/[^0-9]/g, "");
  debug("Cleaned message: " + arg + " to: " + cleanedMessage);
  right.value = cleanedMessage;
}, right);
    
hub.subscribe('changeLogo',function(arg){
  debug("Putting the logo from the user. This is the path: "+ arg);
  img.setAttribute("src",storage.getItem("userLogo"));
},img);
 * 
 */

Utils.publisher = {
  subscribers : {
    any : []
  },
  subscribe : function(type, fn, context) {
    type = type || 'any';
    fn = typeof fn === "function" ? fn : context[fn];

    if (typeof this.subscribers[type] === "undefined") {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push({
      fn : fn,
      context : context || this
    });
  },
  unsubscribe : function(type, fn, context) {
    this.visitSubscribers('unsubscribe', type, fn, context);
  },
  publish : function(type, publication) {
    this.visitSubscribers('publish', type, publication);
  },
  visitSubscribers : function(action, type, arg, context) {
    var pubtype = type || 'any', subscribers = this.subscribers[pubtype], i, max = subscribers ? subscribers.length
        : 0;

    for (i = 0; i < max; i += 1) {
      if (action === 'publish') {
        subscribers[i].fn.call(subscribers[i].context, arg);
      } else {
        if (subscribers[i].context === context) {
          subscribers.splice(i, 1);
          Utils.debug("Removed subscribers");

        } else {
          Utils.debug("Not removing subscriber" + i);

        }
      }
    }
  }
};
Utils.makePublisher = function(o) {
  for (var i in Utils.publisher) {
    if (Utils.publisher.hasOwnProperty(i)
        && typeof Utils.publisher[i] === "function") {
      o[i] = Utils.publisher[i];
    }
  }
  o.subscribers = {
    any : []
  };
};

/**
 * http://www.w3schools.com/js/js_cookies.asp
 * name of the cookie, the value of the cookie, and the number of days until the cookie expires.
 * 
 * @param c_name
 * @param value
 * @param exdays
 */
Utils.setCookie = function(c_name, value, exdays){
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = c_name + "=" + c_value;
};
Utils.getCookie = function(c_name){
  var i, x, y, ARRcookies = document.cookie.split(";");
  for (i = 0; i < ARRcookies.length; i++){
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
    x = x.replace(/^\s+|\s+$/g,"");
    if (x == c_name){
      return unescape(y);
    }
  }
};


/**
 * Detects whether we are running offline on an Android app.
 * 
 * Note: to Android app developers, append this to your user agent string to
 * take advantage of the offline functionality of this app.
 * 
 * @returns {Boolean} true if using offline Android
 */
Utils.androidApp = function() {
	return navigator.userAgent.indexOf("OfflineAndroidApp") > -1;
};

/**
 * Detects whether we are running offline in chrome extension.
 * 
 * @returns {Boolean} true if using a Chrome Extension
 */
Utils.chromeApp = function() {
	return window.location.href.indexOf("chrome-extension") > -1;
};

/**
 * If not running offline on an android or in a chrome extension,
 * assume we are online.
 *
 * @returns {Boolean} true if not on offline Android or on a Chrome
 *          Extension
 */
Utils.onlineOnly = function() {
	return !this.androidApp() && !this.chromeApp();
};

Utils.getVersion = function(callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', 'manifest.json');
  xmlhttp.onload = function (e) {
      var manifest = JSON.parse(xmlhttp.responseText);
      callback(manifest.version);
  };
  xmlhttp.send(null);
};
Utils.playAudioFile = function(divid){
	Utils.debug("Playing Audio from "+ divid);

	if( Utils.androidApp() ){
		Android.playAudio(document.getElementById(divid).src);
	}else{
		document.getElementById(divid).play();
	}
};
Utils.pauseAudioFile = function(divid){
	Utils.debug("Pausing Audio." );

	if( Utils.androidApp()  ){
		Android.pauseAudio();
	}else{
		document.getElementById(divid).pause();
	}
};
Utils.setAudioUrl = function(audiourl){
	if( Utils.androidApp() ){
		var dir = Android.getAudioDir();
		if (dir.length > 0){
			
		}else{
			dir =  audiourl;
		}
		localStorage.setItem("audioUrl",dir);
	}else{
		// localStorage.setItem("audioUrl","./../"); //same host
		localStorage.setItem("audioUrl",audiourl);
	}
	Utils.debug("Audio url is set to "+localStorage.getItem("audioUrl") );
};
