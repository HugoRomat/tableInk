import React, { Component } from "react";
import * as d3 from 'd3';
import Lines from './Lines'
import './../../css/main.css';
import paper from 'paper';
import * as Hammer from 'hammerjs';
import { connect } from 'react-redux';
import { distance, guid, whoIsInside, getTransformation, is_point_inside_selection, getType, showBbox, _getBBox, checkIntersection, getNearestElement, showBboxBB, drawCircle, interpolate, line_intersect, midPosition, getPerpendicularPoint, drawLine, distToSegment, lineIntersectsSquare, lineIntersectsPolygone, showOmBB, center, getSpPoint, LeastSquares, createPositionAtLengthAngle, getCenterPolygon } from "./Helper";
import ColorMenu from "./ColorMenu";


import CalcConvexHull from './../../../customModules/convexhull';
import Vector from './../../../customModules/vector';
import CalcOmbb from './../../../customModules/ombb';

import { 
    addSketchLine,
    removeSketchLines,
    createGroupLines,
    addStickyLines,
    addLinesClass,
    addLinesToSticky
} from '../actions';
import Guides from "./Guides/Guides";

import Interface from "./Interface";
import Menus from "./Menus/Menus";
import Lettres from "./Lettres/Lettres";

const mapDispatchToProps = {  
    addSketchLine,
    removeSketchLines,
    createGroupLines,
    addStickyLines,
    addLinesClass,
    addLinesToSticky
};


