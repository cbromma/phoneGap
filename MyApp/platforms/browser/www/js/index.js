/*
 * Lorem ipsum by Drinking-Support.com
 */
var positionLang = 0;
var positionLat = 0;
var map = 0;

var currentRunArray = [];
var currentRunObject = [];

var startTimer = 0;
var runDuration = 0;
var runDistance = 0;
var runTrigger = false;
var picture = 0;

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

    // start button -> start the map/run
    mapStarter: function(event){

    	runTrigger = true;
        var position = 0;
        startTimer = Date.now();
        
        setInterval(function(){
        	//console.log("test");
        	if(runTrigger){
        		navigator.geolocation.watchPosition(app.onSuccess, app.onError);
        		//var position = {lat: positionLat, lng: positionLang};
        		if(positionLat != 0 && positionLang != 0){
                    currentRunArray.push({lat: positionLat, lng: positionLang});

        		}
                //console.log("Lat: "+ positionLat + " Lng: " + positionLang);
        	}
        }, 1000);
        
        setTimeout(function(){
            map = new google.maps.Map(document.getElementById('map'), {zoom: 4, center: currentRunArray[currentRunArray.length-1]});
            var marker = new google.maps.Marker({position: currentRunArray[currentRunArray.length-1], map: map});
        }, 2000);
    },

    // stop button -> save object to jason file -> camera function
    tapHandler: function(event){
    	currentRunArray.shift();
    	runTrigger = false;
    	
    	// do picture
		navigator.camera.getPicture(app.onCameraSuccess, app.onCameraFail, { quality: 50,
		    destinationType: Camera.DestinationType.DATA_URL
		});

		// calc distance
		for(var i = 0; i < currentRunArray.length - 2; i++){
			runDistance += app.calcDistance(currentRunArray[i].lat, currentRunArray[i].lng, currentRunArray[i + 1].lat, currentRunArray[i + 1].lng);
		}
		// positionLat, lng: positionLang
		// (lat1, lon1, lat2, lon2)
		//alert(runDistance);

        runDuration = Date.now() - startTimer;
		// create runObject / marker positions / duration / picture / distance
    	currentRunObject = [currentRunArray, runDuration, picture, runDistance];
    	//alert(currentRunObject);
    	
    	// write object to file
    	var jsonData = JSON.stringify(currentRunObject);

    	
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
            fileSystem.root.getFile("saved_runs.txt", {create: true, exclusive: false}, function(fileEntry){
                fileEntry.createWriter(function(writer){
                    //von Nico kopiert und muss geändert werden
                    if(writer.length <= 5){
                        writer.write(jsonData);
                        //alert("Hat gespeichert");
                    }
                }, app.onError);
            }, app.onError);
        }, null);

        document.getElementById('output').innerHTML = "Strecke: " + (runDistance*1000) + ", Zeit:" + runDuration;

        var path = new google.maps.Polyline({
            path: currentRunArray,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        path.setMap(map);

        //endmarker
        var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
        var marker = new google.maps.Marker({
            position: currentRunArray[currentRunArray.length-1],
            map: map,
            icon: iconBase + picture
        });
    },
    
    calcDistance: function(lat1, lon1, lat2, lon2) {
    	if ((lat1 == lat2) && (lon1 == lon2)) {
    		return 0;
    	}
    	else {
    		var radlat1 = Math.PI * lat1/180;
    		var radlat2 = Math.PI * lat2/180;
    		var theta = lon1-lon2;
    		var radtheta = Math.PI * theta/180;
    		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    		if (dist > 1) {
    			dist = 1;
    		}
    		dist = Math.acos(dist);
    		dist = dist * 180/Math.PI;
    		dist = dist * 60 * 1.1515;
    		dist = dist * 1.609344;

    		return dist;
    	}
    },
    
    onCameraSuccess: function(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;

        picture = imageData;
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

        if(position.coords.latitude != 0 && position.coords.longitude != 0){
            currentRunArray.push({lat: position.coords.latitude, lng: position.coords.longitude});
            runDuration++;
        }
        //document.getElementById('output').innerHTML =  position.coords.latitude+ " " + position.coords.longitude;
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