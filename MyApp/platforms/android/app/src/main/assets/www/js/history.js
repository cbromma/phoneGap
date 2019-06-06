var history =  {
	initialize: function(){
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},
	
	bindEvents: function(){
    	document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
    onDeviceReady: function() {
        // delete event
        $("#start").bind("tap", app.mapStarter);
    },
    
    showRunList: function(){
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
			fileSystem.root.getFile("saved_runs.txt", null, function(fileEntry){
				fileEntry.file(function(file){
					var reader = new FileReader();
					reader.readAsText(file);
					reader.onloadend = function(evt) {
						history.buildCollapseSet(evt);
					};
				}, null);
			}, null);
		}, null);
    },
    
    buildCollapseSet: function (evt) {
		var collSet = document.getElementById("runlist");
		if(evt.target.result === null || evt.target.result === "" || histApp.firstLoad){
			document.getElementById("histStatus").hidden = false;
			document.getElementById("deleteAllBtn").style.display = "none";
			collSet.hidden = true;
			var how_many = 100;
			if(!(evt.target.result === null || evt.target.result === "")){
				how_many += JSON.parse(evt.target.result).table.length;
			}
			if(histApp.firstLoad){
				collSet.innerHTML= "";
				for(var s = 0; s < how_many; s++){
					collSet.innerHTML += "    <div data-role=\"collapsible\" hidden>\n" +
						"			<h2>test</h2>\n" +
						"   		<p>test</p>\n"  +
						"   		<div class=\"map_canvas\"></div>\n"  +
						"   		<button class=\"ui-btn\" onclick=\"deleteSingle(this)\">Delete</button>\n"  +
						"    </div>\n"
				}
			}
			else{
				for(var y = 0; y < collSet.children.length; y++){
					collSet.children[y].hidden = true;
				}
			}
			histApp.firstLoad = false;
			return;
		}
		for(var y = 0; y < collSet.children.length; y++){
			collSet.children[y].hidden = true;
		}
		var json = JSON.parse(evt.target.result);
		document.getElementById("histStatus").hidden = true;
		document.getElementById("deleteAllBtn").style.display = "block";
		collSet.hidden = false;
		for(var j = 0; j < json.table.length; j++){
			var entry = collSet.children[j];
			entry.hidden = false;
			var name = entry.children[0];
			name.innerHTML = name.innerHTML.replace(name.childNodes[0].innerText.replace("\nclick to expand contents", ""), json.table[j].name);
			name.innerHTML = name.innerHTML.replace(name.childNodes[0].innerText.replace(" click to expand contents", ""), json.table[j].name);
			var dist = 0;
			for(var k = 0; k < json.table[j].geoLat.length - 1; k++){
				dist += app.distanceHelper(json.table[j].geoLat[k], json.table[j].geoLng[k], json.table[j].geoLat[k+1], json.table[j].geoLng[k+1]);
			}
			dist = Math.round((dist * 1000));
			var time = parseInt(json.table[j].geoTime[json.table[j].geoTime.length-1]) - parseInt(json.table[j].geoTime[0]);
			time = app.timeFormatHelper(time);
			var data = entry.children[1].children[0];
			data.innerHTML = data.innerHTML.replace(data.innerHTML.replace(" click to expand contents", ""), "Distance: " + dist + "m " + time);

			var canvas = entry.children[1].children[1];

			var latitudeStart = json.table[j].geoLat[0];
			var longitudeStart = json.table[j].geoLng[0];
			var latLongStart = new google.maps.LatLng(latitudeStart, longitudeStart);

			var latitudeEnd = json.table[j].geoLat[json.table[j].geoLat.length-1];
			var longitudeEnd = json.table[j].geoLng[json.table[j].geoLat.length-1];
			var latLongEnd = new google.maps.LatLng(latitudeEnd, longitudeEnd);

			var mapOptions = {
				center: latLongStart,
				zoom: 17,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			var map = new google.maps.Map(canvas, mapOptions);

			var markerStart = new google.maps.Marker({
				position: latLongStart,
				map: map,
				title: "Start"
			});

			markerStart.setMap(map);

			new CustomMarker(latLongEnd, map, json.table[j].picture);

			var pathCoordinates = [];
			for(var l = 0; l < json.table[j].geoLng.length; l++){
				pathCoordinates.push({lat: json.table[j].geoLat[l], lng: json.table[j].geoLng[l]});
			}
			var path = new google.maps.Polyline({
				path: pathCoordinates,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});

			path.setMap(map);
		}
	},
}