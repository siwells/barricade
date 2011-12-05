/*
 * SimpleModal Basic Modal Dialog
 * http://www.ericmmartin.com/projects/simplemodal/
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2010 Eric Martin - http://ericmmartin.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Revision: $Id: basic.js 254 2010-07-23 05:14:44Z emartin24 $
 */

jQuery(function ($) {
	// Load dialog on page load
	//$('#basic-modal-content').modal();

	// Load dialog on click
	$('#basic-modal .basic').click(function (e) {
		//$('#basic-modal-content').modal();

        //$('#basic-modal-content').modal({modal:false, overlayClose:true, opacity:100, position:[10,10], onShow: function (dialog) {
//    	    dialog.container.draggable();
  //      } });

$("#basic-modal-content").modal({
    modal:false, 
    overlayClose:true,
    onOpen: function (dialog) {
    	dialog.overlay.fadeIn('slow', function () {
    		dialog.data.hide();
	    	dialog.container.fadeIn('slow', function () {
    			dialog.data.slideDown('slow');
	    	});
    	});
    },

    onShow: function (dialog) {
        $(dialog.container).draggable();
    },

    onClose: function (dialog) {
    	dialog.data.fadeOut('slow', function () {
    		dialog.container.hide('slow', function () {
    			dialog.overlay.slideUp('slow', function () {
    				$.modal.close();
	    		});
    		});
	    });
    }
});

		return false;
	});
});
