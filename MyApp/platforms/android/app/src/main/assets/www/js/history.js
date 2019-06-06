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
        this.showRunList();
    },
    
    showRunList: function(){
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
			fileSystem.root.getFile("saved_runs.txt", null, function(fileEntry){
				fileEntry.file(function(file){
					var reader = new FileReader();
					reader.readAsText(file);
					reader.onloadend = function(evt) {
						history.parseFile(evt);
					};
				}, null);
			}, null);
		}, null);
    },
    
    parseFile: function(event){
    	alert(JSON.parse(event));
    }
};

history.initialize();