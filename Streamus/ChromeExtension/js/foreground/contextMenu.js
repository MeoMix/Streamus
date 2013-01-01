//Responsible for showing options when interacting with a song list or play list
define(function(){
	'use strict';
	var selector = $('#ContextMenu');

	//Hide the context menu whenever any click occurs not just when selecting an item.
	$(document).click(function(){
		selector.offset({top:0, left:0}).hide();
	});

	return {
		empty: function(){
			selector.empty();
		},
		addContextMenuItem: function(text, onClick){
			$('<a/>', {
				href: '#',
				text: text,
				click: onClick
			}).appendTo(selector);
		},
		show: function(top, left){
			//Don't allow the context menu to display off the document viewport.
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

