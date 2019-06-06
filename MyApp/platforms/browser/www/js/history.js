var historyApp =  {
	initialize: function(){
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},
	
	bindEvents: function(){
    	document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
    onDeviceReady: function() {
        // delete event
    	$("#linkToRunList").bind("tap", historyApp.tapHandler);
    },
    
    tapHandler: function(event){
    	alert("hello world");
    	historyApp.showRunList();
    },
    
    showRunList: function(){
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
			fileSystem.root.getFile("saved_runs.txt", null, function(fileEntry){
				alert("file found");
				fileEntry.file(function(file){
					var reader = new FileReader();
					reader.readAsText(file);
					reader.onloadend = function(evt) {
						historyApp.parseFile(evt);
					};
				}, null);
			}, null);
		}, null);
    },
    
    parseFile: function(event){
    	alert(JSON.parse(event));
    },
};

historyApp.initialize();