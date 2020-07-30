(function(global){

	function onLoad() {
		$('#nav-button').click(function(){
			$("#nav-button").toggleClass("active");
			$("header nav").toggleClass("active");
		});
		$(document).click(function(event){
			var target = event.target;
			var nav = document.querySelector("header nav");
			var nav_button = document.querySelector("#nav-button");
			if (!nav.contains(target) && !nav_button.contains(target)) {
				$("#nav-button").removeClass("active");
				$("header nav").removeClass("active");
			}
		});
	}

	$(document).ready(onLoad);

})(window);