import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getTransformation, unionRectangles, showOmBB, showBboxBB, mergeRectangles, drawCircle, distance, _getBBox, _getBBoxPromise, _getBBoxPan, guid, getBoundinxBoxLines, groupBy } from "./../Helper";
import { connect } from 'react-redux';
// import shallowCompare from 'react-addons-shallow-compare';
import {
    addTagToGroup,
    moveSketchLines
} from './../../actions';
import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import LinesGrouping from "./LinesGrouping";
import Polygon from 'polygon'
import Background from "./Background";
import { boxBox } from "intersects";

const mapDispatchToProps = { 
    moveSketchLines,
    addTagToGroup,
};
const mapStateToProps = (state, ownProps) => {  

  return { 
      sketchLines: state.rootReducer.present.sketchLines,
      tagsGroup: state.rootReducer.present.tagsGroup,
  };
};


class Group extends Component {
    constructor(props) {
        super(props);

        this.state = {
            'placeholders':[],
            'sketchLines': this.props.sketchLines,
            'BBs': [],
            'offsetY': []
        }

        this.selected = false;
        this.getIn = false;
        this.offsetX = [];

        this.i= 0;
        this.allBoundingBox = null;
        this.press = false;

        this.strokePath = JSON.parse(JSON.stringify(this.props.group.stroke['points']))
        
        this.BBOxPathMain = null;

        // console.log(this.props.group.stroke['points'])
        // setTimeout(()=> {
        
        // }, 3000)
        // console.log('-------------------------ENDED');

        // console.log(this,props.group)
        // setTimeout(()=>{
            // console.log(JSON.stringify(d3.select('#panItems').node().getBBox()))
        // }, 1000)
        // this.forLoop()3
    }
    createStroke(){
        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.group.id)
            .attr("d", line(that.strokePath))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "5");
        
        d3.select('#fake-'+that.props.group.id)
            .attr("d", line(that.strokePath))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '50')
            .attr('opacity', '0.2')

        /*
            getBoundinxBoxLines([that.props.group.id]).then((d)=>{
                d3.select('#pathBB-' + that.props.group.id)
                    .attr('width', d.width + 80)
                    .attr('height', d.height)
                    .attr('x', d.x)
                    .attr('y', d.y)
                    .attr('fill', 'rgba(255,0,0,0.3)')
            })
        */
    }
    updateLine(){
        var that = this;
        // console.log(this.props.group)
        this.placeHolder = JSON.parse(JSON.stringify(this.props.group.model.placeHolder)); 

        
        this.createStroke();

        var el = document.getElementById('fake-'+that.props.group.id);
        this.mc = new Hammer.Manager(el);
        var press = new Hammer.Press({time: 250});
        var pan = new Hammer.Pan({'pointers':0, threshold: 1});
        // var pan2fingers = new Hammer.Pan({'pointers':1, threshold: 1});
        var tap = new Hammer.Tap();

        this.mc.add(press);
        this.mc.add(pan);
        this.mc.add(tap);
        pan.recognizeWith(press);
        // $(el).on('touchstart touchmove', function(e){e.preventDefault(); })

        pan.recognizeWith(tap);

        
        this.mc.on("tap", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){
                if (that.props.isGuideHold){
                    that.props.setGroupTapped({'item': that.props.group.id});
                    that.colorForTaping(false);
                }
                else {
                    // console.log(that.props.isGuideHold)
                    that.colorForTaping(true);
                    that.props.addToSelection({'id':that.props.group.id});
                    
                }
            }
        })
        this.mc.on("panstart", function(event) {
            if (event.pointers[0].pointerType == 'touch'){
                that.startPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y,  'time': Date.now()};
                that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}
                that.dragstarted(event);


                var getPan = getTransformation(d3.select('#panItems').attr('transform'));
                // if (this.props.group.lines.length > 0){
                    that.getAllBoundingBox(that.props.group.id).then((BB)=> {
                        // console.log('HEY', BB);
                        that.allBoundingBox = BB;

                        that.allBoundingBox.x += getPan.translateX - 20;
                        that.allBoundingBox.y += getPan.translateY - 20;
                        that.allBoundingBox.width += 40;
                        that.allBoundingBox.height += 40;
                    })
                _getBBoxPromise('item-'+that.props.group.id).then((d)=>{
                    that.BBOxPathMain  = d;
                })

                // that.getAllIntersectsForGroup();
            }  
            if (event.pointers[0].pointerType == 'pen' ){
                that.startPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y,  'time': Date.now()};
                that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}
                _getBBoxPromise('item-'+that.props.group.id).then((d)=>{
                    that.BBOxPathMain  = d;
                })
            }
        })
        this.mc.on("panmove", function(ev) {
           
                
            /** Si c'est pen sur stroke */
            if (ev.pointers[0].pointerType == 'pen' ){
                var X = ev.pointers[0].x - that.BBOxPathMain.x;// - transform.translateX// - getPan.translateX;
                var Y = ev.pointers[0].y - that.BBOxPathMain.y;// - transform.translateY// - getPan.translateY;;
               
                // drawCircle(that.BBOxPathMain.x, that.BBOxPathMain.y + that.BBOxPathMain.height, 10, 'red')
                // console.log(Y+ that.BBOxPathMain.y, that.BBOxPathMain.y + that.BBOxPathMain.height)
                if (Y+ that.BBOxPathMain.y > that.BBOxPathMain.y + that.BBOxPathMain.height){
                    that.strokePath.push([X,Y])
                    that.createStroke();
                } else {
                    // var lastPoint = 
                    // that.strokePath.push([X,Y])
                }

                
            }
            if (ev.pointers[0].pointerType == 'touch' ){
                // that.findIntersection(that.allBoundingBox, ev);

                that.findIntersectionRecursive(that.allBoundingBox, ev);
                that.dragged(ev);
            }
        })
        this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){
                that.dragended(ev);
            }
        })
        this.mc.on("press", function(ev) {
            // console.log('press')
            if (ev.pointers[0].pointerType == 'touch' ){
                // that.press = true;
                that.props.holdGuide(that.props.group.id);
            }
        })
        this.mc.on("pressup", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){
                // that.press = false;
                that.props.holdGuide(false);
            }
        })
        
          


        /*d3.select('#fake-'+that.props.group.id)
            .on('pointerdown', function(d){
                if (d3.event.pointerType == 'touch'){
                    that.startPosition = {'x': d3.event.x, 'y':d3.event.y,  'time': Date.now()};
                    that.lastPosition = {'x': d3.event.x, 'y':d3.event.y}
                    that.dragstarted(that);
                }
            })
            .on('pointermove', function(d){
                if (d3.event.pointerType == 'touch'){
                    var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
                    if (dist > 10 ){
                        that.dragged(that);
                    }
                }
            })
            .on('pointerup', function(d){
                if (d3.event.pointerType == 'touch'){
                    that.dragended(that);
                }
            })*/
            d3.select('#fake-'+that.props.group.id).on('contextmenu', function(){
                d3.event.preventDefault();
            })


        // console.log(JSON.parse(JSON.stringify(this.placeHolder)))\
        // console.log('BEGINNING')
        if (this.props.group.lines.length >0){
            this.getBoundinxBoxEveryone().then(()=> {
            
                this.computePosition();
                this.computeLinesPlaceHOlder(JSON.parse(JSON.stringify(this.placeHolder)))
            })     
        } else {
            this.getBoundinxBoxEveryone().then(()=> {
                this.computeLinesPlaceHOlder(JSON.parse(JSON.stringify(this.placeHolder)))
            })    
        }
        


        //Swipe on the BIG box
        // var that = this;
        // var el = d3.select('#rect-'+this.props.group.id).node()
        // this.mc = new Hammer.Manager(el);
        // var swipe = new Hammer.Swipe({pointers: 1});
        // this.mc.add(swipe);

        // this.mc.on("swipeleft", function(ev) {
        //     if (ev.pointers[0].pointerType == 'touch'){
        //         console.log('swipeleft', ev.direction)
        //         that.createTable();
                
        //         // var data = {
        //         //     'id': guid(), 
        //         //     'idGroupline':that.props.iteration +'-'+that.props.id, 
        //         //     'position': [0,0],
        //         //     'model': that.props.tagHold
        //         // };
        //         // that.props.addTagToGroup(data)
        //         // // console.log('TAP', that.props.tagHold)
        //     }
        // }) 
    }

    getAllBoundingBox = async(id) => {
        var that = this;

        //ADD BBOX LINE FOR having at least one when pushing
        // var transformPan = {'translateX': 0, 'translateY': 0}
        // console.log(that.props.group.id)
        var BBLine = await _getBBoxPromise('item-'+id);
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        BBLine.x = BBLine.x - transformPan.translateX;
        BBLine.y = BBLine.y - transformPan.translateY;
        // console.log(transformPan)
        return new Promise(resolve => {
            that.getBoundinxBoxEveryone().then((BBox)=>{
                // console.log(BBox)
               
                var BBox1 = BBLine;
                if (BBox.length != 0){
                    // var BBox1 = BBox[0];
                    for (var i = 0; i< BBox.length; i++){
                        // showBboxBB(BBox[i], 'red');
                        BBox1 = unionRectangles(BBox1, BBox[i]);
                    }
                }


                // showBboxBB(BBox1, 'red');
                resolve(BBox1);
            })
            
        })
    }
    getAllIntersectsForGroup (){
       
    }
    findIntersectionRecursive = async(BBTemp, ev) => {
        // console.log(BBTemp)
        // var alreadyAdded = []
        var that = this;
        var offsetX = ev.pointers[0].x - this.lastPosition.x;
        var offsetY = ev.pointers[0].y - this.lastPosition.y;
        BBTemp.x += offsetX; //+ transformPan.translateX;
        BBTemp.y += offsetY; //+ transformPan.translateY;

        var BBid = [];
        var arrayLineAttached = this.props.group.lines.join().split(',')

        /** Push all the lines */
        d3.select('.standAloneLines').selectAll('g').each(function(){
            var idSImple = d3.select(this).attr('id').split('-')[1]
            // console.log(d3.select(this).attr('id'))
            if (arrayLineAttached.indexOf(idSImple) == -1) BBid.push(d3.select(this).attr('id'))
        })
         /** Push all the groups */
        d3.selectAll('.groupPath').each(function(){
            var idSImple = d3.select(this).attr('id').split('-')[1]
            if (idSImple != that.props.group.id) BBid.push('group-'+idSImple)
        })
        
        // console.log(BBid, arrayLineAttached)
        // showBboxBB(BBTemp, 'blue');
        this.findIntersects(BBTemp, offsetX, offsetY, BBid, BBTemp)
        
    }
    findIntersects = async(BBTemp, offsetX, offsetY, BBid, BBinitial) => {
       
        // showBboxBB(BBTemp, 'red');
        // console.log(BBid)
        //Put my lines in an array
        // console.log(BBid)
        // Check for all these lines
        for (var i in BBid){
            var id = BBid[i];
            var idSImple = id.split('-')[1];
            var type = id.split('-')[0]
            if (type == 'item') var BB = await _getBBoxPromise(BBid[i]);
            /** Make it bigger if it's a group */
            if (type == 'group') {
                var BB = await _getBBoxPromise(BBid[i]);
                BB.x -= 40;
                BB.y -= 40;
                BB.width += 80;
                BB.height += 80;
            }
            // showBboxBB(BB, 'red');
            // showBboxBB(BB, 'blue');
            var intersected = boxBox(BB.x, BB.y, BB.width, BB.height, BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
            if (intersected) {
                

                var insideandWhichGroup = this.props.allGroups.find(group => group.lines.find((arrayEntry)=> arrayEntry.indexOf(idSImple) > -1))//.indexOf(idSImple) > -1);//x.id == this.guideTapped.item)

                var isItAGroup = this.props.allGroups.find(group => group.id == idSImple)//.indexOf(idSImple) > -1);//x.id == this.guideTapped.item)
                // console.log()
                // if not attached to a group

                /** It's a group */
                if (isItAGroup != undefined){
                    // console.log(BBinitial)
                    // showBboxBB(BB, 'blue');
                    /* Cas horizontal vertial JE BOUGE VERTICAL */
                    if ((BB.x < BBinitial.x && BB.x + BB.width > BBinitial.x + BBinitial.width) && (BB.y > BBinitial.y && BB.y + BB.height < BBinitial.y + BBinitial.height)){
                        // console.log('CAS 1')
                    }
                    /* Cas horizontal vertial JE BOUGE HORIZONTAL */
                    else if ((BB.x > BBinitial.x && BB.x + BB.width < BBinitial.x + BBinitial.width) && (BB.y < BBinitial.y && BB.y + BB.height > BBinitial.y + BBinitial.height)){
                        // console.log('CAS 1')
                    }
                    else {
                        var transform = getTransformation(d3.select('#'+id).attr('transform'));
                        var X = (offsetX + transform.translateX) ;
                        var Y = (offsetY + transform.translateY) ;
                        d3.select('#'+ id).attr('transform', 'translate('+X+','+Y+')')
                        var index = BBid.indexOf(BBid.find(x => x == id));
                        var newBB = JSON.parse(JSON.stringify(BBid))
                        newBB.splice(index,1)
                        // showBboxBB(BB, 'red');
                        this.findIntersects(BB, offsetX, offsetY, newBB, BBinitial); 
                    }

                    
                  
                }
                /** Not stroke inside a group */
                else if (insideandWhichGroup == undefined){
                   
                    var transform = getTransformation(d3.select('#'+id).attr('transform'));
                    var X = offsetX + transform.translateX;
                    var Y = offsetY + transform.translateY;
                    d3.select('#'+ id).attr('transform', 'translate('+X+','+Y+')')

                    var index = BBid.indexOf(BBid.find(x => x == id));
                    var newBB = JSON.parse(JSON.stringify(BBid))
                    newBB.splice(index,1)
                    this.findIntersects(BB, offsetX, offsetY, newBB, BBinitial);
                   
                } 
                /*** If already in a group */
                else {
                    // console.log('GO')
                    // console.log(insideandWhichGroup)
                    var arrayLineAttached = insideandWhichGroup.lines.join().split(',')
                    arrayLineAttached.forEach((d)=>{
                        var transform = getTransformation(d3.select('#item-'+ d).attr('transform'));
                        var X = offsetX + transform.translateX;
                        var Y = offsetY + transform.translateY;
                        d3.select('#item-'+ d).attr('transform', 'translate('+X+','+Y+')')
                    })
                    // console.log(insideandWhichGroup)
                    var transform = getTransformation(d3.select('#group-'+insideandWhichGroup.id).attr('transform'));
                    var X = offsetX + transform.translateX;
                    var Y = offsetY + transform.translateY;
                    d3.select('#group-'+ insideandWhichGroup.id).attr('transform', 'translate('+X+','+Y+')')

                    // var BB =  await _getBBoxPromise(BBid[i])//this.getAllBoundingBox(insideandWhichGroup.id);

                    /** Erase from array */
                    var arraywihoutItem = arrayLineAttached.map((k)=>'item-'+k)
                    var newBB = JSON.parse(JSON.stringify(BBid))
                    for (var i = arraywihoutItem.length - 1; i >= 0; i--) {
                        var index = BBid.indexOf(BBid.find(x => x == arraywihoutItem[i]));
                        newBB.splice(index,1)
                    }
                    

                    this.findIntersects(BB, offsetX, offsetY, newBB, BBinitial);
                }

                // console.log(insideandWhichGroup)
                
                // console.log('HEY')
            }
            // console.log(BBid[i])
        }
    }
    findIntersection = async(BBTemp, ev) => {
        // console.log(BBTemp)
       
        var offsetX = ev.pointers[0].x - this.lastPosition.x;
        var offsetY = ev.pointers[0].y - this.lastPosition.y;
        BBTemp.x += offsetX; //+ transformPan.translateX;
        BBTemp.y += offsetY; //+ transformPan.translateY;
        
        // showBboxBB(BBTemp, 'blue');
      
        var BBid = [];
        var arrayLineAttached = this.props.group.lines.join().split(',')
        // showBboxBB(BBTemp, 'red');

        //Put my lines in an array
        d3.select('.standAloneLines').selectAll('g').each(function(){
            var idSImple = d3.select(this).attr('id').split('-')[1]
            // console.log(d3.select(this).attr('id'))
            if (arrayLineAttached.indexOf(idSImple) == -1) BBid.push(d3.select(this).attr('id'))
        })
        // Check for all these lines
        for (var i in BBid){
            var BB = await _getBBoxPromise(BBid[i])
            // showBboxBB(BB, 'red');
            // showBboxBB(BB, 'blue');
            var intersected = boxBox(BB.x, BB.y, BB.width, BB.height, BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
            if (intersected) {
                var id = BBid[i];
                var idSImple = id.split('-')[1];

                var insideandWhichGroup = this.props.allGroups.find(group => group.lines.find((arrayEntry)=> arrayEntry.indexOf(idSImple) > -1))//.indexOf(idSImple) > -1);//x.id == this.guideTapped.item)

                // if not attached to a group
                if (insideandWhichGroup == undefined){
                    var transform = getTransformation(d3.select('#'+id).attr('transform'));
                    var X = offsetX + transform.translateX;
                    var Y = offsetY + transform.translateY;
                    d3.select('#'+ id).attr('transform', 'translate('+X+','+Y+')')
                } 
                /*** If already in a group */
                else {
                    var arrayLineAttached = insideandWhichGroup.lines.join().split(',')
                    arrayLineAttached.forEach((d)=>{
                        var transform = getTransformation(d3.select('#item-'+ d).attr('transform'));
                        var X = offsetX + transform.translateX;
                        var Y = offsetY + transform.translateY;
                        d3.select('#item-'+ d).attr('transform', 'translate('+X+','+Y+')')
                    })
                    // console.log(insideandWhichGroup)
                    var transform = getTransformation(d3.select('#group-'+insideandWhichGroup.id).attr('transform'));
                    var X = offsetX + transform.translateX;
                    var Y = offsetY + transform.translateY;
                    d3.select('#group-'+ insideandWhichGroup.id).attr('transform', 'translate('+X+','+Y+')')
                }

                // console.log(insideandWhichGroup)
                
                // console.log('HEY')
            }
            // console.log(BBid[i])
        }
    }
    componentDidMount(){
        console.log('GOs')
        this.updateLine();   
    }
    dragstarted(env) {
        var that = env;;
    }
    
    dragged(event) {  
        var that = this;       
        var transform = getTransformation(d3.select('#group-'+that.props.group.id).attr('transform'));
        // console.log(event)
        var offsetX = event.srcEvent.x - that.lastPosition.x;
        var offsetY = event.srcEvent.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#group-'+that.props.group.id).attr('transform', 'translate('+X+','+Y+')')

        var linesAttached = that.props.group['lines'];

        // console.log(linesAttached)
        linesAttached.forEach((groupLine)=>{
            groupLine.forEach((lineId)=>{
                var id = 'item-'+lineId;

                
                var transform = getTransformation(d3.select('#'+id).attr('transform'));
                var X = offsetX + transform.translateX;
                var Y = offsetY + transform.translateY;
                d3.select('#'+id).attr('transform', 'translate('+X+','+Y+')')
            })
        })
        // for (var i in linesAttached){
        //     var line = linesAttached[i];
        //     var identifier = 'item-'+line;
        //     var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
        //     var X = offsetX + transform.translateX;
        //     var Y = offsetY + transform.translateY;
        //     d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
        // }

        that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}

    }
    dragended(event) {
        var that = this;
        that.drag = false;
       
        // var dist = distance(that.startPosition.x, event.srcEvent.x, that.startPosition.y, event.srcEvent.y);
        // var time = Date.now() -  that.startPosition['time'];


        // console.log(dist, time)
        // if (dist < 10 && time < 200){
        //     clearTimeout(that.timerPress);

        //     if (that.props.isGuideHold){
        //         // console.log(that.props.isGuideHold)
        //         that.props.setGroupTapped({'item': env.props.group.id});
        //         that.colorForTaping(false);
        //     }
        //     else {
        //         console.log(that.props.isGuideHold)
        //         that.colorForTaping(true);
    
        //         that.props.addToSelection({'id':env.props.group.id});
               
        //     }
            
        // }
    }
    colorForTaping(isIt){
        var that = this;
        d3.select('#fake-'+that.props.group.id)
            .attr('opacity', '0.2')

        if (isIt == true){
            d3.select('#fake-'+that.props.group.id)
                .attr('opacity', '1')
            that.selected = true;
        }
        else that.selected = false;
    }
    // POUR TOUS LES PLACEHOLDER
    // SERT A METTRE MES OBJETS EN 0 ABSOLU ++ 
    // Update ma BBOX de mon objet PLACEHOLDER
    computeLinesPlaceHOlder = async(placeholder) => {
        var that = this;
        var itemsGuide = [];
        for (var j in placeholder){
            var element = placeholder[j];
            var lines = element.lines;
            // console.log(lines)
            

            if (lines.length > 0){

                // const grouped = groupBy(lines, line => line.type);
                await this.computeBBoxInPlaceHolder(element, lines)

                // var pattern = grouped.get("pattern")
                // var scale = grouped.get("normal");
                // if (pattern.length > 0){
                //     var linesId = pattern.map((g)=> g.id)
                //     // console.log('=================', element)
                //     element.BBoxPattern = await getBoundinxBoxLines(linesId)
                // }
                // if (scale.length > 0){
                //     var linesId = scale.map((g)=> g.id)
                //     element.BBoxScale = await getBoundinxBoxLines(linesId)
                // }

                // console.log(grouped.get("pattern"), grouped.get("normal"));
            }
        };
        // console.log(JSON.parse(JSON.stringify(placeholder)))
        // console.log('endPlaceHolder')
        this.setState({'placeholders': placeholder});
        // console.log(placeholder)
    }
    computeBBoxInPlaceHolder = async(element, lines) => {
        var that = this;
        var arrayBBox = [];
        var nodeId = d3.select('#placeHolder-'+element.id +'-' + that.props.group.model.id).attr('id');
        var BB = await _getBBoxPromise(nodeId);
        var transform = {'translateX': 0, 'translateY': 0}
        transform = getTransformation(d3.select('#item-'+that.props.group.model.id).attr('transform'))
        BB.x = BB.x - transform.translateX;
        BB.y = BB.y - transform.translateY;
        arrayBBox.push(BB);
      
        // SERT A TROUVER LE COIN EN HAUT A GAUCHE
        var polygon;
        if (arrayBBox.length > 1){
            polygon = mergeRectangles(arrayBBox[0], arrayBBox[1])
            for (var i = 2; i < arrayBBox.length; i++){
                polygon = mergeRectangles(polygon, arrayBBox[i])
            }
        } else polygon = arrayBBox[0]
        //UNE FOIS QUE c'EST FAIT TOUT LE NONDE EN 0
        lines.forEach((d)=>{
            d.data = d.data.map((f)=> [f[0] - polygon.x, f[1] - polygon.y])
        })
        element.BBox = polygon;
    }
    sleep = () => {
        return new Promise(resolve => setTimeout(resolve, 200))
    }
    forLoop = async () => {
        console.log('Start')
      
        for (let index = 0; index < 800; index++) {
            console.log(index)
          await this.sleep()
        }
      
        console.log('End')
      }
    // async asyncData (app) {
    //     const res = await app.$axios.$get('api.v1/feeds')
    //     return { feeds: res}
    //   }
     /**
     * FAIT LA BOUNDING BOX DE TOUTE LES LIGNES
     */
    getBoundinxBoxEveryone = async () => {
        // var BB = await _getBBoxPromise('item-'+strokeId);
        // return new Promise((resolve, reject) => {
            // console.log('GO', this.props.group.lines)
        var BBox = [];
        // console.log(this.props.group.lines)
        // const grouped = this.props.group.lines(pets, pet => pet.type);
        // d3.selectAll('.BB').remove()
        for (let i = 0; i < this.props.group.lines.length; i++) {
            var line = this.props.group.lines[i];
            var rectangle = null;
            var that = this;
            

            for (let index = 0; index < line.length; index++) {
                // console.log(line[index])
                var strokeId = line[index];
                var BB = await _getBBoxPromise('item-'+strokeId);

                if (rectangle == null) rectangle = BB;
                else rectangle = unionRectangles(rectangle, BB);
                // showBboxBB(BB, 'red');
            }
           
            var transformPan = {'translateX': 0, 'translateY': 0}
            var transformDrag = {'translateX': 0, 'translateY': 0}
            var item = d3.select('#panItems').node()
            if (item != null){
                transformPan = getTransformation(d3.select('#panItems').attr('transform'));
            } 
            var item = d3.select('#group-'+ that.props.group.id).node()
            // GET apres le drag en compte sur les BBox
            // console.log(transform)
            rectangle.x = rectangle.x - transformPan.translateX;
            rectangle.y = rectangle.y - transformPan.translateY;

            BBox.push(rectangle)

            
            // showBboxBB(rectangle, 'red');
            // console.log('PUSH')
        }

        
        
        // console.log('GO',BBox)
        // showBboxBB(BBox[0], 'red');
        this.BB = BBox;

       
        // this.props.getBBoxEachLine({'bb':this.BB, 'iteration': this.props.iteration});
        // console.log('endBBox')
        // this.computePosition();
        

        
        return BBox;

    }
    computePosition(){
        var offset = [];
        
        var padding = this.props.group.model.paddingBetweenLines;
        // console.log(padding)
        var bb = JSON.parse(JSON.stringify(this.BB));
        // this.BB.forEach((d)=> console.log(d))
        var bbwithIndex = this.BB.map((d, i)=>{ d.index = i; return d })
        bbwithIndex.sort((a, b) => a.y - b.y);
        //Premiere position ne change pas
        var initialPosition = JSON.parse(JSON.stringify(bbwithIndex[0]['y']));
        
        bbwithIndex.forEach((d, i)=>{
            offset.push({'position': initialPosition, 'index':d.index});
            initialPosition += d.height  + padding;
            
        })
        // console.log(offset)
        // this.BB.sort((a, b) => );
        this.offset = offset.map((d, i)=>{
            return {'index': d.index, 'value':bbwithIndex[i]['y'] - d.position }
        })

        this.offset.sort((a, b) => a.index - b.index);
        this.state.offsetY = this.offset.map((d)=>{
            return d.value;
        })
        this.state.offsetX = this.state.offsetY.map((d)=> 0)
        // this.state.offsetY = []
        // this.setState({'offsetY': this.offsetY})
        // console.log(this.state.offsetY)
    }
    // shouldComponentUpdate(nextProps, nextState) {
        
          
    // }
    
    componentDidUpdate(prevProps, prevState){
        var that = this;
        // console.log('did update')
        // console.log('GOOOO', this.props.group.lines.join().split(','))
        // this.getAllIntersectsForGroup()
        if (this.props.sketchLines != prevProps.sketchLines){
            // this.setState({'sketchLines': this.props.sketchLines})
            // this.getBoundinxBoxEveryone()
        }
        /** POUR UNE NOUVELL LIGNE OU ECRIRE SUR LA MEME*/
        else if ([].concat(...this.props.group.lines).length != [].concat(...prevProps.group.lines).length ){
            // console.log('GO')
            //NOUVELLE LIGNE
            // if (this.props.group.lines.length != prevProps.group.lines.length){
                // console.log('GOOOO', this.props.group.lines)
            this.placeholder = JSON.parse(JSON.stringify(this.props.group.model.placeHolder))
            this.getBoundinxBoxEveryone().then(()=> {
                this.computePosition();
                this.computeLinesPlaceHOlder(this.placeholder);
            })
            // } else {

            // }
        }
        
        else if (this.props.shouldUnselect != prevProps.shouldUnselect){
            d3.select('#fake-'+that.props.group.id).attr('opacity', '0.2')
        }
        else if (this.props.shouldUnselect != prevProps.shouldUnselect){
            d3.select('#fake-'+that.props.group.id).attr('opacity', '0.2')
        }
        else if (this.props.sketchLines != prevProps.sketchLines){
            d3.select('#fake-'+that.props.group.id).attr('opacity', '0.2')
        }
        else if (this.props.group.model.placeHolder != prevProps.group.model.placeHolder){
            console.log('gO')
            // console.log(JSON.parse(JSON.stringify(this.props.group.model.placeHolder)))
            this.placeholder = JSON.parse(JSON.stringify(this.props.group.model.placeHolder))
            this.getBoundinxBoxEveryone().then(()=> {
                if (this.props.group.lines.length > 0) this.computePosition();
                this.computeLinesPlaceHOlder(this.placeholder);
                
            })
            // console.log('placeholder')
        }
        
        else if (this.props.groupHolded != prevProps.groupHolded){
            
            if (this.props.groupHolded == false){
                d3.select('#rect-'+this.props.group.id).attr('width', 0).attr('height', 0)
            }
            else if (this.props.groupHolded != this.props.group.id){
                // console.log(this.props.groupHolded, this.props.group.id)
                _getBBoxPromise('group-'+this.props.group.id).then((d)=> {
                        var transformPan = {'translateX': 0, 'translateY': 0}
                        var item = d3.select('#panItems').node()
                        if (item != null){
                            transformPan = getTransformation(d3.select('#panItems').attr('transform'));
                        }
                        d3.select('#rect-'+this.props.group.id)
                            .attr('width', d.width)
                            .attr('height', d.height)
                            .attr('x', d.x - transformPan.translateX)
                            .attr('y', d.y - transformPan.translateY)
                            .attr('fill', 'rgba(0,255,0,0.2')
                    
                })
            }
            // console.log('groupHolded')
        }

        // this.initiateTable()
        // DRAW The box for swiping
        /**/

        // var d = _getBBox('background-'+this.props.group.id)
        
        // console.log(d)
        // d3.select('#rect-'+this.props.group.id)
        //     .attr('width', d.width)
        //     .attr('height', d.height)
        //     .attr('x', d.x)
        //     .attr('y', d.y)
        //     .attr('fill', 'rgba(0,255,0,0.3')
    }
    getBoundinxBoxEveryong(){
        // console.log(this.props)
    }
    // moveSketchLines = (d) => {
    //     // console.log('GO')
    //     this.props.moveSketchLines(d);
    // }
    moveLines = (d) => {
        this.props.moveSketchLines(d.data);
        // console.log('start')
        // d3.selectAll('.BB').remove()
        // showBboxBB(BB, 'red');
        
        if (d.iteration == this.props.group.lines.length-1){
        
        }
    }
    render() {

        // console.log(this.state.placeholders)
        // console.log('render')
        // console.log(BB)
        // var sticky = this.props.stickyLines.find(x => x.id == this.guideTapped.item)
        // console.log(this.props.group.lines)
        //Pour chaque ligne reconnu dans mon groupe
        var listItems = this.props.group.lines.map((d, i) => { return <g key={i} ></g>})
        if (this.state.placeholders.length > 0){
            listItems = this.props.group.lines.map((d, i) => {

                // POUR LES TAGS
                var results= this.props.tagsGroup.filter(x => x.idGroupline == i + '-' + this.props.group.id);
                // var sticky = this.props.tagsGroup.find(x => x.idGroupline == i + '-' + this.props.group.id);
                // console.log(sticky, i + '-' + this.props.group.id)
                // console.log(results)
                return <LinesGrouping 
                    key={i} 
                    line={d}
                    sketchLines={this.props.sketchLines}
                    placeholders={this.state.placeholders}
                    stroke={this.props.group.stroke}
                    id={this.props.group.id}
                    iteration={i}
                    BBs={this.BB} 
                    offsetY={this.state.offsetY}
                    offsetX={this.state.offsetX}
                    showGrid={this.props.showGrid}
    
                    moveLines={this.moveLines}

                    tagHold={this.props.tagHold}
                    addTagToGroup={this.props.addTagToGroup}
                    tags={results}
                />
            });
        }
    //    console.log(this.props.group.lines)
        
        return (
            <g id={'group-'+this.props.group.id} transform={`translate(${this.props.group.position[0]},${this.props.group.position[1]})`}>
                {/* <g>{this.state.placeholders.length > 0 ? : <g></g> }</g> */}
                {listItems} 

                   {/* { (this.props.group.lines > 0) ? */}
                    <Background
                        sketchLines={this.state.sketchLines}
                        placeholders={this.state.placeholders}
                        stroke={this.props.group.stroke}
                        id={this.props.group.id}
                        

                        group={this.props.group}

             
                    />
                    {/* : null } */}
                 
                
                <g id={'item-'+this.props.group.id} className={'groupPath'} transform={`translate(${this.props.group.stroke.position[0]},${this.props.group.stroke.position[1]})`}>
                    <path style={{'pointerEvents': 'none' }} id={this.props.group.id}/> 
                    <path id={'fake-'+this.props.group.id}  className={'fakePath'}></path>

                    

                </g>
                <rect className={'bbGroup'} id={'pathBB-'+this.props.group.id} />
                <rect id={'rect-'+this.props.group.id} />
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Group);