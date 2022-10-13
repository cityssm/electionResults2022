/* global define */
define([
    "backbone",
    "jquery",
    "underscore",
    "app/collections/areatypeCollections",
    "app/utils/config",
    "app/utils/helper",
    "text!app/templates/error.html"
], function (Backbone, $, _, areaTypeCollections, Config, Helper, ErrorTemplate) {
    "use strict";

    var Router = Backbone.Router.extend({
        routes: {
            "at/:atid/ar/:arid/(ct/:ctid)": "areaAndContest",
            home: "initRoute"
        },
        initialize: function () {
            window.routerStatus = "init";
            $(document.body).append(ErrorTemplate);
            this.initRoute();
            if (Config.languages.length > 1) {
                setTimeout(addLanguageSelectionMenu, 1000);
            }
        },

        initRoute: function () {
            //if(Backbone.history.fragment !== '' && Config.isAreaTypeMenuVisible){
            if (Backbone.history.fragment !== "") {
                Helper.parseRoute(Backbone.history.fragment);
            } else {
                window.lastRoute = Backbone.history.fragment;
            }

            //init language resources
            Helper.loadLanguagePack();

            if (window.areaTypeID === "" && window.areaID === "") {
                Helper.alertMessage("errorInvalid", "Invalid Route");
            }

            var areaTypeCollection = new areaTypeCollections.AreaTypeCollection();

            if (Config.isAreaTypeMenuVisible) {
                $("#areatypes").show("fast");
            }

            window.$reloadBar = $(".reloadBar");
            window.$counter = $("#counter");
            window.$contests = $("#contests");
            window.appState = "init";
        },
        areaAndContest: function (atid, arid, ctid) {
            if (Helper.isLoopActive) {
                return;
            }

            window.areaTypeID = atid;
            window.areaID = arid;
            window.contestID = ctid;

            //TODO: define case if the areatype is already selected, skip this trigger
            //if(Helper.checkUpValue(atid) && !checkTheRouteElement(0, atid)) {
            if (Helper.checkUpValue(atid)) {
                $("div.areaType_nav")
                    .find("#" + atid)
                    .trigger("click");
            }

            if (Helper.checkUpValue(arid)) {
                $("#arearesults" + arid + " > a").trigger("click");
            }

            if (Helper.checkUpValue(ctid)) {
                $("#contest" + ctid + " > a").trigger("click");
            }
            console.log("area and contest");
            window.appState = "routed";
        }
    });

    //check if the route element has the same value as in the previous history fragment
    function checkTheRouteElement(id, element) {
        var isTheSame = false;
        switch (element) {
            case "atid":
                isTheSame = window.lastRoute[0] === id;
                break;
            case "arid":
                isTheSame = window.lastRoute[1] === id;
                break;
            case "ctid":
                isTheSame = window.lastRoute[2] === id;
                break;
            default:
                isTheSame = false;
        }
        return isTheSame;
    }

    function addLanguageSelectionMenu() {
        var languages = Config.languages;
        var $lang_menu = $("#lang_selection");
        $lang_menu.addClass("languageSelection");
        $lang_menu.append('<img src="images/flagmini.png"/>');
        var aStart = '<a href="#">';
        var aStartSelected = '<a href="#" class="selectedLanguage">';
        var isFirst = true;
        var aEnd = "</a>";
        var separator = " | ";

        for (var i = 0; i < languages.length; i++) {
            if (languages[i] === Config.defaultLanguage) {
                $lang_menu.append(separator + aStartSelected + languages[i] + aEnd);
            } else {
                $lang_menu.append(separator + aStart + languages[i] + aEnd);
            }

            isFirst = false;
        }
        $lang_menu.addClass("animated bounceInLeft");
        $lang_menu.find("a").on("click", manageLanguageMenu);
    }

    function manageLanguageMenu(event) {
        if ($(event.currentTarget).hasClass("selectedLanguage")) {
            Helper.isLanguageChanged = false;
            return;
        }
        manageLanguageMenuLinks(event.currentTarget);
        Helper.DefaultLanguage = event.currentTarget.innerHTML;
        Helper.isLanguageChanged = true;
        Helper.loadLanguagePack();
    }

    function manageLanguageMenuLinks(target) {
        var $target = $(target);
        var langLinkCollection = $target.parent().find("a");
        $.each(langLinkCollection, function (index, element) {
            if (element === target) {
                $target.addClass("selectedLanguage");
            } else {
                $(element).removeClass("selectedLanguage");
            }
        });
    }

    Backbone.history.start();
    //Helper.ManageElementsVisibility($("#electionTitles"), "titlesBlock");
    //console.log("History = " +Backbone.history);
    //Backbone.history.loadUrl(Backbone.history.fragment);
    window.appRouter = new Router();
    Helper.ManageVisibility();

    return window.appRouter;
});
