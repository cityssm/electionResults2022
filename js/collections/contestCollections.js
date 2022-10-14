/* global define, console */
define([
    "jquery",
    "underscore",
    "backbone",
    "app/views/contestViews",
    "app/views/contestListViews",
    "app/views/singleContestViews",
    "app/views/areaStatisticsViews",
    "app/utils/config",
    "app/utils/helper"
], function (
    $,
    _,
    Backbone,
    Views,
    ContestListViews,
    SingleContestView,
    AreaStatistics,
    Config,
    Helper
) {
    "use strict";

    var Models = {};
    var Collections = {};
    var Timestamp = "";
    var URL = "";
    var selectedAreaID = "";
    var pinnedResultsCollections = "";
    var pinnedContestErrors = "";
    var reloadInterval = 0;

    Models.StatisticsModel = Backbone.Model.extend({
        parse: function (response) {
            if (_.has(response, "areaResults")) {
                var areaResults = response.areaResults;

                if (!_.has(this, "areaResults")) {
                    //console.log('Timestamp = '+Timestamp+" response.Timestamp = "+response.statistics.timeStamp);
                    if (Timestamp !== response.statistics.timeStamp) {
                        this.areaResultsCollections = new Collections.AreaResultsCollection(
                            areaResults
                        );
                    }
                } else {
                    this.areaResultsCollections.reset(areaResults);
                }

                delete response.areaResults;
            }

            return response;
        }
    });

    Collections.StatisticsCollection = Backbone.Collection.extend({
        model: Models.StatisticsModel,

        initialize: function (props) {
            selectedAreaID = props.selectedAreaID;
            URL = props.url;
            this.url = URL + Helper.randomTimestamp();
            //this.url = URL+Helper.randomTimestamp();
        },

        onErrorHandler: function (collection, response) {
            var errorMessage = "error" + response.status;
            Helper.alertMessage(
                errorMessage,
                "Arearesults (ContestCollection) " +
                    response.status +
                    " (" +
                    response.statusText +
                    ")"
            );
        },

        onCompleteHandler: function (xhr, textStatus) {
            //console.log("Status " + textStatus);
        },

        addView: function () {
            var areaReportModel = new Backbone.Model(this.models[0].attributes.statistics);
            if (Timestamp !== areaReportModel.attributes.timeStamp) {
                var areaReportView = new AreaStatistics.AreaReportView({ model: areaReportModel });
                areaReportView.render();
                areaReportView.renderLocalStats(Models.LocalStatsModel);
                Timestamp = areaReportModel.attributes.timeStamp;
            }
        },

        checkForUpdate: function (options) {
            this.stopUpdate();
            //var updateMe = _.bind(function(interval, contestObj) {
            var updateMe = _.bind(function () {
                this.url = URL + Helper.randomTimestamp();
                this.fetch({
                    reset: true,
                    update: true,
                    error: this.onErrorHandler,
                    complete: this.onCompleteHandler
                });
                this.on("reset", this.addView);
                this.reloadingTimer(options.interval || 10000);
                this._intervalFetch = window.setTimeout(updateMe, options.interval || 10000);
            }, this);
            updateMe();
        },

        stopUpdate: function () {
            if (!_.isUndefined(this._intervalFetch)) {
                window.clearTimeout(this._intervalFetch);
                delete this._intervalFetch;

                Timestamp = "";
            }
        },

        reloadingTimer: function (periodLength) {
            clearInterval(reloadInterval);

            var $reloadBar = window.$reloadBar;
            var $counter = window.$counter;
            $reloadBar.removeClass("progress-bar-danger").addClass("progress-bar-info");
            periodLength = periodLength / 1000;

            var counter = 0;
            var stop = Config.reloadingPeriod;
            var redZone = Math.floor((periodLength / 3) * 2);
            //console.log('redZone = '+redZone);
            $reloadBar.css("width", counter);
            $reloadBar.attr("aria-valuenow", "0");
            $reloadBar.attr("aria-valuemin", "0");
            $reloadBar.attr("aria-valuemax", stop);
            $reloadBar.html("<span class=\"sr-only\">0% Complete</span>");

            if (Helper.isLoopActive) {
                $counter.text("");
                return;
            }

            reloadInterval = setInterval(function () {
                var w = Math.floor((counter / stop) * 100);
                if (counter > redZone) {
                    $reloadBar.removeClass("progress-bar-info").addClass("progress-bar-danger");
                }

                $reloadBar.css("width", w + "%");
                $reloadBar.attr("aria-valuenow", (counter + 1));
                $reloadBar.html("<span class=\"sr-only\">" + w + "% Complete</span>");
                
                $counter.text(stop - counter - 1 + " s");
                if (counter > stop) {
                    counter = 0;
                    clearInterval(reloadInterval);
                } else {
                    counter++;
                }
            }, 1000);
        }
    });

    Models.AreaResultsModel = Backbone.Model.extend({
        initialize: function (response) {
            if (Config.showPinnedContest) {
                var pinnedAreaID = Config.pinnedAreaID;
                if (_.has(response, pinnedAreaID)) {
                    var pinnedAreaResults = $.extend(
                        true,
                        {},
                        response[pinnedAreaID].contestResults
                    );
                    var pinnedContestModel = _.findWhere(pinnedAreaResults, {
                        id: Config.pinnedContestID
                    });
                    if (pinnedContestModel === undefined) {
                        pinnedContestErrors = "Pinned ContestID Error";
                    }
                    Models.pinnedContestModel = new Backbone.Model(pinnedContestModel);
                    Models.pinnedContestModel.choiceResultsCollection =
                        new Collections.ChoiceResultCollection(
                            Models.pinnedContestModel.attributes.choiceResults
                        );
                    pinnedResultsCollections = new Collections.PinnedContestResultCollection(
                        Models.pinnedContestModel
                    );
                    pinnedResultsCollections.addView();
                    pinnedAreaResults = null;
                } else {
                    pinnedContestErrors = "Pinned AreaID Error";
                }
            } else {
                pinnedContestErrors = "";
            }

            if (_.has(response, selectedAreaID)) {
                var selectedAreaResults = response[selectedAreaID];

                if (!_.has(this, selectedAreaID)) {
                    //local area eligible voters
                    if (Config.showEligibleVotersTitle) {
                        //$('#eligibleVotersTitle').empty().append(selectedAreaResults.statistics.eligibleVoters);
                        $("#eligibleVotersNumber")
                            .empty()
                            .append(selectedAreaResults.statistics.eligibleVoters);
                        Models.LocalStatsModel = new Backbone.Model(selectedAreaResults.statistics);
                    }
                    this.selectedAreaResultsCollections =
                        new Collections.SelectedAreaResultsCollections(selectedAreaResults);
                } else {
                    this.selectedAreaResultsCollections.reset(selectedAreaResults);
                }

                delete response[selectedAreaID];
            }

            return response;
        }
    });

    Collections.AreaResultsCollection = Backbone.Collection.extend({
        model: Models.AreaResultsModel
    });

    Models.SelectedAreaResultsModel = Backbone.Model.extend({
        initialize: function (response) {
            if (_.has(response, "contestResults")) {
                var contestResults = response.contestResults;

                if (!_.has(this, "contestResults")) {
                    this.contestResultCollections = new Collections.ContestResultCollection(
                        contestResults
                    );
                    this.contestResultCollections.addView();
                } else {
                    this.contestResultCollections.reset(contestResults);
                }

                delete response.contestResults;
            }

            return response;
        }
    });

    Collections.SelectedAreaResultsCollections = Backbone.Collection.extend({
        model: Models.SelectedAreaResultsModel
    });

    Models.ContestResultModel = Backbone.Model.extend({
        initialize: function (response) {
            if (_.has(response, "choiceResults")) {
                var choices = response.choiceResults;
                if (!_.has(this, "choiceResults")) {
                    this.choiceResultsCollection = new Collections.ChoiceResultCollection(choices);
                } else {
                    this.choiceResultsCollection.reset(choices);
                }

                delete response.choiceResults;
            }

            return response;
        }
    });

    Collections.ContestResultCollection = Backbone.Collection.extend({
        model: Models.ContestResultModel,
        addView: function () {
            if (this.length > 0) {
                var updated = Timestamp !== "";
                if (Config.isContestListVisible) {
                    ContestListViews.contestView = new ContestListViews.ContestListCollectionView({
                        collection: this,
                        updated: updated
                    });
                    ContestListViews.contestView.render();
                } else {
                    Views.contestView = new Views.ContestResultCollectionView({
                        collection: this,
                        updated: updated
                    });
                    Views.contestView.render();
                }
                if (pinnedContestErrors !== "") {
                    Helper.alertMessage("errorInvalid", pinnedContestErrors);
                }
                if (updated) {
                    Helper.addAndRemoveUpdateAlert(window.$contests);
                }
            }

            //start automatic loop only once
            if (Helper.checkOnceIfLoopIsSetOnAutomatic) {
                _.delay(function () {
                    if (Config.isAutoLoopOn) {
                        window.$loopButton.trigger("click");
                        var $backButton = $("#backButton");
                        $backButton.fadeOut("fast");
                    }
                }, 1000);
                Helper.checkOnceIfLoopIsSetOnAutomatic = false;
            }
        }
    });

    Collections.PinnedContestResultCollection = Backbone.Collection.extend({
        addView: function () {
            if (this.length > 0) {
                var updated = Timestamp !== "";
                //if(updated) {
                //Models.pinnedContestModel = this.findWhere({'id': Config.pinnedContestID});
                if (Helper.checkUpValue(Models.pinnedContestModel.get("id"))) {
                    var pinnedContestView = new SingleContestView.PinnedContestResultCollectionView(
                        { model: Models.pinnedContestModel, updated: updated }
                    );
                    pinnedContestView.render();
                }
                // }
            }
        }
    });

    Models.ChoiceResultModel = Backbone.Model.extend({});

    Collections.ChoiceResultCollection = Backbone.Collection.extend({
        model: Models.ChoiceResultModel,
        comparator: function (choices) {
            if (Config.sortByVotes) {
                return -choices.get("votes");
            }
        }
    });

    return Collections;
});
