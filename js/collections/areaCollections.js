/* global define */
define (["jquery", "backbone", "underscore", "app/views/areaViews", "app/utils/helper", "app/utils/config"],
    function($, Backbone, _, Views, Helper, Config){

        'use strict';

        var Models = {};
        var Collections = {};
        var areatypeID = '';


        Models.AreaModel = Backbone.Model.extend({
//
//            parse: function(model){
//
//                if(_.has(model, 'parentAreaId')){
//
//                    var subAreas = model.parentAreaId;
//                    if(!_.has(this, 'subAreas')){
//                        this.subAreas = new Collections.SubAreasCollection(subAreas);
//                    } else {
//                        this.subAreas.reset(subAreas);
//                    }
//
//                    delete model.subAreas;
//                }
//
//                return model;
//            }
        });

        Collections.AreaCollection = Backbone.Collection.extend({

            model: Models.AreaModel,
            initialize: function(props){
                this.url = props.url;
                this.url = this.url+Helper.randomTimestamp();
                this.areatypeID = (Helper.checkUpValue(props.areatypeID)) ? props.areatypeID : '';
                areatypeID = this.areatypeID;
            },
            fetchData: function(){
                this.fetch({ reset:true, error:this.onErrorHandler, complete:this.onCompleteHandler });
                this.on('reset', this.addView);
            },

            onErrorHandler: function (collection, response) {
                var erroMessage = "error"+response.status;
                Helper.alertMessage(erroMessage, 'Arealist '+response.status +' ('+response.statusText+')');
            },

            onCompleteHandler: function (xhr, textStatus) {
                //console.log("Status " + textStatus);
            },

            addView: function(newAreaTypeID){
                 if(typeof newAreaTypeID === "object"){
                     newAreaTypeID = newAreaTypeID.areatypeID;
                 }

                if(this.length>0){
                   Views.areaView = new Views.AreaCollectionView({ collection: this });
                   Views.selectedAreatypeID = (Helper.checkUpValue(newAreaTypeID)) ? newAreaTypeID : areatypeID;
                   Views.areaView.render();
                }
            }

        });

        return  Collections;

    });