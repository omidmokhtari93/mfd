/*
 * jqModal - Minimalist Modaling with jQuery
 *
 * Copyright (c) 2007-2015 Brice Burgess @IceburgBrice
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 * $Version: 1.4.0 (2015.08.16 +r25)
 * Requires: jQuery 1.2.3+
 */

(function($) {

	/**
	 * Initialize elements as "modals". Modals typically are popup dialogs,
	 * notices, modal windows, &c.
	 *
	 * @name jqm
	 * @param options user defined options, augments defaults.
	 * @type jQuery
	 * @cat Plugins/jqModal
	 */

	$.fn.jqm=function(options){
		return this.each(function(){
			var jqm = $(this).data('jqm') || $.extend({ID: I++}, $.jqm.params),
		      o = $.extend(jqm,options);

			// add/extend options to modal and mark as initialized
			$(this).data('jqm',o).addClass('jqm-init')[0]._jqmID = o.ID;

			// ... Attach events to trigger showing of this modal
			$(this).jqmAddTrigger(o.trigger);
		});
	};

	/**
	 * Matching modals will have their jqmShow() method fired by attaching a
	 *   onClick event to elements matching `trigger`.
	 *
	 * @name jqmAddTrigger
	 * @param trigger a a string selector, jQuery collection, or DOM element.
	 */
	$.fn.jqmAddTrigger=function(trigger){
	  if(trigger){
	    return this.each(function(){
			  if (!addTrigger($(this), 'jqmShow', trigger))
			    err("jqmAddTrigger must be called on initialized modals");
		  });
	  }
	};

	/**
	 * Matching modals will have their jqmHide() method fired by attaching an
	 *   onClick event to elements matching `trigger`.
	 * 
	 * @name jqmAddClose
	 * @param trigger a string selector, jQuery collection, or DOM element.
	 */
	$.fn.jqmAddClose=function(trigger){
	  if(trigger){
  	  return this.each(function(){
  			if(!addTrigger($(this), 'jqmHide', trigger))
  			  err ("jqmAddClose must be called on initialized modals");
  		});
	  }
	};

	/**
	 * Open matching modals (if not shown)
	 */
	$.fn.jqmShow=function(trigger){
		return this.each(function(){ if(!this._jqmShown) show($(this), trigger); });
	};

	/**
	 * Close matching modals
	 */
	$.fn.jqmHide=function(trigger){
		return this.each(function(){ if(this._jqmShown) hide($(this), trigger); });
	};

	// utility functions

	var
		err = function(msg){
			if(window.console && window.console.error) window.console.error(msg);

	}, show = function(m, t){

		/**
		 * m = modal element (as jQuery object)
		 * t = triggering element
		 *
		 * o = options
		 * z = z-index of modal
		 * v = overlay element (as jQuery object)
		 * h = hash (for jqModal <= r15 compatibility)
		 */
	  
	  t = t || window.event;

		var o = m.data('jqm'),
			z = (parseInt(m.css('z-index'))) || 3000,
			v = $('<div></div>').addClass(o.overlayClass).css({
			  height:'100%',
			  width:'100%',
			  position:'fixed',
			  left:0,
			  top:0,
			  'z-index':z-1,
			  opacity:o.overlay/100
			}),

			// maintain legacy "hash" construct
			h = {w: m, c: o, o: v, t: t};	

		m.css('z-index',z);

		if(o.ajax){
			var target = o.target || m,
				url = o.ajax;

			target = (typeof target === 'string') ? $(target,m) : $(target);
			if(url.substr(0,1) === '@') url = $(t).attr(url.substring(1));

			// load remote contents
			target.load(url,function(){
				if(o.onLoad) o.onLoad.call(this,h);
			});

			// show modal
			if(o.ajaxText) target.html(o.ajaxText);
      open(h);
		}
		else { open(h); }
		
	}, hide = function(m, t){
		/**
		 * m = modal element (as jQuery object)
		 * t = triggering element
		 *
		 * o = options
		 * h = hash (for jqModal <= r15 compatibility)
		 */

	  t = t || window.event;
		var o = m.data('jqm'),
		    // maintain legacy "hash" construct
		    h = {w: m, c: o, o: m.data('jqmv'), t: t};

		close(h);

	}, onShow = function(hash){
		// onShow callback. Responsible for showing a modal and overlay.
		//  return false to stop opening modal. 

		// hash object;
		//  w: (jQuery object) The modal element
		//  c: (object) The modal's options object 
		//  o: (jQuery object) The overlay element
		//  t: (DOM object) The triggering element

		// if overlay not disabled, prepend to body
		if(hash.c.overlay > 0) hash.o.prependTo('body');

		// make modal visible
		hash.w.show();

		// call focusFunc (attempts to focus on first input in modal)
		$.jqm.focusFunc(hash.w,true);

		return true;

	}, onHide = function(hash){
		// onHide callback. Responsible for hiding a modal and overlay.
		//  return false to stop closing modal. 

		// hash object;
		//  w: (jQuery object) The modal element
		//  c: (object) The modal's options object 
		//  o: (jQuery object) The overlay element
		//  t: (DOM object) The triggering element

		// hide modal and if overlay, remove overlay.
		if(hash.w.hide() && hash.o) hash.o.remove();

		return true;

	},  addTrigger = function(m, key, trigger){
		// addTrigger: Adds a jqmShow/jqmHide (key) event click on modal (m)
		//  to all elements that match trigger string (trigger)

		var jqm = m.data('jqm');
		if(jqm) return $(trigger).each(function(){
			this[key] = this[key] || [];

			// register this modal with this trigger only once
			if($.inArray(jqm.ID,this[key]) < 0) {
				this[key].push(jqm.ID);

				// register trigger click event for this modal
				//  allows cancellation of show/hide event from
				$(this).click(function(e){
					if(!e.isDefaultPrevented()) m[key](this);
					return false;
				});
			}

		});

	}, open = function(h){
		// open: executes the onOpen callback + performs common tasks if successful

		// transform legacy hash into new var shortcuts 
		var m = h.w,
			v = h.o,
			o = h.c;

		// execute onShow callback
		if(o.onShow(h) !== false){
			// mark modal as shown
			m[0]._jqmShown = true;

			// if modal:true  dialog
			//   Bind the Keep Focus Function [F] if no other Modals are active
			// else, 
			//   trigger closing of dialog when overlay is clicked
			if(o.modal){ 
			  if(!ActiveModals[0]){ F('bind'); } 
			  ActiveModals.push(m[0]); 
			}
			else m.jqmAddClose(v);

			//  Attach events to elements inside the modal matching closingClass
			if(o.closeClass) m.jqmAddClose($('.' + o.closeClass,m));

			// if toTop is true and overlay exists;
			//  remember modal DOM position with <span> placeholder element, and move
			//  the modal to a direct child of the body tag (after overlyay)
			if(o.toTop && v)
			  m.before('<span id="jqmP'+o.ID+'"></span>').insertAfter(v);

			// remember overlay (for closing function)
			m.data('jqmv',v);

			// close modal if the esc key is pressed and closeOnEsc is set to true
			m.unbind("keydown",$.jqm.closeOnEscFunc);
			if(o.closeOnEsc) {
				m.attr("tabindex", 0).bind("keydown",$.jqm.closeOnEscFunc).focus();
			}
		}

	}, close = function(h){
		// close: executes the onHide callback + performs common tasks if successful

		// transform legacy hash into new var shortcuts
		 var m = h.w,
			v = h.o,
			o = h.c;

		// execute onHide callback
		if(o.onHide(h) !== false){
			// mark modal as !shown
			m[0]._jqmShown = false;

			 // If modal, remove from modal stack.
			 // If no modals in modal stack, unbind the Keep Focus Function
			 if(o.modal){ 
			   ActiveModals.pop(); 
			   if(!ActiveModals[0]) F('unbind'); 
			 }

			 // IF toTop was passed and an overlay exists;
			 //  Move modal back to its "remembered" position.
			 if(o.toTop && v) $('#jqmP'+o.ID).after(m).remove();
		}

	},  F = function(t){
		// F: The Keep Focus Function (for modal: true dialos)
		// Binds or Unbinds (t) the Focus Examination Function (X) 

		$(document)[t]("keypress keydown mousedown",X);

	}, X = function(e){
		// X: The Focus Examination Function (for modal: true dialogs)

		var targetModal = $(e.target).data('jqm') || 
		                  $(e.target).parents('.jqm-init:first').data('jqm');
		var activeModal = ActiveModals[ActiveModals.length-1];

		// allow bubbling if event target is within active modal dialog
		return (targetModal && targetModal.ID === activeModal._jqmID) ?
		         true : $.jqm.focusFunc(activeModal,e);
	},

	I = 0,   // modal ID increment (for nested modals)
	ActiveModals = [];  // array of active modals

	// $.jqm, overridable defaults
	$.jqm = {
		/**
		 *  default options
		 *    
		 * (Integer)   overlay      - [0-100] Translucency percentage (opacity) of the body covering overlay. Set to 0 for NO overlay, and up to 100 for a 100% opaque overlay.  
		 * (String)    overlayClass - Applied to the body covering overlay. Useful for controlling overlay look (tint, background-image, &c) with CSS.
		 * (String)    closeClass   - Children of the modal element matching `closeClass` will fire the onHide event (to close the modal).
		 * (Mixed)     trigger      - Matching elements will fire the onShow event (to display the modal). Trigger can be a selector String, a jQuery collection of elements, a DOM element, or a False boolean.
		 * (String)    ajax         - URL to load content from via an AJAX request. False to disable ajax. If ajax begins with a "@", the URL is extracted from the attribute of the triggering element (e.g. use '@data-url' for; <a href="#" class="jqModal" data-url="modal.html">...)	                
		 * (Mixed)     target       - Children of the modal element to load the ajax response into. If false, modal content will be overwritten by ajax response. Useful for retaining modal design. 
		 *                            Target may be a selector string, jQuery collection of elements, or a DOM element -- and MUST exist as a child of the modal element.
		 * (String)    ajaxText     - Text shown while waiting for ajax return. Replaces HTML content of `target` element.
		 * (Boolean)   modal        - If true, user interactivity will be locked to the modal window until closed.
		 * (Boolean)   toTop        - If true, modal will be posistioned as a first child of the BODY element when opened, and its DOM posistion restored when closed. Useful for overcoming z-Index container issues.
		 * (Function)  onShow       - User defined callback function fired when modal opened.
		 * (Function)  onHide       - User defined callback function fired when modal closed.
		 * (Function)  onLoad       - User defined callback function fired when ajax content loads.
		 */
		params: {
			overlay: 50,
			overlayClass: 'jqmOverlay',
			closeClass: 'jqmClose',
			closeOnEsc: false,
			trigger: '.jqModal',
			ajax: false,
			target: false,
			ajaxText: '',
			modal: false,
			toTop: false,
			onShow: onShow,
			onHide: onHide,
			onLoad: false
		},

		// focusFunc is fired:
		//   a) when a modal:true dialog is shown,
		//   b) when an event occurs outside an active modal:true dialog
		// It is passed the active modal:true dialog as well as event
		focusFunc: function(activeModal, e) {

		  // if the event occurs outside the activeModal, focus on first element
		  if(e) $(':input:visible:first',activeModal).focus();

		  // lock interactions to the activeModal
		  return false; 
		},

		// closeOnEscFunc is attached to modals where closeOnEsc param true.
		closeOnEscFunc: function(e){
			if (e.keyCode === 27) {
				$(this).jqmHide();
				return false;
			}
		}
	};

})( jQuery );

