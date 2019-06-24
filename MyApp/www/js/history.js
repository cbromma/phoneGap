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
	},

	tapHandler : function(event) {
		historyApp.showRunList();
	},

	loadRunData : function() {
		alert("loaded");
		// TODO load run data to first page
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
											var exist = false;
											for (var i = 0; i < json.not_a_table.length; i++) {
												
												if (json.not_a_table[i]) {
													if (!exist) {
														alert("if");
														
														exist = true;
														var jsonT = { not_a_table : [ json.not_a_table[i] ]};
														writer.write(JSON.stringify(jsonT));
													} else {
														alert("else");
														try {
															writer.seek(writer.length - 2);
														} catch (e) {
															alert(e.message);
														}
														writer.write("," + JSON.stringify(json.not_a_table[i]) + "]}");
													}
												} 
											} // end of for
										}, null);
									}, null);
								}, null);
								
								// end of write	
							};
						}, historyApp.fail);
					}, historyApp.fail);
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
			try {
				$("" + name).bind("tap", historyApp.loadRunData);
			} catch (e) {
				alert(e.message);
			}
		}

		// bind delete buttons
		for (var i = 0; i < json.not_a_table.length; i++) {
			var name = "#delete" + i;
			// alert(name);
			try {
				$("" + name).click(function(event) {
					historyApp.deleteRunData(event.target.id);
				});
			} catch (e) {
				alert(e.message);
			}
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