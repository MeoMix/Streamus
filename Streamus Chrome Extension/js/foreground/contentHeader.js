define(['backgroundManager'], function (backgroundManager) {
    'use strict';
    return function (config) {
        
        var contentHeader = $(config.selector);

        var headerTitle = $('<span/>', {
            'class': 'headerTitle'
        }).appendTo(contentHeader);

        var headerInput = $('<input/>', {
            'class': 'headerInput',
            type: 'text',
            value: backgroundManager.get('activePlaylist').get('title'),
            
            on: {
                
                input: function () {
                    backgroundManager.get('activePlaylist').set('title', $(this).val());
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
        
        backgroundManager.get('allPlaylists').on('change:title', function (model, title) {
            headerInput.val(title);
        });

        backgroundManager.on('change:activePlaylist ', function (model, activePlaylist) {
            headerInput.val(activePlaylist.get('title'));
        });

        var addButton = $('<div/>', {
            'class': 'addButton'
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
            'class': 'addCancelIcon'
        }).appendTo(addButton);
        
        //  jQuery does not support appending paths to SVG elements. You MUST declare element inside of svg's HTML mark-up.
        addCancelIcon.append('<svg id="addCancelIconSvg"><path d="M0,2 L2,0 L12,10 L10,12z"/><path d="M12,2 L10,0 L0,10 L2,12z"/></svg>');

        function expand() {
            addCancelIcon.css('right', '0px').one('click', contract);
            addButton.width('382');
            addInput.css('opacity', 1).css('cursor', "auto").focus();
            addButton.find('span').hide();
            headerInput.attr('disabled', 'disabled');
        }
        
        function contract() {
            addButton.find('span').show();
            headerInput.removeAttr('disabled');
            
            addButton.width('59px').one('click', expand);

            addCancelIcon.css('right', '-30px');
            addInput.css('opacity', 0).css('cursor', "pointer").val('').blur();

            //  Prevent click event from bubbling up so button does not expand on click.
            return false;
        }
        
        if (config.expanded) {
            expand();
        } else {
            contract();
        }

        return {
            expand: expand,
            contract: contract,
            addInputElement: addInput,
            
            //  Display a message for X milliseconds inside of the input. 
            flashMessage: function (message, durationInMilliseconds) {
                
                var placeholder = addInput.attr('placeholder');
                addInput.val('').attr('placeholder', message);
                
                window.setTimeout(function () {
                    addInput.attr('placeholder', placeholder);
                }, durationInMilliseconds);
                
            }
        };
    };
});