// $Id: jquery.cookie.js,v 1.2 2008/02/14 05:23:14 redbox2000drupalorg Exp $
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
/**
* http://www.openjs.com/scripts/events/keyboard_shortcuts/
* Version : 2.01.B
* By Binny V A
* License : BSD
*/
shortcut = {
    'all_shortcuts': {}, //All the shortcuts are stored in this array
    'add': function(shortcut_combination, callback, opt) {
        //Provide a set of default options
        var default_options = {
            'type': 'keydown',
            'propagate': false,
            'disable_in_input': false,
            'target': document,
            'keycode': false
        };
        if (!opt) opt = default_options;
        else {
            for (var dfo in default_options) {
                if (typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
            }
        }

        var ele = opt.target;
        if (typeof opt.target == 'string') ele = document.getElementById(opt.target);
        var ths = this;
        shortcut_combination = shortcut_combination.toLowerCase();

        //The function to be called at keypress
        var func = function(e) {
            e = e || window.event;

            if (opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
                var element;
                if (e.target) element = e.target;
                else if (e.srcElement) element = e.srcElement;
                if (element.nodeType == 3) element = element.parentNode;

                if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
            }

            //Find Which key is pressed
            if (e.keyCode) code = e.keyCode;
            else if (e.which) code = e.which;
            var character = String.fromCharCode(code).toLowerCase();

            if (code == 188) character = ","; //If the user presses , when the type is onkeydown
            if (code == 190) character = "."; //If the user presses , when the type is onkeydown

            var keys = shortcut_combination.split("+");
            //Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
            var kp = 0;

            //Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
            var shift_nums = {
                "`": "~",
                "1": "!",
                "2": "@",
                "3": "#",
                "4": "$",
                "5": "%",
                "6": "^",
                "7": "&",
                "8": "*",
                "9": "(",
                "0": ")",
                "-": "_",
                "=": "+",
                ";": ":",
                "'": "\"",
                ",": "<",
                ".": ">",
                "/": "?",
                "\\": "|"
            };
            //Special Keys - and their codes
            var special_keys = {
                'esc': 27,
                'escape': 27,
                'tab': 9,
                'space': 32,
                'return': 13,
                'enter': 13,
                'backspace': 8,

                'scrolllock': 145,
                'scroll_lock': 145,
                'scroll': 145,
                'capslock': 20,
                'caps_lock': 20,
                'caps': 20,
                'numlock': 144,
                'num_lock': 144,
                'num': 144,

                'pause': 19,
                'break': 19,

                'insert': 45,
                'home': 36,
                'delete': 46,
                'end': 35,

                'pageup': 33,
                'page_up': 33,
                'pu': 33,

                'pagedown': 34,
                'page_down': 34,
                'pd': 34,

                'left': 37,
                'up': 38,
                'right': 39,
                'down': 40,

                'f1': 112,
                'f2': 113,
                'f3': 114,
                'f4': 115,
                'f5': 116,
                'f6': 117,
                'f7': 118,
                'f8': 119,
                'f9': 120,
                'f10': 121,
                'f11': 122,
                'f12': 123
            };

            var modifiers = {
                shift: { wanted: false, pressed: false },
                ctrl: { wanted: false, pressed: false },
                alt: { wanted: false, pressed: false },
                meta: { wanted: false, pressed: false}	//Meta is Mac specific
            };

            if (e.ctrlKey) modifiers.ctrl.pressed = true;
            if (e.shiftKey) modifiers.shift.pressed = true;
            if (e.altKey) modifiers.alt.pressed = true;
            if (e.metaKey) modifiers.meta.pressed = true;

            for (var i = 0; k = keys[i], i < keys.length; i++) {
                //Modifiers
                if (k == 'ctrl' || k == 'control') {
                    kp++;
                    modifiers.ctrl.wanted = true;

                } else if (k == 'shift') {
                    kp++;
                    modifiers.shift.wanted = true;

                } else if (k == 'alt') {
                    kp++;
                    modifiers.alt.wanted = true;
                } else if (k == 'meta') {
                    kp++;
                    modifiers.meta.wanted = true;
                } else if (k.length > 1) { //If it is a special key
                    if (special_keys[k] == code) kp++;

                } else if (opt['keycode']) {
                    if (opt['keycode'] == code) kp++;

                } else { //The special keys did not match
                    if (character == k) kp++;
                    else {
                        if (shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
                            character = shift_nums[character];
                            if (character == k) kp++;
                        }
                    }
                }
            };

            if (kp == keys.length &&
						modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
						modifiers.shift.pressed == modifiers.shift.wanted &&
						modifiers.alt.pressed == modifiers.alt.wanted &&
						modifiers.meta.pressed == modifiers.meta.wanted) {
                callback(e);

                if (!opt['propagate']) { //Stop the event
                    //e.cancelBubble is supported by IE - this will kill the bubbling process.
                    e.cancelBubble = true;
                    e.returnValue = false;

                    //e.stopPropagation works in Firefox.
                    if (e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                    };
                    return false;
                }
            }
        };
        this.all_shortcuts[shortcut_combination] = {
            'callback': func,
            'target': ele,
            'event': opt['type']
        };
        //Attach the function with the event
        if (ele.addEventListener) ele.addEventListener(opt['type'], func, false);
        else if (ele.attachEvent) ele.attachEvent('on' + opt['type'], func);
        else ele['on' + opt['type']] = func;
    },

    //Remove the shortcut - just specify the shortcut and I will remove the binding
    'remove': function(shortcut_combination) {
        shortcut_combination = shortcut_combination.toLowerCase();
        var binding = this.all_shortcuts[shortcut_combination];
        delete (this.all_shortcuts[shortcut_combination]);
        if (!binding) return;
        var type = binding['event'];
        var ele = binding['target'];
        var callback = binding['callback'];

        if (ele.detachEvent) ele.detachEvent('on' + type, callback);
        else if (ele.removeEventListener) ele.removeEventListener(type, callback, false);
        else ele['on' + type] = false;
    }
}
/*!
* Auto Complete 5.1
* April 13, 2010
* Corey Hart @ http://www.codenothing.com
*/
//AutoComplate_OnSelect = function(a1, a2) { $('#ctl00_ctl00_ContentPlaceHolder1_ContentPlaceHolder3_hidctl00_ctl00_ContentPlaceHolder1_ContentPlaceHolder3_drpStockList').val(a2.data.innervalue); };
//CustomerAutoComplate_Onload = function(self, lst) { var arr = lst.list.split('\n'); var res = new Array(); for (i = 0; i < arr.length; i++) { var a = new Object(); a.innervalue = arr[i]; var temp = a.innervalue.split(','); a.display = temp[1]; a.value = temp[1]; res[res.length] = a; } return res; }
function AutoComplate_OnSumbit(a1, a2) { return false; };

(function($, window, undefined) {

    // Expose autoComplete to the jQuery chain
    $.fn.autoComplete = function() {
        // Force array of arguments
        var args = Slice.call(arguments),
			self = this,
			first = args.shift(),
			isMethod = typeof first === 'string',
			handler, el;

        // Deep namespacing is not supported in jQuery, a mistake I made in v4.1
        if (isMethod) {
            first = first.replace(rdot, '-');
        }

        // Allow for passing array of arguments, or multiple arguments
        // Eg: .autoComplete('trigger', [arg1, arg2, arg3...]) or .autoComplete('trigger', arg1, arg2, arg3...)
        // Mainly to allow for .autoComplete('trigger', arguments) to work
        // Note*: Some triggers pass an array as the first param, so check against that first
        args = (AutoComplete.arrayMethods[first] === TRUE && $.isArray(args[0]) && $.isArray(args[0][0])) ||
			(args.length === 1 && $.isArray(args[0])) ?
				args[0] : args;

        // Check method against handlers that need to use triggerHandler 
        handler = isMethod && (AutoComplete.handlerMethods[first] === -1 || args.length < (AutoComplete.handlerMethods[first] || 0)) ?
			'triggerHandler' : 'trigger';

        return isMethod ?
			self[handler]('autoComplete.' + first, args) :

        // Allow passing a jquery event special object {from $.Event()}
			first && first.preventDefault !== undefined ? self.trigger(first, args) :

        // Initiate the autocomplete on each element (Only takes a single argument, the options object)
			self.each(function() {
			    if ($(el = this).data('autoComplete') !== TRUE) {
			        AutoCompleteFunction(el, first);
			    }
			});
    };

    // bgiframe is needed to fix z-index problem for IE6 users.
    $.fn.bgiframe = $.fn.bgiframe ? $.fn.bgiframe : $.fn.bgIframe ? $.fn.bgIframe : function() {
        // For applications that don't have bgiframe plugin installed, create a useless 
        // function that doesn't break the chain
        return this;
    };

    // Allows for single event binding to document and forms associated with the autoComplete inputs
    // by deferring the event to the input in focus
    function setup($input, inputIndex) {
        if (setup.flag !== TRUE) {
            setup.flag = TRUE;
            rootjQuery.bind('click.autoComplete', function(event) {
                AutoComplete.getFocus(TRUE).trigger('autoComplete.document-click', [event]);
            });
        }

        var $form = $input.closest('form'), formList = $form.data('ac-inputs') || {}, $el;

        formList[inputIndex] = TRUE;
        $form.data('ac-inputs', formList);

        if ($form.data('autoComplete') !== TRUE) {
            $form.data('autoComplete', TRUE).bind('submit.autoComplete', function(event) {
                return ($el = AutoComplete.getFocus(TRUE)).length ?
					$el.triggerHandler('autoComplete.form-submit', [event, this]) :
					TRUE;
            });
        }
    }

    // Removes the single events attached to the document and respective input form
    function teardown($input, inputIndex) {
        AutoComplete.remove(inputIndex);

        if (setup.flag === TRUE && AutoComplete.length === 0) {
            setup.flag = FALSE;
            rootjQuery.unbind('click.autoComplete');
        }

        var $form = $input.closest('form'), formList = $form.data('ac-inputs') || {}, i;

        formList[inputIndex] = FALSE;
        for (i in formList) {
            if (formList.hasOwnProperty(i) && formList[i] === TRUE) {
                return;
            }
        }

        $form.unbind('submit.autoComplete');
    }

    // Default function for adding all supply items to the list
    function allSupply(event, ui) {
        if (!$.isArray(ui.supply)) {
            return [];
        }

        for (var i = -1, l = ui.supply.length, ret = [], entry; ++i < l; ) {
            entry = ui.supply[i];
            entry = entry && entry.value ? entry : { value: entry };
            ret.push(entry);
        }

        return ret;
    }



    // Internals
    var TRUE = true;
    var FALSE = false;

    // Copy of the slice prototype
    var Slice = Array.prototype.slice;

    // Make a copy of the document element for caching
    var rootjQuery = $(window.document);

    // Also make a copy of an empty jQuery set for fast referencing
    emptyjQuery = $(),

    // regex's
	rdot = /\./,

    // Opera and Firefox on Mac need to use the keypress event to track holding of
    // a key down and not releasing
	keypress = window.opera || (/macintosh/i.test(window.navigator.userAgent) && $.browser.mozilla),

    // Event flag that gets passed around
	ExpandoFlag = 'autoComplete_' + $.expando,

    // Make a local copy of the key codes used throughout the plugin
	KEY = {
	    backspace: 8,
	    tab: 9,
	    enter: 13,
	    shift: 16,
	    space: 32,
	    pageup: 33,
	    pagedown: 34,
	    left: 37,
	    up: 38,
	    right: 39,
	    down: 40
	},

    // Attach global aspects to jQuery itself
	AutoComplete = $.autoComplete = {
	    // Autocomplete Version
	    version: '5.1',

	    // Index Counter
	    counter: 0,

	    // Length of stack
	    length: 0,

	    // Storage of elements
	    stack: {},

	    // jQuery object versions of the storage elements
	    jqStack: {},

	    // Storage order of uid's
	    order: [],

	    // Global access to elements in use
	    hasFocus: FALSE,

	    // Expose the used keycodes
	    keys: KEY,

	    // Methods whose first argument may contain an array
	    arrayMethods: {
	        'button-supply': TRUE,
	        'direct-supply': TRUE
	    },

	    // Defines the maximum number of arguments that can be passed for using
	    // triggerHandler method instead of trigger. Passing -1 forces triggerHandler
	    // no matter the number of arguments
	    handlerMethods: {
	        'option': 2
	    },

	    // Events triggered whenever one of the autoComplete
	    // input's come into focus or blur out.
	    focus: undefined,
	    blur: undefined,

	    // Allow access to jquery cached object versions of the elements
	    getFocus: function(jqStack) {
	        return !AutoComplete.order[0] ? jqStack ? emptyjQuery : undefined :
				jqStack ? AutoComplete.jqStack[AutoComplete.order[0]] :
				AutoComplete.stack[AutoComplete.order[0]];
	    },

	    getPrevious: function(jqStack) {
	        // Removing elements cause some indexs on the order stack
	        // to become undefined, so loop until one is found
	        for (var i = 0, l = AutoComplete.order.length; ++i < l; ) {
	            if (AutoComplete.order[i]) {
	                return jqStack ?
						AutoComplete.jqStack[AutoComplete.order[i]] :
						AutoComplete.stack[AutoComplete.order[i]];
	            }
	        }

	        return jqStack ? emptyjQuery : undefined;
	    },

	    remove: function(n) {
	        for (var i = -1, l = AutoComplete.order.length; ++i < l; ) {
	            if (AutoComplete.order[i] === n) {
	                AutoComplete.order[i] = undefined;
	            }
	        }

	        AutoComplete.length--;
	        delete AutoComplete.stack[n];
	    },

	    // Returns full stack in jQuery form
	    getAll: function() {
	        for (var i = -1, l = AutoComplete.counter, stack = []; ++i < l; ) {
	            if (AutoComplete.stack[i]) {
	                stack.push(AutoComplete.stack[i]);
	            }
	        }
	        return $(stack);
	    },

	    defaults: {
	        // To smooth upgrade process to 5.x, set backwardsCompatible to true
	        backwardsCompatible: FALSE,
	        // Server Script Path
	        ajax: 'ajax.php',
	        ajaxCache: $.ajaxSettings.cache,
	        // Data Configuration
	        dataSupply: [],
	        dataFn: undefined,
	        formatSupply: undefined,
	        // Drop List CSS
	        list: 'auto-complete-list',
	        rollover: 'auto-complete-list-rollover',
	        width: undefined, // Defined as inputs width when extended (can be overridden with this global/options/meta)
	        striped: undefined,
	        maxHeight: undefined,
	        bgiframe: undefined,
	        newList: FALSE,
	        // Post Data
	        postVar: 'q',
	        postData: {},
	        postFormat: undefined,
	        // Limitations
	        minChars: 2,
	        maxItems: -1,
	        maxRequests: 0,
	        AllowEnter: FALSE,
	        maxRequestsDeep: FALSE,
	        requestType: 'Get',
	        // Input
	        inputControl: undefined,
	        autoFill: FALSE,
	        nonInput: [KEY.shift, KEY.left, KEY.right],
	        multiple: FALSE,
	        multipleSeparator: ' ',
	        // Events
	        onBlur: undefined,
	        onFocus: undefined,
	        onHide: undefined,
	        onLoad: undefined,
	        onMaxRequest: undefined,
	        onRollover: undefined,
	        onSelect: undefined,
	        onShow: undefined,
	        onListFormat: undefined,
	        onSubmit: AutoComplate_OnSumbit,
	        spinner: undefined,
	        preventEnterSubmit: FALSE,
	        delay: 0,
	        // Caching Options
	        useCache: TRUE,
	        cacheLimit: 50
	    }
	},

    // Autocomplete function
	AutoCompleteFunction = function(self, options) {
	    // Start with counters as they are used within declarations
	    AutoComplete.length++;
	    AutoComplete.counter++;

	    // Input specific vars
	    var $input = $(self).attr('autocomplete', 'off'),
	    // Data object stored on 'autoComplete' data namespace of input
			ACData = {},
	    // Track every event triggered
			LastEvent = {},
	    // String of current input value
			inputval = '',
	    // Holds the current list
			currentList = [],
	    // Place holder for all list elements
			$elems = { length: 0 },
	    // Place holder for the list element in focus
			$li,
	    // View and heights for scrolling
			view, ulHeight, liHeight, liPerView,
	    // Hardcoded value for ul visiblity
			ulOpen = FALSE,
	    // Timer for delay
			timeid,
	    // Ajax requests holder
			xhr,
	    // li element in focus, and its data
			liFocus = -1, liData,
	    // Fast referencing for multiple selections
			separator,
	    // Index of current input
			inputIndex = AutoComplete.counter,
	    // Number of requests made
			requests = 0,
	    // Internal Per Input Cache
			cache = {
			    length: 0,
			    val: undefined,
			    list: {}
			},

	    // Merge defaults with passed options and metadata options
			settings = $.extend(
				{ width: $input.outerWidth() },
				AutoComplete.defaults,
				options || {},
				$.metadata ? $input.metadata() : {}
			),

	    // Create the drop list (Use an existing one if possible)
			$ul = !settings.newList && rootjQuery.find('ul.' + settings.list)[0] ?
				rootjQuery.find('ul.' + settings.list).eq(0).bgiframe(settings.bgiframe) :
				$('<ul/>').appendTo('body').addClass(settings.list).bgiframe(settings.bgiframe).hide().data('ac-selfmade', TRUE);


	    // Start Binding
	    $input.data('autoComplete', ACData = {
	        index: inputIndex,
	        hasFocus: FALSE,
	        active: TRUE,
	        settings: settings,
	        initialSettings: $.extend(TRUE, {}, settings)
	    });

	    // IE catches the enter key only on keypress/keyup, so add a helper
	    // to track that event if needed
	    if ($.browser.msie) {
	        $input.bind('keypress.autoComplete', function(event) {
	            if (!ACData.active) {
	                return TRUE;
	            }

	            if (event.keyCode === KEY.enter) {

	                var enter = TRUE;

	                // See entertracking on main key(press/down) event for explanation
	                if ($li && $li.hasClass(settings.rollover)) {
	                    enter = settings.preventEnterSubmit && ulOpen ? FALSE : TRUE;
	                    select(event);
	                }
	                else if (ulOpen) {
	                    $ul.hide(event);
	                }

	                return enter;
	            }
	        });
	    }


	    // Opera && firefox on Mac use keypress to track holding down of key, 
	    // while everybody else uses keydown for same functionality
	    $input.bind(keypress ? 'keypress.autoComplete' : 'keydown.autoComplete', function(event) {
	        // If autoComplete has been disabled, prevent input events

	        if (!ACData.active) {
	            return TRUE;
	        }

	        // Track last event and store code for munging
	        var key = (LastEvent = event).keyCode, enter = FALSE;
	        var keychar = (LastEvent = event);

	        // Tab Key
	        if (key === KEY.tab && ulOpen) {
	            select(event);
	        }
	        // Enter Key
	        else if (key === KEY.enter) {


	            // When tracking whether to submit the form or not, we have
	            // to ensure that the user is actually selecting an element from the drop
	            // down list. It no element is selected, then hide the list and track form
	            // submission. If an element is selected, then track for submission first, 
	            // then hide the list.
	            enter = TRUE;
	            if ($li && $li.hasClass(settings.rollover)) {
	                enter = settings.preventEnterSubmit && ulOpen ? FALSE : TRUE;
	                select(event);

	            }
	            else if (ulOpen) {
	                $ul.hide(event);
	            }

	        }
	        // Up Arrow
	        else if (key === KEY.up && ulOpen) {
	            if (liFocus > 0) {
	                liFocus--;
	                up(event);
	            } else {
	                liFocus = -1;
	                $input.val(inputval);
	                $ul.hide(event);
	            }
	        }
	        // Down Arrow
	        else if (key === KEY.down && ulOpen) {
	            if (liFocus < $elems.length - 1) {
	                liFocus++;
	                down(event);
	            }
	        }
	        // Page Up
	        else if (key === KEY.pageup && ulOpen) {
	            if (liFocus > 0) {
	                liFocus -= liPerView;

	                if (liFocus < 0) {
	                    liFocus = 0;
	                }

	                up(event);
	            }
	        }
	        // Page Down
	        else if (key === KEY.pagedown && ulOpen) {
	            if (liFocus < $elems.length - 1) {
	                liFocus += liPerView;

	                if (liFocus > $elems.length - 1) {
	                    liFocus = $elems.length - 1;
	                }

	                down(event);
	            }
	        }
	        // Check for non input values defined by user
	        else if (settings.nonInput && $.inArray(key, settings.nonInput) > -1) {
	            $ul.html('').hide(event);
	            enter = TRUE;
	        }
	        // Everything else is considered possible input, so
	        // return before keyup prevention flag is set
	        else {
	            var selected = GetSelection($input[0]);
	            if (selected || selected.length > 0) {
	                var txt = $input.val();
	                h = globalResource.charCodeAt(key - 32);
	                var newtxt = txt.replace(selected, "");
	                $input.val(newtxt);
	            }
	            return TRUE;
	        }

	        // Prevent autoComplete keyup event's from triggering by
	        // attaching a flag to the last event
	        LastEvent['keydown_' + ExpandoFlag] = TRUE;

	        return enter;
	    })
		.bind({
		    'keyup.autoComplete': function(event) {
		        // If autoComplete has been disabled or keyup prevention 
		        // flag has be set, prevent input events
		        if (!ACData.active || LastEvent['keydown_' + ExpandoFlag]) {
		            return TRUE;
		        }

		        // If no special operations were run on keydown,
		        // allow for regular text searching
		        inputval = $input.val();
		        var key = (LastEvent = event).keyCode, val = separator ? inputval.split(separator).pop() : inputval;

		        // Still check to make sure 'enter' wasn't pressed
		        if (key != KEY.enter) {

		            // Caching key value
		            cache.val = settings.inputControl === undefined ? val :
						settings.inputControl.apply(self, settings.backwardsCompatible ?
							[val, key, $ul, event, settings, cache] :
							[event, {
							    val: val,
							    key: key,
							    settings: settings,
							    cache: cache,
							    ul: $ul
}]
						);

		            // Only send request if character length passes
		            if (cache.val.length >= settings.minChars) {
		                sendRequest(event, settings, cache, (key === KEY.backspace || key === KEY.space));
		            }
		            // Remove list on backspace of small string
		            else if (key == KEY.backspace) {
		                $ul.html('').hide(event);
		            }
		        }
		    },

		    'blur.autoComplete': function(event) {
		        // If autoComplete has been disabled or the drop list
		        // is still open, prevent input events
		        if (!ACData.active || ulOpen) {
		            return TRUE;
		        }

		        // Only push undefined index onto order stack
		        // if not already there (in-case multiple blur events occur)
		        if (AutoComplete.order[0] !== undefined) {
		            AutoComplete.order.unshift(undefined);
		        }

		        // Expose focus
		        AutoComplete.hasFocus = FALSE;
		        ACData.hasFocus = FALSE;
		        liFocus = -1;
		        $ul.hide(LastEvent = event);

		        // Trigger both the global and element specific blur events
		        if (AutoComplete.blur) {
		            AutoComplete.blur.call(self, event, { settings: settings, cache: cache, ul: $ul });
		        }

		        if (settings.onBlur) {
		            settings.onBlur.apply(self, settings.backwardsCompatible ?
						[inputval, $ul, event, settings, cache] : [event, {
						    val: inputval,
						    settings: settings,
						    cache: cache,
						    ul: $ul
}]
					);
		        }
		    },

		    'focus.autoComplete': function(event, flag) {
		        // Prevent inner focus events if caused by autoComplete inner functionality
		        // Also, because IE triggers focus AND closes the drop list before form submission,
		        // keep the select flag by not reseting the last event
		        if (!ACData.active || (ACData.hasFocus && flag === ExpandoFlag) || LastEvent['enter_' + ExpandoFlag]) {
		            return TRUE;
		        }

		        if (inputIndex !== $ul.data('ac-input-index')) {
		            $ul.html('').hide(event);
		        }

		        // Overwrite undefined index pushed on by the blur event
		        if (AutoComplete.order[0] === undefined) {
		            if (AutoComplete.order[1] === inputIndex) {
		                AutoComplete.order.shift();
		            } else {
		                AutoComplete.order[0] = inputIndex;
		            }
		        }
		        else if (AutoComplete.order[0] != inputIndex && AutoComplete.order[1] != inputIndex) {
		            AutoComplete.order.unshift(inputIndex);
		        }

		        if (AutoComplete.defaults.cacheLimit !== -1 && AutoComplete.order.length > AutoComplete.defaults.cacheLimit) {
		            AutoComplete.order.pop();
		        }

		        // Expose focus
		        AutoComplete.hasFocus = TRUE;
		        ACData.hasFocus = TRUE;
		        LastEvent = event;

		        // Trigger both the global and element specific focus events
		        if (AutoComplete.focus) {
		            AutoComplete.focus.call(self, event, { settings: settings, cache: cache, ul: $ul });
		        }

		        if (settings.onFocus) {
		            settings.onFocus.apply(self,
						settings.backwardsCompatible ? [$ul, event, settings, cache] : [event, {
						    settings: settings,
						    cache: cache,
						    ul: $ul
}]
					);
		        }
		    },

		    /**
		    * Autocomplete Custom Methods (Extensions off autoComplete event)
		    */
		    // Catches document click events from the global scope
		    'autoComplete.document-click': function(e, event) {
		        if (ACData.active && ulOpen &&
		        // Double check the event timestamps to ensure there isn't a delayed reaction from a button
					(!LastEvent || event.timeStamp - LastEvent.timeStamp > 200) &&
		        // Check the target after all other checks are passed (less processing)
					$(event.target).closest('ul').data('ac-input-index') !== inputIndex) {
		            $ul.hide(LastEvent = event);
		            $input.blur();
		        }
		    },

		    // Catches form submission ( so only one event is attached to the form )
		    'autoComplete.form-submit': function(e, event, form) {
		        if (!ACData.active) {
		            return TRUE;
		        }

		        LastEvent = event;

		        // Because IE triggers focus AND closes the drop list before form submission,
		        // tracking enter is set on the keydown event

		        return settings.preventEnterSubmit && (ulOpen || LastEvent['enter_' + ExpandoFlag]) ? FALSE :
					settings.onSubmit === undefined ? TRUE :
					settings.onSubmit.call(self, event, { form: form, settings: settings, cache: cache, ul: $ul });
		    },

		    // Catch mouseovers on the drop down element
		    'autoComplete.ul-mouseenter': function(e, event, li) {
		        if ($li) {
		            $li.removeClass(settings.rollover);
		        }

		        $li = $(li).addClass(settings.rollover);
		        liFocus = $elems.index(li);
		        liData = currentList[liFocus];
		        view = $ul.scrollTop() + ulHeight;
		        LastEvent = event;

		        if (settings.onRollover) {
		            settings.onRollover.apply(self, settings.backwardsCompatible ?
						[liData, $li, $ul, event, settings, cache] :
						[event, {
						    data: liData,
						    li: $li,
						    settings: settings,
						    cache: cache,
						    ul: $ul
}]
					);
		        }
		    },

		    // Catch click events on the drop down
		    'autoComplete.ul-click': function(e, event) {
		        // Refocus the input box and pass flag to prevent inner focus events
		        $input.trigger('focus', [ExpandoFlag]);

		        // Check against separator for input value
		        $input.val(inputval === separator ?
					inputval.substr(0, inputval.length - inputval.split(separator).pop().length) + liData.value + separator :
					liData.value
				);

		        $ul.hide(LastEvent = event);
		        autoFill();

		        if (settings.onSelect) {
		            settings.onSelect.apply(self, settings.backwardsCompatible ?
						[liData, $li, $ul, event, settings, cache] :
						[event, {
						    data: liData,
						    li: $li,
						    settings: settings,
						    cache: cache,
						    ul: $ul
}]
					);
		        }
		    },

		    // Allow for change of settings at any point
		    'autoComplete.settings': function(event, newSettings) {
		        if (!ACData.active) {
		            return TRUE;
		        }

		        var ret, $el;
		        LastEvent = event;

		        // Give access to current settings and cache
		        if ($.isFunction(newSettings)) {
		            ret = newSettings.apply(self, settings.backwardsCompatible ?
						[settings, cache, $ul, event] : [event, { settings: settings, cache: cache, ul: $ul}]
					);

		            // Allow for extending of settings/cache based off function return values
		            if ($.isArray(ret) && ret[0] !== undefined) {
		                $.extend(TRUE, settings, ret[0] || settings);
		                $.extend(TRUE, cache, ret[1] || cache);
		            }
		        } else {
		            $.extend(TRUE, settings, newSettings || {});
		        }

		        // Change the drop down if dev want's a differen't class attached
		        $ul = !settings.newList && $ul.hasClass(settings.list) ? $ul :
					!settings.newList && ($el = rootjQuery.find('ul.' + settings.list).eq(0)).length ?
						$el.bgiframe(settings.bgiframe) :
						$('<ul/>').appendTo('body').addClass(settings.list)
							.bgiframe(settings.bgiframe).hide().data('ac-selfmade', TRUE);

		        // Custom drop list modifications
		        newUl();

		        // Change case here so it doesn't have to be done on every request
		        settings.requestType = settings.requestType.toUpperCase();

		        // Local copy of the seperator for faster referencing
		        separator = settings.multiple ? settings.multipleSeparator : undefined;

		        // Just to be sure, reset the settings object into the data storage
		        ACData.settings = settings;
		    },

		    // Clears the Cache & requests (requests can be blocked from clearing)
		    'autoComplete.flush': function(event, cacheOnly) {
		        if (!ACData.active) {
		            return TRUE;
		        }

		        if (!cacheOnly) {
		            requests = 0;
		        }

		        cache = { length: 0, val: undefined, list: {} };
		        LastEvent = event;
		    },

		    // External button trigger for ajax requests
		    'autoComplete.button-ajax': function(event, postData, cacheName) {
		        if (!ACData.active) {
		            return TRUE;
		        }

		        if (typeof postData === 'string') {
		            cacheName = postData;
		            postData = {};
		        }

		        // Save off the last event before triggering focus on the off-chance
		        // it is needed by a secondary focus event
		        LastEvent = event;

		        // Refocus the input box, but pass flag to prevent inner focus events
		        $input.trigger('focus', [ExpandoFlag]);

		        // If no cache name is given, supply a non-common word
		        cache.val = cacheName || 'button-ajax_' + ExpandoFlag;

		        return sendRequest(
					event,
					$.extend(TRUE, {}, settings, { maxItems: -1, postData: postData || {} }),
					cache
				);
		    },

		    // External button trigger for supplied data
		    'autoComplete.button-supply': function(event, data, cacheName) {
		        if (!ACData.active) {
		            return TRUE;
		        }

		        if (typeof data === 'string') {
		            cacheName = data;
		            data = undefined;
		        }

		        // Again, save off event before triggering focus
		        LastEvent = event;

		        // Refocus the input box and pass flag to prevent inner focus events
		        $input.trigger('focus', [ExpandoFlag]);

		        // If no cache name is given, supply a non-common word
		        cache.val = cacheName || 'button-supply_' + ExpandoFlag;

		        // If no data is supplied, use data in settings
		        data = $.isArray(data) ? data : settings.dataSupply;

		        return sendRequest(
					event,
					$.extend(TRUE, {}, settings, { maxItems: -1, dataSupply: data, formatSupply: allSupply }),
					cache
				);
		    },

		    // Supply list directly into the result function
		    'autoComplete.direct-supply': function(event, data, cacheName) {
		        if (!ACData.active) {
		            return TRUE;
		        }

		        if (typeof data === 'string') {
		            cacheName = data;
		            data = undefined;
		        }

		        // Again, save off event before triggering focus
		        LastEvent = event;

		        // Refocus the input box and pass flag to prevent inner focus events
		        $input.trigger('focus', [ExpandoFlag]);

		        // If no cache name is given, supply a non-common word
		        cache.val = cacheName || 'direct-supply_' + ExpandoFlag;

		        // If no data is supplied, use data in settings
		        data = $.isArray(data) && data.length ? data : settings.dataSupply;

		        // Load the results directly into the results function bypassing request holdups
		        return loadResults(
					event,
					data,
					$.extend(TRUE, {}, settings, { maxItems: -1, dataSupply: data, formatSupply: allSupply }),
					cache
				);
		    },

		    // Triggering autocomplete programatically
		    'autoComplete.search': function(event, value) {
		        if (!ACData.active) {
		            return TRUE;
		        }

		        cache.val = value || '';
		        return sendRequest(LastEvent = event, settings, cache);
		    },

		    // Add jquery-ui like option access
		    'autoComplete.option': function(event, name, value) {
		        if (!ACData.active) {
		            return TRUE;
		        }

		        LastEvent = event;
		        switch (Slice.call(arguments).length) {
		            case 3:
		                settings[name] = value;
		                return value;
		            case 2:
		                return name === 'ul' ? $ul :
							name === 'cache' ? cache :
							name === 'xhr' ? xhr :
							name === 'input' ? $input :
							settings[name] || undefined;
		            default:
		                return settings;
		        }
		    },

		    // Add enabling event (only applicable after disable)
		    'autoComplete.enable': function(event) {
		        ACData.active = TRUE;
		        LastEvent = event;
		    },

		    // Add disable event
		    'autoComplete.disable': function(event) {
		        ACData.active = FALSE;
		        $ul.html('').hide(LastEvent = event);
		    },

		    // Add a destruction function
		    'autoComplete.destroy': function(event) {
		        var list = $ul.html('').hide(LastEvent = event).data('ac-inputs') || {}, i;

		        // Remove all autoComplete specific data and events
		        $input.removeData('autoComplete').unbind('.autoComplete autoComplete');

		        // Remove form/drop list/document event catchers if possible
		        teardown($input, inputIndex);

		        // Remove input from the drop down element of inputs
		        list[inputIndex] = undefined;

		        // Go through the drop down element and see if any other inputs are attached to it
		        for (i in list) {
		            if (list.hasOwnProperty(i) && list[i] === TRUE) {
		                return LastEvent;
		            }
		        }

		        // Remove the element from the DOM if self created
		        if ($ul.data('ac-selfmade') === TRUE) {
		            $ul.remove();
		        }
		        // Kill all data associated with autoComplete for a cleaned drop down element
		        else {
		            $ul.removeData('autoComplete').removeData('ac-input-index').removeData('ac-inputs');
		        }
		    }
		});

	    // Ajax/Cache Request
	    function sendRequest(event, settings, cache, backSpace, timeout) {
	        // Merely setting max requests still allows usage of cache and supplied data,
	        // this 'Deep' option prevents those scenarios if needed
	        if (settings.maxRequestsDeep === true && requests >= settings.maxRequests) {
	            return FALSE;
	        }

	        if (settings.spinner) {
	            settings.spinner.call(self, event, { active: TRUE, settings: settings, cache: cache, ul: $ul });
	        }

	        if (timeid) {
	            timeid = clearTimeout(timeid);
	        }

	        // Call send request again with timeout flag if on delay
	        if (settings.delay > 0 && timeout === undefined) {
	            timeid = window.setTimeout(function() {
	                sendRequest(event, settings, cache, backSpace, TRUE);
	            }, settings.delay);
	            return timeid;
	        }

	        // Abort previous request incase it's still running
	        if (xhr) {
	            xhr.abort();
	        }

	        // Load from cache if possible
	        if (settings.useCache && $.isArray(cache.list[cache.val])) {
	            return loadResults(event, cache.list[cache.val], settings, cache, backSpace);
	        }

	        // Use user supplied data when defined
	        if (settings.dataSupply.length) {
	            return userSuppliedData(event, settings, cache, backSpace);
	        }

	        // Check Max requests first before sending request
	        if (settings.maxRequests && ++requests >= settings.maxRequests) {
	            $ul.html('').hide(event);

	            if (settings.spinner) {
	                settings.spinner.call(self, event, { active: FALSE, settings: settings, cache: cache, ul: $ul });
	            }

	            if (settings.onMaxRequest && requests === settings.maxRequests) {
	                return settings.onMaxRequest.apply(self, settings.backwardsCompatible ?
						[cache.val, $ul, event, inputval, settings, cache] :
						[event, {
						    search: cache.val,
						    val: inputval,
						    settings: settings,
						    cache: cache,
						    ul: $ul
}]
					);
	            }

	            return FALSE;
	        }

	        settings.postData[settings.postVar] = cache.val;
	        xhr = $.ajax({
	            type: settings.requestType,
	            url: settings.ajax,
	            cache: settings.ajaxCache,
	            //dataType: 'json',

	            // Send personalised data
	            data: settings.postFormat ?
					settings.postFormat.call(self, event, {
					    data: settings.postData,
					    search: cache.val,
					    val: inputval,
					    settings: settings,
					    cache: cache,
					    ul: $ul
					}) :
					settings.postData,

	            success: function(list) {
	                loadResults(event, list, settings, cache, backSpace);
	            },

	            error: function(e) {
	                $ul.html('').hide(event);
	                if (settings.spinner) {
	                    settings.spinner.call(self, event, { active: FALSE, settings: settings, cache: cache, ul: $ul });
	                }
	            }
	        });

	        return xhr;
	    }

	    // Parse User Supplied Data
	    function userSuppliedData(event, settings, cache, backSpace) {
	        var list = [], args = [],
				fn = $.isFunction(settings.dataFn),
				regex = fn ? undefined : new RegExp('^' + cache.val, 'i'),
				items = 0, entry, i = -1, l = settings.dataSupply.length;

	        if (settings.formatSupply) {
	            list = settings.formatSupply.call(self, event, {
	                search: cache.val,
	                supply: settings.dataSupply,
	                settings: settings,
	                cache: cache,
	                ul: $ul
	            });
	        } else {
	            for (; ++i < l; ) {
	                // Force object wrapper for entry
	                entry = settings.dataSupply[i];
	                entry = entry && typeof entry.value === 'string' ? entry : { value: entry };

	                // Setup arguments for dataFn in a backwards compatible way if needed
	                args = settings.backwardsCompatible ?
						[cache.val, entry.value, list, i, settings.dataSupply, $ul, event, settings, cache] :
						[event, {
						    search: cache.val,
						    entry: entry.value,
						    list: list,
						    i: i,
						    supply: settings.dataSupply,
						    settings: settings,
						    cache: cache,
						    ul: $ul
}];

	                // If user supplied function, use that, otherwise test with default regex
	                if ((fn && settings.dataFn.apply(self, args)) || (!fn && entry.value.match(regex))) {
	                    // Reduce browser load by breaking on limit if it exists
	                    if (settings.maxItems > -1 && ++items > settings.maxItems) {
	                        break;
	                    }
	                    list.push(entry);
	                }
	            }
	        }

	        // Use normal load functionality
	        return loadResults(event, list, settings, cache, backSpace);
	    }

	    // Key element Selection
	    function select(event) {
	        // Ensure the select function only gets fired when list of open

	        if (ulOpen) {
	            if (settings.onSelect) {
	                settings.onSelect.apply(self, settings.backwardsCompatible ?
						[liData, $li, $ul, event, settings, cache] :
						[event, {
						    data: liData,
						    li: $li,
						    settings: settings,
						    cache: cache,
						    ul: $ul
}]
					);
	            }

	            autoFill();
	            inputval = $input.val();

	            // Because IE triggers focus AND closes the drop list before form submission
	            // attach a flag on 'enter' selection
	            if (LastEvent.type === 'keydown') {
	                LastEvent['enter_' + ExpandoFlag] = TRUE;
	            }

	            $ul.hide(event);
	        }

	        $li = undefined;
	    }

	    // Key direction up
	    function up(event) {
	        if ($li) {
	            $li.removeClass(settings.rollover);
	        }

	        $ul.show(event);
	        $li = $elems.eq(liFocus).addClass(settings.rollover);
	        liData = currentList[liFocus];

	        if (!$li.length || !liData) {
	            return FALSE;
	        }

	        autoFill(liData.value);
	        if (settings.onRollover) {
	            settings.onRollover.apply(self, settings.backwardsCompatible ?
					[liData, $li, $ul, event, settings, cache] :
					[event, {
					    data: liData,
					    li: $li,
					    settings: settings,
					    cache: cache,
					    ul: $ul
}]
				);
	        }

	        // Scrolling
	        var scroll = liFocus * liHeight;
	        if (scroll < view - ulHeight) {
	            view = scroll + ulHeight;
	            $ul.scrollTop(scroll);
	        }
	    }

	    // Key direction down
	    function down(event) {
	        if ($li) {
	            $li.removeClass(settings.rollover);
	        }

	        $ul.show(event);
	        $li = $elems.eq(liFocus).addClass(settings.rollover);
	        liData = currentList[liFocus];

	        if (!$li.length || !liData) {
	            return FALSE;
	        }

	        autoFill(liData.value);

	        // Scrolling
	        var scroll = (liFocus + 1) * liHeight;
	        if (scroll > view) {
	            $ul.scrollTop((view = scroll) - ulHeight);
	        }

	        if (settings.onRollover) {
	            settings.onRollover.apply(self, settings.backwardsCompatible ?
					[liData, $li, $ul, event, settings, cache] : [event, {
					    data: liData,
					    li: $li,
					    settings: settings,
					    cache: cache,
					    ul: $ul
}]
				);
	        }
	    }

	    // Attach new show/hide functionality to only the ul object (so not to infect all of jQuery),
	    // And also attach event handlers if not already done so
	    function newUl() {
	        var hide = $ul.hide, show = $ul.show, list = $ul.data('ac-inputs') || {};

	        if (!$ul[ExpandoFlag]) {
	            $ul.hide = function(event, speed, callback) {
	                if (settings.onHide && ulOpen) {
	                    settings.onHide.call(self, event, { ul: $ul, settings: settings, cache: cache });
	                }

	                ulOpen = FALSE;
	                return hide.call($ul, speed, callback);
	            };

	            $ul.show = function(event, speed, callback) {
	                if (settings.onShow && !ulOpen) {
	                    settings.onShow.call(self, event, { ul: $ul, settings: settings, cache: cache });
	                }

	                ulOpen = TRUE;
	                return show.call($ul, speed, callback);
	            };

	            // A flag must be attached to the $ul cached object
	            $ul[ExpandoFlag] = TRUE;
	        }

	        // Attach global handlers for event delegation (So there is no more loss time in unbinding and rebinding)
	        if ($ul.data('autoComplete') !== TRUE) {
	            $ul.data('autoComplete', TRUE)
				.delegate('li', 'mouseenter.autoComplete', function(event) {
				    AutoComplete.getFocus(TRUE).trigger('autoComplete.ul-mouseenter', [event, this]);
				})
				.bind('click.autoComplete', function(event) {
				    AutoComplete.getFocus(TRUE).trigger('autoComplete.ul-click', [event]);
				    return FALSE;
				});
	        }

	        list[inputIndex] = TRUE;
	        $ul.data('ac-inputs', list);
	    }

	    // Auto-fill the input
	    // Credit to Jörn Zaefferer @ http://bassistance.de/jquery-plugins/jquery-plugin-autocomplete/
	    // and http://www.pengoworks.com/workshop/jquery/autocomplete.htm for this functionality
	    function autoFill(val) {
	        var start, end, range;

	        // Set starting and ending points based on values
	        if (val === undefined || val === '') {
	            start = end = $input.val().length;
	        } else {
	            if (separator) {
	                val = inputval.substr(0, inputval.length - inputval.split(separator).pop().length) + val + separator;
	            }

	            start = inputval.length;
	            end = val.length;
	            $input.val(val);
	        }

	        // Create selection if allowed
	        if (!settings.autoFill || start > end) {
	            return FALSE;
	        }
	        else if (self.createTextRange) {
	            range = self.createTextRange();
	            if (val === undefined) {
	                range.move('character', start);
	                range.select();
	            } else {
	                range.collapse(TRUE);
	                range.moveStart('character', start);
	                range.moveEnd('character', end);
	                range.select();
	            }
	        }
	        else if (self.setSelectionRange) {
	            self.setSelectionRange(start, end);
	        }
	        else if (self.selectionStart) {
	            self.selectionStart = start;
	            self.selectionEnd = end;
	        }
	    };
	    function GetSelection(input) {
	        //var textComponent = document.getElementById('Editor');
	        var selectedText;
	        // IE version
	        if (document.selection != undefined) {
	            input.focus();
	            var sel = document.selection.createRange();
	            selectedText = sel.text;
	        }
	        // Mozilla version
	        else if (input.selectionStart != undefined) {
	            var startPos = input.selectionStart;
	            var endPos = input.selectionEnd;
	            selectedText = input.value.substring(startPos, endPos)
	        }
	        return selectedText;
	    };

	    // List Functionality
	    function loadResults(event, list, settings, cache, backSpace) {
	        // Allow another level of result handling
	        currentList = settings.onLoad ?
				settings.onLoad.call(self, event, { list: list, settings: settings, cache: cache, ul: $ul }) : list;

	        // Tell spinner function to stop if set
	        if (settings.spinner) {
	            settings.spinner.call(self, event, { active: FALSE, settings: settings, cache: cache, ul: $ul });
	        }

	        // Store results into the cache if allowed
	        if (settings.useCache && !$.isArray(cache.list[cache.val])) {
	            cache.length++;
	            cache.list[cache.val] = list;

	            // Clear cache if necessary
	            if (settings.cacheLimit !== -1 && cache.length > settings.cacheLimit) {
	                cache.list = {};
	                cache.length = 0;
	            }
	        }

	        // Ensure there is a list
	        if (!currentList || currentList.length < 1) {
	            return $ul.html('').hide(event);
	        }

	        // Refocus list element
	        liFocus = -1;

	        // Initialize Vars together (save bytes)
	        var offset = $input.offset(), // Input position
				container = [], // Container for list elements
				items = 0, i = -1, striped = FALSE, length = currentList.length; // Loop Items

	        if (settings.onListFormat) {
	            settings.onListFormat.call(self, event, { list: currentList, settings: settings, cache: cache, ul: $ul });
	        }
	        else {
	            // Push items onto container
	            for (; ++i < length; ) {
	                if (currentList[i].value) {
	                    if (settings.maxItems > -1 && ++items > settings.maxItems) {
	                        break;
	                    }

	                    container.push(
							settings.striped && striped ? '<li class="' + settings.striped + '">' : '<li>',
							currentList[i].display || currentList[i].value,
							'</li>'
						);

	                    striped = !striped;
	                }
	            }
	            $ul.html(container.join(''));
	        }

	        // Cache the list items
	        $elems = $ul.children('li');

	        // Autofill input with first entry
	        if (settings.autoFill && !backSpace) {
	            liFocus = 0;
	            liData = currentList[0];
	            autoFill(liData.value);
	            $li = $elems.eq(0).addClass(settings.rollover);
	        }
	        //var offset = $input.offset();
	        var bodyheight = $('body').height();
	        var ulHeight = $ul.height();
	        var inputpossion = $input.offset().top;
	        var ulTop = offset.top + $input.outerHeight();
	        //var h2 = $ul.outerHeight();
	        if (ulHeight + inputpossion >= bodyheight) {
	            ulTop = inputpossion - ulHeight;
	        }
	        // Align the drop down element
	        $ul.data('ac-input-index', inputIndex).scrollTop(0).css({
	            top: ulTop,
	            left: offset.left,
	            width: settings.width
	        })
	        // The drop list has to be shown before maxHeight can be configured
			.show(event);

	        // Log li height for less computation
	        liHeight = $elems.eq(0).outerHeight();

	        // If Max Height specified, control it
	        if (settings.maxHeight) {
	            $ul.css({
	                height: liHeight * $elems.length > settings.maxHeight ? settings.maxHeight : 'auto',
	                overflow: 'auto'
	            });
	        }

	        // ulHeight gets manipulated, so assign to viewport seperately 
	        // so referencing conflicts don't override viewport
	        ulHeight = $ul.outerHeight();
	        view = ulHeight;

	        // Number of elements per viewport
	        liPerView = liHeight === 0 ? 0 : Math.floor(view / liHeight);

	        // Include amount of time it took to load the list
	        // and run modifications
	        LastEvent.timeStamp = (new Date()).getTime();
	    }

	    // Custom modifications to the drop down element
	    newUl();

	    // Do case change on initialization so it's not run on every request
	    settings.requestType = settings.requestType.toUpperCase();

	    // Local quick copy of the seperator (so we don't have to run this check every time)
	    separator = settings.multiple ? settings.multipleSeparator : undefined;

	    // Expose copies of both the input element and the cached jQuery version
	    AutoComplete.stack[inputIndex] = self;
	    AutoComplete.jqStack[inputIndex] = $input;

	    // Form and Document event attachment
	    setup($input, inputIndex);
	};

})(jQuery, window || this);

var WatchListManger = new Object();
WatchListManger.Vars = new Array();
WatchListManger.parent = new Object();
WatchListManger.NoteHtml = "<div class='WatchListNote'>"
                          + "<div class='ArrowDiv'><div></div></div>"
                          + "<table dir='ltr' cellspacing='0' cellpadding='0' >"
                          + "<tr><td class='topleft'></td><td class='top'></td><td class='topright'></td></tr>"
                          + "<tr><td class='middleleft'></td><td style='background-color:#fff' class='center'><span class='noteTitleBar'></span><div class='editBotton' title='" + editBottonTitle + "'></div><div class='closeBotton' title='" + closeBottonTitle + "' ></div><div class='noteMessage'></div><div class='editArea'><div class='editBottom'><span class='save' title='" + saveTitle + "'></span></div><textarea class='noteMessage' ></textarea></div></td><td class='middleright'></td></tr>"
                          + "<tr><td class='bottomleft'></td><td class='bottom'></td><td class='bottomright'></td></tr>"
                          + "</table>"
                          + "</div>";
WatchListManger.NoteHtmlObject = $(WatchListManger.NoteHtml);
WatchListManger.NoteHtmlObject.find(".editBotton").click(function () {
    var temp = WatchListManger.NoteHtmlObject.EditObject;
    temp.EditNote();
    return false;
});
WatchListManger.NoteHtmlObject.find(".closeBotton").click(function () {
    WatchListManger.NoteHtmlObject.attr("editMode", false);
    WatchListManger.CloseNote();
});
$(document).ready(function () {
    $("body").click(function () {
        WatchListManger.CloseNote();
    });
});
WatchListManger.NoteHtmlObject.attr("editMode", false);
WatchListManger.NoteHtmlObject.EditObject = null;
WatchListManger.NoteHtmlObject.find(".save").click(function () {
    var editMode = WatchListManger.NoteHtmlObject.attr("editMode");
    if (editMode == "true" && WatchListManger.NoteHtmlObject.EditObject != null) {
        var temp = WatchListManger.NoteHtmlObject.EditObject;
        var InstrumentID = temp.InstrumentID;
        var wid = temp.Parent.tag;
        var tx = WatchListManger.NoteHtmlObject.find("textarea").val();
        if (!currentLan) {
            currentLan = "fa";
        }
        $.ajax({
            type: "Get",
            url: "../0/0/WatchListHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({ "Type": 7, "la": currentLan, "value": { "ID": wid, "insCode": InstrumentID, "note": encodeURI(tx) }, "t": new Date().getTime() }),
            success: function (msg) {
                if (msg == "1") {
                    temp.Note = tx;
                }
            }
        });
        WatchListManger.CloseNote();
    }
});
WatchListManger.NoteHtmlObject.click(function () {
    var editMode = WatchListManger.NoteHtmlObject.attr("editMode");
    if (editMode == "false") {
        WatchListManger.CloseNote();
    }
    return false;
});
WatchListManger.callBackfunction = function (obj) {
};
WatchListManger.GetKeys = function () {
    var t = new Array();
    //    $(WatchListManger.Vars).each(function () {
    //        t = t.concat(this.GetKeys());
    //    });
    var active = WatchListManger.GetActive();
    if (active != null) {
        t = t.concat(active.GetKeys());
        var r = new Array();
        o: for (var j = 0; j < t.length; j++) {
            for (var i = 0; i < r.length; i++) {
                if (r[i].Value == t[j].Value) {
                    continue o;
                }
            }
            r[r.length] = t[j];
        }
        return r;
    }
    return t;
};
WatchListManger.SaveString = function () {
    var tot = new Array();
    $(WatchListManger.Vars).each(function () {
        var k = new Object();
        k.Title = this.Title;
        /*var y = new Array();
        $(this.value.GetKeys()).each(function() {
        y[y.length] = this.Value;
        });*/
        k.Tag = this.tag;
        k.Values = this.GetKeysWithSym();
        tot[tot.length] = k;
    });
    return Object.toJSON(tot);
};
WatchListManger.CookieHandler = new Object();
WatchListManger.CookieHandler.SaveActiveTag = function (tag) {
    WatchListManger.CookieHandler.setCookie(tag);
};
WatchListManger.CookieHandler.GetActiveTag = function (tag) {
    WatchListManger.CookieHandler.getCookie();
};
WatchListManger.CookieHandler.cookie_name = "tadbir_watchlist";
WatchListManger.CookieHandler.getCookie = function () {
    var c_name = WatchListManger.CookieHandler.cookie_name;
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
    return null;
};
WatchListManger.CookieHandler.setCookie = function (value) {
    var c_name = WatchListManger.CookieHandler.cookie_name;
    var exdays = null;
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
};
WatchListManger.LoadSaved = function (str) {
    var parsed = str.parseJSON();
    if (parsed) {
        $(parsed).each(function () {
            var k = WatchListManger.Add(this.Title);
            if (k) {
                k.tag = this.Tag;
                k.isSave = true;
                /*$(this.Values).each(function() {
                k.AddNew(this.Value, this.sym, true);
                });*/
            }
        });
    }
};
WatchListManger.Update = function (obj, setting) {
    $(WatchListManger.Vars).each(function () {
        this.UpdateMe(obj);
    });
};
WatchListManger.Add = function (t) {
    /*var tempvar = new Object();
    tempvar.tag = new Date().getTime();
    tempvar.value = new WatchListModule(tempvar.tag);
    tempvar.isActive = false;
    tempvar.Title = t;
    tempvar.isSave = false;*/
    canADD = true;
    if (t != "") {
        $(this.Vars).each(function () {
            if (this.Title == t)
                canADD = false;
        });
        if (canADD) {
            var h = new WatchListModule(t);
            this.Vars[this.Vars.length] = h;
            return h;
        };
    };
    return null;
};
WatchListManger.CanAdd = function (t) {
    canADD = true;
    if (t != "") {
        $(this.Vars).each(function () {
            if (this.Title == t)
                canADD = false;
        });
    };
    return canADD;

};
WatchListManger.GetActive = function () {
    var temp = null;
    $(this.Vars).each(function () {
        if (this.isActive)
            temp = this;
    });
    return temp;
};
WatchListManger.Acivate = function (t) {

    var temp = WatchListManger.GetActive();
    if (temp) {
        temp.isActive = false;
        $(temp.tbl).remove();
    }
    if (t != -1) {
        var l = WatchListManger.Get(t);
        l.isActive = true;
        WatchListManger.CookieHandler.setCookie(t);
        WatchListManger.parent.append($(l.tbl));
        try {
            var tv = WatchListManger.parent[0];
            if (typeof (tv.config) == 'undefined' && !tv.config) {
                WatchListManger.parent.tablesorter().bind("sortEnd", function () { WatchListManger.parent.colorize(); });
                var Header = WatchListManger.parent.find("thead");
                Header.detach();
                $("#watchListHeader").append(Header);
                
            };
            WatchListManger.parent.trigger("update");
        } catch (e) {
            /* console.log(e); */
        }

    }
};
WatchListManger.Remove = function (t) {
    var id = -1;
    $(WatchListManger.Vars).each(function (index) {
        if (this.tag == t) {
            id = index;
            return;
        }
    });
    $(WatchListManger.Vars[id].tbl).remove();
    if (id > -1) {
        WatchListManger.Vars = jQuery.grep(WatchListManger.Vars, function (value, index) {
            return id != index;
        });
    }

};
WatchListManger.GetModuleList = function () {
    return WatchListManger.Vars;
};
WatchListManger.Get = function (VariableName) {
    var temp = null;
    $(this.Vars).each(function () {
        if (this.tag == VariableName)
            temp = this;
    });
    return temp;
};
WatchListManger.ShowNote = function (rowObj) {
    WatchListManger.ShowNoteDialog(rowObj);

    WatchListManger.NoteHtmlObject.find("div.noteMessage").show();
    WatchListManger.NoteHtmlObject.find(".editArea").hide();

    WatchListManger.NoteHtmlObject.attr("editMode", false);
    WatchListManger.NoteHtmlObject.EditObject = rowObj;
};
WatchListManger.CloseNote = function (rowObj) {
    WatchListManger.NoteHtmlObject.detach();
    WatchListManger.NoteHtmlObject.EditObject = null;
};
WatchListManger.EditNote = function (rowObj) {
    WatchListManger.ShowNoteDialog(rowObj);

    WatchListManger.NoteHtmlObject.find("div.noteMessage").hide();
    WatchListManger.NoteHtmlObject.find(".editArea").show();

    WatchListManger.NoteHtmlObject.attr("editMode", true);
    WatchListManger.NoteHtmlObject.EditObject = rowObj;

};
WatchListManger.ShowNoteDialog = function (rowObj) {
    var note = rowObj.Note;
    var g = $(rowObj.tr).find(".WatchListNoteIcon");
    g.parent().append(WatchListManger.NoteHtmlObject);
    var w = WatchListManger.NoteHtmlObject.css("width");
    WatchListManger.NoteHtmlObject.css("margin-left", "-" + w);
    var wp = parseInt(w);
    WatchListManger.NoteHtmlObject.find("table").css("width", wp - 10 + "px");
    WatchListManger.NoteHtmlObject.find(".noteTitleBar").text(rowObj.InsCode);
    if (note == null)
        note = '';
    WatchListManger.NoteHtmlObject.find(".noteMessage").text(note);

};
function WatchListModule(t) {

    this.tbl = $('<tbody></tbody>');
    /* $(tblObj).append(this.tbl); */
    this.tag = new Date().getTime();
    this.isActive = false;
    this.Title = t;
    this.isSave = false;
    this.WatchRow = new Array();
    /* WatchListManger.Add(this.VariableName, this); */
};
WatchListModule.prototype.tbl = null;
WatchListModule.prototype.VariableName = '';
WatchListModule.prototype.WatchRow = new Array();
WatchListModule.prototype.tag = '';
WatchListModule.prototype.isActive = false;
WatchListModule.prototype.Title = '';
WatchListModule.prototype.isSave = false;
WatchListModule.prototype.isCached = false;
WatchListModule.prototype.ClickUnBind = function () {
    /* var events = $(this.tbl).find('tr').data("events"); */
    $(this.tbl).find('tr').unbind('click');

};
WatchListModule.prototype.ClickBind = function () {
    var w = this;
    this.ClickUnBind();
    var i = 0;
    $(this.tbl).find('tr').each(function () {
        var te = new WatchRow();
        te.tr = $(this);
        var InsId = te.tr.attr("id").split('_')[0];
        var InsCode = te.tr.find("td.InsCode").text();
        te.InstrumentID = InsId;
        te.InsCode = InsCode;
        te.Note = w.WatchRow[i].Note;
        i++;
        te.Parent = w;
        $(this).find('.WatchListNoteIcon').click(function () { te.ShowNote(te); return false; });
    });
    $(this.tbl).find('tr .BtnBuySell').click(function () { ShowModal('BuySell'); });
    $(this.tbl).find('tr').dblclick(function () { ShowModal('BuySell'); });

    $(this.tbl).find('tr').click(function (e) {
        if (typeof (e.detail) == "undefined" || e.detail == 1) {
            WatchListManger.CloseNote();
            if (!$(e.originalTarget).hasClass('removeButton')) {

                var t = $(this).attr("id");
                var arr = t.split('_');

                var stock = w.GetStock(arr[0]);

                WatchListManger.callBackfunction(stock);
            }
        }
    }
    );
};
WatchListModule.prototype.AddNewWatchRow = function (obj, noneed) {
    if (obj instanceof WatchRow) {
        var contain = false;
        $(this.WatchRow).each(function () {
            if (this.InstrumentID == obj.InstrumentID) {
                contain = true;
                return;
            }
        });
        if (!contain) {
            this.WatchRow[this.WatchRow.length] = obj;
            var row = obj.GetRow();

            var rowId = obj.InstrumentID + "_" + this.tag;
            $(row).attr("id", rowId);

            row.prepend($('<td align="center" valign="middle" width="11" style="padding-top:7px;" ><div class="removeButton" onclick="WatchListManger.Get(' + this.tag + ').Remove($(this).parent().parent(\'tr\'))">&nbsp;</div></td>'));
            this.tbl.append(row);
//            $("table.watchList thead tr th").each(function (index, thobj) {
//                var i = index + 1;
//                var selector = '#' + rowId + ' td:nth-child(' + i + ')';
//                var width = $(thobj).attr('width');
//                $(selector).attr('width',width);
//            });
//            $("table.watchList thead tr th:hidden").each(function () {
//                var selector = '#' + rowId + ' td.' + $(this).attr('class').replace('Sortheader', '');
//                $(selector).hide(selector);
//            });
            if (!noneed) {
                var lst = "";
                lst += obj.InstrumentID + ",";
                var handlerName = "StockInformationHandler.ashx";
                if (document.URL.indexOf("ImeFutAddOrder") > 0) {
                    handlerName = "IMEFutureInfoHandler.ashx";
                    //lst += 4 + ","; //todo: securityid is hard code
                }
                if (!currentLan) {
                    currentLan = "fa";
                }
                $.getJSON(RLCServerAddrerss + '/' + handlerName + '?' + Object.toJSON({ "Type": "getstockprice", "la": currentLan, "arr": lst }) + "&jsoncallback=?",
                function (ajr) {

                    if (ajr) {
                        var Rtun = LsAr(ajr[0]);
                        obj.Update(Rtun);
                    }
                });
            }
            this.UpdateModules();
            $(WatchListManger.parent).colorize();
            this.ClickBind();
        }
    }
    return (!contain) ? obj : null;
};
WatchListModule.prototype.AddNew = function (InsID, InsName, symboldid, noneed) {
    var kk = new WatchRow(InsID, InsName);
    kk.SymbolId = symboldid;
    kk.Parent = this;
    return this.AddNewWatchRow(kk, noneed);
};
WatchListModule.prototype.GetKeys = function () {
    var t = new Array();
    $(this.WatchRow).each(function () {
        var obj = new Object();
        obj.Key = 'InstrumentID';
        obj.Value = this.InstrumentID;
        t[t.length] = obj;
    });
    return t;
};
WatchListModule.prototype.GetKeysWithSym = function () {
    var t = new Array();
    $(this.WatchRow).each(function () {
        var obj = new Object();
        obj.sym = this.InsCode;
        obj.Value = this.InstrumentID;
        t[t.length] = obj;
    });
    return t;
};
WatchListModule.prototype.UpdateModules = function () {

};
WatchListModule.prototype.CallBackFunction = function (obj) {
    WatchListManger.callBackfunction(obj);
};
WatchListModule.prototype.UpdateMe = function(obj, setting) {
    var insCode = '';
    if (setting== null || setting.Schema == null) {
        var arr = eval(obj);
        $(arr.OperatorTags).each(function() {
            if (this.Key == 'InstrumentID')
                insCode = this.Value;
        });
        $(this.WatchRow).each(function () {
            if (this.InstrumentID == insCode)
                this.Update(eval(arr.Value));
        });
    } else {
        var item = obj.getItemName().replace("_lightrlc", "");
        insCode = item.toString().toUpperCase();
        $(this.WatchRow).each(function () {
            if (this.InstrumentID == insCode)
                this.Update(obj);
        });
    }
       
    
};
WatchListModule.prototype.GetStock = function (InsID) {
    var result = null;
    $(this.WatchRow).each(function () {
        if (this.InstrumentID == InsID) {
            result = this;
            return result;
        }
    });
    return result;
};
WatchListModule.prototype.GetData = function () {
    if (typeof (AjaxManager) != 'undefined' && AjaxManager != null) {

        AjaxManager.UpdateWatchList(this);
    }
    var wathclist = this;
    var lst = '';
    if (wathclist.WatchRow.length == 0)
        return;
    for (var i = 0; i < wathclist.WatchRow.length; i++) {
        var row = this.WatchRow[i];
        lst += row.InstrumentID + ',';

    }

    var handlerName = "StockInformationHandler.ashx";
    if (document.URL.indexOf("ImeFutAddOrder") > 0) {
        handlerName = "IMEFutureInfoHandler.ashx";
        //lst += 4 + ",";  //todo: securityid is hard code
    }
    if (!currentLan) {
        currentLan = "fa";
    }
    $.getJSON(RLCServerAddrerss + '/' + handlerName + '?' + Object.toJSON({ "Type": "getstockprice2", "la": currentLan, "arr": lst }) + "&jsoncallback=?",
    function (ajr) {
        if (ajr) {
            ajr = PopulateFromMinifiedStock(ajr);
            $(ajr).each(function () {
                var insInfo = this;
                var obj = wathclist.GetStock(this.NSCCode);
                var Rtun = LsAr(insInfo);
                obj.Update(Rtun);
            });

        }

    }
    );
};
WatchListModule.prototype.Remove = function (obj) {
    var id = -1;
    /*    if (confirm('آیا مطمئن هستید؟')) { */
    var ffff = this;
    confirmDeleteWatchList(function () {
        $(ffff.WatchRow).each(function (index) {
            if (this.tr[0] == obj[0]) {
                id = index;
                return;
            }
        });
        if (id > -1) {
            $.ajax({
                type: "Get",
                url: "../0/0/WatchListHandler.ashx" + "?lan=" + currentLan,
                data: Object.toJSON({ "Type": 5, "value": { "ID": ffff.tag, "insCode": ffff.WatchRow[id].InstrumentID }, "t": new Date().getTime() }),
                success: function (msg) {
                }
            });
            ffff.WatchRow[id].tr.remove();
            ffff.WatchRow = jQuery.grep(ffff.WatchRow, function (value, index) {
                return id != index;
            });
            ffff.UpdateModules();
        }
    });
};
WatchListModule.prototype.RemoveWithoutConfirm = function (obj) {
    var id = -1;
    /*    if (confirm('آیا مطمئن هستید؟')) { */
    var ffff = this;
    $(ffff.WatchRow).each(function (index) {
        if (this.tr[0] == obj[0]) {
            id = index;
            return;
        }
    });
    if (id > -1) {
        ffff.WatchRow[id].tr.remove();
        ffff.WatchRow = jQuery.grep(ffff.WatchRow, function (value, index) {
            return id != index;
        });
        ffff.UpdateModules();
    }
};

function WatchRow(InsID, InsName, cbFunction) {
    this.InstrumentID = InsID;
    this.InsCode = InsName;
    this.tr = $("<tr>"
    + "<td class='InsCode' style='min-width: 50px;'>&nbsp;</td>"
    + "<td class='LastTradedPrice' style='width:6.5%;'>&nbsp;</td>"
    + "<td class='TotalShareTrade' style='width:8%;'>&nbsp;</td>"
    + "<td class='ClosingPrice' style='width:6.5%;'>&nbsp;</td>"
    + "<td class='TotalNumberOfTrades' style='width:6.5%;'>&nbsp;</td>"
    + "<td class='TotalTradeValue' style='width:8%;'>&nbsp;</td>"
    + "<td class='PreClosingPrice' style='width:6.5%;'>0</td>"
    + "<td class='FirstTradedPrice' style='width:6.5%;'>0</td>"
    + "<td class='PriceVarPercent' style='width:6.5%;'>&nbsp;</td>"

    + "<td class='BestBuyQuantity' style='width:7%; background-color:#D2D2F0;'>&nbsp;</td>"
    + "<td class='BestBuyPrice' style='width:6.5%; background-color:#D2D2F0;'>&nbsp;</td>"
    + "<td class='BestSellPrice' style='width:6.5%; background-color:#FFD5DC;'>&nbsp;</td>"
    + "<td class='BestSellQuantity' style='width:6.5%; background-color:#FFD5DC;'>&nbsp;</td>"


    + "<td align='center' valign='middle' width='11'><div class='StockChangeSign'>&nbsp;</div></td>"
    + "<td style='width:22px; padding:0 3px'><div class='BtnBuySell' title='" + BtnBuySellTitle + "'><div class='BtnBuySellIcon'></div></div></td>"
    + "<td align='center' valign='middle' width='12'><div class='WatchListNoteIcon' title='" + WatchListNoteIconTitle + "'></div></td>"
    + "<td class='CodalLink' style='width: 31px;'></td>"
    + "</tr>");
    var te = this;
    this.tr.find(".WatchListNoteIcon").click(function () { te.ShowNote(te); return false; });
    this.tr.find(".BtnBuySell").click(function () { ShowModal('BuySell'); });
    this.tr.dblclick(function () { ShowModal('BuySell'); });
};
WatchRow.prototype.tr = null;
WatchRow.prototype.InstrumentID = '';
WatchRow.prototype.InsCode = '';
WatchRow.prototype.PriceVarPercent = 0;
WatchRow.prototype.TotalNumberOfTrades = 0;
WatchRow.prototype.TotalTradeValue = 0;
WatchRow.prototype.PreClosingPrice = 0;
WatchRow.prototype.ClosingPrice = 0;
WatchRow.prototype.LastTradedPrice = 0;
WatchRow.prototype.TotalShareTrade = 0;
WatchRow.prototype.FirstTradedPrice = 0;
//WatchRow.prototype.PriceVar = 0;
WatchRow.prototype.PriceVarPercentSign = '0';
WatchRow.prototype.RefPrice = 0;
WatchRow.prototype.LowPrice = 0;
WatchRow.prototype.HighPrice = 0;
WatchRow.prototype.TotalShareTrade = 0;

WatchRow.prototype.BestBuyQuantity = 0;
WatchRow.prototype.BestBuyPrice = 0;
WatchRow.prototype.BestSellQuantity = 0;
WatchRow.prototype.BestSellPrice = 0;
WatchRow.prototype.CodalLink = 'http://codal.ir/ReportList.aspx?search&Symbol=';

WatchRow.prototype.SymbolId = 0;
WatchRow.prototype.Note = "";
WatchRow.prototype.SymbolTitle = "";
WatchRow.prototype.Parent = null;
WatchRow.prototype.ShowNote = function (obj) {
    WatchListManger.ShowNote(obj);
};
WatchRow.prototype.EditNote = function () {
    WatchListManger.EditNote(this);
};
WatchRow.prototype.setClosingPrice = function (value) {
    this.ClosingPrice = value;
    this.UpdateRow();
};
WatchRow.prototype.GetRow = function () {
    this.UpdateRow();
    return this.tr;
};
WatchRow.prototype.UpdateRow = function () {

    $(this.tr).find('.FirstTradedPrice').html(this.FirstTradedPrice.toString().toShortNumber().SeparateNumber());
    $(this.tr).find('.ClosingPrice').html(this.ClosingPrice.toString().toShortNumber().SeparateNumber());
    $(this.tr).find('.PreClosingPrice').html(this.PreClosingPrice.toString().toShortNumber().SeparateNumber());
    $(this.tr).find('.TotalShareTrade').html(this.TotalShareTrade.toString().toShortNumber().SeparateNumber());
    $(this.tr).find('.TotalNumberOfTrades').html(this.TotalNumberOfTrades.toString().toShortNumber().SeparateNumber());
    $(this.tr).find('.TotalTradeValue').html(this.TotalTradeValue.toString().toShortNumber().SeparateNumber());
    $(this.tr).find('.InsCode').html(this.InsCode);
    $(this.tr).find('.LastTradedPrice').html(this.LastTradedPrice.toString().toShortNumber().SeparateNumber());

    $(this.tr).find('.BestBuyQuantity').html(this.BestBuyQuantity.toString().SeparateNumber());
    $(this.tr).find('.BestBuyPrice').html(this.BestBuyPrice.toString().SeparateNumber());
    $(this.tr).find('.BestSellQuantity').html(this.BestSellQuantity.toString().SeparateNumber());
    $(this.tr).find('.BestSellPrice').html(this.BestSellPrice.toString().SeparateNumber());
    $(this.tr).find('.CodalLink').html('<a href="' + this.CodalLink + '" target="_blank">◄☼►</>');


    var priceVarObj = $(this.tr).find('.PriceVar');
    priceVarObj.removeClass('positive');
    priceVarObj.removeClass('negative');
    if (this.PriceVar >= 0) {
        priceVarObj.addClass('positive');
        priceVarObj.html(this.PriceVar);
    }
    else {
        priceVarObj.addClass('negative');
        priceVarObj.html('(' + Math.abs(this.PriceVar) + ')');
    }

    var priceVarPercentObj = $(this.tr).find('.PriceVarPercent');
    priceVarPercentObj.removeClass('positive');
    priceVarPercentObj.removeClass('negative');
    if (this.PriceVarPercent >= 0) {
        priceVarPercentObj.addClass('positive');
        priceVarPercentObj.html(this.PriceVarPercent);
    }
    else {
        priceVarPercentObj.addClass('negative');
        priceVarPercentObj.html('(' + Math.abs(this.PriceVarPercent) + ')');
    }
    var tdClassName = "";
    var className = "";
    if (this.PriceVarPercentSign == '-') {
        tdClassName = "StockDownSign";
        className = "redReduce";
    }
    else if (this.PriceVarPercentSign == '+') {
        tdClassName = "StockUpSign";
        className = "greenIncrease";
    }
    else if (this.PriceVarPercentSign == '0') {
        tdClassName = "StockNotChangeSign";
        className = "";
    }
    var imgObj = $(this.tr).find('.StockChangeSign');
    imgObj.removeClass("StockUpSign");
    imgObj.removeClass("StockDownSign");
    imgObj.removeClass("StockNotChangeSign");
    imgObj.addClass(tdClassName);
    $(this.tr).removeClass();
    var id = $(this.tr).attr("id");
    if (id != '' && $('#' + id).length > 0) {
        $(this.tr).addClass(className);

        if (id != '')
            setTimeout("$('#" + id + "').removeClass('" + className + "')", 1000);
    }
    try {
        WatchListManger.parent.trigger("reSort");
    } catch (e) {
        /* console.log(e); */
    }

};


//var newT = new Object();
//var t = eval(ajr);
//var g = t.split(",");
//newT.TotalShareTrade = t[5];
//newT.RefPrice  = t[17];
//newT.PriceVar = t[13];
//newT.LowPrice = t[12];
//newT.HighPrice = t[11];
//newT.PriceVarPercent = t[13];
//newT.PriceVarPercentSign = t[14];
//newT.LastTradedPrice = t[8];







function LsAr(obj) {
    if (typeof (obj) != "object") {
        var t = new Object;
        obj.TotalNumberOfSharesTraded = t[5];
        obj.LastTradedPrice = t[17];
        obj.LowPrice = t[12];
        obj.HighPrice = t[11];
        obj.PriceVar = t[13];
        obj.VarSign = t[14];
        obj.LastTradedPrice = t[8];
        obj.PreClosingPrice = t[17];
    }
    return obj;
};


function LsAr2(t) {

    var obj = new Object;
    obj.TotalNumberOfSharesTraded = t[5];
    obj.LastTradedPrice = t[17];
    obj.LowPrice = t[12];
    obj.HighPrice = t[11];
    obj.PriceVar = t[13];
    obj.VarSign = t[14];
    obj.LastTradedPrice = t[8];
    obj.PreClosingPrice = t[17];
    obj.TotalNumberOfTrades = t[6];
    obj.TotalTradeValue = t[7];

    return obj;
};
WatchRow.prototype.Update = function (obj) {

    this.FirstTradedPrice = (obj.FirstTradedPrice) ? obj.FirstTradedPrice : this.FirstTradedPrice;
    this.TotalNumberOfTrades = (obj.TotalNumberOfTrades) ? obj.TotalNumberOfTrades : this.TotalNumberOfTrades;
    this.TotalTradeValue = (obj.TotalTradeValue) ? obj.TotalTradeValue : this.TotalTradeValue;
    this.PreClosingPrice = (obj.PreClosingPrice) ? obj.PreClosingPrice : this.PreClosingPrice;
    this.ClosingPrice = (obj.ClosingPrice) ? obj.ClosingPrice : this.ClosingPrice;
    this.SymbolTitle = obj.CompanyName != null ? obj.CompanyName : "";
    if (obj.TotalNumberOfSharesTraded)
        this.TotalShareTrade = (obj.TotalNumberOfSharesTraded) ? obj.TotalNumberOfSharesTraded : this.TotalShareTrade;
    this.RefPrice = (obj.PreClosingPrice) ? obj.PreClosingPrice : this.RefPrice;
    this.PriceVar = (obj.LastTradedPrice && obj.HighPrice && obj.HighPrice > 0) ? obj.LastTradedPrice - this.RefPrice : this.PriceVar;
    this.LastTradedPrice = ((obj.LastTradedPrice != null) ? obj.LastTradedPrice : this.LastTradedPrice);
    this.InsCode = ((obj.SymbolFa) ? obj.SymbolFa : this.InsCode);

    //this.InsCode = this.InsCode;
    this.PriceVarPercent = ((obj.PriceVar != null) ? obj.PriceVar : this.PriceVarPercent);
    this.PriceVarPercentSign = ((obj.VarSign != null) ? obj.VarSign : this.PriceVarPercentSign);
    if (obj.TotalNumberOfTrades == 0) {
        this.PriceVar = 0;
        this.PriceVarPercent = 0;
        this.PriceVarPercentSign = '0';
        this.TotalShareTrade = 0;
    }
    //debugger;
    this.CodalLink = WatchRow.prototype.CodalLink + this.InsCode.replace('1', '');
    this.LowPrice = obj.LowPrice;
    this.HighPrice = obj.HighPrice;
    if (obj.length > 0) {
        this.BestBuyQuantity = (obj[0].bq) ? obj[0].bq : this.BestBuyQuantity;
        this.BestBuyPrice = (obj[0].bp) ? obj[0].bp : this.BestBuyPrice;
        this.BestSellQuantity = (obj[0].sq) ? obj[0].sq : this.BestSellQuantity;
        this.BestSellPrice = (obj[0].sp) ? obj[0].sp : this.BestSellPrice;
    }
    if (obj.FirstOrderPage) {
        this.BestBuyQuantity = (obj.FirstOrderPage.BestBuyQuantity) ? obj.FirstOrderPage.BestBuyQuantity : this.BestBuyQuantity;
        this.BestBuyPrice = (obj.FirstOrderPage.BestBuyPrice) ? obj.FirstOrderPage.BestBuyPrice : this.BestBuyPrice;
        this.BestSellQuantity = (obj.FirstOrderPage.BestSellQuantity) ? obj.FirstOrderPage.BestSellQuantity : this.BestSellQuantity;
        this.BestSellPrice = (obj.FirstOrderPage.BestSellPrice) ? obj.FirstOrderPage.BestSellPrice : this.BestSellPrice;
    }
    this.UpdateRow();
};

function GetOrderFromServer(item, isCopy) {
    if (typeof(isCopy) == 'undefined')
        isCopy = false;
    var par = item;
    var orderid = par.attr("orderid");
    
    $.ajax({
        type: "Get",
        url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
        data: Object.toJSON({

            "Mode": "getorder",
            "orderid": orderid,
            "ts": new Date().getTime()
        }),
        success: function (msg) {
            var ajr = msg.parseJSON();
            var obj = new Object();
            if (ajr) {
                obj.innervalue = ajr.MetaData[0].td;
                try {
                    var order = ajr.MetaData[1];
                    if (order.otq - order.ea <= 0 && !isCopy) {
                        ShowAlertMessage("امکان ویرایش سفارش وجود ندارد");
                        return;
                    }
                } catch (e) {

                }
                SetOrder(ajr);
                $('#hiddrpExchangeList').val(ajr.MetaData[0].td);

                callbackF2(obj);
            }
        }
    });
}
function SetCustomer(mode, name, bourseCode, customerid, boursecodeid, isin) {
    $('.alertList').empty();
    $('#boursecodeid').val(boursecodeid);
    $('#customerid').val(customerid);
    $('#isin').val(isin);
    $('#customerName').text(name);
    $('#BourseCode').text(bourseCode);
}
var reqGetTrades = null;

function GetTrades()
{
    if (reqGetTrades != null)
        try {
            reqGetTrades.abort();
        } catch (e) {

        }
    reqGetTrades = $.ajax({
        type: "Get",
        url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
        data: Object.toJSON({
            "Mode": "getcustomertodaytrades", "ts": new Date().getTime()
        }),
        success: function (msg) {
            var ajr = msg.parseJSON();
            if (ajr) {
                showTrades(ajr);
            }
        },
        error: function (msg) {
        }
    });
}
var reqGetOrders = null;
function GetOrders() {
    if (reqGetOrders != null)
        try {
            reqGetOrders.abort();
        } catch (e) {

        }
        reqGetOrders = $.ajax({
            type: "Get",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({
                "Mode": "getcustomeropenorder", "ts": new Date().getTime()
            }),
            success: function (msg) {
                var ajr = msg.parseJSON();
                if (ajr) {
                    showOrders(ajr);
                }
            },
            error: function (msg) {
            }
        });
    }

function UpdateOpenOrder() {
    if (reqGetOrders != null)
        try {
            reqGetOrders.abort();
        } catch (e) {

        }
    reqGetOrders = $.ajax({
        type: "Get",
        url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
        data: Object.toJSON({
            "Mode": "getcustomeropenorder", "ts": new Date().getTime()
        }),
        success: function (msg) {
            var ajr = msg.parseJSON();
            if (ajr) {
                showOrders(ajr);
            }
        },
        error: function (msg) {
        }
    });
}

    var reqGetSymbolAgreement = null;

    function GetSymbolAgreementStatus() {
        var calcIsin = $("#calcIsin").val();
        var AgreementStatus =
        {
            IsSymbolCautionAgreement: false,
            CustomerAgreementAccepted: false
        };

        $("#chbxAcceptAgreement").prop("checked", false);

        reqGetSymbolAgreement = $.ajax({
            type: "Get",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({
                "Mode": "getsymbolagreementstatus", "ts": new Date().getTime(), "SymbolIsin": calcIsin
            }),
            success: function (msg) {
                AgreementStatus = msg.parseJSON();
                if (AgreementStatus.CustomerAgreementAccepted == true) 
                    $("#chbxAcceptAgreement").prop("checked", true);
                else 
                    $("#chbxAcceptAgreement").prop("checked", false);
            },
            error: function (msg) {
            }
        });
    }

    var reqGetSymbolOrdersStatus = null;

    function GetSymbolOrdersStatus() {
        if (!$("#A6").hasClass('current')) {
            return false;
        }
        var calcIsin = $("#calcIsin").val();
        if (reqGetSymbolOrdersStatus != null)
            try {
                reqGetSymbolOrdersStatus.abort();
            } catch (e) {

            }
        reqGetSymbolOrdersStatus = $.ajax({
            type: "Get",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({
                "Mode": "getsymbolorderstatus", "ts": new Date().getTime(), "SymbolIsin": calcIsin
            }),
            success: function (msg) {
                var ajr = msg.parseJSON();
                if (ajr) {
                    showSymbolOrders(ajr);
                }
            },
            error: function (msg) {
            }
        });
    }
    
var reqGetTodayOrders = null;
function GetTodayOrders() {
    if (reqGetTodayOrders != null)
        try {
            reqGetTodayOrders.abort();
        } catch (e) {

        }
    reqGetTodayOrders = $.ajax({
        type: "Get",
        url: "../9/0/SiteCustomerHandler.ashx"+ "?lan=" + currentLan,
        data: Object.toJSON({
            "Mode": "getcustomerorder", "ts": new Date().getTime()
        }),
        success: function (msg) {
            var ajr = msg.parseJSON();
            if (ajr) {
                showTodayOrders(ajr);
            }
        }
    });
};
function GetOrderById(id) {
    if (reqGetTodayOrders != null)
        try {
            reqGetTodayOrders.abort();
        } catch (e) {

        }
    reqGetTodayOrders = $.ajax({
        type: "Get",
        url: "../9/0/SiteCustomerHandler.ashx"+ "?lan=" + currentLan,
        data: Object.toJSON({
            "Mode": "gettodayorderbyid", "ts": new Date().getTime(),
            "OrderId":id
        }),
        success: function (msg) {
            var ajr = msg.parseJSON();
            if (ajr) {
                showTodayOrders(ajr);
            }
        }
    });
};
function GetAccounts(customerid) {
    $.ajax(
    {
        type: "Get",
        url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
        data: Object.toJSON({
            "Mode": "getcustomeraccount", "ts": new Date().getTime(), "markettype": $("#drpMarketAccount").val()
        }),
        success: function (msg) {
            var ajr = msg.parseJSON();
            if (ajr) {
                showAccounts(ajr);
            }
        }
    });
};
function GetPositions(customerid) {
    $.ajax(
    {
        type: "Get",
        url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
        data: Object.toJSON({
            "Mode": "getpositions", "ts": new Date().getTime()
        }),
        success: function (msg) {
            var ajr = msg.parseJSON();
            if (ajr) {
                var obj = new Object();
                obj.Value = new Array();
                for (var i = 0; i < ajr.length; i++) {
                    var temp = new Object();
                    temp.symbol = ajr[i].ss;
                    temp.volume = ajr[i].c;
                    temp.pside = ajr[i].s;
                    temp.AvgPrice = ajr[i].ap;
                    obj.Value[obj.Value.length] = temp;
                }

                showPositions(obj);
            }
        }
    });
};

function GetIFBPositions(customerId) {
    $.ajax(
    {
        type: "Get",
        url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
        data: Object.toJSON({
            "Mode": "getIFBpositions", "ts": new Date().getTime()
        }),
        success: function (msg) {
            var ajr = msg.parseJSON();
            if (ajr) {
                var obj = new Object();
                obj.Value = new Array();
                for (var i = 0; i < ajr.length; i++) {
                    var temp = new Object();

                    temp.positionCount = ajr[i].pc;
                    temp.positionSide = ajr[i].ps;
                    temp.donePrice = ajr[i].dp;
                    temp.symbolId = ajr[i].si;
                    temp.eventDate= ajr[i].ed;
                    temp.symbol = ajr[i].s;
                    temp.visible = 1;
                    obj.Value[obj.Value.length] = temp;
                  }

                showIFBPositions(obj);
            }
        }
    });
};
function getStock(customerid) { }
function ShowAccountingDetail(customerid) {
    var marketType = $("#drpMarketAccount").val();
    if (marketType != "-1") {
        $.ajax({
            type: "Get",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({
                "Mode": "GetAccountRemain",
                "marketType": marketType
            }),
            success: function (msg) {
                var ajr = msg.parseJSON();
                if (ajr) {
                    setAccountDetail(ajr);
                }
            }
        });
    }
    return;
}
function getCookie(c_name) {
    return $.cookie(c_name);
}
function setCookie(c_name, value, expiredays) {
    $.cookie(c_name, value, { expires: expiredays });
}
function checkCookie(c_name) {
    if (getCookie(c_name) == "true") {
        return "true";
    }
    else {
        var value = $("#showAgain").prop("checked");
        if (value) {
            setCookie(c_name, "true", 1);
        }
        else {
            setCookie(c_name, "false", 1);
        }
        return getCookie(c_name);
    }
}
function SaveOrder(orderSide) { //65 for buy  // 86 for sell
    if (orderSide != null)
        $("#hiddenOrderSide").val(orderSide);
    var order = GetOrder();

    var check = OrderValidate();
    if (check != 1) {
        ShowOrderMessage(check);
        return null;
    }
    return order;
}
function checkSupportSign() {
    try {
        if (signPlugin || signPlugin.valid)
            return true;
        if (ActiveXObject) {
            return true;
        }
    }
    catch (e) { }
    return false;
}
function GetOrderStatus(orderid, customerid) {
    if (GetOrderStatusLock == 0 && orderid && orderid > 0) {
        GetOrderStatusLock = 1;
        $.ajax({
            type: "Get",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({
                "Mode": "orderstatus",
                "orderid": orderid
                        , "ts": new Date().getTime()
            }),
            success: function (msg) {
                var ajr = msg.parseJSON();
                if (ajr.IsFinish) {
                    if (!ajr.MetaData[0].ec) {
                        ShowOrderMessage(ajr.MetaData[1]);
                        GetOrders(customerid);
                    }
                    else {
                        if (ajr.MetaData[0].ps) {
                            ShowOrderMessage(ajr.MetaData[0].ps);
                        }
                    }
                }
                else {
                    setTimeout('GetOrderStatus(' + orderid + ',' + customerid + ')', settimoutsecond);
                }
                GetOrderStatusLock = 0;
            }
        });
    }
}

$(document).ready(function () {
    $('#confirm').jqm({ overlay: 55, modal: true, trigger: false });
    var customerid = addorderCustomerId;
    SetInfo(customerid, '');
    GetOrders();
});
function SendBuySell(order, type) {
    var ff = function (ajr) {
        var ts = null;
        var json = null;
        var ss = null;
        if (needToken) {
            if (!checkSupportSign()) {

                alert(addOrderResourceYouMustLogin);
                return false;
            };
            ts = ajr.tt;
            ss = ajr.ssign;
            var toSign = "customerid:" + addorderCustomerId + ",ts:" + ts + ",sgn:" + ss;
            json = sign(toSign.toLowerCase());
            if (json == null) {

                alert(addOrderResourceSignProblem);
                return;
            };
        }
        else { json = ""; };
        $.ajax({
            type: "POST",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({
                "Mode": "buysell",
                "SymbolId": order.SymbolId,
                "OrderPrice": order.OrderPrice,
                "OrderType": order.OrderType,
                "OrderSide": order.OrderSide,
                "OrderValidity": order.OrderValidity,
                "OrderValiditydate": order.OrderValiditydate,
                "OrderTotalQuantity": order.OrderTotalQuantity,
                "TriggerPrice": order.TriggerPrice,
                "MinimumQuantity": order.MinimumQuantity,
                "MaxShown": order.MaxShown,
                "BourseCode": order.BourseCode,
                "isin": order.ISIN,
                "pk": order.pk,
                "OrderMode": order.OrderMode,
                "orderid": order.orderid,
                "OrderExpectedQuantity": order.OrderExpectedQuantity,
                "ts": ts,
                "cs": encodeURIComponent(json),
                "ss": encodeURIComponent(ss),
                "SymbolNsc": order.SymbolNsc,
                "SendSMS": order.SendSMS,
                "browserTime": order.browserTime,
                "IsSymbolInAgreement": order.IsSymbolInAgreement,
                "AcceptedAgreement": order.AcceptedAgreement
            }),
            success: function (msg) {
                var ajr = msg.parseJSON();
                if (ajr.ResetOrder) {
                    ResetOrder();
                }
                if (ajr) {
                    //RunEngine(ajr.MetaData[0]);
                    var t = ajr.Value;
                    if (ajr.MetaData[1] != null) {

                        t += " <span onclick=\"alert('" + ajr.MetaData[1] + "')\">" + addOrderResourceOrderSign + '</span>';
                    }
                    if (qm == 0 || t.indexOf("ارتباط با هسته معاملات مقدور نمی باشد") >= 0) {
                        ShowOrderMessage(t, false, ajr.haserror);
                    }
                    if (t.indexOf("تغییر وضیعت سفارش") >= 0) {
                        ResetOrder();
                        ShowOrderMessage(t, false, ajr.haserror);
                    }
                    if (t.indexOf("تاریخ نامعتبر است") >= 0) {
                        ResetOrder();
                        ShowOrderMessage(t, false, ajr.haserror);
                    }
                    //ShowAccountingDetail();
                    //GetOrders();
                }
                else { ShowOrderMessage(msg); };

            }
        });
    };
    if (needToken) {
        $.ajax({
            type: "GET",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({ "Mode": "getTimeStamp" }),
            success: function (msg) { var ajr = msg.parseJSON(); ff(ajr); }
        });
    }
    else { ff(""); };
    ShowOrderMessage(sendtonetwork);
    //$('#OrderpanelAlert').find("#btnOrderpanelAlertOk").attr("disabled", true);
    return false;
};
function DeleteOrder(row, orderid, customerid) {
    var ff = function (ajr) {
        var ts = null;
        var json = null;
        var ss = null;
        if (needToken) {
            if (!checkSupportSign()) { alert(addOrderResourceYouMustLogin); return; };
            ts = ajr.tt;
            ss = ajr.ssign;
            var toSign = "customerid:" + addorderCustomerId + ",ts:" + ts + ",sgn:" + ss;
            json = sign(toSign.toLowerCase());
            if (json == null) { alert(addOrderResourceSignProblem); return; };
        }
        else { json = ""; };

        var td = row.find("td");
        $.ajax({
            type: "POST",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({ "Mode": "deleteorder", "orderid": orderid, "ts": ts, "cs": encodeURIComponent(json), "ss": encodeURIComponent(ss) }),
            success: function (msg) {

                var ajr = msg.parseJSON();
                if (ajr) {
                    var arr = eval(ajr);
                    if (arr.MetaData[1] == "0") {
                        $(td[8]).css('color', 'red');
                        ShowOrderMessage(arr.MetaData[0], false, true);
                    }
                    else { $(td[8]).css('color', 'green'); };
                    //RunEngine(ajr.MetaData[0]);
                    //ShowAccountingDetail();
                    //GetOrders();
                    $(td[9]).empty();
                    ShowOrderMessage(arr.MetaData[0], false, true);
                    $(td[8]).text(arr.MetaData[0]);
                };
            }
        });
    };
    if (needToken) {
        $.ajax({
            type: "GET",
            url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({
                "Mode": "getTimeStamp"
            }),
            success: function (msg) { var ajr = msg.parseJSON(); ff(ajr); }
        });
    }
    else { ff(""); };


};
function sign(message) {

    var certificate = addOrderNeedTokenToLogin;
    try {
        if (signPlugin && signPlugin.valid) {
            return signPlugin.Sign(certificate, message);
        }
    } catch (e) {

    }
    try {
        var CAPICOM_STORE_OPEN_READ_ONLY = 0;
        var CAPICOM_CURRENT_USER_STORE = 2;
        var CAPICOM_LOCAL_MACHINE_STORE = 1;
        var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
        var CAPICOM_CERTIFICATE_FIND_EXTENDED_PROPERTY = 6;
        var CAPICOM_CERTIFICATE_FIND_TIME_VALID = 9;
        var CAPICOM_CERTIFICATE_FIND_KEY_USAGE = 12;
        var CAPICOM_DIGITAL_SIGNATURE_KEY_USAGE = 0x00000080;
        var CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME = 0;
        var CAPICOM_INFO_SUBJECT_SIMPLE_NAME = 0;
        var CAPICOM_ENCODE_BASE64 = 0;
        var CAPICOM_E_CANCELLED = -2138568446;
        var CERT_KEY_SPEC_PROP_ID = 6;
        var Store = new ActiveXObject("CAPICOM.Store");

        var StoreName = "My";
        Store.Open(CAPICOM_CURRENT_USER_STORE, StoreName, CAPICOM_STORE_OPEN_READ_ONLY);
        var Certs = Store.Certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, certificate);
        var Cert = Certs.Item(1);
        var Signer = new ActiveXObject("CAPICOM.Signer");
        Signer.Certificate = Cert;
        var SignedData = new ActiveXObject("CAPICOM.SignedData");
        SignedData.Content = message;
        var sig = SignedData.Sign(Signer, false, CAPICOM_ENCODE_BASE64);
        return sig;
    }
    catch (e) { };
};
function changeQueueMode() {
    $("#queue").slideToggle();
    $("#advQueue").slideToggle('fast', function () {
        var dBl = $("#advQueue").css("display");

        if (dBl == "none") {

            $("#advQueueBtn").val(UcnewOrderAdvance);
        } else {

            $("#advQueueBtn").val(UcNewOrderDefault);
        }
    });
};
function ShowModal(OrederFunc) {
    $('#OrderpanelAlert').hide();
    $('#btnBuyMask').hide();
    $('#btnSellMask').hide();
    $('#btnDeleteOrderMask').hide();
    $('#btnEditOrderMask').hide();
    $('#lastMessage2 span').html('');
    if (OrederFunc == 'BuySell') {
        $("#TRBuySellButtons").show();
        $("#TREditButtons").hide();
        $('#drpAccountingProvider').attr('selectedIndex', 0);
        ResetOrder();
        $("#AddOrderAccountMask").hide();

        $("#JqmOrderPanel .jqmOrderPanelTitle h1").text(UcNewOrderResourceSendOrder);
    }
    else if (OrederFunc == 'EditOrder') {
        $('#drpAccountingProvider').attr('selectedIndex', 0);
        $("#TREditButtons").show();
        $("#TRBuySellButtons").hide();
        $("#AddOrderAccountMask").show();

        $("#JqmOrderPanel .jqmOrderPanelTitle h1").text(UcNewOrderResourceEditOrder);
        $('#drpExchangeList').attr('disabled', true);
    }
    else if (OrederFunc == 'CopyOrder') {
        $("#orderid").val("0");
        $("#TRBuySellButtons").show();
        $("#TREditButtons").hide();
        $("#AddOrderAccountMask").hide();

        $("#JqmOrderPanel .jqmOrderPanelTitle h1").text(UcNewOrderResourceCopy);
        $('#drpExchangeList').attr('disabled', false);
    }
    shortcut.add("esc", function () {
        $('#JqmOrderPanel').fadeOut('fast');
        shortcut.remove("esc");
    });
    $('#JqmOrderPanel').show();
    $('#OrderPanel').mousedown().mouseup();
};
function SetOrderPanelInfo(obj) {

    if (typeof (obj.GroupStateID) != 'undefined') {
        var strgroupstate = eval("GroupStateId" + obj.GroupStateID);
        var groupstatetext = " ( " + strgroupstate[0] + " ) ";

        $('#GroupState' + UcNewOrderClientID).text(groupstatetext);

        $('#GroupState' + UcNewOrderClientID).css("color", strgroupstate[1]);
    }

    if (obj.LowAllowedPrice != null && obj.HighAllowedPrice != null) {
        $('#PriceThreshold' + UcNewOrderClientID).html("<span onclick='setPrice(this)'>" + obj.HighAllowedPrice.toString().SeparateNumber() + "</span><span style='font-weight:normal'> - </span><span onclick='setPrice(this)'>" + obj.LowAllowedPrice.toString().SeparateNumber() + "</span>");
    }

    if (obj.MinQOrder != null && obj.MaxQOrder != null) {
        $('#AmountThreshold' + UcNewOrderClientID).html("<span onclick='setQuantity(this)'>" + obj.MaxQOrder.toString().SeparateNumber() + "</span><span style='font-weight:normal'> - </span><span onclick='setQuantity(this)'>" + obj.MinQOrder.toString().SeparateNumber() + "</span>");
    }
    if (obj.PriceVar != null) {
        if (obj.PriceVar < 0) $('#ClosingPriceVar' + UcNewOrderClientID).css("color", "Red");
        else if (obj.PriceVar > 0) $('#ClosingPriceVar' + UcNewOrderClientID).css("color", "green");
        else $('#ClosingPriceVar' + UcNewOrderClientID).css("color", "Black");
        $('#ClosingPriceVar' + UcNewOrderClientID).html("(%" + obj.PriceVar.toString().SeparateNumber() + ")");
    }
    if (obj.LastTradedPrice != null) {
        $('#ClosingPrice' + UcNewOrderClientID).html(obj.LastTradedPrice.toString().SeparateNumber());
    }
    if (obj.SymbolTitle != null && obj.InsCode != null) {
        $('#companyname' + UcNewOrderClientID).html(obj.SymbolTitle + " - " + obj.InsCode);
    }
};
function SendOrder() {
    $('#btnEditOrderMask').show();
    $('#btnDeleteOrderMask').show();
    var t = SaveOrder();
    if (t != null)
        SendBuySell(t);
};
function setPrice(obj) {
    $("#txtPrice").val($(obj).text());
}
function setQuantity(obj) {
    $("#txtCount").val($(obj).text());
}
function advEnable() {
    if ($("#AdvanceBox").prop("checked") == true) {
        $("#divAdv").slideDown('slow');
        $(".jqmOrderPanelContent").animate({ height: '+=80' }, 600);
    }
    else {
        $("#divAdv").slideUp('fast');
        $(".jqmOrderPanelContent").animate({ height: '-=80' }, 180);
    };
};
$(document).ready(function () {

    $("#BuySellBotton").click(function () {
        ShowModal('BuySell');
        $('#drpExchangeList').val('');
    });

    var divHeight = 222 + StockTableLimit * 16;
    $(".jqmOrderPanelContent").css("min-height", divHeight);
    $(".jqmOrderPanelContent").css("max-height", divHeight + 80);
    $("#AdvanceBox").prop('checked', false);
    $(".jqmOrderPanelClose").click(function () {
        $('#JqmOrderPanel').fadeOut('fast');
        shortcut.remove("esc");
    });
    $(".jqmOrderPanelAlertClose").click(function () {

        if ($("#btnOrderpanelAlertOk").attr('disabled') == false)
            CloseOrderpanelAlert();
    });
    $("input[name=calcOrderSide]").change(function () {
        changeCalcSetting();
    });
    $("#btnSell").click(function () {
        $('#btnBuyMask').show();
        $('#btnSellMask').show();
        var t = SaveOrder("86");
        if (t != null)
            SendBuySell(t);
    });
    $("#btnBuy").click(function () {
        $('#btnBuyMask').show();
        $('#btnSellMask').show();
        var t = SaveOrder("65");

        if (t != null)
            SendBuySell(t);
    });

    if (UcNewOrderCheckSendSMS) {
        $("#orderSettingMaskDiv").css("display", "none");
    }
    $("#btnEditOrder").click(function () {
        SendOrder();
    });
    $("#btnDeleteOrder").click(function () {
        $('#btnEditOrderMask').show();
        $('#btnDeleteOrderMask').show();
        var temp = $("#orderid").val();
        var row = $('tr[orderid=' + temp + ']');
        ConfirmDeleteOrder(row);
    });
    document.body.onselectstart = function () { return false; };

    $("#OrderPanel").animaDrag({
        speed: 10,
        interval: 50,
        easing: null,
        cursor: 'move',
        boundary: document.body,
        grip: null,
        overlay: true,
        after: function () { },
        during: function () { },
        before: function (e) { if (e.target != this && $(e.target)[0] != $("div.jqmOrderPanelTitle")[0] || $(e.target) == $("input")) { e.mlCancel = true; } },
        afterEachAnimation: function (e) { }
    });
    shortcut.add("F7", function () {
        ShowHide($("#footpanel #calcPanel a:first"), $("#hiddrpExchangeList").val() == "");
        return false;
    });
});
function changeCalcSetting() {
    /*debugger;    */
    var calcIsin = $("#calcIsin").val();
    var calcOrderSide = $("input[name=calcOrderSide]:checked").val();
    var t = parseInt($("#calcKol").val().toString().ToDigit());
    var marketunitname = commissionCalculator.getMarketUnitName(calcIsin);
    $("#clacStockType").text(marketunitname);

    if (calcOrderSide == "65") {
        $("#TheFinalNumberAvailableForPurchase").attr('class', 'visibletrue');
        $("#TheFinalNumberAvailableForSell").attr('class', 'visiblefalse');
        /*
        if (calcIsin.toUpperCase().substring(0, 7) == "IRO3MSZ") {
            calcBourseKarmozd = MaskanFaraBourseStock_Buy_Bourse;
            calcBrokerKarmozd = MaskanFaraBourseStock_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceTasHilatMaskan);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRR7") {
            //calcBourseKarmozd = FaraBourseStock_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseStock_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceOTC);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRO3") {
            calcBourseKarmozd = FaraBourseStock_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseStock_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceOTC);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRO7") {
            calcBourseKarmozd = FaraBoursePayeh_Buy_Bourse;
            calcBrokerKarmozd = FaraBoursePayeh_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBoursePayeh);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRR3") {
            calcBourseKarmozd = FaraBoursePayeh_Buy_Bourse;
            calcBrokerKarmozd = FaraBoursePayeh_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBoursePayeh);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRO1") {
            calcBourseKarmozd = Exchange_Buy_Bourse;
            calcBrokerKarmozd = Exchange_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceBourse);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRR1") {
            calcBourseKarmozd = Exchange_Buy_Bourse;
            calcBrokerKarmozd = Exchange_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceBourse);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRB3") {
            calcBourseKarmozd = Bond_Buy_Bourse;
            calcBrokerKarmozd = Bond_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceBond);
        }
        else if (calcIsin.toUpperCase().substring(0, 3) == "IRS") {
            calcBourseKarmozd = Tabaee_Buy_Bourse;
            calcBrokerKarmozd = Tabaee_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceTabaeeStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT1C") {
            calcBourseKarmozd = ETFMixed_Buy_Bourse;
            calcBrokerKarmozd = ETFMixed_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFMixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT1S") {
            calcBourseKarmozd = ETFStock_Buy_Bourse;
            calcBrokerKarmozd = ETFStock_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT1F") {
            calcBourseKarmozd = ETFFixed_Buy_Bourse;
            calcBrokerKarmozd = ETFFixed_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFFixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT1N") {
            calcBourseKarmozd = ETFZaminSakhteman_Buy_Bourse;
            calcBrokerKarmozd = ETFZaminSakhteman_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFZaminSakhteman);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT3C") {
            calcBourseKarmozd = FaraBourseETFMixed_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFMixed_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFMixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT3S") {
            calcBourseKarmozd = FaraBourseETFStock_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFStock_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT3F") {
            calcBourseKarmozd = FaraBourseETFFixed_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFFixed_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFFixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT3N") {
            calcBourseKarmozd = ETFZaminSakhteman_Buy_Bourse;
            calcBrokerKarmozd = ETFZaminSakhteman_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFZaminSakhteman);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT7C") {
            calcBourseKarmozd = FaraBourseETFMixed_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFMixed_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFMixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT7S") {
            calcBourseKarmozd = FaraBourseETFStock_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFStock_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT7F") {
            calcBourseKarmozd = FaraBourseETFFixed_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFFixed_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFFixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT7N") {
            calcBourseKarmozd = ETFZaminSakhteman_Buy_Bourse;
            calcBrokerKarmozd = ETFZaminSakhteman_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFZaminSakhteman);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT8C") {
            calcBourseKarmozd = FaraBourseETFMixed_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFMixed_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFMixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT8S") {
            calcBourseKarmozd = FaraBourseETFStock_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFStock_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT8F") {
            calcBourseKarmozd = FaraBourseETFFixed_Buy_Bourse;
            calcBrokerKarmozd = FaraBourseETFFixed_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFFixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT8N") {
            calcBourseKarmozd = ETFZaminSakhteman_Buy_Bourse;
            calcBrokerKarmozd = ETFZaminSakhteman_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFZaminSakhteman);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRBK" || calcIsin.toUpperCase().substring(0, 4) == "IRK1") {
            calcBourseKarmozd = Salaf_Buy_Bourse;
            calcBrokerKarmozd = Salaf_Buy_Broker;
            $("#clacStockType").text(UcNewOrderResourceSalaf);
        }*/

    }
    else if (calcOrderSide == "86") {
        $("#TheFinalNumberAvailableForPurchase").attr('class', 'visiblefalse');
        $("#TheFinalNumberAvailableForSell").attr('class', 'visibletrue');

        /*if (calcIsin.toUpperCase().substring(0, 7) == "IRO3MSZ") {
            calcBourseKarmozd = MaskanFaraBourseStock_Sell_Bourse;
            calcBrokerKarmozd = MaskanFaraBourseStock_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceTasHilatMaskan);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRR7") {
            calcBourseKarmozd = FaraBourseStock_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseStock_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceOTC);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRO3") {
            calcBourseKarmozd = FaraBourseStock_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseStock_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceOTC);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRO7") {
            calcBourseKarmozd = FaraBoursePayeh_Sell_Bourse;
            calcBrokerKarmozd = FaraBoursePayeh_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBoursePayeh);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRR3") {
            calcBourseKarmozd = FaraBoursePayeh_Sell_Bourse;
            calcBrokerKarmozd = FaraBoursePayeh_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBoursePayeh);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRO1") {
            calcBourseKarmozd = Exchange_Sell_Bourse;
            calcBrokerKarmozd = Exchange_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceBourse);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRR1") {
            calcBourseKarmozd = Exchange_Sell_Bourse;
            calcBrokerKarmozd = Exchange_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceBourse);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRB3") {
            calcBourseKarmozd = Bond_Sell_Bourse;
            calcBrokerKarmozd = Bond_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceBond);
        }
        else if (calcIsin.toUpperCase().substring(0, 3) == "IRS") {
            calcBourseKarmozd = Tabaee_Sell_Bourse;
            calcBrokerKarmozd = Tabaee_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceTabaeeStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT1C") {
            calcBourseKarmozd = ETFMixed_Sell_Bourse;
            calcBrokerKarmozd = ETFMixed_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFMixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT1S") {
            calcBourseKarmozd = ETFStock_Sell_Bourse;
            calcBrokerKarmozd = ETFStock_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT1F") {
            calcBourseKarmozd = ETFFixed_Sell_Bourse;
            calcBrokerKarmozd = ETFFixed_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFFixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT1N") {
            calcBourseKarmozd = ETFZaminSakhteman_Sell_Bourse;
            calcBrokerKarmozd = ETFZaminSakhteman_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFZaminSakhteman);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT3C") {
            calcBourseKarmozd = FaraBourseETFMixed_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFMixed_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFMixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT3S") {
            calcBourseKarmozd = FaraBourseETFStock_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFStock_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT3F") {
            calcBourseKarmozd = FaraBourseETFFixed_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFFixed_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFFixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT3N") {
            calcBourseKarmozd = ETFZaminSakhteman_Sell_Bourse;
            calcBrokerKarmozd = ETFZaminSakhteman_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFZaminSakhteman);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT7C") {
            calcBourseKarmozd = FaraBourseETFMixed_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFMixed_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFMixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT7S") {
            calcBourseKarmozd = FaraBourseETFStock_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFStock_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT7F") {
            calcBourseKarmozd = FaraBourseETFFixed_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFFixed_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFFixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT7N") {
            calcBourseKarmozd = ETFZaminSakhteman_Sell_Bourse;
            calcBrokerKarmozd = ETFZaminSakhteman_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFZaminSakhteman);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT8C") {
            calcBourseKarmozd = FaraBourseETFMixed_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFMixed_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFMixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT8S") {
            calcBourseKarmozd = FaraBourseETFStock_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFStock_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFStock);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT8F") {
            calcBourseKarmozd = FaraBourseETFFixed_Sell_Bourse;
            calcBrokerKarmozd = FaraBourseETFFixed_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceFaraBourseETFFixed);
        }
        else if (calcIsin.toUpperCase().substring(0, 5) == "IRT8N") {
            calcBourseKarmozd = ETFZaminSakhteman_Sell_Bourse;
            calcBrokerKarmozd = ETFZaminSakhteman_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceETFZaminSakhteman);
        }
        else if (calcIsin.toUpperCase().substring(0, 4) == "IRBK" || calcIsin.toUpperCase().substring(0, 4) == "IRK1") {
            calcBourseKarmozd = Salaf_Sell_Bourse;
            calcBrokerKarmozd = Salaf_Sell_Broker;
            $("#clacStockType").text(UcNewOrderResourceSalaf);
        }*/

    }
    if (!isNaN(t))
        reCalc(t, calcOrderSide);
}
function GetQueueClientId() {

    return sqClientid;
};
function GetQueueClientIda() {

    return sqaClientid;
};
function callbackF(v) {


    var stock = v.innervalue.split(',');
    $('#lastMessage2 span').html('');
    var activeIsin = $("#calcIsin").val().trim().toLowerCase();
    if (stock[3].trim().toLowerCase() == activeIsin) {
        return false;
    }
    setTimeout(function () {
        if ($("#JqmOrderPanel").css('display') == 'block') {
            var m4 = App.GetModul(GetIntraDayModuleName());
            if (m4 != null) {
                m4.MetaData[1] = stock[3];
                m4.MetaData[2] = "chartcontainer2";
                m4.MetaData[3] = "false";
                m4.Init();
            }
        }
    }, 150);

    try {
        if ($("#DivLastStockPrice").css("display") == "block") {
            var m3 = App.GetModul(GetIntraDayModuleName());
            if (m3 != null) {
                m3.MetaData[1] = stock[3];
                m3.MetaData[2] = "chartcontainer1";
                m3.MetaData[3] = "true";

                m3.Init();
            }
        }
    } catch (e) { }

    $('#txtPrice').val('');
    $('#txtCount').val('');
    $('#orderManagerRule').text('');
    reCalc(null);
    $('#LowAllowedPrice').text(stock[6]);
    ResetLastStockPrice();
    $('.lsl').attr('nsccode', stock[3]);
    $('#queue').attr('nsccode', stock[3]);
    $('#priceHelper').show();

    var ma = App.GetModul(sqaClientid);
    ma.MetaData[1] = stock[3];
    ma.Init();



    var m = App.GetModul(sqClientid);
    m.MetaData[1] = stock[3];
    m.Init();
    try {
        var gid = GetStockGroupID();
        var m = App.GetModul(gid);
        if (m != null) {
            m.MetaData[1] = stock[3];
            m.Init();
        };
    }
    catch (e) {
        debug(e)
    };
    var m1 = App.GetModul(GetLSIClientId());
    m1.MetaData[4] = stock[3];
    m1.Init();
    var m2 = null;
    var l = 0;
    if (m2 != null) {
        if (m2.MetaData != null && m2.MetaData.toString().length > 0) {
            l = m2.MetaData.length;
        };
        m2.Init();
    };
    App.Connet();
    $('#txtCount').focus();
};
function callbackF2(v) {
    var stock = v.innervalue.split(',');
    setTimeout(function () {
        if ($("#JqmOrderPanel").css('display') == 'block') {
            var m4 = App.GetModul(GetIntraDayModuleName());
            if (m4 != null) {
                m4.MetaData[1] = stock[3];
                m4.MetaData[2] = "chartcontainer2";
                m4.Init();
            }
        }
    }, 150);

    try {
        var m3 = App.GetModul(GetIntraDayModuleName());
        if (m3 != null) {
            m3.MetaData[1] = stock[3];
            m3.MetaData[2] = "chartcontainer1";
            m3.Init();
        }
    } catch (e) { }

    reCalc(null);
    $('#HighAllowedPrice').text(stock[5]);
    $('#LowAllowedPrice').text(stock[6]);
    ResetLastStockPrice();
    $('.lsl').attr('nsccode', stock[3]);
    $('#queue').attr('nsccode', stock[3]);
    $('#priceHelper').show();

    var ma = App.GetModul(sqaClientid);
    ma.MetaData[1] = stock[3];
    ma.Init();

    var m = App.GetModul(sqClientid);
    m.MetaData[1] = stock[3];
    m.Init();
    try {
        var m = App.GetModul(GetStockGroupID());
        if (m != null) {
            m.MetaData[1] = stock[3];
            m.Init();
        };
    }
    catch (e) { };
    var m1 = App.GetModul(GetLSIClientId());
    m1.MetaData[4] = stock[3];
    m1.Init();
    var m2 = null;
    var l = 0;
    if (m2 != null) {
        if (m2.MetaData != null && m2.MetaData.toString().length > 0) {
            l = m2.MetaData.length;
        };
        m2.Init();
    };
    App.Connet();
    $('#txtCount').focus();
};
function OrderValidate() {
    var order = GetOrder();
    if (order == null) {
        return selectStock;
    };
    if (order.CustomerId <= 0) {
        return selectcustomer;
    };

    if (order.OrderSide == intOrdersideBuy) {
        if (order.OrderTotalQuantity < parseInt(MinimumOrderCountForBuy)) {
            return MinBuyCountError.format(MinimumOrderCountForBuy);
        };
        if (order.OrderTotalQuantity > parseInt(MaximumOrderCountForBuy)) {
            return MaxBuyCountError.format(MaximumOrderCountForBuy);
        };
        if (order.IsRight == "1" && (ActiveRightForBuy == "0")) {
            return IsRightBuyError;
        };
    };

    if (order.OrderSide == intOrdersideSell) {
        if (order.OrderTotalQuantity < parseInt(MinimumOrderCountForSell)) {
            return MinSellCountError.format(MinimumOrderCountForSell);
        };
        if (order.OrderTotalQuantity > parseInt(MaximumOrderCountForSell)) {
            return MaxSellCountError.format(MaximumOrderCountForSell);
        };
        if (order.IsRight == "1" && (ActiveRightForSell == "0")) {
            return IsRightSellError;
        };
        if (order.pk != "TBRFinancialDataProvider") {
            if (SellProviderError)
                return SellProviderError;
            else {
                return "SellProviderError";
            }
        }
    };
    if (order.OrderType == "76") {
        if (order.OrderTotalQuantity == '') {
            return selectOrderTotalQuantity;
        };
        if (order.OrderPrice == '') {
            return selectOrderPrice;
        };
        if (IsDigit(order.OrderPrice)) {
            var p = parseInt(GetNumber(order.OrderPrice));
            var h = parseInt(GetNumber($('#HighAllowedPrice').text()));
            var l = parseInt(GetNumber($('#LowAllowedPrice').text()));
            if (p < l || p > h) {
                return OrderPriceNotValid;
            };
        };
    };
    if (order.CustomerId <= 0) {
        return selectCustomer;
    };
    if (order.IsSymbolInAgreement === true || order.IsSymbolInAgreement === "true") {
        if (order.AcceptedAgreement != true) {
            if (PleaseTickCautionAgreement)
                return PleaseTickCautionAgreement;
            else
                return "pleasetickcautionagreement";
        }
    }
    return 1;
};
function CreateTable(values, columns, headerTitle, emptyMessage) {
    if (values != null) {
        if (values.length > 0) {
            var table = "<table cellspacing='0' cellpadding='3' id='tblTodayOrdersHeader' width='100%'></table><div style='height:126px;  display: block; overflow-x: hidden; overflow-y: scroll;  width: 100%;'><table cellspacing='0' id='tblTodayOrders' class='tblq'><thead><tr>{0}</tr></thead><tbody>{1}</tbody></table></div>";
            var td = "<td width='7.5%'>{0}</td>";
            var tdDate = "<td width='7.5%' style='font-size:11px;'>{0}</td>";
            var tdStatus = '<td style="font-size:11px;"> {1}</td>';
            var tdaction = '<td cname="action" width="48"> {0} {1} {2}</td>';
            var tdProvider = '<td width="12%" style="font-size:11px;"><div class="{0}"></div> {1}  </td>';
            var tdOrderFrom = '<td width="27"><div class="{0}"></div></td>';
            var tdorderside = '<td width="15%" style="text-align:center; background-color:{0};font-size:11px;"><div class="{2}"></div> {1} </td>';

            var th = "<th width='{0}'>{1}</th>";
            var thStatus = "<th>{0}</th>";
            var tr = "<tr orderid='{2}' customerid='{3}' class='{1}' ondblclick='{4}'>{0}</tr>";
            var trAction = tr;
            var headerRow = "";
            for (var i in headerTitle) {

                if (typeof (headerTitle[i]) != "function") {
                    if (headerTitle[i] == statusString) {
                        headerRow += thStatus.format(headerTitle[i]);
                    } else if (headerTitle[i] == actionString) headerRow += th.format('48', headerTitle[i]);
                    else if (headerTitle[i] == "") headerRow += th.format('27', headerTitle[i]);
                    else if (headerTitle[i] == providerString) headerRow += th.format('12%', headerTitle[i]);
                    else if (headerTitle[i] == buySellString) headerRow += th.format('15%', headerTitle[i]);
                    else headerRow += th.format('7.5%', headerTitle[i]);
                }
            };
            var rows = "";
            for (var i in values) {
                if (typeof (values[i]) != "function") {
                    var tds = "";
                    for (var j in columns) {
                        if (typeof (columns[j]) != "function") {
                            if (columns[j] == "dtime") {
                                tds += tdDate.replace("{0}", eval("values[i]." + columns[j]));
                            }
                            else if (columns[j] == "status") {
                                tds += tdStatus.replace("{1}", eval("values[i]." + columns[j]));
                            }
                            else if (columns[j] == "orderFrom") {
                                tds += tdOrderFrom.replace("{0}", "Ico" + values[i].orderFrom);
                            }
                            else if (columns[j] == "action") {

                                if (values[i].visible == 1) {
                                    tds += tdaction.format(imgcopy, imgdelete, imgedit);
                                    trAction = tr.replace("{4}", 'EditOrder(this);');
                                }
                                else {
                                    tds += tdaction.format(imgcopy, '', '');
                                    trAction = tr.replace("{4}", '');
                                }
                            }
                            else if (columns[j] == "orderside")
                            {
                                var tdtemp = values[i].orderside;
                                if (typeof (values[i].ordervl) != "undefined")
                                    tdtemp = tdtemp + " ( " + values[i].ordervl;
                                if (typeof (values[i].gtdate) != "undefined") {
                                    tdtemp += " " + values[i].gtdate;
                                };
                                if (typeof (values[i].ordervl) != "undefined") tdtemp += " )";

                                if (values[i].orderside == UcNewOrderResourceSell)
                                    tds += tdorderside.format('#FFBCBC', tdtemp);
                                else {

                                    if (values[i].orderside == UcNewOrderResourceBuy)
                                        tds += tdorderside.format('#C5C5F5', tdtemp);
                                }
                            }
                            else if (columns[j] == "ProviderName") {

                                if (values[i].ProviderName == 'MellatBankFinancialDataProvider') {
                                    tds += tdProvider.format('IcoMellat', UcNewOrderResourceMellat);
                                } else if (values[i].ProviderName == 'MelliFinancialDataProvider') {
                                    tds += tdProvider.format('IcoMelli', UcNewOrderResourceMelli);
                                } else if (values[i].ProviderName == 'MelliFinancialDataProvider') {
                                    tds += tdProvider.format('IcoMelli', UcNewOrderResourceMellat);
                                } else if (values[i].ProviderName == 'SamanFinancialDataProvider') {
                                    tds += tdProvider.format('IcoSaman', UcNewOrderResourceSaman);
                                } else if (values[i].ProviderName == 'RefahFinancialDataProvider') {
                                    tds += tdProvider.format('IcoRefah', UcNewOrderResourceRefah);
                                } else if (values[i].ProviderName == 'SepahFinancialDataProvider') {
                                    tds += tdProvider.format('IcoSepah', UcNewOrderResourceSepah);
                                } else if (values[i].ProviderName == 'KarafarinFinancialDataProvider') {
                                    tds += tdProvider.format('IcoKarafarin', UcNewOrderResourceKarAfarin);
                                } else if (values[i].ProviderName == 'EnovinFinancialDataProvider') {
                                    tds += tdProvider.format('IcoEnovin', UcNewOrderResourceEnovin);
                                } else if (values[i].ProviderName == 'AnsarFinancialDataProvider') {
                                    tds += tdProvider.format('IcoAnsar', UcNewOrderResourceAnsar);
                                } else if (values[i].ProviderName == 'ParsianFinancialDataProvider') {
                                    tds += tdProvider.format('IcoParsian', UcNewOrderResourceParsian);
                                } else if (values[i].ProviderName == 'PasargadFinancialDataProvider') {
                                    tds += tdProvider.format('IcoPasargad', UcNewOrderResourcePassargad);
                                } else {
                                    tds += tdProvider.format('IcoBroker', UcNewOrderResourceBrokerAccount);
                                }
                            } else {
                                tds += td.replace("{0}", eval("values[i]." + columns[j]));
                            }
                        }
                    };
                    var className = "";
                    rows += trAction.format(tds, className, values[i].orderid, values[i].customerid);
                }
            };
            var re = table.replace("{0}", headerRow).replace("{1}", rows);
            return re;
        }
        else {

            var emptyMsg = UcNewOrderTodayEmpy;
            if (typeof emptyMessage != "undefined" && emptyMessage) emptyMsg = emptyMessage;
            return '<div>' + emptyMsg + '</div>';
        }
    };
};

