/* global define */
define (["jquery", "underscore", "app/utils/config"],
    function($, _, Config){

        "use strict";
        var Utils = {};
        Utils.Resources = '';
        Utils.ResourceToLocalize = [];
        Utils.DefaultLanguage = Config.defaultLanguage;
        Utils.isLanguageChanged = true;
        Utils.StoredObjectsDictionary = {};
        Utils.AreatypesRelationDictionary = {};
        Utils.isAreaResultUpdated =  false;
        Utils.MobileBreakpoint = 800;
        Utils.isLoopActive = false;
        Utils.loopContest = {};
        Utils.checkOnceIfLoopIsSetOnAutomatic = true;
        var resetContestList = false;

        Utils.template = function(id, model){
            return _.template( $("#"+id).html(), model);
        };

        Utils.getScreenWidth = function(){
            return window.innerWidth ||
                document.documentElement.clientWidth ||
                document.body.clientWidth;
        };
        Utils.localize = function(){

            if(Utils.isLanguageChanged){
                Utils.loadLanguagePack();
                Utils.ResourceToLocalize = $('.localize');
            }

        };

        Utils.randomTimestamp =  function (){
            var timestamp = new Date();
            return "?id="+timestamp.getTime();
        };

        Utils.loadLanguagePack = function(){

            var langFolder  = Utils.DefaultLanguage+'/';
            var url = 'js/lang/'+langFolder+'resources.json'+Utils.randomTimestamp();

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: setResources,
                error: onErrorHandler
            });

            function setResources(data){
                Utils.Resources = data;
                document.title = Utils.getTranslationFromResources('pageTitle');
                var lang = Utils.DefaultLanguage.toUpperCase();
                //overriding resource values with the config values
                if(Config['electionTitle'+lang] !== ''){Utils.Resources.electionTitle = Config['electionTitle'+lang];}
                if(Config['unofficialTitle'+lang] !== ''){Utils.Resources.unofficialTitle = Config['unofficialTitle'+lang];}
                addTranslationLabels();
            }
            function onErrorHandler(response){
                ////console.log(response.statusText);
                Utils.alertMessage("error404", '404 Resource not found.');
            }
        };

        function addTranslationLabels(){

            $.each(Utils.ResourceToLocalize, function(index, element){
                var $element = $(element);
                var id = $element.data('resourceid');
                var target = $element.data('target');

                if(target === undefined){
                    $element.text(Utils.Resources[id]);
                }else{
                    $element.find(target).text(Utils.Resources[id]);
                }
            });
            //$('#areaStatistics').fadeIn(400);
        }

        Utils.getTranslationFromResources = function(resourceName){
            var name = Utils.Resources[resourceName];
             if(!Utils.checkUpValue(name)){
                 name = '';
             }
            return name;
        };

        Utils.ManageVisibility = function(){
            var isVisibleClass = $('.isVisible');

            $.each(isVisibleClass, function (index, element){
                var $element = $(element);
                var id = $element.data('configid');
                if(!Config[id]){
                    $element.hide();
                }
            });

        };

        Utils.attachTemplateToDocumentBody = function(){
            //1 - AreaType Template
            //2 - Area Template
            //3 - Contest Template
            var template = '';
            switch(template){
                case 1:
                    template = '';
                    break;
                case 2:
                    template = '';
                    break;
                case 3:
                    template = '';
                    break;
                default :
                    template = '';
            }
            if(template !== ''){
                $(document.body).append(template);
            }

        };
        //bad values return false
        Utils.checkUpValue = function (value){

            var returnVal = true;

            switch(value){
                case null:
                    returnVal = false;
                    break;
                case undefined:
                    returnVal = false;
                    break;
                case '':
                    returnVal = false;
                    break;
                default:
                    returnVal = true;
            }
            return returnVal;
        };

        Utils.parseRoute = function(strAddress){

            var values = [];
            var firstSlash = strAddress.substr(3);
            var secondSlash = firstSlash.indexOf('/');
            var ATID = firstSlash.substr(0,secondSlash);
            values.push(ATID);
            var strAfterATID = firstSlash.substr(secondSlash+4);
            var slashAfterAreaID = strAfterATID.indexOf('/');
            var ARID = strAfterATID.substr(0, slashAfterAreaID);
            values.push(ARID);
            var CTID = strAfterATID.substr(ARID.length+4);
            values.push(CTID);

            window.areaTypeID = ATID;
            window.areaID = ARID;
            window.contestID = CTID;

            return values;
        };

        Utils.addAndRemoveUpdateAlert = function($obj){
            var html = '<div id="updated" data-resourceId="updatedTitle" class="localize alert alert-success text-center animated flash">';

            $obj.prepend(html+Utils.Resources.updatedTitle+'</div>');

            var $updated = $obj.find('#updated');
            setTimeout(function(){$updated.slideUp('300', function(){$updated.remove();} );}, 3000);
        };

        Utils.CheckIntervalValues = function(interval, min, max){
            var intervalChoice = 0;

            if(interval>=min && interval<=max){
                intervalChoice = interval*1000;
            }else{
                //default value
                intervalChoice =  30000;
            }
            return intervalChoice;
        };

        Utils.alertMessage = function (error, alternateError){
            var $alert = $('.alert');

            if($alert.length > 0){
                $alert.remove();
            }
            if(error === 'initialStateNote'){
                $('#contests').prepend( Utils.template('initialNoteTemplate'));
            }else{
                $('#contests').prepend( Utils.template('errorTemplate'));
            }
            if(Utils.Resources !== '') {
                $('.alert span').text(Utils.getTranslationFromResources(error));
            }else{
                $('.alert span').text('Error: '+alternateError);
            }

            //remove alert if it's an invalid message
            if(error === 'errorInvalid'){
                setTimeout(function(){
                    $alert = $('.alert');
                    if($alert.length > 0){
                        $alert.remove();
                    }
                }, 3000);
            }

        };

        
        Utils.stopLoopOnClick = function(userClick){
            if(Utils.isLoopActive && !userClick){
                window.$loopButton.trigger('click');
            }
        };

        Utils.loop = function(runLoop){
            Utils.loopAnimation(false);
            var loopPeriod = Utils.CheckIntervalValues(Config.loopPeriod, 4, 60)/2;
            var $backButton = $('#backButton');
            var $reloadTimeBar = $('#reloadTimeBar');

            if (runLoop) {
                if (Utils.getScreenWidth() < 992 ) {
                    $backButton.css('display', 'none');
                    $('.areaListGroup').fadeOut('fast');
                }
                $reloadTimeBar.hide();
                //global loop state
                Utils.loopAnimation(true, 'pulse');
                Utils.isLoopActive = runLoop;
                Utils.loopContest = new Utils.LoopAreaType(loopPeriod);
                Utils.loopContest.init();
                Utils.loopContest.run();

            }else{
                Utils.isLoopActive = runLoop;
                Utils.loopContest.stop();
                Utils.loopAnimation(true, 'rubberBand');
                if (Utils.getScreenWidth() < 992 )  {
                    $backButton.css('display', 'block');
                }
                $reloadTimeBar.show();
                Utils.loopContest = {};
                resetContestList = true;
            }
        };

        Utils.loopAnimation = function(add, type){
            var $loopButton = window.$loopButton;
            if(add){
                $loopButton.addClass('animated '+type);
            }else{
                $loopButton.removeClass('animated pulse rubberBand');
            }
        };

        Utils.getAreaTypeLoopList = function(areaTypeLoopList){
           var includeIDsArray = Config.areaTypeIDLoopArray;
           var includeIDsArray_LENGTH = includeIDsArray.length;

           var reducedIDList =  _.filter(areaTypeLoopList, function(elem){

                for(var j = 0; j < includeIDsArray_LENGTH; j++) {
                    if(elem.id === includeIDsArray[j]){
                        return elem;
                    }
                }
            });

            return reducedIDList;
        };


        Utils.TreeItem = function () {
            var self = this;
            self.type = 'TreeItem';
            self.done = false;
            self.siblings = [];
            self.index = -1;
            self.shouldInitChildren = false;

            self.init = function() {
            };

            self.next = function() {

                if(self.shouldInitChildren){
                    self.initChildren();
                    self.shouldInitChildren = false;
                }

                //if (!!self.children && self.children.done === false) {
                if (!!self.children && !self.children.done) {
                    self.children.next();
                } else {
                    self.nextSibling();
                }
            };

            self.nextSibling = function () {
                if (self.siblings.length > 0) {
                    if (self.shouldAlwaysCheckDOM) {
                        self.init();
                    }

                    self.clickNext();

                    self.shouldInitChildren = true;
                    
                    if (self.index === self.siblings.length - 1) {
                        self.done = true;
                    }
                }
            };

            self.clickNext = function() {
                self.index = (self.index + 1) % self.siblings.length;
                //if (self.siblings.length > 1) {
                    var $target = $(self.siblings[self.index]);
                    $target.addClass('loop');
                    self.siblings[self.index].click();
                    //console.log('click next' + self.type);
                    $target.removeClass('loop');
                //}

            };

            self.clickFirst = function() {
                if (self.siblings.length > 0) {
                    self.index = 0;
                    var $target = $(self.siblings[0]);
                    $target.addClass('loop');
                    self.siblings[0].click();
                    //console.log('click first' + self.type);
                    $target.removeClass('loop');
                }
            };

            return self;
        };

        Utils.LoopAreaType = function (loopPeriod) {
            var self = new Utils.TreeItem();
            self.type = 'LoopAreaType';
            self.loopActive = true;
            //self.counter = 0;

            self.init = function () {
                self.siblings = $('.areaType_nav a');
                self.siblings.removeClass('selected inLoop').addClass('inLoop');
                // check if the area types loop list is limited
                if(Config.areaTypeIDLoopArray.length > 0) {
                    self.siblings = Utils.getAreaTypeLoopList(self.siblings);
                }

                self.clickFirst();

                self.shouldInitChildren = true;

                return self;
            };

            self.initChildren = function () {
                self.children = new Utils.LoopArea();
                self.children.init();
            };

            self.run = function () {

                if(self.loopActive) {
                    _.delay(self.run, loopPeriod, 'next');
                    //console.log('loop Period: '+loopPeriod+ " :"+self.type);
                    self.next();
                }
            };

            self.stop = function () {
                self.loopActive = false;
            };

            return self;
        };

        Utils.LoopArea  = function() {
            var self = new Utils.TreeItem();
            self.type = 'LoopArea';
            self.init = function() {
                self.siblings = $('.areaListGroup li a');
                self.siblings.removeClass('inLoop').addClass('inLoop');
                self.clickFirst();

                self.shouldInitChildren = true;
                return self;
            };

            self.initChildren = function () {
                self.children = new Utils.LoopContest();
                resetContestList = true;
                self.children.init();
            };

            return self;
        };

        Utils.LoopContest = function() {

            var self = new Utils.TreeItem();
            self.type = 'LoopContest';
            self.shouldAlwaysCheckDOM = true;

            self.init = function () {
                var contestList = '.contestListGroup li a:not(.localize)';
                //only at the interval begins, wait to rebuild contestList DOM and secure the last one is deleted
                if(resetContestList) {
                    _.delay(function () {
                        self.siblings = $(contestList);
                        self.siblings.removeClass('inLoop').addClass('inLoop');
                        resetContestList = false;
                        return self;
                    }, 800);
                }else{
                    self.siblings = $(contestList);
                    self.siblings.removeClass('inLoop').addClass('inLoop');
                    return self;
                }

            };

            self.initChildren = function () {};

            return self;
        };

        return Utils;
});
