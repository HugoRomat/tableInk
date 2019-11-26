import React, { Component } from "react";
import * as d3 from 'd3';
import Lines from './Lines'
import './../../css/main.css';
import paper from 'paper';
import * as Hammer from 'hammerjs';
import { connect } from 'react-redux';
import { distance, guid, whoIsInside, getTransformation, is_point_inside_selection, getType, showBbox, _getBBox, checkIntersection, getNearestElement, showBboxBB, drawCircle, interpolate, line_intersect, midPosition, getPerpendicularPoint, drawLine, distToSegment, lineIntersectsSquare, lineIntersectsPolygone, showOmBB, center, getSpPoint, LeastSquares, createPositionAtLengthAngle, getCenterPolygon, drawPath, getoobb, FgetBBox } from "./Helper";
import ColorMenu from "./ColorMenu";
import Polygon from 'polygon'

import CalcConvexHull from './../../../customModules/convexhull';
import Vector from './../../../customModules/vector';
import CalcOmbb from './../../../customModules/ombb';

import {boxBox} from 'intersects';

import { 
    addSketchLine,
    removeSketchLines,
    createGroupLines,
    addStickyLines,
    addLinesClass,
    addLinesToSticky,
    changeModelGroupLines,
    addText
} from '../actions';
import Guides from "./Guides/Guides";

import Interface from "./Interface";
import Menus from "./Menus/Menus";
import Lettres from "./Lettres/Lettres";
import Groups from "./Group/Groups";
import { SpeechRecognitionClass } from "./SpeechReognition/Speech";
import Textes from "./Textes/Textes";

const mapDispatchToProps = {  
    addSketchLine,
    removeSketchLines,
    createGroupLines,
    addStickyLines,
    addLinesClass,
    addLinesToSticky,
    changeModelGroupLines,
    addText
};


function mapStateToProps(state, ownProps) {

    // console.log(state)
    return {
        sketchLines: state.rootReducer.present.sketchLines,
        stickyLines: state.rootReducer.present.stickyLines,
        lettres: state.rootReducer.present.lettres
    };
}


class Document extends Component {

    constructor(props) {
        super(props);
        this.down = false;
        this.tempArrayStroke = [];
        this.tempLine = null;
        this.pointText = null;
        this.selection = false;


        this.selectionGroup = [];
        this.press = false;
        this.sticky = false;
        this.grouping = false;
        this.isGuideHold = false;
        this.duplicating = false;

        this.objectIn = [];
        this.isItemDragged = false;
        this.isFlick = false;

        this.linesInselection = [];
        this.guideTapped = null;
        this.press = false;

        this.state = {
            shouldOpenAlphabet: false
        }
        // this.shouldOpenAlphabet = false;
        // console.log(CalcOmbb)
    }
    init(){

    }
    componentDidMount(){
        this.listenEvents();
        d3.select('#canvasVisualization').style('width', '100%').style('height', '100%');
        // d3.select('#eventReceiver').style('width', '100%').style('height', '100%');
        
        this.listenHammer();

        this.speech = new SpeechRecognitionClass(this);

        // this.init();

        // this.isMount = true;
        // this.forceUpdate();

        // console.log(this.props)
    }
    listenHammer(){
        var that = this;
        var el = document.getElementById("eventReceiver");
        this.mc = new Hammer.Manager(el);
        var press = new Hammer.Press({time: 250});
        var pan = new Hammer.Pan({'pointers':2, threshold: 5});
        this.mc.add(press);
        // t3his.mc.add(pan);

        // pan.recognizeWith(press);

        // this.mc.on("panstart", function(ev) {
        //     // if (that.penPressed == null){
        //       if (ev.pointers[0].pointerType == 'touch'){
        //           that.panStart(ev);
        //       }
        //     // }
        //   })
        //   this.mc.on("pan", function(ev) {
        //     // if (that.penPressed == null){
        //       if (ev.pointers[0].pointerType == 'touch'){
        //         that.panMove(ev);
        //       }
        //     // } 
        //   })
        //   this.mc.on("panend", function(ev) {
        //     if (that.penPressed == null){
        //       if (ev.pointers[0].pointerType == 'touch'){
        //           that.panEnd(ev);
        //       }
        //     }
        //   })
        this.mc.on("press", function(ev) {
            ev.preventDefault();
            if (ev.pointers[0]['pointerType'] == 'touch'){
                ev.srcEvent.preventDefault();
                that.press = true;
                // console.log(ev)
                that.speech.setAlphabet(that.props.lettres)
                that.speech.start({'x':ev.srcEvent.x, 'y' :ev.srcEvent.y});

                
            }
        })
        this.mc.on("pressup", function(ev) {
              ev.preventDefault();
                // console.log(that)
                if (ev.pointers[0]['pointerType'] == 'touch'){
                    that.press = false;
                    console.log(that.speech)
                    that.speech.stop();
                    
                }
        })
    }
    