function CreateRowTable(columns, values) {
    var tds = "";
    var rows = "";
    var td = "<td width='7.5%'>{0}</td>";
    var tdDate = "<td width='7.5%' style='font-size:11px;'>{0}</td>";
    var tdStatus = '<td style="font-size:11px;"> {1}</td>';
    var tdaction = '<td cname="action" width="48"> {0} {1} {2}</td>';
    var tdProvider = '<td width="12%" style="font-size:11px;"><div class="{0}"></div> {1}  </td>';
    var tdOrderFrom = '<td width="27"><div class="{0}"></div></td>';
    var tdorderside =
        '<td width="15%" style="text-align:center; background-color:{0};font-size:11px;"><div class="{2}"></div> {1} </td>';
    var th = "<th width='{0}'>{1}</th>";
    var thStatus = "<th>{0}</th>";
    var tr = "<tr orderid='{2}' customerid='{3}' class='{1}' ondblclick='{4}'>{0}</tr>";
    var trAction = tr;
    var headerRow = "";

    for (var j in columns) {
        if (columns.hasOwnProperty(j)) {
            if (typeof (columns[j]) != "function") {
                if (columns[j] === "dtime") {
                    tds += tdDate.replace("{0}", eval("values." + columns[j]));
                } else if (columns[j] === "status") {
                    tds += tdStatus.replace("{1}", eval("values." + columns[j]));
                } else if (columns[j] === "orderFrom") {
                    tds += tdOrderFrom.replace("{0}", "Ico" + values.orderFrom);
                } else if (columns[j] === "action") {

                    if (values.visible === 1) {
                        tds += tdaction.format(imgcopy, imgdelete, imgedit);
                        trAction = tr.replace("{4}", 'EditOrder(this);');
                    } else {
                        tds += tdaction.format(imgcopy, '', '');
                        trAction = tr.replace("{4}", '');
                    }
                } else if (columns[j] == "orderside") {
                    var tdtemp = values.orderside;
                    if (typeof (values.ordervl) != "undefined")
                        tdtemp = tdtemp + " ( " + values.ordervl;
                    if (typeof (values.gtdate) != "undefined") {
                        tdtemp += " " + values.gtdate;
                    };
                    if (typeof (values.ordervl) != "undefined") tdtemp += " )";

                    if (values.orderside === UcNewOrderResourceSell)
                        tds += tdorderside.format('#FFBCBC', tdtemp);
                    else {

                        if (values.orderside === UcNewOrderResourceBuy)
                            tds += tdorderside.format('#C5C5F5', tdtemp);
                    }
                } else if (columns[j] === "ProviderName") {

                    if (values.ProviderName == 'MellatBankFinancialDataProvider') {
                        tds += tdProvider.format('IcoMellat', UcNewOrderResourceMellat);
                    } else if (values.ProviderName == 'MelliFinancialDataProvider') {
                        tds += tdProvider.format('IcoMelli', UcNewOrderResourceMelli);
                    } else if (values.ProviderName == 'MelliFinancialDataProvider') {
                        tds += tdProvider.format('IcoMelli', UcNewOrderResourceMellat);
                    } else if (values.ProviderName == 'SamanFinancialDataProvider') {
                        tds += tdProvider.format('IcoSaman', UcNewOrderResourceSaman);
                    } else if (values.ProviderName == 'RefahFinancialDataProvider') {
                        tds += tdProvider.format('IcoRefah', UcNewOrderResourceRefah);
                    } else if (values.ProviderName == 'SepahFinancialDataProvider') {
                        tds += tdProvider.format('IcoSepah', UcNewOrderResourceSepah);
                    } else if (values.ProviderName == 'KarafarinFinancialDataProvider') {
                        tds += tdProvider.format('IcoKarafarin', UcNewOrderResourceKarAfarin);
                    } else if (values.ProviderName == 'EnovinFinancialDataProvider') {
                        tds += tdProvider.format('IcoEnovin', UcNewOrderResourceEnovin);
                    } else if (values.ProviderName == 'AnsarFinancialDataProvider') {
                        tds += tdProvider.format('IcoAnsar', UcNewOrderResourceAnsar);
                    } else if (values.ProviderName == 'ParsianFinancialDataProvider') {
                        tds += tdProvider.format('IcoParsian', UcNewOrderResourceParsian);
                    } else if (values.ProviderName == 'PasargadFinancialDataProvider') {
                        tds += tdProvider.format('IcoPasargad', UcNewOrderResourcePassargad);
                    } else {
                        tds += tdProvider.format('IcoBroker', UcNewOrderResourceBrokerAccount);
                    }
                } else {
                    tds += td.replace("{0}", eval("values." + columns[j]));
                }
            }
        }
    };
    var className = "";
    rows = trAction.format(tds, className, values.orderid, values.customerid);
    return rows;
}



