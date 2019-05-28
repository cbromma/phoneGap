/*
 * Lorem ipsum by Drinking-Support.com
 */
var positionLang = 0;
var positionLat = 0;

var currentRunArray = [];
var currentRunObject = [];

var runDuration = 0;
var runDistance = 0;
var runTrigger = false;



var app = {


		
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    bindEvents: function(){
    	document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        //camera
        $("#target").bind("tap", app.tapHandler);

        //navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError);
        // 

        //map
        $("#start").bind("tap", app.mapStarter);

    },
    
    

    //start the map/run
    mapStarter: function(event){

    	runTrigger = true;
        var position = {lat: positionLat, lng: positionLang};  
        
        setInterval(function(){
        	//console.log("test");
        	if(runTrigger){
        		navigator.geolocation.watchPosition(app.onSuccess, app.onError);
        		position = {lat: positionLat, lng: positionLang};
                currentRunArray.push(position);
                runDuration++;
                console.log(position);
        	}
        }, 1000);
        
        setTimeout(function(){
            var map = new google.maps.Map(document.getElementById('map'), {zoom: 4, center: currentRunArray[currentRunArray.length-1]});
            var marker = new google.maps.Marker({position: currentRunArray[currentRunArray.length-1], map: map});
        }, 2000);
    },

    // test button -> camera function
    tapHandler: function(event){
    	currentRunArray.shift();
    	runTrigger = false;
    	
    	
    	
        
        // create runObject
    	currentRunObject = [currentRunArray, runDuration, null, runDistance];
    	alert(currentRunObject);
    	
    	// write object to file
    	var jsonData = JSON.stringify(currentRunObject);
        var fs = require('fs');
    	fs.writeFile("././test.txt", jsonData, function(err) {
    	    if (err) {
    	        console.log(err);
    	    }
    	});
    	

		navigator.camera.getPicture(app.onCameraSuccess, app.onCameraFail, { quality: 50,
		    destinationType: Camera.DestinationType.DATA_URL
		});
    },
    
    onCameraSuccess: function(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;

        
    },

    onCameraFail: function(message) {
        alert('Failed because: ' + message);
    },

	 // onSuccess Geolocation
    onSuccess: function(position) {
//    	var element = document.getElementById('start');
//		element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
//				  'Longitude: '          + position.coords.longitude             + '<br />' +
//				  'Altitude: '           + position.coords.altitude              + '<br />' +
//				  'Accuracy: '           + position.coords.accuracy              + '<br />' +
//				  'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
//				  'Heading: '            + position.coords.heading               + '<br />' +
//				  'Speed: '              + position.coords.speed                 + '<br />' +
//				  'Timestamp: '          + position.timestamp                    + '<br />';
		positionLang = position.coords.longitude;
		positionLat = position.coords.latitude;
    },

	// onError Callback receives a PositionError object
	onError: function(error) {
		alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	},
	
    // Update DOM on a Received Event
	receivedEvent: function(id) {
		var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
	
	
	


};

app.initialize();