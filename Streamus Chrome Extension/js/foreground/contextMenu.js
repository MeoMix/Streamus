//  Responsible for showing options when interacting with a video list or play list
define(function(){
	'use strict';
	var selector = $('#ContextMenu');

	//  Hide the context menu whenever any click occurs not just when selecting an item.
	$(document).on('click contextmenu', function () {
		selector.offset({top:0, left:0}).hide();
	});

	return {
		empty: function(){
			selector.empty();
		},
		addContextMenuItem: function(text, isDisabled, onClick){
		    var contextMenuItem = $('<a/>', {
		        href: '#',
		        text: text,
		        'class': 'contextMenuItem',
		        click: onClick
		    });
		    
		    contextMenuItem.appendTo(selector);
		    contextMenuItem.attr('disabled', isDisabled);
		    //  TODO: Fix name if I want to disable other things.. being lazy.
		    contextMenuItem.attr('title', 'This is your last Playlist, so you can\'t delete it');

		},
		show: function(top, left){
			//  Don't allow the context menu to display off the document viewport.
			var needsVerticalFlip = top + selector.height() > $(document).height();
			if(needsVerticalFlip){
				top = top - selector.height();
			}

			var needsHorizontalFlip = left + selector.width() > $(document).width();
			if(needsHorizontalFlip){
				left = left - selector.width();
			}

			selector.offset({
				top: top,
				left: left
			}).show();
		}
	};
});