function UpdateLightStockQueue(ajr, setting) {

    var item = ajr.getItemName().replace("_lightrlc", "");
    var orderpanelQueuecontainer = $('#OrderpanelQueue');
    var activeItem = orderpanelQueuecontainer.attr('nsccode');

    if (activeItem && activeItem.toLowerCase() != item.toLowerCase()) {
        return;
    }
    var schema = setting.Schema;
    var container = $('#' + setting.container);
    ajr.forEachChangedField(function (name, pos, val) {
        if (val) {
            var exist = $.inArray(name, schema);
            if (exist >= 0) {
                container.find('.' + name).text(val.toString().SeparateNumber());
                orderpanelQueuecontainer.find('.' + name).text(val.toString().SeparateNumber());
            }
        }
    });
};

function LightStockQueueCallBack(ajr, v) {

    if (ajr) {
        var nscCode;
        v.Data = ajr;
        var arr = eval(ajr);
        if (arr.Value != null && arr.Value.length > 0) {
            nscCode = arr.Value[0].NSCCode;
            $('#OrderpanelQueue').attr('nsccode', nscCode);
        }
        $('#' + v.container).html('');
        $('#OrderpanelQueue').html('');
        var tbl = LightStockQueueCreateTable(arr);
        tbl.appendTo('#' + v.container);
        tbl.clone().attr('id', 'tblQeueOrderPanel').appendTo('#OrderpanelQueue');
    }
}


