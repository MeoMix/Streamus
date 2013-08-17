define([
    'user'
], function (User) {
    'use strict';

    return function (config) {
        
        var contentHeader = $(config.selector);

        var headerTitle = $('<span/>', {
            'class': 'headerTitle'
        }).appendTo(contentHeader);

        var headerInput = $('<input/>', {
            'class': 'headerInput',
            type: 'text',
            value: User.get('folders').getActiveFolder().getActivePlaylist().get('title'),
            
            on: {
                
                input: function () {
                    User.get('folders').getActiveFolder().getActivePlaylist().set('title', $(this).val());
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

        var playlists = User.get('folders').getActiveFolder().get('playlists');
        playlists.on('change:title', function(playlist, playlistTitle) {
            headerInput.val(playlistTitle);
        });

        playlists.on('change:active', function (playlist, isActive) {
            
            if (isActive) {
                headerInput.val(playlist.get('title'));
            } else {
                headerInput.val('No Playlist Selected');
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