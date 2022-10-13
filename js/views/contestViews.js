/* global define */
define([
    "jquery",
    "bootstrap",
    "backbone",
    "text!app/templates/contest.html",
    "app/utils/helper",
    "app/utils/config"
], function ($, Bootstrap, Backbone, ContestTemplate, Helper, Config) {
    "use strict";

    $(document.body).append(ContestTemplate);
    var effect = Config.contestDisplayEffect;

    var Views = {};

    Views.ContestResultCollectionView = Backbone.View.extend({
        el: "#contests",
        initialize: function (props) {
            this.$el.empty();
            this.updated = props.updated;
        },
        render: function () {
            if (effect > 0) {
                this.$el.hide("fast");
            }
            this.collection.each(function (model) {
                if (!(Config.showPinnedContest && Config.pinnedContestID === model.get("id"))) {
                    var contestResultView = new Views.ContestResultView({ model: model });
                    this.$el.append(contestResultView.render().el);
                }
            }, this);

            if (effect === 1) {
                this.$el.slideDown("slow");
            } else if (effect === 2) {
                this.$el.fadeIn("fast");
            }

            return this;
        }
    });

    Views.PinnedContestResultView = Backbone.View.extend({
        el: "#pinnedContest",
        render: function () {
            var contestResultView = new Views.ContestResultView({ model: this.model });
            this.$el.append(contestResultView.render().el);
        }
    });

    Views.ContestResultView = Backbone.View.extend({
        className: "contestResult",
        events: {
            "click .contest-back": "onContestButtonClick"
        },
        render: function () {
            this.$el.append(Helper.template("divContestsTemplate", this.model.toJSON()));
            this.renderChoiceResults();
            return this;
        },

        renderChoiceResults: function () {
            var choiceResultView = new Views.ChoiceResultCollectionView({
                collection: this.model.choiceResultsCollection,
                acclaimed: this.model.get("isAcclaimed")
            });
            this.$el.find("table").append(choiceResultView.render().el);
        },
        onContestButtonClick: function (evt) {
            this.switchArrowImageDirection(evt.currentTarget);
        },
        switchArrowImageDirection: function (target) {
            $(target)
                .find("span")
                .toggleClass("glyphicon-chevron-down")
                .toggleClass("glyphicon-chevron-up")
                .toggleClass("text-danger");

            //$(target).toggleClass('contest-arrowDown');
            //$(target).toggleClass('contest-arrowUp');
        }
    });

    Views.ChoiceResultCollectionView = Backbone.View.extend({
        tagName: "tbody",
        initialize: function (props) {
            this.acclaimed = props.acclaimed;
        },
        render: function () {
            this.collection.each(function (model) {
                var contestResultView = new Views.ChoiceResultView({ model: model });
                this.$el.append(contestResultView.render(this.acclaimed).el);
            }, this);
            return this;
        }
    });

    Views.ChoiceResultView = Backbone.View.extend({
        tagName: "tr",

        events: {
            "click .partyButton": "showPartyVotes"
        },
        render: function (acclaimed) {
            //            var viewID = "party_"+this.cid;
            //
            //            if( this.model.get('isWinner') === 1 ){
            //                this.$el.addClass('winner');
            //            }
            //
            //            this.$el.append(Helper.template('trChoicesTemplate', this.model.toJSON()));

            var viewID = "party_" + this.cid;
            var incumbent = !!this.model.get("isIncumbent");
            var disabled = !!this.model.get("isDisabled");

            if (this.model.get("isWinner") === 1) {
                this.$el.addClass("winner");
            }

            var templateType = "";

            if (acclaimed) {
                templateType = "trAccalimedChoicesTemplate";
            } else {
                templateType = "trChoicesTemplate";
            }

            this.$el.append(Helper.template(templateType, this.model.toJSON()));

            if (this.model.attributes.partyBreakdown.length > 0 && Config.showPartyVotes) {
                this.$el
                    .find(".partyButton")
                    .css("display", "inline")
                    .attr("data-target", "#" + viewID);
                var partyCollection = new Backbone.Collection(this.model.attributes.partyBreakdown);
                var partyCollectionView = new Views.PartyCollectionView({
                    collection: partyCollection
                });
                this.$el.find(".choiceName").append(partyCollectionView.render(viewID).el);
            }

            if (Config.showChoiceVotesPercentageBar) {
                var columnToShowPercentageBar =
                    Config.columnToShowPercentageBar === 1 ? ".choiceName" : ".percentages";
                if (this.model.get("percentage").substr(0, 1) !== "0") {
                    this.$el
                        .find(columnToShowPercentageBar)
                        .append(Helper.template("choiceProgressBarTemplate", this.model.toJSON()));
                    var $progressObj = this.$el.find(".progress-bar");
                    var percent = $progressObj.attr("aria-valuenow");
                    percent = percent.substring(0, percent.length - 1);
                    this.$el.find(".progress-bar").attr("aria-valuenow", percent);
                }
            }

            return this;
        },
        showPartyVotes: function (evt) {
            this.switchArrowImageDirection(evt.currentTarget);
        },
        switchArrowImageDirection: function (target) {
            $(target).find("span.glyphicon").toggleClass("glyphicon-chevron-down");
            $(target).find("span.glyphicon").toggleClass("glyphicon-chevron-up");
        }
    });

    Views.PartyCollectionView = Backbone.View.extend({
        render: function (viewID) {
            this.$el.append(Helper.template("divPartiesTemplate"));
            this.$el.addClass("partyBlock pull-right collapse").attr("id", viewID);
            this.collection.each(function (model) {
                var partyResultView = new Views.PartyResultView({ model: model });
                this.$el.find("tbody").append(partyResultView.render().el);
            }, this);
            return this;
        }
    });

    Views.PartyResultView = Backbone.View.extend({
        tagName: "tr",

        render: function () {
            this.$el.append(Helper.template("trPartyTemplate", this.model.toJSON()));
            return this;
        }
    });

    return Views;
});