function LightAdvancedStockQueueCallBack1(ajr, v) {
    debug('Todo LightAdvancedStockQueueCallBack1');
    return;
    if (ajr) {
        var nscCode;
        v.Data = ajr;
        var arr = eval(ajr);
        if (arr.Value != null && arr.Value.length > 0) {
            nscCode = arr.Value[0].NSCCode;
            $('#LightOrderpanelQueue').attr('nsccode', nscCode);
        }
        $('#' + v.container).html('');
        $('#LightOrderpanelQueue').html('');
        var tbl = LightAdvancedStockQueueCreateTable(arr);
        tbl.appendTo('#' + v.container);
        tbl.clone().attr('id', 'tblQeueOrderPanel').appendTo('#LightOrderpanelQueue');
    }
}



function LightAdvancedStockQueueCreateTable(ajr) {

    //var  createtablefunction =
    //var buyText = "خرید";
    //var sellText = "فروش";
    var QueueCountText = "تعداد";
    var VolumeText = "حجم";
    var PriceText = "قیمت";
    if (bs86) {
        //sellText = bs86;
        //buyText = bs65;
        QueueCountText = countString;
        VolumeText = volumeString;
        PriceText = priceString;
    }
    var strtbl = '<table id="tblqStockNew" class="tblq" width="100%"></table>';
    var strthead = "<thead><th>" + QueueCountText + "</th><th>" + VolumeText + "</th><th>" + PriceText + "</th><th>" + VolumeText + "</th><th>" + QueueCountText + "</th></thead>";
    var strtbody = "<tbody></tbody>";
    var strBodyAfter = "";
    var tbody = $(strtbody);
    var tbl = $(strtbl);
    tbl.append(strthead);
    var trSell = '<tr trc="{4}">' +
        '<td orderside="buy" class="{0} nb NumberOfOrdersAtBestSell_{5}">{1}</td>' +
        '<td orderside="buy" class="{0} bq BestSellLimitQuantity_{5}">{2}</td>' +
        '<td orderside="buy" class="{0} bp BestSellLimitPrice_{5}">{3}</td>' +
        '<td editpanel="buy"></td><td></td>' +
        '</tr>';
    var trBuy = '<tr trc="{4}">' +
        '<td></td>' +
        '<td editpanel="sell"></td>' +
        '<td orderside="sell" class="{0} sp BestBuyLimitPrice_{5}">{1}</td>' +
        '<td orderside="sell" class="{0} sq BestBuyLimitQuantity_{5}">{2}</td>' +
        '<td orderside="sell" class="{0} ns NumberOfOrdersAtBestBuy_{5}">{3}</td>' +
        '</tr>';
    if (ajr.Value) {
        var flagi = 0;
        var tblComStyle, tblComStyleTwo;
        var count = 0;
        var currnetCount = 0;
        jQuery.each(ajr.Value, function (index) {
            if (currnetCount >= StockTableLimit) {
                return false;
            }
            if (flagi == 0) {
                tblComStyle = "tblqb1col2";
                tblComStyleTwo = "tblqb2col2";
                flagi = 1;
            } else {
                tblComStyleTwo = "tblqb2col1";
                tblComStyle = "tblqb1col1";
                flagi = 0;
            }
            var m = this;

            var trTempBuy = trBuy.format(tblComStyle, m.NoBestSell.toString().SeparateNumber(), m.BestSellQuantity.toString().SeparateNumber(), m.BestSellPrice.toString().SeparateNumber(), currnetCount, index + 1);
            var trTempSell = trSell.format(tblComStyleTwo, m.BestBuyPrice.toString().SeparateNumber(), m.BestBuyQuantity.toString().SeparateNumber(), m.NoBestBuy.toString().SeparateNumber(), currnetCount, index + 1);

            tbody.prepend(trTempSell);
            strBodyAfter += trTempBuy;

            currnetCount++;
        });
        tbody.appendTo(tbl);
        $(strBodyAfter).appendTo(tbl);
    };


    return tbl;

}
function LightStockQueueCreateTable(ajr) {
    var buyText = "خرید";
    var sellText = "فروش";
    var QueueCountText = "تعداد";
    var VolumeText = "حجم";
    var PriceText = "قیمت";
    if (bs86) {
        sellText = bs86;
        buyText = bs65;
        QueueCountText = countString;
        VolumeText = volumeString;
        PriceText = priceString;
    }

    var strtbl = "<table id='tblqStock' class='tblq' width='100%' ></table>";
    var strthead = "<thead><tr class='trh'><th class='trhb' align='center' colspan='3' >" + buyText + "</th><th class='trhs' align='center' colspan='3' >" + sellText + "</th></tr><tr ><th class='trhb'>" +
       QueueCountText + "</th><th class='trhb'>" + VolumeText + "</th><th class='trhb'>" + PriceText + "</th><th class='trhs'>" +
        PriceText + "</th><th class='trhs'>" + VolumeText + "</th><th class='trhs'>" + QueueCountText + "</th></tr></thead>";

    var strtbody = "<tbody></tbody>";
    var tbody = $(strtbody);
    var tbl = $(strtbl);
    tbl.append(strthead);
    var tr = "<tr>" +
        "<td order_side='buy'  onclick='javascript:buyQueue(this,1);'  class='{0} b1 NumberOfOrdersAtBestBuy_{8}'>{2}</td>" +
        "<td order_side='buy'  onclick='javascript:buyQueue(this,2);'  class='{0} b1 BestBuyLimitQuantity_{8}' stock_valu='true'>{3}</td>" +
        "<td order_side='buy'  onclick='javascript:buyQueue(this,3);'  class='{0} b1 BestBuyLimitPrice_{8}' stock_price='true'>{4}</td>" +
        "<td order_side='sell' onclick='javascript:sellQueue(this,1);' class='{1} s  BestSellLimitPrice_{8}' stock_price='true'>{7}</td>" +
        "<td order_side='sell' onclick='javascript:sellQueue(this,2);' class='{1} s  BestSellLimitQuantity_{8}' stock_valu='true'>{6}</td>" +
        "<td order_side='sell' onclick='javascript:sellQueue(this,3);' class='{1} s  NumberOfOrdersAtBestSell_{8}'>{5}</td></tr>";
    if (ajr.Value) {
        var flagi = 0;
        var tblComStyle, tblComStyleTwo;
        var count = 0;
        var currnetCount = 0;
        jQuery.each(ajr.Value, function (index) {
            if (currnetCount >= StockTableLimit)
            { return false; }
            if (flagi == 0) {
                tblComStyle = 'tblqb1col2';
                tblComStyleTwo = 'tblqb2col2';
                flagi = 1;
            }
            else {
                tblComStyleTwo = 'tblqb2col1';
                tblComStyle = 'tblqb1col1';
                flagi = 0;
            }
            var m = this;
            var trtemp = tr.format(tblComStyle, tblComStyleTwo, m.NoBestBuy.toString().SeparateNumber(), m.BestBuyQuantity.toString().SeparateNumber(), m.BestBuyPrice.toString().SeparateNumber(), m.NoBestSell.toString().SeparateNumber(), m.BestSellQuantity.toString().SeparateNumber(), m.BestSellPrice.toString().SeparateNumber(), index + 1);
            tbody.append(trtemp);
            currnetCount++;
        });
        tbody.appendTo(tbl);
    };
    return tbl;
}

