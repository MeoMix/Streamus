//  Responsible for showing options when interacting with a video list or play list
define(function(){
	'use strict';
    var contextMenu = $('<div>', {
        id: 'ContextMenu'
    });

	//  Hide the context menu whenever any click occurs not just when selecting an item.
    $(document).on('click contextmenu', function () {
        contextMenu.empty().remove();
	});

    return {
        remove: function() {
            contextMenu.empty().remove();
        },

		addContextMenuItem: function (config) {
		    
		    var contextMenuItemConfig = $.extend({}, {
		        href: '#',
		        text: '',
		        'class': 'contextMenuItem',
		        disabled: false,
		        title: ''
		    }, config);
	
		    $('<a/>', contextMenuItemConfig).appendTo(contextMenu);
		},
		
		show: function (top, left) {
		    contextMenu.appendTo('body');

			//  Don't allow the context menu to display off the document viewport.
		    var needsVerticalFlip = top + contextMenu.height() > $(document).height();
			if(needsVerticalFlip){
			    top = top - contextMenu.height();
			}

			var needsHorizontalFlip = left + contextMenu.width() > $(document).width();
			if(needsHorizontalFlip){
			    left = left - contextMenu.width();
			}
		    
			contextMenu.offset({
				top: top,
				left: left
			});
		}
	};
});

