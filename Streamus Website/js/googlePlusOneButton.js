$(function() {
    $('<script>', {
        async: true,
        src: 'https://apis.google.com/js/plusone.js',
    }).insertBefore($('script:first'));
});