function mapStateToProps(state, ownProps) {

    // console.log(state)
    return {
        sketchLines: state.rootReducer.present.sketchLines,
        stickyLines: state.rootReducer.present.stickyLines
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

        // console.log(CalcOmbb)
    }
    init(){

    }
    componentDidMount(){
        this.listenEvents();
        d3.select('#canvasVisualization').style('width', '100%').style('height', '100%');
        // d3.select('#eventReceiver').style('width', '100%').style('height', '100%');
        
        // this.listenHammer();
        // this.init();

        // this.isMount = true;
        // this.forceUpdate();

        // console.log(this.props)
    }
    listenHammer(){
        var that = this;
        var el = document.getElementById("canvasVisualization");
        this.mc = new Hammer.Manager(el);
        var press = new Hammer.Press({time: 250});
        var pan = new Hammer.Pan({'pointers':2, threshold: 5});
        this.mc.add(press);
        this.mc.add(pan);

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
        //   this.mc.on("press", function(ev) {
        //     //   ev.preventDefault();
        //         // console.log(that)
        //       if (ev.pointers[0]['pointerType'] == 'touch'){
        //         // console.log('PRESS')
        //         that.press = true;
        //         // that.press(ev);
        //       }
        //     })
        //     this.mc.on("pressup", function(ev) {
        //         //   ev.preventDefault();
        //             // console.log(that)
        //           if (ev.pointers[0]['pointerType'] == 'touch'){
        //             that.press = false;
        //           }
        //         })
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
                // that.press == false && 

                if (that.isItemDragged == false){
                    that.down = true;
                    // that.createLine();
                    // console.log(d3.event)
                    if (that.isGuideHold != false){
                        that.duplicating = true;
                        // console.log('GO')
                        // that.duplicateSticky(that.isGuideHold);

                    }
                    else if (d3.event.x < 300){
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
                    if (that.down == true  && that.isItemDragged == false){
                        // console.log(that.drawing)
                        // if (that.press == false){

                            
                            that.tempArrayStroke.push([d3.event.x, d3.event.y])
                            if (that.drawing){
                                that.drawTempStroke();
                            }
                            if (that.sticky){
                                that.drawTempStroke();
                            }
                            if (that.selecting){
                                that.drawTempSelectingStroke();
                            }
                            if (that.duplicating){
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
                    if (that.selecting) {
                        
                        that.makingGroup();
                        // selectionGroup
                        that.selecting = false;
                    }
                    else if (that.duplicating){
                        // that.drawTempStroke();
                        var objectsSelected = that.findIntersection('penTemp');
                        that.findClosestElements(objectsSelected, 'penTemp');
                        // console.log('Hello world')
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
    makingGroup(){
        /*var selection = whoIsInside(this.props.sketchLines, this.tempArrayStroke);
        var id = guid();
        this.selectionGroup = {'id': id, 'data':{'idLines':selection}, 'position': [0,0]};
        console.log(selection)

        this.props.addLinesClass({'idLines':selection, 'class':['group-'+id]})
        this.props.createGroupLines({'id': id, 'data':{'idLines':selection}, 'position': [0,0]});
        */


        // for (var i in selection){
        //     d3.select('#item-'+selection[i]).classed('group-'+id, true);
        // }

        // console.log(selection)
    }
    /*findClosestElementsDistance(objects, idGuide){
        this.alreadyGoInsideLines = [];
        objects.forEach((objectIntersection)=>{

            var objectId = objectIntersection.id;
            this.alreadyGoInsideLines.push(objectId);
            
            var lines = JSON.parse(JSON.stringify(this.props.sketchLines));
            var line = lines.find(x => x.id == objectId);

            var transform = getTransformation(d3.select('#item-'+objectId).attr('transform'))
            console.log()
            var startPoint = [line.points[0][0] + transform.translateX, line.points[0][1] + transform.translateY];
            var endPoint =  [line.points[line.points.length-1][0] + transform.translateX, line.points[line.points.length-1][1] + transform.translateY];

            console.log(startPoint, endPoint)
            // findCloseToEndPoint(endPoint)
            drawCircle(startPoint[0], startPoint[1], 5, 'green')
            drawCircle(endPoint[0], endPoint[1], 5, 'green')
            
            findCloseToStartPoint(lines, startPoint, this.alreadyGoInsideLines)
            
        })

        function findCloseToStartPoint(lines, startPoint, alreadyGoInsideLines){
            var isIn = false;
            // console.log(lines)
            lines.forEach((d)=>{
                // console.log(d)
                d = JSON.parse(JSON.stringify(d));
                if (alreadyGoInsideLines.indexOf(d.id) == -1){
                    // console.log(d.id)
                    var transform = getTransformation(d3.select('#item-'+d.id).attr('transform'))
                    var lastPoint =  [d.points[d.points.length-1][0] + transform.translateX, d.points[d.points.length-1][1] + transform.translateY];
                    // drawCircle(lastPoint[0], lastPoint[1], 1, 'red')
                    var dist = distance(startPoint[0], lastPoint[0],startPoint[1], lastPoint[1] );
                    console.log(dist)
                    if (dist < 40){
                        alreadyGoInsideLines.push(d.id);
                        isIn = d.points[0];
                        console.log(alreadyGoInsideLines)
                    }
                }
               
            })
            // if (isIn != false){
            //     findCloseToStartPoint(isIn)
            // }
        }
        // function findCloseToEndPoint(endPoint){
        //     lines.forEach((d)=>{
        //         var firstPoint = d.points[0];
        //         var dist = distance(endPoint[0], firstPoint[0],endPoint[1], firstPoint[1] );
        //         console.log(dist)
        //     })
        // }
    }*/
    findClosestElements(objects, idGuide){
        console.log(objects)
        var that = this;
        // this.alreadyGoInsideLines = [];
        // this.pointsThroughLine = [];
        // this.alreadyAdded = []

        var firstPoint = {'x': this.tempArrayStroke[0][0] , 'y': this.tempArrayStroke[1][1]  };
        var lastPoint = {'x': this.tempArrayStroke[this.tempArrayStroke.length-1][0], 'y': this.tempArrayStroke[this.tempArrayStroke.length-1][1] };

        var pointOnLine = [];
        var centerBox = [0];
        var pointsThroughLine = [];
        var alreadyAdded = [];

      

        objects.forEach((objectIntersection, i)=>{
            pointsThroughLine.push([]);
            alreadyAdded.push([])

            var objectId = objectIntersection.id 
            alreadyAdded[i].push(objectId);
            // var pointClosest = objectIntersection.intersectionPoint;
            var line = this.props.sketchLines.find(x => x.id == objectIntersection.id);
            var points = JSON.parse(JSON.stringify(line['points']));

            drawCircle(firstPoint.x, firstPoint.y, 5, 'green')
            drawCircle(lastPoint.x, lastPoint.y, 5, 'green')
            /**********************************************************/
            //    SERT A TROUVER LA LIGNE QUI COUPE MON MOT EN DEUX
            /**********************************************************/

            //ConvexHull
            var line = this.props.sketchLines.find(x => x.id == objectId);
            var points = JSON.parse(JSON.stringify(line['points']));
            var transform = getTransformation(d3.select('#item-'+objectId).attr('transform'))
            points = points.map((d)=>{
                return new Vector(d[0] + transform.translateX,d[1] + transform.translateY)
            })
            
            // PREND LES NEARES ELEMENT POUR PAR AVOIR UN CENTRE ABBERANT
            getNearestElement(objectId, JSON.parse(JSON.stringify(this.props.sketchLines))).then((nearObjects)=>{
                console.log(nearObjects)
                nearObjects.forEach((d)=>{
                    // var id = d.split('-')[1];
                    var id = d;
                    console.log(id)
                    var line = this.props.sketchLines.find(x => x.id == id);
                    var otherPoints = JSON.parse(JSON.stringify(line['points']));
                    var transform = getTransformation(d3.select('#item-'+id).attr('transform'));
                    console.log(transform)
                    otherPoints = otherPoints.map((d)=>{
                        return new Vector(d[0] + transform.translateX,d[1] + transform.translateY)
                    })
                    points = points.concat(otherPoints);
                    showBbox('item-'+id, 'red')
                    alreadyAdded[i].push(id);
                
                })

                //FIND CENTER OF MY SHAPE
                var convexHull = CalcConvexHull(points);
                var oobb = new CalcOmbb(convexHull);
                showOmBB(oobb);
                centerBox[i] = getCenterPolygon(points);
                drawCircle(centerBox[i].x, centerBox[i].y, 5, 'orange');

                pointOnLine[i] = getSpPoint(firstPoint, lastPoint, centerBox[i]);
                drawCircle(pointOnLine[i].x, pointOnLine[i].y, 5, 'green');
                pointsThroughLine[i].push(pointOnLine[i]);
                pointsThroughLine[i].push(centerBox[i]);

                drawLine(pointOnLine[i].x, pointOnLine[i].y, centerBox[i].x, centerBox[i].y, 'red');

                

                // setTimeout(function(){
                    
                    expandText(pointOnLine[i],  centerBox[i], 3,  pointsThroughLine[i], alreadyAdded);
                // },1000)
            })

        })

        /**********************************************************/
        //    EXPAND AS LONG AS USERS WRITE
        /**********************************************************/
        function expandText(begin, end, lengthInterpolate, pointsThroughLine, alreadyAdded){
            
            // var point = interpolate(begin, end, lengthInterpolate);

            var angle = Math.atan2(end.y-begin.y, end.x-begin.x)
            var point = createPositionAtLengthAngle(end, angle, 150)
            drawCircle(point.x, point.y, 5, 'red');

            drawLine(begin.x, begin.y, point.x, point.y, 'red');


            d3.select('.standAloneLines').selectAll('g').each(function(){
                var id = d3.select(this).attr('id').split('-')[1];
                if (alreadyAdded.indexOf(id) == -1){
                    
                    var line = that.props.sketchLines.find(x => x.id == id)
                    // console.log(that.props.sketchLines, id)
                    var points = JSON.parse(JSON.stringify(line['points']));
                    var transform = getTransformation(d3.select('#item-'+id).attr('transform'))
                    points = points.map((d)=>{
                        return new Vector(d[0] + transform.translateX,d[1] + transform.translateY)//{'x': d[0], 'y': d[1]}
                    })
                    var convexHull = CalcConvexHull(points);
                    var oobbNew = new CalcOmbb(convexHull);

                    // var BB = _getBBox(id);   
                    var isIntersect = lineIntersectsPolygone(begin, point, oobbNew);
                    if (isIntersect){
                        alreadyAdded.push(id)
                        // console.log(that.alreadyGoInsideLines)
                        // that.alreadyGoInsideLines.push(id);
                        showOmBB(oobbNew);
                        // objectIntersection.points = objectIntersection.points.concat(points)
                        // showBboxBB(BB, 'blue')
                        // setTimeout(function(){
                        lengthInterpolate = lengthInterpolate *2;
                        // console.log(pointsThroughLine)
                        var result = increasePrecisionLine(begin, end, oobbNew, pointsThroughLine,)
                        // expandText(begin, end, lengthInterpolate, pointsThroughLine, alreadyAdded)
                        expandText(result.begin, result.end, lengthInterpolate, pointsThroughLine, alreadyAdded)//, arraySorted,oobb, iteration)
                            
                        // },1000)
                    }
                }
            })
        }

        /**** DRAW UNE TREND LINE POUR LES AVOIR */
        function increasePrecisionLine(begin, end, oobbNew, pointsThroughLine){

            
            // console.log(pointsThroughLine)
            var centerBox = getCenterPolygon(oobbNew);
            pointsThroughLine.push(centerBox);
            // drawCircle(centerBox.x, centerBox.y, 5, 'orange')
 
            // console.log(pointsThroughLine)

            pointsThroughLine.forEach((d)=>{
                drawCircle(d.x, d.y, 5, 'blue');
            })
            // drawCircle(centerBox.x, centerBox.y, 5, 'red');

            var valuesX = [];
            var valuesY = [];
            pointsThroughLine.forEach((d)=>{
                valuesX.push(d.x)
            })
            pointsThroughLine.forEach((d)=>{
                valuesY.push(d.y)
            })
            // console.log(valuesX, valuesY)
            var coeffRegression = LeastSquares(valuesX,valuesY);
            var from = {'x': begin.x, 'y':(coeffRegression['m'] *  begin.x) + coeffRegression['b']}
            var to = {'x': centerBox.x, 'y':(coeffRegression['m'] * centerBox.x) + coeffRegression['b']}
            // console.log(from, to)
            drawLine(from.x, from.y, to.x, to.y, 'blue');
            return {'begin': from, 'end':to}
        }
        
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
            while( isIn == false && i< length){
                var pointSticky = d3.select('#penTemp').node().getPointAtLength(i);
                var isIn = is_point_inside_selection([pointSticky.x, pointSticky.y],  selection);
                if (isIn) that.objectIn.push({'id':d3.select(this).attr('id').split('-')[1]})
                i++;
            }
        })

        // console.log(that.objectIn)
        return JSON.parse(JSON.stringify(that.objectIn))
    }
    // findIntersection(id){
    //     //Getting all objects
    //     var that = this;
    //     this.objectIn = [];

    //     var firstPoint = that.tempArrayStroke[0];
    //     var lastPoint = that.tempArrayStroke[that.tempArrayStroke.length-1];
    //     var lineGuide = [{'x': firstPoint[0] ,'y': firstPoint[1]}, {'x': lastPoint[0], 'y': lastPoint[1] }]

    //     drawLine(firstPoint[0] ,firstPoint[1],lastPoint[0], lastPoint[1] , 'black' )
    //     //Regardes les intersections
    //     d3.select('.standAloneLines').selectAll('g').each(function(){

    //         var BB = _getBBox(d3.select(this).attr('id'));
    //         var line1 = [{'x': BB.x, 'y': BB.y}, {'x': BB.x + BB.width, 'y': BB.y }]
    //         var line2 = [{'x': BB.x + BB.width, 'y': BB.y}, {'x': BB.x + BB.width, 'y': BB.y + BB.height}]
    //         var line3 = [{'x': BB.x + BB.width, 'y': BB.y + BB.height}, {'x': BB.x, 'y': BB.y + BB.height }]
    //         var line4 = [{'x': BB.x, 'y': BB.y + BB.height }, {'x': BB.x , 'y': BB.y }];

    //         var arrayLine = [line1, line2, line3, line4];
    //         var item = null
    //         arrayLine.forEach((line)=>{
    //             var isIntersect = line_intersect(line[0].x, line[0].y, line[1].x, line[1].y, lineGuide[0].x, lineGuide[0].y, lineGuide[1].x, lineGuide[1].y);
    //             if (isIntersect != false) {
    //                 console.log('HEY')
    //                 item = d3.select(this).attr('id').split('-')[1]
    //             }
    //         })
    //         if (item != null) that.objectIn.push(item)

    //     })
    //     // console.log(that.objectIn)
    //     return JSON.parse(JSON.stringify(that.objectIn))
    // }
    expandSelection(){

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
            'linesAttached': this.objectIn, 
            'id': id, 
            'placeHolder': [{'id':'left', 'data': {}, 'lines':[]}, {'id':'right', 'data': {}, 'lines':[]}, {'id':'top', 'data': {}, 'lines':[]}, {'id':'bottom', 'data': {}, 'lines':[]}, {'id':'middle', 'data': {}, 'lines':[]}],
            'position': [firstPoint[0],firstPoint[1]],
            'textPosition': {'where': 'right', 'position': [10,50]},
        }

        this.props.addStickyLines(data);

        // console.log({'idLines':that.objectIn, 'class':['item-'+id]})
        //Add class to element
        
        this.props.addLinesClass({'idLines':that.objectIn, 'class':['item-'+id]})
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

    addStroke(){
        var id = guid();
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
            'position': [firstPoint[0],firstPoint[1]]
        }
        this.props.addSketchLine(data);
       
    }

    changeWidthStroke = (d) => {
        // console.log(d)
        this.strokeWidth = String(d);
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
        // console.log('HOOOOLD')
    }
    // To know if an item was dragged
    dragItem = (d) => {
        
        this.isItemDragged = d;
        // console.log('HOOOOLD')
    }
    render() {
        return (
            <div>
                
                <svg id="canvasVisualization">
                        <rect id='eventReceiver' height={window.innerWidth} width={window.innerHeight} x={0} y={0} fill='red' opacity='0' />
                        
                        <Lines />
                        <Guides holdGuide={this.holdGuide} dragItem={this.dragItem}/>
                        <Interface />

                        <Menus />
                        <Lettres />

                        <g id="tempLines">
                            <path id="penTemp"></path>
                        </g>
                        
                        {/* <g id="eventReceiver">
                            </g>     */}
                        {/* <ColorMenu isSticky={this.isSticky} changeColorStroke={this.changeColorStroke} changeWidthStroke={this.changeWidthStroke} changeActionPen={this.changeActionPen}/> */}
                        
               

                </svg>
                {/* <svg id="eventReceiver"></svg> */}
                <ColorMenu isSticky={this.isSticky} isGroup ={this.isGroup} />
            </div>
        );
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(Document);