    panEnd(e){
        console.log('panEnd')
    }
    listenEvents(){
        var that = this;
        // console.log('HEY')

        //Mon click est forcement une selection
        d3.select('#eventReceiver')
            .on('pointerdown', function(){

                // getNearestElement('be5a214fa3b0575c82931d4084bd29367', that.props.sketchLines)
                // console.log('HEY')
                // if (d3.event.pointerType == 'pen'){
                that.pointerDownPoperties = {'time': Date.now(), 'position':[d3.event.x, d3.event.y]}
                // that.selecting =false;
                that.drawing = false;
                that.erasing = false;
                // that.hasMoved = false;
                // that.press == false && 

                if (that.isItemDragged == false){
                    that.down = true;
                    // that.createLine();
                    // console.log(d3.event)
                    that.duplicating = that.isGuideHold; 
                    // if (that.isGuideHold != false){
                    //     that.duplicating = true;
                    //     // console.log('GO')
                    //     // that.duplicateSticky(that.isGuideHold);

                    // }
                    if (d3.event.x < 300){
                        that.sticky = true;
                    }
                    else if(d3.event.buttons == 1 && that.selecting != true){
                        that.drawing = true;
                        // that.createDrawing();
                    }
                    else if (d3.event.buttons == 32){
                        that.erasing = true;
                    }
                    else if (d3.event.buttons == 2){
                        that.selecting = true;
                        // that.createSelecting();
                    }
                }
                    //Si je presse pour dupliquer
                    else {

                        //duplicate group

                       /* var ids = that.selectionGroup['data']['idLines'];
                        var newGroupId = guid();
                        var arrayLinesId = [];


                        for (var i in ids){
                            var id = ids[i];
                            var newIdLine = guid();
                            //recuperer la donnee
                            var line = that.props.sketchLines.find(x => x.id == id)
                            var data = {
                                'points': line['points'], 
                                'data': {'class':['group-'+newGroupId]}, 
                                'id': newIdLine, 
                                'position': [0,0]
                            }
                            arrayLinesId.push(newIdLine)
                            that.props.addSketchLine(data);
                        }
                        // console.log(that.selectionGroup['id'])
                        var x = parseFloat(d3.select('#'+that.selectionGroup['id']).attr('x')) + parseFloat(d3.select('#'+that.selectionGroup['id']).attr('width'))/2
                        var y = parseFloat(d3.select('#'+that.selectionGroup['id']).attr('y')) + parseFloat(d3.select('#'+that.selectionGroup['id']).attr('height'))/2
                        // console.log(x, y)
                        var X = 0;
                        var Y = 0;

                        that.props.createGroupLines({'id': '-'+newGroupId, 'data':{'idLines':arrayLinesId}, 'position': [d3.event.x-x, d3.event.y-y]});
                        */
                    }
                // }
                

            })
            .on('pointermove', function(){
                // if (d3.event.pointerType == 'pen'){
                    // console.log(that.drawing, that.sticky, that.selecting, that.duplicating)
                    if (that.down == true  && that.isItemDragged == false){
                        // console.log(that.drawing)
                        // if (that.press == false){

                            
                            that.tempArrayStroke.push([d3.event.x, d3.event.y])
                            if (that.press){

                            }
                            else if (that.drawing){
                                that.drawTempStroke();
                            }
                            else if (that.sticky){
                                that.drawTempStroke();
                            }
                            else if (that.selecting){
                                that.drawTempSelectingStroke();
                            }
                            else if (that.duplicating){
                                that.drawTempStroke();
                                // console.log('Hello world')
                            }

                        // }
                        // else {
                        //     // console.log(d3.select('#'+that.selectionGroup.id).node().getBBox())

                        //     var BBWidth = d3.select('#'+that.selectionGroup.id).node().getBBox().width
                        //     // var BBWidth = text.node().getBBox();
                        //     // var width = that.newGroup.bounds.height;
                        //     var dist = distance(that.panPosition.x, d3.event.x, that.panPosition.y, d3.event.y);
                        //     // console.log(dist)
                        //     if (dist > BBWidth){
                        //         var group = JSON.parse(JSON.stringify(that.selectionGroup))
                        //         group.data.forEach(function(d){ d.id = guid()})
                        //         // that.props.createGroupLines({'id': 'group-'+guid(), 'data':group.data, 'position': [d3.event.x, d3.event.y]});
                        //         that.panPosition = {'x': d3.event.x, "y": d3.event.y };
                        //     }
                        // }
                    }
                    
                    
                    

                    // console.log(d3.event)
                // }
            })
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
            .on('pointerup', function(){

                that.detectingFlick();
                // console.log(that.isGuideHold.length, that.isItemDragged)
                if (that.down && that.isItemDragged == false){
                    // console.log(that.drawing, that.sticky)
                    // console.log(that.drawing)
                    // console.log(that.isGuideHold.length)
                    // if (that.duplicating && that.isGuideHold != false){

                    // }
                    // if (that.selecting) {
                        
                    //     that.makingGroup();
                    //     // selectionGroup
                    //     that.selecting = false;
                    // }
                    if (that.press){

                    }
                    else if (that.duplicating){
                        // that.drawTempStroke();
                        var objectsSelected = that.findIntersection('penTemp');
                        var strokeGuide = JSON.parse(JSON.stringify(that.tempArrayStroke))
                        that.findClosestElements(objectsSelected, 'penTemp').then((elementLines)=> {
                            // that.showBlockOfLinesElement(elementLines);
                            that.makingGroup(elementLines, that.isGuideHold, strokeGuide);
                        })
                        
                    }
                    else if (that.sticky && that.isGuideHold == false){
                        // console.log(length)
                        // that.findIntersection('penTemp');
                        that.addStrokeGuide(); 
                        that.sticky = false;
                    }
                    
                    else if (that.drawing && that.sticky == false && that.isGuideHold == false){
                        that.addStroke();
                        that.drawing = false;
                    }
                    that.removeTempStroke();
                }
                that.tempArrayStroke = [];
                that.down = false;
                that.objectIn = [];
                that.sticky = false;
            })
    }
    detectingFlick(){
        // that.pointerDownPoperties = {'time': Date.now(), 'position':[d3.event.x, d3.event.y]};
        // console.log(Date.now() -  this.pointerDownPoperties['time'])
        var time = Date.now() -  this.pointerDownPoperties['time'];
        var dist = distance(this.pointerDownPoperties['position'][0], d3.event.x, this.pointerDownPoperties['position'][1], d3.event.y)
        // console.log(dist, time)

        //Setup for the flick
        if (time < 200 && dist < 200 && dist > 50){
            console.log('FLICK')
            this.isFlick = true;
        }

    }
    /*duplicateSticky(groupOfLines){
        console.log(groupOfLines)
        var that = this;
        var firstpoint= [];
        for (var i in groupOfLines){
            var id = guid();
            var lineId = groupOfLines[i].split('-')[1]
            // console.log(lineId)
            var line = that.props.stickyLines.find(x => x.id == lineId);
            var arrayPoints = JSON.parse(JSON.stringify(line['points']))
            firstpoint.push(arrayPoints[0])

            var transform = getTransformation(d3.select('#'+groupOfLines[i]).attr('transform'))
 
            var data = {
                'points': arrayPoints, 
                'data': {'linesAttached':[]}, 
                'id': id, 
                'position': [d3.event.x-firstpoint[0][0] + transform.translateX, d3.event.y-firstpoint[0][1]+ transform.translateY]
            }
            this.props.addStickyLines(data);
            
           

            // console.log('item-'+id)
            // setTimeout(function(){
            var objectIntersects = that.findIntersection('item-'+id);
            // console.log(that.objectIn)
            that.props.addLinesClass({'idLines':[lineId], 'class':['item-'+id]});
            // console.log({'idLines':that.objectIn, 'id':id})
            if (objectIntersects.length != 0) that.props.addLinesToSticky({'idLines':objectIntersects, 'id':id})
            
            
                // }, 3000)
            // setTimeout(function(){
                // console.log()
                // console.log(d3.select('#item-'+id).node())
            //
        }
    }*/
    makingGroup(lines, model, strokeGuide){
        // console.log(lines)
        // var selection = whoIsInside(this.props.sketchLines, this.tempArrayStroke);
        // console.log(this.tempArrayStroke)
        var firstPoint = JSON.parse(JSON.stringify(strokeGuide[0]))
        var arrayPoints = strokeGuide;
        arrayPoints.forEach((d)=>{
            d[0] = d[0] - firstPoint[0];
            d[1] = d[1] - firstPoint[1]
        })


        var modelData = this.props.stickyLines.find(x => x.id == model)
        // console.log(modelData)
        var id = guid();
        var group = {
            'id': id, 
            'lines':lines, 
            'position': [0,0],
            'model': modelData,
            'stroke': {'points':arrayPoints, 'position': [firstPoint[0],firstPoint[1]]}
        };
        console.log(group)
        // this.props.addLinesClass({'idLines':selection, 'class':['group-'+id]})
        this.props.createGroupLines(group);
        // this.props.removeSketchLines();


        // for (var i in selection){
        //     d3.select('#item-'+selection[i]).classed('group-'+id, true);
        // }

        // console.log(selection)
    }
    findClosestElements(objects, idGuide){
        return new Promise((resolve, reject) => {

            var firstPoint = {'x': this.tempArrayStroke[0][0] , 'y': this.tempArrayStroke[1][1]  };
            var lastPoint = {'x': this.tempArrayStroke[this.tempArrayStroke.length-1][0], 'y': this.tempArrayStroke[this.tempArrayStroke.length-1][1] };
            var pointOnLine = [];
            var centerBox = [0];
            var pointsThroughLine = [];
            var alreadyAdded = [];

            console.log(objects)
            objects.forEach((objectIntersection, i)=>{
                pointsThroughLine.push([]);
                alreadyAdded.push([])
                var objectId = objectIntersection.id 
                alreadyAdded[i].push(objectId);
                //ConvexHull
                var line = this.props.sketchLines.find(x => x.id == objectId);
                var points = JSON.parse(JSON.stringify(line['points']));
                var transform = getTransformation(d3.select('#item-'+objectId).attr('transform'))
                points = points.map((d)=>{
                    return new Vector(d[0] + transform.translateX,d[1] + transform.translateY)
                })
                
                var BB = _getBBox('item-'+objectId);
                // showBboxBB(BB, 'red');
                // showBbox('item-'+objectId, 'red');
                
                centerBox[i] = getCenterPolygon(points);
                // drawCircle(centerBox[i].x, centerBox[i].y, 5, 'orange');

                pointOnLine[i] = {'x': BB.x+ BB.width, 'y':BB.y+ (BB.height/2)}
                // pointOnLine[i] = getSpPoint(firstPoint, lastPoint, centerBox[i]);
                // drawCircle(pointOnLine[i].x, pointOnLine[i].y, 5, 'green');
                pointsThroughLine[i].push(pointOnLine[i]);
                pointsThroughLine[i].push(centerBox[i]);

                this.expandText(pointOnLine[i],  centerBox[i], 3,  pointsThroughLine[i], alreadyAdded[i], -1, JSON.parse(JSON.stringify(this.props.sketchLines)));
                this.expandText(centerBox[i], pointOnLine[i],  3,  pointsThroughLine[i], alreadyAdded[i], +1, JSON.parse(JSON.stringify(this.props.sketchLines)));

            })


            /**
             * REMOVE DOUBLONS
             */
            var arrayDoublons = [];
            var realArray = [];
            alreadyAdded.forEach((d)=>{
                var newArr = [];
                d.forEach((e)=>{
                    if (arrayDoublons.indexOf(e) == -1) newArr.push(e)
                    // else console.log('doublon');
                    arrayDoublons.push(e)
                })
                realArray.push(newArr)
            })
    

            // console.log(realArray)
            resolve(realArray)

        })

    }
        // console.log(alreadyAdded)
        /**********************************************************/
        //    EXPAND AS LONG AS USERS WRITE
        /**********************************************************/
    expandText(begin, end, lengthInterpolate, pointsThroughLine, alreadyAdded, signe, sketchLines){
            
            // var point = interpolate(begin, end, lengthInterpolate);
        var that = this;
        var angle = Math.atan2(end.y-begin.y, end.x-begin.x)
        var point = createPositionAtLengthAngle(end, angle, 200);
        // console.log('GO')
        // drawCircle(point.x, point.y, 5, 'red');

        // drawLine(begin.x, begin.y, point.x, point.y, 'red');


        d3.select('.standAloneLines').selectAll('g').each(function(){
            var id = d3.select(this).attr('id').split('-')[1];
            if (alreadyAdded.indexOf(id) == -1){
                
                var BB = _getBBox('item-'+id);
                BB.x -= 15;
                BB.y -= 15;
                BB.width +=30;
                BB.height += 30
                var oobbNew = [
                    {'x': BB.x, 'y':BB.y},
                    {'x': BB.x+ BB.width, 'y':BB.y},
                    {'x': BB.x+ BB.width, 'y':BB.y + BB.height},
                    {'x': BB.x, 'y':BB.y + BB.height}
                ]
                var isIntersect = lineIntersectsPolygone(begin, point, oobbNew);
                if (isIntersect){
                    // showBboxBB(BB, 'red')
                    // showBbox('item-'+id, 'blue');
                    alreadyAdded.push(id)
                    lengthInterpolate = lengthInterpolate *2;

                    var centerPolygon = getCenterPolygon(oobbNew);
                    var rightSide = {'x': BB.x+ BB.width, 'y':BB.y+ (BB.height/2)}
                    // var result = that.increasePrecisionLine(begin, end, oobbNew, pointsThroughLine,)
                    if (signe == 1) that.expandText(centerPolygon, rightSide, lengthInterpolate, pointsThroughLine, alreadyAdded, signe, sketchLines)//, arraySorted,oobb, iteration)
                    else that.expandText(rightSide, centerPolygon, lengthInterpolate, pointsThroughLine, alreadyAdded, signe, sketchLines)
                }
            }
        })
     }

        
    
