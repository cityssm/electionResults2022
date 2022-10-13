/* global define, require, requirejs */
requirejs.config({
    locale: "en",
    baseUrl: "js/libs",
    paths: {
        jquery: "jquery-1.11",
        underscore: "underscore-min",
        backbone: "backbone",
        bootstrap: "bootstrap.min",
        app: ".."
    },
    shim: {
        underscore: {
            deps: [],
            exports: "_"
        },
        backbone: {
            deps: ["jquery", "underscore"],
            exports: "Backbone"
        },
        bootstrap: {
            deps: ["jquery"],
            exports: "Bootstrap"
        }
    }
});

require(["app/app"]);
