'use strict';

(function(global) {

	function mod(x, m) {
		return (x % m + m) % m;
	}

	const e = React.createElement;

	class CarouselSlide extends React.Component {

		constructor(props) {
			super(props);
		}

		render() {
			return e('div', {className: 'carousel-item-custom',
				style:{position:this.props.position,
					left: this.props.left,
					top: this.props.top}}, 
				[e('img', {key: 'large-img', className: 'img-maxed d-none d-lg-block',
					src: this.props.img_large_src, alt: this.props.img_alt}),
				e('img', {key: 'small-img', className: 'img-maxed d-block d-lg-none',
					src: this.props.img_small_src, alt: this.props.img_alt})
				]);
		}
	}

	class CarouselCaption extends React.Component {

		constructor(props) {
			super(props);
		}

		render() {
			return e('div', {style:{opacity:this.props.captionOpacity}}, 
					e('div', {className: 'carousel-caption-custom'},
						[
							e('h5', {key: 'title'}, this.props.title),
							e('p', {key: 'text', dangerouslySetInnerHTML:{__html:this.props.text}})
						])
				);
		}

	}

	class CarouselButton extends React.Component {

		constructor(props) {
			super(props);
		}

		render() {
			return e('button', {className: 'carousel-button ' + this.props.className, 
				onClick: this.props.onClick}, e('p', {}, this.props.text))
		}

	}

	class CarouselPositionIndicator extends React.Component {

		constructor(props) {
			super(props);
		}

		render() {
			return e('button', {className: 'carousel-position-indicator' + (this.props.active?' active':''),
				onClick: this.props.onClick});
		}
	}

	class Carousel extends React.Component {

		constructor(props) {
			super(props);
			this.captions = [];
			this.itemPropsList = [];
			this.n = props.items.length;
			this.slideInterval = null;
`			`
			this.state = {currLoc: 0, targetLoc: 0, lastUserT: 0, slidingStartT: 0, slidingStartLoc: 0};

			for (var item of props.items) {
				var item_props = {};
				item_props["img_small_src"] = "res/carousel/" + item.file_name + "/" + item.file_name + "-small.jpg";
				item_props["img_large_src"] = "res/carousel/" + item.file_name + "/" + item.file_name + "-large.jpg";
				item_props["img_alt"] = item.title.toLowerCase() + " photo";
				item_props["title"] = item.title;
				item_props["text"] = item.html;

				var caption = e(CarouselCaption, item_props);

				this.captions.push(caption);
				this.itemPropsList.push(item_props);
			}
		}

		getSlideLocAtT(t) {
			var target = this.state.targetLoc;
			var start = this.state.slidingStartLoc;
			var dt = t - this.state.slidingStartT;
			if (Math.abs(target - start) <= 1) {
				if (target > start) {
					return Math.min(target, start + dt / 500);
				} else {
					return Math.max(target, start - dt / 500);
				}
			}
			return Math.min(1, dt / 500) * (target - start) + start;
		}

		renderSlide() {
			this.setState(function(state) {
				var t = Date.now();
				var x = this.getSlideLocAtT(t);
				if (x == state.targetLoc) {
					clearInterval(this.slideInterval);
					this.slideInterval = null;
				}
				return {currLoc: x};
			});
		}

		transitionSlide(dir, userClicked) {
			var t = Date.now();
			var x = this.getSlideLocAtT(t);
			var n = this.n;
			
			function moveClose(a, b) {
				if (a - b > n) {
					return b + (a - b) % n;
				}
				if (b - a > n) {
					return b - (b - a) % n;
				}
				return a;
			}

			if (userClicked) {
				this.setState((state)=>({
					currLoc: x,
					targetLoc: moveClose(state.targetLoc + dir, x),
					lastUserT: t,
					slidingStartT: t,
					slidingStartLoc: x
				}));
			} else {
				this.setState((state)=>({
					currLoc: x,
					targetLoc: moveClose(state.targetLoc + dir, x),
					slidingStartT: t,
					slidingStartLoc: x
				}));
			}
			if(!this.slideInterval) {
				this.slideInterval = setInterval(()=>this.renderSlide(), 10);
			}
		}

		goToSlide(targetLoc) {
			if (mod(this.state.targetLoc, this.n) == targetLoc) return;
			this.transitionSlide(targetLoc - mod(this.state.targetLoc, this.n), true);
		}

		nextSlide() {
			this.transitionSlide(1, true);
		}

		prevSlide() {
			this.transitionSlide(-1, true);
		}

		genSlide(t) {
			var currLoc = this.state.currLoc;
			var currSlide = mod(Math.floor(currLoc), this.n);
			var offset = currLoc - Math.floor(currLoc);

			var res = {captions: []};
			var itemList = []

			if (offset == 0) {
				var itemProps = {};
				Object.assign(itemProps, this.itemPropsList[currSlide]);
				itemProps['position'] = 'relative';
				itemProps['left'] = 0;
				itemProps['key'] = 'item-' + currSlide;
				itemProps['captionOpacity'] = 1;
				itemList.push(e(CarouselSlide, itemProps));
				res.captions.push(e(CarouselCaption, itemProps));
			} else {
				var nextSlide = (currSlide + 1) % this.n;

				var itemProps = {};
				Object.assign(itemProps, this.itemPropsList[currSlide]);
				itemProps['position'] = 'relative';
				itemProps['left'] = (-100 * offset) + "%";
				itemProps['key'] = 'item-' + currSlide;
				itemProps['captionOpacity'] = 1 - offset;
				itemList.push(e(CarouselSlide, itemProps));
				itemProps['key'] = 'caption-' + currSlide;
				res.captions.push(e(CarouselCaption, itemProps));

				itemProps = {};
				Object.assign(itemProps, this.itemPropsList[nextSlide]);
				itemProps['position'] = 'absolute';
				itemProps['left'] = 100 * (1 - offset) + "%";
				itemProps['top'] = 0;
				itemProps['key'] = 'item-' + nextSlide;
				itemProps['captionOpacity'] = offset;
				itemList.push(e(CarouselSlide, itemProps));
				itemProps['key'] = 'caption-' + nextSlide;
				res.captions.push(e(CarouselCaption, itemProps));
			}
			res.items = e('div', {className: 'carousel-items', key: 'carousel-items'}, itemList);
			return res;
		}

		genPositionIndicators() {
			var ret = []
			for(var i = 0; i < this.n; i++) {
				ret.push(e(CarouselPositionIndicator, {key: 'positional-indicator-' + i,
					onClick:function(x, obj){
						return ()=>obj.goToSlide(x);
					}(i, this),
					active:i == mod(this.state.targetLoc, this.n)}));
			}
			return e('div', {key: 'position-indicators', className:'carousel-position-indicators'}, ret);
		}

		render() {
			var t = Date.now();
			var itemsAndCaptions = this.genSlide();
			return [
				itemsAndCaptions.items,
				e(CarouselButton, {key: 'prev-button', className: 'prev-button', onClick:()=>this.prevSlide(), text:'<'}),
				e(CarouselButton, {key: 'next-button', className: 'next-button', onClick:()=>this.nextSlide(), text:'>'}),
				this.genPositionIndicators(),
				itemsAndCaptions.captions
			];
		}
	}
	
	function onLoad(event) {
		ajaxUtils.sendGetRequest("res/carousel/items.json", function(response){
			const carouselContainer = document.querySelector('#carousel-container');
			ReactDOM.render(e(Carousel, {items: JSON.parse(response.response)}), carouselContainer);
		});
	}

	$(document).ready(onLoad);


})(window);
