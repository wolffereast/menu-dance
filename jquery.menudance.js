/*!
 * Menu_Dance - jQuery Plugin
 * version: 1.0.0 (Mon, 13 Oct 2014)
 * requires jQuery v1.6 or later
 *
 * wolffereast
 */

;(function ( $ ) {
	$.fn.menu_dance = function(options) {
		var menu_dance, settings = $.extend(
		{},{
			changers : {},
		}, options);
		
		this.each(function(){
			//create the new javascript object here
			menu_dance = $(this).data('Menu_Dance', new Menu_Dance(this, settings.changers));
		});
		//return the selector, cause, ya know, jQuery
		return this;
	}

	function Menu_Dance(target, changers){
		target = $(target)
		
		//init the constants
		this.timeout;
		//$ object holding a single target
		this.target = target;
		//object holding elements that can affect the height of the target
		//needs to be keyed by the click selector, with a value of the item whose height is changing
		this.changers = changers;
		this.last_scroll_top = $(window).scrollTop();
		this.target_styles_initial = {
			top: target.css('top'),
			display: target.css('display')
		}
		//this doesnt like to init without a particular set of css
		target.css({top: '0px', position: 'fixed'});

		//this should happen on resize
		$(window).on('resize', {Menu_Dance: this}, this.resize_handler);
		//and on start
		this.update_element();
		
		if (Object.prototype.toString.call( changers ) === '[object Object]'){
			for (propt in changers)$(propt).on('click', {selector : changers[propt], Menu_Dance: this}, this.promise_bind);
		}
		
		//bind the scroll - make the nav dance if it is relatively positioned
		$(window).on('scroll', {last_scroll_top : this.last_scroll_top, Menu_Dance: this}, this.scroll_bind);
		
		return this;
	}
	
	Menu_Dance.prototype.resize_handler = function(event){
		clearTimeout(event.data.Menu_Dance.timeout);
		//using the timeout to prevent jerking
		event.data.Menu_Dance.timeout = setTimeout(event.data.Menu_Dance.update_element(), 200);
	}//end of resize_handler function prototype declaration
	
	Menu_Dance.prototype.promise_bind = function(event){
		$(event.data.selector).promise().done(function(){
			////console.log('running the bound promise')
			event.data.Menu_Dance.update_element()
		});
	}//end of promise_bind function prototype declaration
	
	Menu_Dance.prototype.scroll_bind = function(event){
		var past_point,
				st = $(window).scrollTop(),
				Menu_Dance = event.data.Menu_Dance,
				target = Menu_Dance.target,
				last_scroll_top = Menu_Dance.last_scroll_top;

		if ($('.menu_dance_scrollable').length){
			//if going up, follow the top
			if (st < last_scroll_top){
				if (target.css('position') == 'relative' || parseInt(target.css('top')) !== 0){
					if (target.css('position') == 'fixed'){
						////console.log('in the moving up outer if')
						//if it is a jump, set the top
						//jump means it moves more than the offset
						if (last_scroll_top - st > target.height() - $(window).height()) target.css({top: '0px'})
						else target.css({position : 'relative', top: (last_scroll_top + $(window).height() - target.height())+'px'});
					}
					else if($(window).scrollTop() <= parseInt(target.css('top'))){
						////console.log('in the moving up outer else if')
						//force it to fixed with the correct top
						target.css({position : 'fixed', top: '0px'})
					}
				}
			}
			//going down
			else if (st > last_scroll_top){
				//if relative OR (not at the bottom AND not above the top)
				if ($(target).css('position') == 'relative' || parseInt($(target).css('top')) !== $(window).height() - $(target).height()){
					if ($(target).css('position') == 'fixed'){
						////console.log('in the moving down outer if')
						////console.log(parseInt($(target).css('top')))
						////console.log($(window).height() - $(target).height())
						if (st - Menu_Dance.last_scroll_top > target.height() - $(window).height()) target.css({top: ($(window).height() - target.height()) + 'px'})
						else target.css({position : 'relative', top: last_scroll_top+'px'});
					}
					else if($(window).height() + $(window).scrollTop() >= target.height() + parseInt(target.css('top'))){
						////console.log('in the moving down outer else if')
						//force it to fixed with the correct top
						target.css({position : 'fixed', top: ($(window).height() - target.height()) + 'px'})
					}
					//else if it isnt relative it should be, use the old scrolltop to determine the correct location
				}
			}
			//reset last_scroll_top
			Menu_Dance.last_scroll_top = st;
		}
	}//end of scroll_bind function prototype declaration
	
	Menu_Dance.prototype.destroy = function(){
		$(window).off('resize', this.resize_handler);
		if (Object.prototype.toString.call( this.changers ) === '[object Object]'){
			for (propt in this.changers)$(propt).off('click',this.promise_bind);
		}
		$(window).off('scroll', this.scroll_bind);
		this.target.css(this.target_styles_initial);
		
		this.target.removeData('Menu_Dance');
	}//end of destroy function prototype declaration
	
	Menu_Dance.prototype.update_element = function(){
		var win = $(window),
				target = this.target,
				targetHeight = target.height(),
				targetTop = parseInt(target.css('top')),
				winYPos = win.scrollTop(),
				winHeight = win.height(),
				docHeight = $('body').height();

		if(targetHeight > winHeight){
			target.addClass('menu_dance_scrollable');
			
			if (winYPos){
				//need to check position here
				if (target.css('position') == 'relative'){
					//close enough to the bottom to run over, push it back up
					if (docHeight < (winYPos + targetHeight) && targetTop + targetHeight >= docHeight){
						target.animate({top : (docHeight - targetHeight)+'px'}, 300);
					}
					//need to catch when you close something near the bottom of the window, this moves the bottom back down
					else if (targetTop + targetHeight < winYPos + winHeight){
						target.animate({top : (winYPos + winHeight - targetHeight)+'px'}, 300, 'swing', function(){
							target.css({top: ($(window).height() - targetHeight) + 'px', position: 'fixed'});
						});
					}
				}
				else{
					////console.log('in the pos = fixed update target call')
					//too close to the bottom, move the element up please
					if (docHeight < (winYPos + targetHeight)){
						target.animate({top : (docHeight - targetHeight - winYPos)+'px'}, 300, 'swing', function(){
							target.css({top : (docHeight - targetHeight) + 'px', position : 'relative'});
						});
					}
					//need to catch when you close something near the bottom of the window, this moves the bottom back down
					else if(targetTop + targetHeight < winHeight){
						target.animate({top : (winHeight - targetHeight)+'px'}, 300);
					}
					//now catch if something just opened when not at the bottom of the menu
					//this happens if we are not fixed to the top (target top != 0) and top + screen height != nav height
					else if (targetTop != 0 && targetHeight != targetTop + winHeight){
						//y pos + targetTop because targetTop is negative.  This swap takes the place of an abs value call
						target.css({top: (winYPos + targetTop) + 'px', position: 'relative'});
					}
				}
			}
			else {
				$('div.sidebarVariableTop').css('top', '0px');
			}
		}
		else{
			target.removeClass('menu_dance_scrollable')
			if (target.css('display') == 'relative'){
				target.animate({top : winYPos + 'px'}, 300, 'swing', function(){
					target.css({display : 'fixed', top : '0px'});
				});
			}
			else target.css({display : 'fixed', top : '0px'});
		}
	}//end update element prototype declaration

}( jQuery ));