    //Pour les guides
    findIntersection(){
        //Getting all objects
        var that = this;
        this.objectIn = [];

        d3.select('.standAloneLines').selectAll('g').each(function(){
            var BB = _getBBox(d3.select(this).attr('id'));
            var selection = [
                [BB.x, BB.y],
                [BB.x+BB.width, BB.y],
                [BB.x+BB.width, BB.y+BB.height],
                [BB.x, BB.y+BB.height]
            ]
            var isIn = false;
            var i = 0;
            var length = d3.select('#penTemp').node().getTotalLength();
            while(isIn == false && i< length){
                var pointSticky = d3.select('#penTemp').node().getPointAtLength(i);
                var isIn = is_point_inside_selection([pointSticky.x, pointSticky.y],  selection);
                if (isIn) that.objectIn.push({'id':d3.select(this).attr('id').split('-')[1]})
                i+=10;
            }
        })


        /**
        *   CHECK INTERSECTION BETWEEN BOXES
        */
        var indexToSLice = []
        for (var i = 0; i < that.objectIn.length; i++){
            var id1 = that.objectIn[i];
            var BB1 = _getBBox('item-'+id1.id);
            BB1.x -= 10
            BB1.width += 20
            
            // showB/boxBB(BB1, 'red');
            for (var j = i+1; j < that.objectIn.length; j++){
                var id2 = that.objectIn[j];
                var BB2 = _getBBox('item-'+id2.id);
                var intersected = boxBox(BB1.x, BB1.y, BB1.width, BB1.height, BB2.x, BB2.y, BB2.width, BB2.height);
                //  indexToSLice.push(i);
                if (intersected) {
                    // console.log(intersected, i, j)
                    indexToSLice.push(i);
                }
            }
            
        }

        for (var i = indexToSLice.length - 1; i >= 0; i--) {
            that.objectIn.splice(indexToSLice[i], 1);
        }
       

        // for (var i = 0; i < that.objectIn.length; i++){
        //     var id1 = that.objectIn[i];
        //     var BB1 = _getBBox('item-'+id1.id)
        //     showBboxBB(BB1, 'red');
        // }

        // console.log(that.objectIn)
        return JSON.parse(JSON.stringify(that.objectIn))
    }
    
