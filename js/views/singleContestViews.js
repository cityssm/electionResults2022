/* global define */
define([
    "jquery",
    "bootstrap",
    "underscore",
    "backbone",
    "app/utils/helper",
    "app/utils/config"
], function ($, Bootstrap, _, Backbone, Helper, Config) {
    "use strict";
    var effect = Config.contestDisplayEffect;

    var Views = {};

    Views.ContestResultCollectionView = Backbone.View.extend({
        el: Config.isContestDisplayInModalDialogue ? "#modalContest" : "#contests",

        initialize: function (props) {
            this.$el.empty();
            this.updated = props.updated;
        },

        render: function () {
            if (effect > 0) {
                this.$el.hide("fast");
            }
            var contestResultView = new Views.ContestResultView({ model: this.model });
            this.$el.append(contestResultView.render().el);

            if (Config.isContestDisplayInModalDialogue) {
                $("#contestModal").modal({ keyboard: true });
                $(".modal-title").text($("#selectedAreaTitle").text());
            }

            if (effect === 1) {
                this.$el.slideDown("slow");
            } else if (effect === 2) {
                this.$el.fadeIn("fast");
            }

            if (this.updated) {
                this.updated = false;
            }

            return this;
        }
    });

    Views.PinnedContestResultCollectionView = Backbone.View.extend({
        el: "#pinnedContest",

        //        events: {
        //            "click .singleContestHeader": "switchPinnedContestDisplay",
        //            "mouseover .singleContestHeader>span": "switchPinIcon",
        //            "mouseleave .singleContestHeader>span": "switchExitIcon"
        //        },
        //        switchPinnedContestDisplay: function(event){
        //            if(Config.showPinnedContest){
        //                Config.showPinnedContest = false;
        //                this.$el.remove();
        //                this.$contests.removeClass("col-md-6").addClass("col-md-12");
        //            }
        //        },
        //        switchPinIcon: function(event) {
        //            var $target = $(event.target);
        //            $target.removeClass('glyphicon-pushpin');
        //            $target.addClass('glyphicon-remove');
        //        },
        //        switchExitIcon: function(event) {
        //            var $target = $(event.target);
        //            $target.addClass('glyphicon-pushpin');
        //            $target.removeClass('glyphicon-remove');
        //        },
        initialize: function (props) {
            this.$el.empty();
            this.updated = props.updated;
            if (Helper.getScreenWidth() > Helper.MobileBreakpoint) {
                this.$contests = this.$el.parent().find("#contests");
                if (!this.$contests.hasClass("col-md-6")) {
                    this.$contests.addClass("col-md-6");
                }
                if (!this.$el.hasClass("col-md-6")) {
                    this.$el.addClass("col-md-6");
                }
            }
            //this.$el.append(Helper.template('pinnedContestTemplate'));
        },

        render: function () {
            if (effect > 0) {
                this.$el.hide("fast");
            }
            var contestResultView = new Views.ContestResultView({ model: this.model });
            this.$el.append(contestResultView.render().el);
            //            this.$el.find('.singleContestHeader').css( 'cursor', 'pointer');
            //this.$el.find('.singleContestHeader>span').addClass('text-danger glyphicon glyphicon glyphicon-pushpin pull-right').css( 'cursor', 'pointer');

            if (effect === 1) {
                this.$el.slideDown("slow");
            } else if (effect === 2) {
                this.$el.fadeIn("fast");
            }

            //if(this.updated){
            //Helper.addAndRemoveUpdateAlert(this.$el);
            //}
            if (!Config.isContestPinnedLeft) {
                this.$el.insertAfter("#contests");
            }

            return this;
        }
    });

    Views.ContestResultView = Backbone.View.extend({
        className: "contestResult",
        render: function () {
            this.$el.append(Helper.template("divSingleContestsTemplate", this.model.toJSON()));
            if (Config.isContestListVisible) {
                this.$el.find("button > span").removeClass();
            }
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
        }
    });

    Views.ChoiceResultCollectionView = Backbone.View.extend({
        tagName: "tbody",
        initialize: function (props) {
            this.acclaimed = props.acclaimed;
        },
        render: function () {
            this.collection.each(function (model) {
                //console.log('acclaimed: '+this.acclaimed);
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
                //                if(disabled && Config.showDisabled){
                //                    templateType = 'trDisabledChoicesTemplate';
                //                }else {
                //                    templateType = 'trChoicesTemplate';
                //                }
                templateType = "trChoicesTemplate";
            }

            this.$el.append(Helper.template(templateType, this.model.toJSON()));

            if (this.model.attributes.partyBreakdown.length > 0 && Config.showPartyVotes) {
                this.$el
                    .find(".partyButton")
                    .css("display", "inline")
                    .attr("data-target", "#" + viewID);
                //this.$el.append(this.model.get("choiceName"));
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
