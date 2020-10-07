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
			return e('div', {className: 'carousel-item-custom'}, 
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
			return e('div', {}, 
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
			this.slides = [];
			this.num_slides = props.items.length;
			this.state = {currLoc: 0};

			for (var item of props.items) {
				var item_props = {};
				item_props["img_small_src"] = "res/carousel/" + item.file_name + "/" + item.file_name + "-small.jpg";
				item_props["img_large_src"] = "res/carousel/" + item.file_name + "/" + item.file_name + "-large.jpg";
				item_props["img_alt"] = item.title.toLowerCase() + " photo";
				item_props["title"] = item.title;
				item_props["text"] = item.html;

				var slide = e(CarouselSlide, item_props);
				var caption = e(CarouselCaption, item_props);

				this.captions.push(caption);
				this.slides.push(slide);
			}
		}

		goToSlide(targetLoc) {
			this.setState({currLoc: targetLoc});
		}

		nextSlide() {
			this.setState((state)=>{
				return {currLoc: mod(state.currLoc + 1, this.num_slides)}
			});
		}

		prevSlide() {
			this.setState((state)=>{
				return {currLoc: mod(state.currLoc - 1, this.num_slides)}
			});
		}

		genCarouselItems() {
			return e('div', {className: 'carousel-items', key: 'carousel-items'}, this.slides[this.state.currLoc]);
		}

		genCarouselCaptions() {
			return e('div', {key: 'carousel-caption'},
				this.captions[this.state.currLoc]);
		}

		genPositionIndicators() {
			var ret = []
			for(var i = 0; i < this.num_slides; i++) {
				ret.push(e(CarouselPositionIndicator, {key: 'positional-indicator-' + i, onClick:function(x){
					return ()=>this.goToSlide(x);
				}.bind(this)(i), active:i == this.state.currLoc}));
			}
			return e('div', {key: 'position-indicators', className:'carousel-position-indicators'}, ret);
		}

		render() {
			return [
				this.genCarouselItems(),
				e(CarouselButton, {key: 'prev-button', className: 'prev-button', onClick:()=>this.prevSlide(), text:'<'}),
				e(CarouselButton, {key: 'next-button', className: 'next-button', onClick:()=>this.nextSlide(), text:'>'}),
				this.genPositionIndicators(),
				this.genCarouselCaptions()
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
