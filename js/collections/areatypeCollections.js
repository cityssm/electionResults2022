define([
    "backbone",
    "jquery",
    "underscore",
    "app/views/areatypeViews",
    "app/utils/config",
    "app/utils/helper"
], function (Backbone, $, _, Views, Config, Helper) {
    "use strict";

    var Models = {};
    var Collections = {};

    Models.AreatypeModel = Backbone.Model.extend({});

    Collections.AreaTypeCollection = Backbone.Collection.extend({
        model: Models.AreatypeModel,
        url: Config.defaultURLprefix + Config.defaultAreaTypeFileName + ".json",

        onErrorHandler: function (collection, response) {
            //var erroMessage = "error"+response.status;
            Helper.alertMessage(
                "initialStateNote",
                "Areatype " + response.status + " (" + response.statusText + ")"
            );
        },

        onCompleteHandler: function (xhr, textStatus) {
            //console.log("Status " + textStatus);
        },

        initialize: function () {
            this.url = this.url + Helper.randomTimestamp();
            this.fetch({
                reset: true,
                update: true,
                error: this.onErrorHandler,
                complete: this.onCompleteHandler
            });
            //this.fetch({ reset:true });
            this.on("reset", this.addView);
        },

        addView: function () {
            this.map(function (model) {
                Helper.AreatypesRelationDictionary[model.id] = model.attributes.parentid;
            });

            if (this.length > 0) {
                Views.areaTypeView = new Views.AreaTypeCollectionView({ collection: this });
                Views.areaTypeView.render();
            }
        }
    });

    return Collections;
});
