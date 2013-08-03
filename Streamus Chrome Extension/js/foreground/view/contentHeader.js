define(['backgroundManager'], function (BackgroundManager) {
    'use strict';

    return function (config) {
        
        var contentHeader = $(config.selector);

        var headerTitle = $('<span/>', {
            'class': 'headerTitle'
        }).appendTo(contentHeader);

        var headerInput = $('<input/>', {
            'class': 'headerInput',
            type: 'text',
            value: BackgroundManager.get('activePlaylist').get('title'),
            
            on: {
                
                input: function () {
                    BackgroundManager.get('activePlaylist').set('title', $(this).val());
                },
                
                mouseover: function () {
                    $(this).css('border-color', '#EEE');
                },
                
                mouseout: function () {
                    //  Don't blur if they're trying to highlight some text to edit and go outside the bounds.
                    if (window.getSelection().toString() === '') {
                        $(this).blur();
                    }
                },
                
                blur: function () {
                    $(this).css('border-color', 'transparent');
                }
                
            }
        });

        headerInput.appendTo(headerTitle);
        
        BackgroundManager.get('allPlaylists').on('change:title', function (model, title) {
            headerInput.val(title);
        });

        BackgroundManager.on('change:activePlaylist ', function (model, activePlaylist) {
            
            if (activePlaylist === null) {
                headerInput.val('No Active Playlist');
            } else {
                headerInput.val(activePlaylist.get('title'));
            }

        });

        var addButton = $('<div/>', {
            'class': 'addButton',
            click: expand
        }).appendTo(contentHeader);
        
        //  jQuery does not support appending paths to SVG elements. You MUST declare element inside of svg's HTML mark-up.
        addButton.append('<svg id="addButtonSvg"><rect x="4.625" y="0" width="2.75" height="12"/><rect x="0" y="4.625" width="12" height="2.75"/></svg>');

        $('<span/>', {
            'class': 'addText',
            text: config.addText
        }).appendTo(addButton);

        var addInput = $('<input/>', {
            'class': 'addInput',
            type: 'text',
            maxlength: 255,
            placeholder: config.addInputPlaceholder
        }).appendTo(addButton);

        var addCancelIcon = $('<div/>', {
            'class': 'addCancelIcon',
            click: contract
        }).appendTo(addButton);
        
        //  jQuery does not support appending paths to SVG elements. You MUST declare element inside of svg's HTML mark-up.
        addCancelIcon.append('<svg id="addCancelIconSvg"><path d="M0,2 L2,0 L12,10 L10,12z"/><path d="M12,2 L10,0 L0,10 L2,12z"/></svg>');
        
        if (config.expanded) {
            expand();
        }
        
        function expand() {
            contentHeader.addClass('expanded');
            headerInput.attr('disabled', 'disabled');
            addInput.focus();
        }

        function contract() {
            contentHeader.removeClass('expanded');
            headerInput.removeAttr('disabled');
            addInput.val('').blur();

            //  Prevent click event from bubbling up so button does not expand on click.
            return false;
        }

        return {
            addInputElement: addInput
        };
    };
});