$(function() {
    $('<script>', {
        async: true,
        id: 'facebook-jssdk',
        src: '//connect.facebook.net/en_US/all.js#xfbml=1&appId=104501109590252',
    }).insertBefore($('script:first'));
});

