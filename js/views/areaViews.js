/* global define */
/* global js/utils */
define (["jquery", "bootstrap", "underscore", "backbone",
    "app/collections/contestCollections",
    "text!app/templates/area.html", "app/utils/helper", "app/utils/config"],
    function($, Bootstrap, _, Backbone, contestCollections, AreaTemplate, Helper, Config){

        'use strict';

        $(document.body).append(AreaTemplate);
        var mainLevelOpenObject = '';
        var subLevelsOpenObject = '';

        var Views = {};
        Views.selectedAreatypeID = '';
        Views.selectedAreaID = '';
        Views.contestResultCollection = '';
        var $areaListGroup = {};

        Views.AreaCollectionView = Backbone.View.extend({
            el: "#areas",
            events:{
                "click .btnBackToAreaList": "manageAreaListVisibility"
            },

            manageAreaListVisibility: function(event){
                var $target = $(event.currentTarget);
                $areaListGroup.show();
                $target.toggle();
            },
            render: function(){

                var effect = (Config.enterAreaListAnimation === 1) ? 'bounceInLeft' : 'flipInX';
                if (Config.isAreaListEnterAnimationRepeated){ this.$el.removeClass('animated '+effect);}

                var areaCollection = new Backbone.Collection(this.collection.where({areaTypeId:Views.selectedAreatypeID}));
                //this.collection.each(function(model){
                areaCollection.each(function(model){
                    if(model.get('hasContests')) {
                        var areaListView = new Views.AreaListView({model: model});
                        this.$el.find("ul.areaListGroup").append(areaListView.render().el);
                    }
                },this);

                $areaListGroup = this.$el.find("ul.areaListGroup");

                //if(!Helper.isLoopActive) {

                    Helper.parseRoute(Backbone.history.fragment);

                    if (!Helper.checkUpValue(window.areaID) || Backbone.history.fragment === '') {
                        //first time opening the app with no particular history fragment (route)
                        this.$el.find('a:eq(0)').trigger('click');
                    } else {
                        //routing without history's been used, but fragment has the address (an ext link or a bookmark)
                        var target = "#arearesults" + window.areaID + " > a";
                        var $target = $(target);
                        //check if area ID is valid and the first run
                        if ($target.length > 0 && window.routerStatus === 'init') {
                            window.routerStatus = '';
                            $target.trigger('click');
                        } else {
                            //show error if happens when loop is off
                            if(!Helper.isLoopActive){
                                Helper.alertMessage('errorInvalid', 'Invalid ID');
                            }
                            this.$el.find('a:eq(0)').trigger('click');
                        }
                    }
                //}

                if(Config.isAreaListVisible) {
                    if (Config.isAreaListEnterAnimated && Helper.getScreenWidth() > Helper.MobileBreakpoint) {
                        if(Config.enterAreaListAnimation !== 0) {
                            $areaListGroup.addClass('animated ' + effect);
                        }
                    }
                }else{
                    $areaListGroup.hide();
                }

                return this;
            }


        });



        Views.AreaListView = Backbone.View.extend({

            tagName: "li",
            className: "list-group-item",

            events:{
               "click a": "onAreaButtonClick"
            },
            onAreaButtonClick: function(evt, automate){

                evt.preventDefault();
                var target = evt.currentTarget;

                var $target = $(target);
                //Helper.stopLoopOnClick($target.hasClass('loop'));
                //CHECK sending isSubLevel value on check to Helper function disallows the sub areas
                //var isSubLevel = Helper.checkUpValue($target.closest('div').hasClass('subArea'));
                var isSubLevel = $target.closest('div').hasClass('subArea');
                var targetAreaID = $target.closest('div').attr('id');

                //if(subLevelsOpenObject !== target){
                if(Views.selectedAreaID !== targetAreaID ){
                        Views.areaButtonClick(target, isSubLevel);
                }

                //if (Helper.getScreenWidth() <= Helper.MobileBreakpoint) {
                if (Helper.getScreenWidth() < 992 && !Helper.isLoopActive) {
                    setTimeout(function(){
                        $areaListGroup.fadeOut('fast');
                        $areaListGroup.parent().find('.btnBackToAreaList').css('display', 'block');
                    },
                    800);
                }
            },

            addArrowsAndLinks: function(){

                Views.selectedAreaID = this.model.get('id');

                this.$el.find('a').attr('href', "#at/"+Views.selectedAreatypeID+"/ar/"+Views.selectedAreaID+ "/");
                //this.$el.find('a').attr('href', Backbone.history.fragment + "ar/"+Views.selectedAreaID+ "/");

                this.$el
                    .attr('id', "arearesults"+Views.selectedAreaID)
                    .attr('data-id', Views.selectedAreaID)
                    .attr('data-eligible', this.model.get('eligible'));

                //allow children/subarea to be attached to the parent area and displayed
                if(this.model.collection.length > 0 && Config.isChildAreaSubMenuVisible){
                    var showSubAreaMenu = false;
                    var subAreas = new Backbone.Collection(this.model.collection.where({parentAreaId:this.model.get('id')}));
                    subAreas.each(function(model){
                        if(model.get('hasContests')){
                            showSubAreaMenu = true;
                            return showSubAreaMenu;
                        }
                    });
                    //show Area SubMenu only if there's at least one subArea with hasContests = true
                    if(showSubAreaMenu) {
                        if (this.model.collection > 1){
                            this.$el.find('span').addClass("glyphicon glyphicon-chevron-down");
                        }
                        var subAreaCollectionView = new Views.SubAreaCollectionView({collection: subAreas});
                        this.$el.append(subAreaCollectionView.render().el);
                    }
                }

            },
            render: function(){
                this.$el.append(Helper.template('areaListItemTemplate', this.model.toJSON()));
                this.addArrowsAndLinks();

                return this;
            }

        });

        Views.showContestForSelectedArea = function(target){

            //var showResultsForAreaWithID = $(target).parent().attr('id');
            var showResultsForAreaWithID = $(target).parent().data('id');
            if ('' === window.areaID) {
                window.areaID = showResultsForAreaWithID;
            }
            var selectedAreaID = $(target).attr('href');
            var reloadingPeriod = Helper.CheckIntervalValues(Config.reloadingPeriod, 10, 120);
            var loopPeriod = Helper.CheckIntervalValues(Config.loopPeriod, 5, 60);

            var urlWithAreaResults = Config.defaultURLprefix + Config.defaultAreaResultsFileName+'.json';

            if(Views.contestResultCollection){
                Views.contestResultCollection.stopUpdate();
            }
            Views.contestResultCollection = new contestCollections.StatisticsCollection({url: urlWithAreaResults, selectedAreaID: showResultsForAreaWithID});
            Views.contestResultCollection.checkForUpdate({interval: reloadingPeriod});
            //Views.contestResultCollection.reloadingTimer();

            return selectedAreaID;
        };

        Views.areaButtonClick = function(target, isSubLevel){

            var $target = $(target);
            //direct call for subArea through the router
            var isSublevelOpen = (isSubLevel) ? $(target).closest('div').hasClass('sublevel-open'):true;

            var closeSublevel = function(){
                var openSublevel = $('ul.areaListGroup').find('div.sublevel-open');
                if(openSublevel.length > 0) { openSublevel.removeClass('sublevel-open').slideToggle(); }
            };

            var openTargetMainLevel = function(){
                $target.closest('div.subArea').addClass('sublevel-open').slideToggle();
            };

            var openTargetSublevel = function(){
                $target.closest('li').find('.subArea').addClass('sublevel-open').slideToggle();
                //$target.closest('li').find('.subArea').addClass('sublevel-open').slideToggle( function(){ animateSelection(); });
            };
            var switchArrowImageDirection = function(){

                if(mainLevelOpenObject === target){
                    return;
                }

                var i = 0, $thisTarget = '';

                if(mainLevelOpenObject !==''){
                    //fist round reset the previously rotated arrow, the second turns the new one
                    while(i<2){
                       $thisTarget = (i===0 && mainLevelOpenObject !=='') ? $(mainLevelOpenObject): $target;
                       switchArrowForTarget();
                       i++;
                    }
                }else{
                    $thisTarget =  $target;
                    switchArrowForTarget();
                }

                function switchArrowForTarget(){
                    if($thisTarget.find('span').hasClass('glyphicon')){
                        $thisTarget
                            .find('span')
                            .toggleClass('glyphicon-chevron-down')
                            .toggleClass('glyphicon-chevron-up')
                            .toggleClass('text-muted')
                            .toggleClass('text-danger');
                    }
                }
            };

            var animateSelection = function(){
                if(Config.areaListItemAnimation > 0){
                    var sublevel = (isSubLevel) ? "-sublevel":'';
                    var effect = (Config.areaListItemAnimation === 1) ? "bounce" : "flash";
                    var hasAnimationClass = $('ul.areaListGroup').find('li.animated');
                    if(hasAnimationClass.length > 0) { hasAnimationClass.removeClass().addClass('list-group-item'); }
                    $target.closest('li').addClass('animated '+effect+sublevel);
                }
            };

            var prepareContestForSelectedArea = function(){
                var selectedAreaID = Views.showContestForSelectedArea(target);
                window.appRouter.navigate(selectedAreaID);
            };

            var goToTop = function(){
                window.scrollTo(0,0);
            };

            if(!isSubLevel || !isSublevelOpen)
            {
                closeSublevel();
                (isSublevelOpen) ? openTargetSublevel(): openTargetMainLevel();
                switchArrowImageDirection();
            }

            animateSelection();
            prepareContestForSelectedArea();
            goToTop();

            (!isSubLevel) ? mainLevelOpenObject = target : subLevelsOpenObject = target;
//            $("#selectedAreaTitle > h3").text($target.text());
            $("#selectedAreaTitle h3").text($target.text());

        };

        Views.SubAreaCollectionView = Backbone.View.extend({
            className:"subArea",
            render: function(){
                this.$el.html('<ul class="list-group subareaListGroup"></ul>');
                this.collection.each(function(model){
                    if(model.get('hasContests')) {
                        var subAreaListView = new Views.SubAreaListView({model: model});
                        this.$el.find('ul').append(subAreaListView.render().el);
                    }
                    //this.$el.attr("id", "subArea"+model.get("id"));
                },this);
                //do not display this div at the beginning
                this.$el.hide();
                return this;
            }

        });

        Views.SubAreaListView = Backbone.View.extend({

            tagName: "li",
            className: "list-group-item",

            render: function(){
                this.$el.append(Helper.template('areaListItemTemplate', this.model.toJSON()));
                var selectedSubareaID = this.model.get('id');
                this.$el
                    .attr('data-id', selectedSubareaID)
                    //.attr('data-eligible', this.model.get('eligible'))
                    .attr('id', "arearesults"+selectedSubareaID);
                if (Views.selectedAreatypeID !== ''){
                    this.$el.find('a').attr('href', "#at/"+Views.selectedAreatypeID+"/ar/"+selectedSubareaID+ "/");
                }else{
                    this.$el.find('a').attr('href', "#area/"+selectedSubareaID);
                }
                return this;
            }
        });

        return Views;

    });
