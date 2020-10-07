'use strict';

(function(global){

	function onLoad() {
		const e = React.createElement;

		class NavButton extends React.Component {
		  constructor(props) {
		    super(props);
		    this.state = {active: false};
		  }

		  render() {
		    return e(
		      'button',
		      {
		      	id: 'nav-button',
		      	className: this.props.className,
		      	onClick: () => {
		      		this.setState((state) => ({
		      			active: !state.active
		      		}));
					$("header nav").toggleClass("active");
				}
		      },
		      e('div', {className: 'hamburger' + (this.state.active?' active':'')})
		    );
		  }
		}

		const navButtonContainer = document.querySelector('#nav-button-container');
		ReactDOM.render(e(NavButton, {className: 'd-blcok d-md-none'}), navButtonContainer);

		/*$(document).click(function(event){
			var target = event.target;
			var nav = $("header nav")[0];
			var nav_button = $("#nav-button")[0];
			if (!nav.contains(target) && !nav_button.contains(target)) {
				$("#nav-button").removeClass("active");
				$("header nav").removeClass("active");
			}
		});*/
	}

	$(document).ready(onLoad);

})(window);