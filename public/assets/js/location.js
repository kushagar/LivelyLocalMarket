if(window.navigator.geolocation){
	window.navigator.geolocation.getCurrentPosition(function(success,failure){
         if(success){
			 $.post("/location",success);
		 }
	});
}