    showBlockOfLinesElement(lines){
        // console.log(lines)
        lines.forEach((line)=>{
            var sketchLines = JSON.parse(JSON.stringify(this.props.sketchLines))
            // console.log(line, ))
            line.forEach((D)=>{
                var oobb = getoobb(D, sketchLines);
                drawPath(oobb.oobb)
            })
            // var oobb = getoobb(line, JSON.parse(JSON.stringify(this.props.sketchLines)));
            // console.log(oobb)
            // drawPath(oobb.oobb)
        })
        
    }
    addStrokeGuide(){
        var id = guid();
        var that = this;
        // console.log( this.objectIn)
        
        
        var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
        var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke));
        arrayPoints.forEach((d)=>{
            d[0] = d[0] - firstPoint[0];
            d[1] = d[1] - firstPoint[1]
        })
        var data = {
            'points': arrayPoints, 
            'id': id, 
            'placeHolder': [{'id':'background', 'data': {}, 'lines':[]}, {'id':'left', 'data': {}, 'lines':[]}, {'id':'right', 'data': {}, 'lines':[]}, {'id':'middle', 'data': {}, 'lines':[]}],
            'position': [firstPoint[0],firstPoint[1]],
            'textPosition': {'where': 'right', 'position': [10,50]},
        }

        this.props.addStickyLines(data);

        // console.log({'idLines':that.objectIn, 'class':['item-'+id]})
        //Add class to element
        
        // this.props.addLinesClass({'idLines':that.objectIn, 'class':['item-'+id]})
        // for (var i in this.objectIn){
        //     d3.select('#item-'+that.objectIn[i]).classed('sticky-'+id, true);
        // }
    }
    drawTempStroke(){
        var that = this;
        var line = d3.line()
        d3.select('#penTemp')
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", 'none');


        if (this.sticky) d3.select('#penTemp').attr('stroke', '#9C9EDEDF')
    }
    drawTempSelectingStroke(){
        var that = this;
        var line = d3.line()
        d3.select('#penTemp')
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "5");
    }
    removeTempStroke(){
        var line = d3.line()
        d3.select('#penTemp').attr("d", line([]))
    }
    addStrokeFilledData(data){
        // console.log(data)
        this.props.addSketchLine(data);
    }
    addStroke(){
        var id = guid();

        if (this.tempArrayStroke.length > 1){
            // To have everything in 0,0
            var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
            var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke))
            arrayPoints.forEach((d)=>{
                d[0] = d[0] - firstPoint[0];
                d[1] = d[1] - firstPoint[1]
            })
            // console.log(arrayPoints)
            var data = {
                'points': arrayPoints, 
                'data': {'class':[]}, 
                'id': id, 
                'isAlphabet': false,
                'position': [firstPoint[0],firstPoint[1]]
            }
            this.props.addSketchLine(data);
        }
    }

    changeWidthStroke = (d) => {
        // console.log(d)
        this.strokeWidth = String(d);
    }
    addText (d){
        this.props.addText(d);
    }
    changeColorStroke = (d, opacity) => {
        // console.log(d, this)
        this.strokeColor = String(d);
        this.strokeOpacity = opacity;
        // this.activePath.strokeColor = this.strokeColor;
    }
    changeActionPen = (d) => {
        this.actionPen = d;
    }
    isSticky = (d) => {
        this.sticky = d;
    }
    isGroup = (d) => {
        this.selecting = d;
    }
    // setTextBounds= (d) => {
    //     // console.log(d);
    //     this.pointText = d;
    // }
    holdGuide = (d) => {
        console.log('Selection '+d)
        this.isGuideHold = d;
    }
    // To know if an item was dragged
    dragItem = (d) => {
        this.isItemDragged = d;
    }
    setSelection = (d) => {
        this.linesInselection = d;
    }
    openAlphabet = (d) => {
        // console.log('HEY')
        this.setState({shouldOpenAlphabet:d});
    }
    setGuideTapped = (d) => {

        console.log(this.linesInselection, d)
        this.guideTapped = d;

        if (this.linesInselection.elements.length != 0){

            // console.log(this.props.stickyLines);

            var sticky = this.props.stickyLines.find(x => x.id == this.guideTapped.item)
            var data = {
                'idGroups': this.linesInselection.elements, 
                'model': sticky
            };
            console.log(data)

            this.props.changeModelGroupLines(data);
        }
    }
    render() {
        return (
            <div>
                
                <svg id="canvasVisualization">
                    <rect id='eventReceiver'  x={0} y={0} fill='red' opacity='0' />
                    
                    <g id="item-feedBackVoice">
                        <circle r={35} opacity={0} fill={'#c7e9c0'} id="circlefeedBackVoice" />
                    </g>


                    <Lines />
                    <Guides 
                        holdGuide={this.holdGuide} 
                        dragItem={this.dragItem}
                        setGuideTapped={this.setGuideTapped}
                    />
                    <Interface />

                    <Menus />
                    
                    <Groups 
                        setSelection={this.setSelection}
                    />
                    <Textes />

                    <g id="tempLines">
                        <path id="penTemp"></path>
                    </g>


                   


                    {/* <g id="eventReceiver">
                        </g>     */}
                    {/* <ColorMenu isSticky={this.isSticky} changeColorStroke={this.changeColorStroke} changeWidthStroke={this.changeWidthStroke} changeActionPen={this.changeActionPen}/> */}
                        
               

                </svg>
                
                {/* <svg id="eventReceiver"></svg> */}
                <ColorMenu 
                    openAlphabet={this.openAlphabet}

                    isSticky={this.isSticky} 
                    isGroup ={this.isGroup} 
                />
                {this.state.shouldOpenAlphabet ? <Lettres openAlphabet={this.openAlphabet} /> : null}
            </div>
        );
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(Document);

