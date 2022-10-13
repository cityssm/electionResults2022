/* global define */
define (["jquery", "underscore", "backbone",
    "text!app/templates/areatype.html", "app/collections/areaCollections",
    "app/utils/helper", "app/utils/config"],
    function($, _, Backbone, AreaTypeTemplate, AreaCollections, Helper, Config){
        "use strict";

        $(document.body).append(AreaTypeTemplate);

        var Views = {};
        var $areaTypes = $('#areatypes');

        if(Config.isAreaTypeMenuVisible){
            Views.isAreaTypeMenuOpen = false;
            Views.$selectedAreaTypeName = $('#selectedAreaTypeTitle');
            //tab element appears after hiding the area type menu
            $('#menu_tab').append('<a href="#" class="animated bounceInLeft"><img src="images/btnareatype.png"/></a>');

        }else{
            //TODO : define hiding of the area type menu
            $areaTypes.hide('fast');
        }

        Views.CloseAreaTypeMenu = function(){
            if(Views.isAreaTypeMenuOpen){
                setTimeout(function(){
                    Views.onClickButtonAreaTypeMenuShow();
                    Views.isAreaTypeMenuOpen = false;
                }, Config.delayClosingAreaType);
            }
        };

        Views.onClickButtonAreaTypeMenuShow = function()
        {
            $('#menu_tab').toggle();
            $('body').toggleClass('cbp-spmenu-push-toright');
            $areaTypes.toggleClass("cbp-spmenu-open");
            (Views.isAreaTypeMenuOpen) ? Views.isAreaTypeMenuOpen = false : Views.isAreaTypeMenuOpen = true;

        };

        Views.AreaTypeCollectionView = Backbone.View.extend({
            el: "#areatypes",
            events:
            {
                "mouseover #menu_tab > a": "showAreaTypeMenu",
                "click #menu_tab > a": "showAreaTypeMenu",
                "mouseleave .areaType_nav": "leaveAreaTypeMenu",
                "touchleave .areaType_nav": "leaveAreaTypeMenu"

            },
            initialize: function(){
                //this.model.bind('error', function(model, error){ Helper.alertMessage(model); Helper.alertMessage(error); });
            },
            showAreaTypeMenu: function(evt){
                evt.preventDefault();
                Views.onClickButtonAreaTypeMenuShow();
            },
            leaveAreaTypeMenu: function(evt){
                evt.preventDefault();
                //var $target = $(evt.currentTarget);
                if($areaTypes.hasClass('cbp-spmenu-open')){
                    console.log('left area type menu');
                    Views.onClickButtonAreaTypeMenuShow();
                }
            },
            render: function(){
                var $areaTypeMenu = this.$el.find("div.areaType_nav");
                var defaultAreaTypeID = '';
                this.collection.each(function(model){
                    if(model.get('hasContests')) {
                        var areaTypeListView = new Views.AreaTypeListView({model: model});
                        $areaTypeMenu.append(areaTypeListView.render().el);
                    }
                    if(model.get('showByDefault')){
                        defaultAreaTypeID = model.get('id');
                    }
                },this);


                if(Backbone.history.fragment === ''){

                    if(defaultAreaTypeID !== ''){
                        this.$el.find("#"+defaultAreaTypeID).trigger('click');
                    }else{
                        //in case of neither one areatype is set to showByDefault to true
                        this.$el.find('a').first().trigger('click');
                    }

                }else {
                    var $targetAreaType = this.$el.find("#"+window.areaTypeID);
                    if($targetAreaType.length > 0) {
                        $targetAreaType.trigger('click');
                    }else{
                        if(defaultAreaTypeID !== ''){
                            this.$el.find("#"+defaultAreaTypeID).trigger('click');
                        }else{
                            Helper.alertMessage('errorInvalid', 'Invalid ID');
                        }
                    }
                }

                this.controlsMenuView = new Views.ControlsCollectionView();
                this.controlsMenuView.render();

                return this;
            }

        });

        Views.AreaTypeListView = Backbone.View.extend({
            tagName: "a",
            events: {
                "click": "onDisplayAreaList"
            },
            onDisplayAreaList: function(event){
                var $target = $(event.currentTarget);
                Helper.stopLoopOnClick($target.hasClass('loop'));
                if(!$target.hasClass('selected')) {
                    if (Config.isAreaTypeMenuVisible) {
                        Views.$selectedAreaTypeName.text($target.text());
                    }
                    Views.displayAreaList($target);
                    Views.CloseAreaTypeMenu();
                }
            },
            render: function(){
                this.$el.append(Helper.template('areaTypeListTemplate', this.model.toJSON()))
                    .attr('href', '#at/'+this.model.get('id')+"/")
                    .attr('id', this.model.get('id'))
                    .addClass('');

                return this;
            }
        });

        Views.displayAreaList = function($target){
            toggleSelected($target);
            //ready to display arealist
            var $ulAreaList = $('ul.areaListGroup');
            $ulAreaList.empty();
            $('#contests').empty();

            var showAreaListWithThisID = $target.attr('id');
            //window.appRouter.navigate($target.attr('href'));
            if(!Helper.checkUpValue(Views.areaCollection)) {
                Views.areaCollection = new AreaCollections.AreaCollection({
                    url: Config.defaultURLprefix + Config.defaultAreaListFileName + '.json',
                    areatypeID: showAreaListWithThisID
                });
                Views.areaCollection.fetchData();
            }else{
                Views.areaCollection.addView(showAreaListWithThisID);
            }


            function toggleSelected ($target){
                //mark badge as a selected
                $target.find('.badge').toggleClass('badge-selected');

                //unmark previously selected
                $target.parent()
                    .find('a.selected')
                    .removeAttr('class')
                    .find('.badge')
                    .toggleClass('badge-selected');
                //add selected
                $target.toggleClass('selected');
            }

        };

        Views.ControlsCollectionView = Backbone.View.extend({
            el:'#menu_control',

            initialize: function(){
                this.$el.empty();
            },

            events:{
                "click #loopButton": "changeLoopButtonState"
            },

            changeLoopButtonState: function(evt){
                evt.preventDefault();
                var $target = $(evt.currentTarget);

                if ($target.attr('id') === 'loopButton') {
                    if ($target.hasClass('active')) {
                        Helper.loop(false);
                    } else {
                        Helper.loop(true);
                    }
                }
            },

            render: function(){
                this.$el.append(Helper.template('controlGroupTemplate'));
                this.$el.delay('500').css('display', 'block').addClass('animated bounceInLeft');
                window.$loopButton = this.$el.find('#loopButton');

                if(!Config.showLoopButton){
                    window.$loopButton.remove();
                }

                return this;
            }
        });




        return Views;

});