/*
 * Lorem ipsum by Drinking-Support.com
 */
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
        $("#target").bind("tap", app.tapHandler);
        navigator.geolocation.getCurrentPosition(this.onSuccess, this.onError);
    },
    
    // test button -> camera function
    tapHandler: function(event){
		//alert("geklickt");
		navigator.camera.getPicture(app.onCameraSuccess, app.onCameraFail, { quality: 50,
		    destinationType: Camera.DestinationType.DATA_URL
		});
    },
    
    onCameraSuccess: function(imageData) {
        var image = document.getElementById('myImage');
        image.src = "data:image/jpeg;base64," + imageData;
        alert("loaded");
    },

    onCameraFail: function(message) {
        alert('Failed because: ' + message);
    },

	 // onSuccess Geolocation
    onSuccess: function(position) {
    	var element = document.getElementById('geolocation');
		element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
				  'Longitude: '          + position.coords.longitude             + '<br />' +
				  'Altitude: '           + position.coords.altitude              + '<br />' +
				  'Accuracy: '           + position.coords.accuracy              + '<br />' +
				  'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
				  'Heading: '            + position.coords.heading               + '<br />' +
				  'Speed: '              + position.coords.speed                 + '<br />' +
				  'Timestamp: '          + position.timestamp                    + '<br />';
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
	
	
	
	GoogleMap: function(){

		initializeMap = function(){
		var map = showMap();
		}

		var showMap = function(){
		var mapOptions = {
		zoom: 4,
		center: new google.maps.LatLng(-33, 151),
		mapTypeId: google.maps.MapTypeId.ROADMAP
		}

		var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

		return map;
		}
	}
};

app.initialize();