(function(global) {

	var carousel = {};

	function mod(x, m) {
		return (x % m + m) % m;
	}

	function getSlideLocAtT(t) {
		var target = carousel.targetLoc;
		var start = carousel.startingLoc;
		var dt = t - carousel.slidingStartT;
		if (Math.abs(target - start) <= 1) {
			if (target > start) {
				return Math.min(target, start + dt / 500);
			} else {
				return Math.max(target, start - dt / 500);
			}
		}
		return Math.min(1, dt / 500) * (target - start) + start;
	}

	function renderSlide() {
		var slides = carousel.items.children;
		var captions = carousel.captions;

		var now = Date.now();
		var currentLoc = getSlideLocAtT(now);

		var currSlide = (Math.floor(currentLoc) % slides.length + slides.length) % slides.length;
		var offset = currentLoc - Math.floor(currentLoc);

		for (var slide of carousel.lastVisible) {
			slides[slide].classList.remove("active");
			captions[slide].remove();
		}

		if (offset == 0) {
			slides[currSlide].classList.add("active");
			slides[currSlide].style.position = "relative";
			slides[currSlide].style.left = "0";
			carousel.lastVisible = [currSlide];
			carousel.carousel.appendChild(captions[currSlide]);
			captions[currSlide].style.opacity = 1;
		} else {
			var nextSlide = (currSlide + 1) % slides.length;

			slides[currSlide].classList.add("active");
			slides[nextSlide].classList.add("active");
			slides[currSlide].style.position = "relative";
			slides[nextSlide].style.position = "absolute";

			slides[currSlide].style.left = (-100 * offset) + "%";
			slides[nextSlide].style.left = 100 * (1 - offset) + "%";
			slides[nextSlide].style.top = 0;

			carousel.carousel.appendChild(captions[currSlide]);
			carousel.carousel.appendChild(captions[nextSlide]);

			captions[currSlide].style.opacity = 1- offset;
			captions[nextSlide].style.opacity = offset;

			carousel.lastVisible = [currSlide, nextSlide];
		}

		if (currentLoc === carousel.targetLoc) {
			carousel.current_slide = currSlide;
			clearInterval(carousel.slideInterval);
			carousel.slideInterval = null;
		}
	}

	function transition_slide(dir){
		var slides = carousel.items.children;
		var ind = carousel.position_indicators.children;
		ind[mod(carousel.targetLoc, slides.length)].classList.remove("active");
		if (carousel.slideInterval) {
			var now = Date.now();
			var currentLoc = getSlideLocAtT(now);
			carousel.slidingStartT = now;
			carousel.startingLoc = currentLoc;
			carousel.targetLoc += dir;
			if (carousel.targetLoc - carousel.startingLoc > slides.length) {
				carousel.targetLoc -= slides.length;
			}
			if (carousel.startingLoc - carousel.targetLoc > slides.length) {
				carousel.targetLoc += slides.length;
			}

			clearInterval(carousel.slideInterval);
		} else {
			carousel.slidingStartT = Date.now();
			carousel.startingLoc = carousel.targetLoc;
			carousel.targetLoc += dir;
			carousel.lastVisible = [mod(carousel.startingLoc, slides.length)];
		}
		ind[mod(carousel.targetLoc, slides.length)].classList.add("active");

		carousel.slideInterval = setInterval(renderSlide, 10);
	}

	function auto_next_slide() {
		if (Date.now() - carousel.last_user_click > 60000) {
			transition_slide(1);
		}
	}

	function setup_carousel(carousel_items) {
		carousel.captions = []
		carousel.last_user_click = 0;
		for (var item of carousel_items) {
			var snippet_map = {}
			snippet_map["img_small_src"] = "res/carousel/" + item.file_name + "/" + item.file_name + "-small.jpg";
			snippet_map["img_large_src"] = "res/carousel/" + item.file_name + "/" + item.file_name + "-large.jpg";
			snippet_map["img_alt"] = item.title.toLowerCase() + " photo";
			snippet_map["title"] = item.title;
			snippet_map["text"] = item.html;

			var item_snippet = carousel.item_snippet;
			var caption_snippet = carousel.caption_snippet;
			for (const [key, val] of Object.entries(snippet_map)) {
				item_snippet = item_snippet.replace(new RegExp("\{\{" + key + "\}\}", "g"), val);
				caption_snippet = caption_snippet.replace(new RegExp("\{\{" + key + "\}\}", "g"), val);
			}

			var slide = document.createElement("div");
			slide.innerHTML = item_snippet;
			slide.classList.add("carousel-item-custom");

			var caption = document.createElement("div");
			caption.innerHTML = caption_snippet;

			carousel.items.appendChild(slide);
			carousel.captions.push(caption);

			var position_indicator = document.createElement("button");
			(function(){
				var idx = carousel.position_indicators.children.length;
				position_indicator.classList.add("carousel-position-indicator");
				position_indicator.addEventListener('click', function(event) {
					var n = carousel.items.children.length;
					if (mod(carousel.targetLoc, n) == idx) {
						return;
					}
					carousel.last_user_click = Date.now();
					transition_slide(idx - mod(carousel.targetLoc, n));
				});
			})();
			carousel.position_indicators.appendChild(position_indicator);
		}
		carousel.items.children[0].classList.add("active");
		carousel.position_indicators.children[0].classList.add("active");
		carousel.carousel.appendChild(carousel.captions[0]);
		carousel.targetLoc = 0;
		setInterval(auto_next_slide, 7500);
	}
	
	function onLoad(event) {
		carousel.items = document.querySelector(".carousel-items");
		carousel.carousel = document.querySelector(".carousel");
		carousel.position_indicators = document.querySelector(".carousel-position-indicators");

		ajaxUtils.sendGetRequest("snippets/carousel-item.html", function(response){
			carousel.item_snippet = response.response;
		}, false);
		ajaxUtils.sendGetRequest("snippets/carousel-caption.html", function(response){
			carousel.caption_snippet = response.response;
		}, false);
		ajaxUtils.sendGetRequest("res/carousel/items.json", function(response){
			setup_carousel(JSON.parse(response.response));
		});
	}

	global.addEventListener('DOMContentLoaded', onLoad);

	global.carousel_utils = {};
	global.carousel_utils.next_slide = function() {
		carousel.last_user_click = Date.now();
		transition_slide(1);
	}
	global.carousel_utils.prev_slide = function() {
		carousel.last_user_click = Date.now();
		transition_slide(-1);
	}


})(window);
