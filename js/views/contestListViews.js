/* global define */
define([
    "jquery",
    "backbone",
    "app/views/singleContestViews",
    "app/views/contestViews",
    "text!app/templates/contest.html",
    "app/utils/helper",
    "app/utils/config"
], function ($, Backbone, SingleContestView, ContestView, ContestTemplate, Helper, Config) {
    "use strict";
    if (Config.isContestListVisible) {
        $(document.body).append(ContestTemplate);
        //adding template elements to host the Contest List
        //var position = Config.isContestDisplayInModalDialogue ? '#contests':'#areas';
        var position = "#areas";
        $(position).append(Helper.template("contestListTemplate"));
    }

    //adding modal dialogue
    if (Config.isContestDisplayInModalDialogue) {
        $("header").before(Helper.template("contestModalDialogueTemplate"));
    }

    var selectedContest = "";
    var activeContestListItemID = "";
    var $contestLabel = $(".titles");
    var Views = {};
    var Updated = false;

    Views.ContestListCollectionView = Backbone.View.extend({
        el: "ul.contestListGroup",
        initialize: function (props) {
            this.$el.empty();
            Updated = props.updated;
        },
        render: function () {
            Views.ContestResultCollection = this.collection;
            //All contest button will appear only if there are more than one contest in the list (collection)
            if (Config.isAllContestMenuItemVisible && Views.ContestResultCollection.length > 1) {
                var allContestModel = new Backbone.Model({
                    id: "000",
                    contestName: Helper.getTranslationFromResources("allContestsTitle"),
                    voteFor: "0",
                    isAcclaimed: false,
                    choiceResults: []
                });

                var contestListItemView = new Views.ContestListItemView({
                    model: allContestModel,
                    updated: Updated
                });
                this.$el.append(contestListItemView.renderAllContestItem().el);
            }

            this.collection.each(function (model) {
                contestListItemView = new Views.ContestListItemView({
                    model: model,
                    updated: Updated
                });
                this.$el.append(contestListItemView.render().el);
            }, this);

            if (this.collection.length > 1) {
                this.$el.show();
                $contestLabel.show();
            } else {
                this.$el.hide();
                $contestLabel.hide();
            }

            if (!Helper.checkUpValue(window.contestID)) {
                if (!Helper.isLoopActive) {
                    this.$el.find("a").first().trigger("click");
                }
            } else {
                //routing without history's been used, but fragment has the address
                var $target = {};
                if (Updated) {
                    $target = $("#" + activeContestListItemID + " >a");
                } else {
                    $target = $("#contest" + window.contestID + " > a");
                }

                if ($target.length > 0) {
                    $target.trigger("click");
                } else {
                    if (!Helper.isLoopActive) {
                        Helper.alertMessage("errorInvalid", "Invalid ID");
                    }
                    this.$el.find("a:eq(0)").trigger("click");
                }
            }

            //Tell Helper that results are updated
            Helper.isAreaResultUpdated = Updated;
            Updated = false;

            return this;
        }
    });

    Views.ContestListItemView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",

        events: {
            "click a": "onContestButtonClick"
        },
        onContestButtonClick: function (evt) {
            evt.preventDefault();
            var target = evt.currentTarget;

            if (selectedContest !== target) {
                var $target = $(target);
                //Helper.stopLoopOnClick($target.hasClass('loop'));
                var contestView = "";

                $target.closest("ul").find("li").removeClass("contestSelected");
                $target.parent().addClass("contestSelected");
                selectedContest = target;

                //update router only if the click is initiated by user, not timer
                if (!Updated) {
                    window.appRouter.navigate(this.$el.find("a").attr("href"));
                }
                if (this.model.get("id") === "000") {
                    contestView = new ContestView.ContestResultCollectionView({
                        collection: Views.ContestResultCollection,
                        updated: Updated
                    });
                } else {
                    contestView = new SingleContestView.ContestResultCollectionView({
                        model: this.model,
                        updated: Updated
                    });
                }
                activeContestListItemID = $target.parent().attr("id");
                contestView.render();
                Helper.localize();
            }
        },
        addAttributes: function () {
            Views.selectedContestID = this.model.get("id");
            //var currentAddress = Backbone.history.fragment;
            var fragment = Backbone.history.fragment;

            var cutPoint = fragment.indexOf("ct/");
            if (cutPoint > 0) {
                fragment = fragment.substring(0, cutPoint);
            }

            this.$el
                .attr("id", "contest" + Views.selectedContestID)
                .find("a")
                .attr("href", "#" + fragment + "ct/" + Views.selectedContestID);
        },
        renderAllContestItem: function () {
            this.$el.append(Helper.template("allContestListItemTemplate", this.model.toJSON()));

            this.addAttributes();

            return this;
        },
        render: function () {
            this.$el.append(Helper.template("contestListItemTemplate", this.model.toJSON()));

            this.addAttributes();

            return this;
        }
    });

    return Views;
});
