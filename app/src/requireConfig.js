/*globals require*/
require.config({
    shim: {

    },
    paths: {
        famous: '../lib/famous',
        requirejs: '../lib/requirejs/require',
        almond: '../lib/almond/almond',
        'famous-datepicker': '../lib/famous-datepicker'
    },
    packages: [

    ]
});
require(['main']);
