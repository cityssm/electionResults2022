/* global define */
define (["jquery", "backbone", "underscore", "app/utils/helper", "app/utils/config"],
    function($, Backbone, _, Helper, Config){

    "use strict";
    var $areaReport = $("#areaReport");
    var $eligibleGlobNumbers = $('#eligibleVotersGlobalNumber')
    //adding modal dialogue

    var screenWidth = Helper.getScreenWidth();

    if (screenWidth < 992) {
        if(!$areaReport.hasClass('collapse')) {
            $areaReport.addClass('moveReportDown collapse in');
        }
    }

    var Views = {};

    //Resize Window Event
    $(window).resize(_.debounce(function () {
        screenWidth = Helper.getScreenWidth();
        var $backButton = $('#backButton');
        var $areaListGroup = $('.areaListGroup');

        if (screenWidth >= Helper.MobileBreakpoint ) {
            if($areaReport.hasClass('moveReportDown')){$areaReport.removeClass('moveReportDown');}
            if($areaReport.hasClass('collapse')){$areaReport.removeClass('collapse');}
            if($areaReport.hasClass('in')){$areaReport.removeClass('in');}
            if($backButton.css('display') === 'block'){$backButton.fadeOut('fast');}
            if($areaListGroup.css('display') === 'none'){$areaListGroup.fadeIn('fast');}

        }else{
            if(!$areaReport.hasClass('collapse')){$areaReport.addClass('collapse');}
            if(!$areaReport.hasClass('moveReportDown')){$areaReport.addClass('moveReportDown');}
            if($backButton.css('display') === 'none' && !Helper.isLoopActive){$backButton.fadeIn('fast');}
            if($areaListGroup.css('display') === 'block'){$areaListGroup.fadeOut('fast');}
        }

    }, 500));


    Views.AreaReportView = Backbone.View.extend({
        el: "#areaStatistics",
        render: function(){
            var statsTypeTemplate = Config.typeofAreaStatistics;

            //type of the ballot tracking, if ballot based, use another template for local stats
            if(statsTypeTemplate === 1 && !Config.isPollBasedTurnoutTracking){
                statsTypeTemplate = statsTypeTemplate + '_BallotBased';
            }

            this.$el
                .empty()
                .hide()
                .append(Helper.template('areaReportTemplate'+statsTypeTemplate, this.model.toJSON()));

            //only if the global/top area eligible voters is displayed
            //this.addEligibleVotersNumber();
            Helper.localize();
            Helper.ManageVisibility();
            this.displayAreaReportsBlock();
            this.addEligibleVotersGlobalNumber();

            return this;
        },
        addEligibleVotersGlobalNumber: function(){
            if(Config.showEligibleVotersGlobalTitle){
                $eligibleGlobNumbers.empty().append(this.model.get('eligibleVoters'));
            }
        },
        displayAreaReportsBlock: function(){
            if(Config.showAreaStatisticsBlock){
                this.$el.fadeIn(400);
            }
        },
        renderLocalStats : function(model){
            if(Config.showAreaStatisticsBlock && Config.typeofAreaStatistics === 1) {
                var allItems = model.keys();
                var $statsTable = this.$el.find('table');
                $.each(allItems, function(index, element){
                    //console.log(index, element);
                    var $obj = $statsTable.find('#local_'+element);
                    if($obj){
                        if(element === 'tabulators' || element === 'polls'){
                            var closed = 'closed'+(element.charAt(0).toUpperCase() + element.slice(1));
                            $obj.append(model.get(closed)+' / '+model.get(element));
                        }else{
                            $obj.append(model.get(element));
                        }
                    }
                });
               //this.$el.append(Helper.template('localReportTemplate', model.toJSON()));
            }
        }


    });


    return  Views;

});