function UpdateLightQueueTableAdv(ajr, setting) {

    var item = ajr.getItemName().replace("_lightrlc", "");
    var activeItem = $('#tblqStockNew').attr('nsccode');

    if (activeItem.toLowerCase() != item.toLowerCase()) {
        return;
    }
    var schema = setting.Schema;
    var container = $('#' + setting.container);

    ajr.forEachChangedField(function (name, pos, val) {
        if (val) {
            var exist = $.inArray(name, schema);
            if (exist >= 0) {
                container.find('.' + name).text(val.toString().SeparateNumber());
            }
        }

    });
};



function LightRefreshStockGroupState(ajr, setting) {
 //   var item = ajr.getItemName().replace("_lightrlc", "");

    var currentGroup = setting.groupCode;
    var schema = setting.Schema;

    ajr.forEachChangedField(function (name, pos, val) {
        debug(name + " " + val);
        if (val) {
            if (name == currentGroup) {
                var exist = $.inArray(name, schema);
                if (exist >= 0) {
                    var strgroupstate = eval('GroupStateId' + val);
                    var groupstatetext = ' ( ' + strgroupstate[0] + ' ) ';
                    $('#groupstate').text(groupstatetext);
                    $('#groupstate').css('color', strgroupstate[1]);
                }
            }
        }

    });


};

