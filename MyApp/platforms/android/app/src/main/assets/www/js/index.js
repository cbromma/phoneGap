/*
 * Lorem ipsum by Drinking-Support.com
 */
var positionLang = 0;
var positionLat = 0;
var map = 0;
var startMarker = 0;

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

        //map
        $("#start").bind("tap", app.mapStarter);
    },

    // start button -> start the map/run
    mapStarter: function(event){

    	app.resetGlobalVariables();
    	
    	runTrigger = true;
        var position = 0;
        startTimer = Date.now();

        setInterval(function(){
        	//console.log("test");
        	if(runTrigger){
        		navigator.geolocation.watchPosition(app.onSuccess, app.onError);
        		//var position = {lat: positionLat, lng: positionLang};
        		if(positionLat != 0 && positionLang != 0){
                    //currentRunArray.push({lat: positionLat, lng: positionLang});
        			currentRunArray.push({lat: positionLat, lng: positionLang});
        		} 
        	}
        }, 1000);
        
        setTimeout(function(){
            map = new google.maps.Map(document.getElementById('map'), {zoom: 16, center: currentRunArray[currentRunArray.length-1]});
            startMarker = new google.maps.Marker({position: currentRunArray[currentRunArray.length-1], map: map});
        }, 2000);
    },

    // stop button -> save object to jason file -> camera function
    tapHandler: function(event){
    	currentRunArray.shift();
    	runTrigger = false;
    	
    	// do picture
		navigator.camera.getPicture(app.onCameraSuccess, app.onCameraFail, { quality: 50,destinationType: Camera.DestinationType.DATA_URL});
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
        image.src = "data:image/png;base64," + imageData;

        picture = image.src;

		// calc distance
		for(var i = 0; i < currentRunArray.length - 2; i++){
			runDistance += app.calcDistance(currentRunArray[i].lat, currentRunArray[i].lng, currentRunArray[i + 1].lat, currentRunArray[i + 1].lng);
		}

		// calc duration
        runDuration = Date.now() - startTimer;
		// create runObject / marker positions / duration / picture / distance
    	currentRunObject = [currentRunArray, runDuration, picture, runDistance];

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
    	
    	// output
        document.getElementById('output').innerHTML = "Strecke: " + (runDistance*1000) + "m, Zeit: " + app.msToHMS(runDuration);

        // draw path on map
        var path = new google.maps.Polyline({
            path: currentRunArray,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        path.setMap(map);

        //endmarker     
        var icon = {
        	url: picture,
            scaledSize: new google.maps.Size(50,50),
        };

        //alert(currentRunArray[currentRunArray.length - 1].lat + "   " + currentRunArray[currentRunArray.length - 1].lng);
        var marker = new google.maps.Marker({
        	position: new google.maps.LatLng(currentRunArray[currentRunArray.length - 1].lat, currentRunArray[currentRunArray.length - 1].lng), //currentRunArray[currentRunArray.length-1], //new google.maps.LatLng(0, 0)
        	map: map,
            icon: icon
        });
    },
    
    msToHMS: function(duration) { 
    	var milliseconds = parseInt((duration % 1000) / 100), 
    	seconds = parseInt((duration / 1000) % 60), 
    	minutes = parseInt((duration / (1000 * 60)) % 60), 
    	hours = parseInt((duration / (1000 * 60 * 60)) % 24); 
    	
    	hours = (hours < 10) ? "0" + hours : hours; 
    	minutes = (minutes < 10) ? "0" + minutes : minutes; 
    	seconds = (seconds < 10) ? "0" + seconds : seconds; 
    	return hours + ":" + minutes + ":" + seconds ; 
    },

    onCameraFail: function(message) {
        alert('Failed because: ' + message);
    },

	 // onSuccess Geolocation
    onSuccess: function(position) {
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
    
    resetGlobalVariables: function(){
    	positionLang = 0;
    	positionLat = 0;
    	map = 0;
    	startMarker = 0;

    	currentRunArray = [];
    	currentRunObject = [];

    	startTimer = 0;
    	runDuration = 0;
    	runDistance = 0;
    	runTrigger = false;
    	picture = 0;
    }
};

app.initialize();