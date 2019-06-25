var historyApp = {
	initialize : function() {
		document.addEventListener('deviceready', this.onDeviceReady.bind(this),
				false);
	},

	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},

	onDeviceReady : function() {
		// delete event
		$("#linkToRunList").bind("tap", historyApp.tapHandler);
		$("#deleteAll").bind("tap", historyApp.deleteAll);
	},

	tapHandler : function(event) {
		historyApp.showRunList();
	},

	loadRunData : function(index) {
		var current = 0;
		
		var map = 0;
		var startMarker = 0;
		var currentRunArray = [];
		var runDuration = 0;
		var runDistance = 0;
		var picture = 0;
		
		// read from file
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(
				fileSystem) {
			fileSystem.root.getFile("saved_runs.txt", null,
					function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							reader.readAsText(file);
							reader.onloadend = function(evt) {
								try {
									var value = index
											.substring(4, index.length);
									json = JSON.parse(evt.target.result);
									current = json.not_a_table.splice(
											value, 1);
									currentRunArray = current[0].runs;
									startMarker = currentRunArray[0];
									runDuration = current[0].runDuration;
									runDistance = current[0].runDistance;
									picture = current[0].pic;
									
									map = new google.maps.Map(document.getElementById('map'), {zoom: 16, center: currentRunArray[currentRunArray.length-1]});
							         startMarker = new google.maps.Marker({position: currentRunArray[currentRunArray.length-1], map: map});
									
									// output
							        document.getElementById('output').innerHTML = "Strecke: " + (runDistance*1000) + "m, Zeit: " + historyApp.msToHMS(runDuration);

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
								} catch (e) {
									alert(e.message);
								}
								
								
							};
						}, historyApp.fail);
					}, historyApp.fail);
		}, null);
					
	},

	deleteRunData : function(index) {

		// delete
		var json = 0;

		// read from file
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(
				fileSystem) {
			fileSystem.root.getFile("saved_runs.txt", null,
					function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							reader.readAsText(file);
							reader.onloadend = function(evt) {
								try {
									var value = index
											.substring(6, index.length);
									json = JSON.parse(evt.target.result);
									var removed = json.not_a_table.splice(
											value, 1);
								} catch (e) {
									alert(e.message);
								}
								
								
								// write to file
								window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(
										fileSystem) {
									fileSystem.root.getFile("saved_runs.txt", {
										create : true,
										exclusive : false
									}, function(fileEntry) {
										fileEntry.createWriter(function(writer) {	
											if (json.length == 0 || json.not_a_table.length == 0){
												writer.write(JSON.stringify(""));
											} else {
												writer.write(JSON.stringify(json));
											}
											historyApp.showRunList();
										}, null);
									}, null);
								}, null);
								
								// end of write	
							};
						}, historyApp.fail);
					}, historyApp.fail);
		}, null);
	},
	
	deleteAll: function(){
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(
				fileSystem) {
			fileSystem.root.getFile("saved_runs.txt", {
				create : true,
				exclusive : false
			}, function(fileEntry) {
				fileEntry.createWriter(function(writer) {	
					writer.write(JSON.stringify(""));
					historyApp.showRunList();
				}, null);
			}, null);
		}, null);
	},

	showRunList : function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(
				fileSystem) {
			fileSystem.root.getFile("saved_runs.txt", null,
					function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							reader.readAsText(file);
							reader.onloadend = function(evt) {
								try {
									historyApp.parseFile(evt);
								} catch (e) {
									alert(e.message);
								}
							};
						}, historyApp.fail);
					}, historyApp.fail);
		}, null);
	},

	parseFile : function(evt) {
		// alert(JSON.parse(evt.target.result));
		var json = JSON.parse(evt.target.result);
		var id = document.getElementById("runlist");
		if(!json || json == null || json == "" || json.not_a_table.length == 0){
			id.innerHTML = "";
			return;
		}
		id.innerHTML = "";
		id.innerHTML += "<ul>";

		for (var j = 0; j < json.not_a_table.length; j++) {
			var current = json.not_a_table[j];
			id.innerHTML += "<li>Zeit: "
					+ historyApp.msToHMS(current.runDuration) + " / Strecke: "
					+ current.runDistance + "<a href='#main' id='load" + j
					+ "' class='ui-btn'>Laden</a>" + // load map
					"<a href='' id='delete" + j
					+ "' class='ui-btn'>Löschen</a>" + // delete map
					"</li>";

		}

		id.innerHTML += "</ul>";

		// bind load buttons
		for (var j = 0; j < json.not_a_table.length; j++) {
			var name = "#load" + j;
			// alert(name);
				$("" + name).click(function(event) {
					historyApp.loadRunData(event.target.id);
				});
		}

		// bind delete buttons
		for (var i = 0; i < json.not_a_table.length; i++) {
			var name = "#delete" + i;
			// alert(name);
				$("" + name).click(function(event) {
					historyApp.deleteRunData(event.target.id);
				});
		}

	},

	fail : function(error) {
		// console.log(error.code);
		alert(error.code);
	},

	msToHMS : function(duration) {
		var milliseconds = parseInt((duration % 1000) / 100), seconds = parseInt((duration / 1000) % 60), minutes = parseInt((duration / (1000 * 60)) % 60), hours = parseInt((duration / (1000 * 60 * 60)) % 24);

		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;
		return hours + ":" + minutes + ":" + seconds;
	}
};

historyApp.initialize();