function LightInitStockGroupState(ajr, setting) {
    ajr.groupCode = '';
    $('#' + ajr.container).html('');
    $('#' + ajr.container).append($('<span id="groupstate"></span>'));
    $('#' + ajr.container).css('display', 'inline');
};

function jsonStockGroupState(ot, metadata) {
    var g = ['B1', 'F1', 'F2', 'N1', 'N2', 'N3', 'N4', 'U1', 'Y1', 'Z1', 'Z2', 'Z4', 'Z3', 'O1', '00'];
    var groups = [];
    for (var i = 0; i < g.length; i++) {
        var group = new Object();
        group.Key = 'InstrumentID';
        group.Value = g[i];
        groups[groups.length] = group;
    }
    return groups;
};

function LightAdvancedStockQueueCallBack(ajr, v) {
    var strtbl = '<table id="tblqStockNew" class="tblq" width="100%"></table>';
    var strthead = "<thead><th>تعداد</th><th>حجم</th><th>قیمت</th><th>حجم</th><th>تعداد</th></thead>";
    var strtbody = "<tbody></tbody>";
    var strBodyAfter = "";
    var tbody = $(strtbody);
    var tbl = $(strtbl);
    tbl.append(strthead);
    var trBuy = '<tr trc="{4}"><td orderside="buy" class="{0} nb">{1}</td><td orderside="buy" class="{0} bq">{2}</td><td orderside="buy" class="{0} bp">{3}</td><td editpanel="buy"></td><td></td></tr>';
    var trSell = '<tr trc="{4}"><td></td><td editpanel="sell"></td><td orderside="sell" class="{0} sp">{1}</td><td orderside="sell" class="{0} sq">{2}</td><td orderside="sell" class="{0} ns">{3}</td></tr>';
    if (ajr.Value) {
        var flagi = 0;
        var tblComStyle, tblComStyleTwo;
        var count = 0;
        var currnetCount = 0;
        jQuery.each(ajr.Value, function () {
            if (currnetCount >= StockTableLimit) {
                return false;
            }
            if (flagi == 0) {
                tblComStyle = "tblqb1col2";
                tblComStyleTwo = "tblqb2col2";
                flagi = 1;
            } else {
                tblComStyleTwo = "tblqb2col1";
                tblComStyle = "tblqb1col1";
                flagi = 0;
            }
            var m = this;
            var trTempSell = trSell.format(tblComStyle, m.BestBuyPrice.toString().SeparateNumber(), m.BestBuyQuantity.toString().SeparateNumber(), m.NoBestBuy.toString().SeparateNumber(), currnetCount);
            var trTempBuy = trBuy.format(tblComStyleTwo, m.NoBestSell.toString().SeparateNumber(), m.BestSellQuantity.toString().SeparateNumber(), m.BestSellPrice.toString().SeparateNumber(), currnetCount);
            tbody.prepend(trTempBuy);
            strBodyAfter += trTempSell;

            currnetCount++;
        });
        tbody.appendTo(tbl);
        $(strBodyAfter).appendTo(tbl);
    };
    $('#' + v.container).html('');
    tbl.attr('nsccode', v.MetaData[1]);
    tbl.appendTo('#' + v.container);
};
