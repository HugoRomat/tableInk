import React, { Component } from "react";
import * as d3 from 'd3';
import  $ from 'jquery';
import Lines from './Lines'
import './../../css/main.css';

import * as Hammer from 'hammerjs';
import { connect } from 'react-redux';
import { distance, guid, whoIsInside, getTransformation, is_point_inside_selection, getType, showBbox, _getBBox, checkIntersection, getNearestElement, showBboxBB, drawCircle, interpolate, line_intersect, midPosition, getPerpendicularPoint, drawLine, distToSegment, lineIntersectsSquare, lineIntersectsPolygone, showOmBB, center, getSpPoint, LeastSquares, createPositionAtLengthAngle, getCenterPolygon, drawPath, getoobb, FgetBBox, simplify, _getBBoxPromise, getBoundinxBoxLines, _getBBoxPromiseNode } from "./Helper";
import ColorMenu from "./Interface/ColorMenu";
import Polygon from 'polygon'

import CalcConvexHull from './../../../customModules/convexhull';
import Vector from './../../../customModules/vector';
import CalcOmbb from './../../../customModules/ombb';

import {boxBox, boxPoint} from 'intersects';

import paperTexture from './../../../static/paperTexture.jpg';

import { 
    addSketchLine,
    removeSketchLines,
    createGroupLines,
    addStickyLines,
    addLinesClass,
    addLinesToSticky,
    changeModelGroupLines,
    addText,
    setGrid,
    addLineToGroup,
    addLineToExistingGroup
} from '../actions';
import Guides from "./Guides/Guides";

import Interface from "./Interface";
import Menus from "./Menus/Menus";
import Lettres from "./Lettres/Lettres";
import Groups from "./Group/Groups";
import { SpeechRecognitionClass } from "./SpeechReognition/Speech";
import Textes from "./Textes/Textes";
import GalleryItmes from "./Gallery/GalleryItmes";
import Tags from "./Tags/Tags";

const mapDispatchToProps = {  
    addSketchLine,
    removeSketchLines,
    createGroupLines,
    addStickyLines,
    addLinesClass,
    addLinesToSticky,
    changeModelGroupLines,
    addText,
    setGrid,
    addLineToGroup,
    addLineToExistingGroup
};


function mapStateToProps(state, ownProps) {

    // console.log(state)
    return {
        sketchLines: state.rootReducer.present.sketchLines,
        stickyLines: state.rootReducer.present.stickyLines,
        lettres: state.rootReducer.present.lettres,
        UIid: state.rootReducer.present.UIid,
        groupLines: state.rootReducer.present.groupLines,
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
            shouldOpenAlphabet: false,
            openGalleryModel: false,
            
            colorStroke: 'black',
            sizeStroke: 2,
            tagHold: false
        }

        this.swipe = false;

        this.pointerOnInterface = [];
        this.swipe = false;

        this.sizePen = 2;
        this.colorPen = 'black';

        this.marginOffset = 300;
        this.showGrid = false;  

        this.gridSizeTemp = [10 ,10]      
        this.gridSize = [10 ,10]    ;
        
        this.isPatternPen = false;
        this.patternPen = [];
        this.patternBBOX = null;
       
        this.init();
        // this.shouldOpenAlphabet = false;
        // console.log(CalcOmbb)
    }
    init(){
        if (window.innerWidth < 769){
            this.marginOffset = 110;
            d3.select('.lineRed').style('left', '110px')
        }
    }
    componentDidMount(){
        this.listenHammer();
        this.listenHammerRectangle();
        this.listenEvents();
        // d3.select('#canvasVisualization').style('width', '100%').style('height', '100%');
        // d3.select('#eventReceiver').style('width', '100%').style('height', '100%');
        // var zoom = d3.zoom().on("zoom", function () {
        //     console.log(d3.event.transform)
        //     // svg.attr("transform", d3.event.transform)
        //  })

        // d3.select('#panItems').attr("transform", 'translate(0,0)')

        this.speech = new SpeechRecognitionClass(this);



        

        var defs = d3.select('svg').append('svg:defs');
        defs.append("svg:pattern")
            .attr("id", "grump_avatar")
            .attr("width", 1000)
            .attr("height", 1000)
            .attr("patternUnits", "userSpaceOnUse")
            
            .append("svg:image")
            .attr("xlink:href", paperTexture)
            .attr("width", 1000)
            .attr("height", 1000)
            .attr("x", 0)
            .attr("y", 0);

            
        // this.init();

        // this.isMount = true;
        // this.forceUpdate();

        // console.log(this.props)
        // this.grid = {'x':0, 'y':0, 'width':window.innerWidth*2, 'height':window.innerHeight*2};
        // this.drawGrid(this.grid.x,this.grid.y, this.grid.width, this.grid.height);
        
    }
    removeGrid(){
        d3.selectAll('.line').remove();
        d3.selectAll('.column').remove();
    }
    drawGrid(startX, startY, width, height){
        // console.log('HEYY', this.gridSize)
        var that = this;
        this.gridHeight = this.gridSize[1];
        this.gridWidth = this.gridSize[0];


        var totalWidth = width;
        var totalHeight = height;


        var numberLine = Math.ceil(totalHeight/that.gridHeight);
        var numberColumn = Math.ceil(totalWidth/that.gridWidth);

        // console.log(totalWidth)
        d3.selectAll('.line').remove();
        d3.selectAll('.column').remove();

        for (var i =0; i<numberLine; i++ ){
            d3.select('#grid').append('line').attr('class', 'line')
                .attr('x1', startX)
                .attr('y1', (i*that.gridHeight) + startY)
                .attr('x2', totalWidth + startX)
                .attr('y2', (i*that.gridHeight) + startY)
                .attr('stroke', 'black')
                .attr('stroke-width', '0.2')
        }
        for (var i =0; i<numberColumn; i++ ){
            // console.log((i*that.gridWidth), (i*that.gridWidth) + that.grid.x)
            d3.select('#grid').append('line').attr('class', 'column')
                .attr('x1', (i*that.gridWidth) + startX)
                .attr('y1', startY)
                .attr('x2', (i*that.gridWidth) + startX)
                .attr('y2', totalHeight + startY)
                .attr('stroke', 'black')
                .attr('stroke-width', '0.2')
        }
    }
    panGrid(X, Y, offsetX, offsetY){
        var that = this;
        // this.drawGrid(0,0, window.innerWidth, window.innerHeight);

        // console.log(-Y, this.grid.y)
        if (offsetX> 0 && -X < this.grid.x){
            this.grid.x -= this.gridWidth;
            this.drawGrid(this.grid.x,this.grid.y, this.grid.width, this.grid.height);
        }
        else if (offsetX< 0 && -X > this.grid.x){
            this.grid.x += this.gridWidth;
            // console.log(this.grid.x)
            this.drawGrid(this.grid.x,this.grid.y, this.grid.width, this.grid.height);
        }
        if (offsetY> 0 && -Y < this.grid.y){
            this.grid.y -= this.gridHeight;
            this.drawGrid(this.grid.x,this.grid.y, this.grid.width, this.grid.height);
        }
        else if (offsetY< 0 && -Y > this.grid.y){
            this.grid.y += this.gridHeight;
            this.drawGrid(this.grid.x,this.grid.y, this.grid.width, this.grid.height);
        }
    }
    listenHammerRectangle(){
        var that = this;
        var el = document.getElementById("leftPart");
        this.mc = new Hammer.Manager(el);

        // var press = new Hammer.Press({time: 250});
        var pan = new Hammer.Pan({'pointers':1, threshold: 1});
        var swipe = new Hammer.Swipe({threshold: 0, pointers: 1});
        this.mc.add(pan);
        this.mc.add(swipe);
        pan.recognizeWith(swipe);
        this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                that.pointerDown(ev.srcEvent)
            }
          })
          this.mc.on("pan", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                that.pointermove(ev.srcEvent)
            }
          })
          this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                that.pointerUp(ev.srcEvent)
            }
          })
        this.mc.on("swiperight", function(ev) {
            // console.log(ev)
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                // if (ev.srcEvent.x < 300){
                    that.createSwipeRight(ev);
                // }
            }
        })

        this.mc.on("swipeleft", function(ev) {
            console.log(ev)
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                // if (ev.srcEvent.x < 300){
                    that.createSwipeLeft(ev);
                // }
            }
        })
    }
    listenHammer(){
        var that = this;
        var el = document.getElementById("eventReceiver");
        this.mc = new Hammer.Manager(el);

        var press = new Hammer.Press({time: 250});
        var pan = new Hammer.Pan({'pointers':1, threshold: 1});
        var swipe = new Hammer.Swipe({threshold: 0, pointers: 1});

        this.mc.add(press);
        this.mc.add(swipe);
        this.mc.add(pan);
        pan.recognizeWith(press);
        // $(el).on('touchstart touchmove', function(e){e.preventDefault(); })

        swipe.recognizeWith(pan);

        
        this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'pen' ){
                that.pointerDown(ev.srcEvent)
            }
            if (ev.pointers[0].pointerType == 'touch'){
                that.panStartCanvas(ev);
            }
          })
          this.mc.on("pan", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                // console.log(ev)
                that.pointermove(ev.srcEvent)
            }
            if (ev.pointers[0].pointerType == 'touch'){
                that.panCanvas(ev);
            }
          })
          this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                that.pointerUp(ev.srcEvent, ev)
            }
            if (ev.pointers[0].pointerType == 'touch'){
                
            }
          })
          
          
        
        this.mc.on("press", function(ev) {
            ev.preventDefault();
            // console.log('PRESS', )
            if (ev.pointers[0]['pointerType'] == 'touch'){ //|| ev.pointers[0]['pointerType'] == 'pen'){
                console.log('PRESS')
                ev.srcEvent.preventDefault();
                that.press = true;
                // console.log(that.props.lettres)
                that.speech.setAlphabet(that.props.lettres)
                that.speech.start({'x':ev.srcEvent.x, 'y' :ev.srcEvent.y});

                
            }
        })
        this.mc.on("pressup", function(ev) {
            console.log('PRESSUP')
              ev.preventDefault();
                // console.log(that)
                if (ev.pointers[0]['pointerType'] == 'touch' ){//|| ev.pointers[0]['pointerType'] == 'pen'){
                    that.press = false;
                    console.log(that.speech)
                    that.speech.stop();
                    
                }
        })

        d3.select('#eventReceiver')
        .on('pointerdown', function(){
            if (d3.event.buttons == 32 && d3.event.pointerType == 'pen'){
                that.erasing = true;
                d3.selectAll('.fakeStroke').style('pointer-events', 'auto')
            }
            // console.log("HELLO", d3.event)
        }) 
        .on('pointermove', function(){
            if (that.erasing){
                var transform = getTransformation(d3.select('#panItems').attr('transform'))
                that.tempArrayStroke.push([d3.event.x - transform.translateX, d3.event.y - transform.translateY]);

                that.tempArrayStroke = that.tempArrayStroke.slice(-10);

                that.eraseStroke();
                that.drawEraseStroke();
            }
        })
        .on('pointerup', function(){
            // console.log()
            if (that.erasing) {
                // console.log('GO')
                that.erasing = false;
                that.tempArrayStroke = [];
                that.removeTempStroke();
                d3.selectAll('.fakeStroke').style('pointer-events', 'none')
            }
           
        })  
    }
    panStartCanvas(ev){
        this.lastPosition = {'x': ev.srcEvent.x, 'y': ev.srcEvent.y}

        
    }
    panCanvas(ev){
        // console.log(ev)
        var offsetX = ev.srcEvent.x - this.lastPosition.x;
        var offsetY = ev.srcEvent.y - this.lastPosition.y;
        var transform = getTransformation(d3.select('#panItems').attr('transform'))
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;

        d3.select('#panItems').attr('transform', 'translate('+X+','+Y+')')
        this.lastPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y}

        // console.log(this.showGrid)
        if (this.showGrid) this.panGrid(X, Y, offsetX, offsetY);
    }
    createSwipeRight(){
        // console.log('GO', window.innerWidth)
        d3.select('.lineRed').transition().duration(1000).style('left', window.innerWidth);
        d3.select('#leftPart').transition().duration(1000).attr('width', window.innerWidth + 'px'); 
        
        this.setState({'openGalleryModel': true});
    }
    createSwipeLeft(){
        var that = this;
        d3.select('.lineRed').transition().duration(1000).style('left',  that.marginOffset + 'px');
        d3.select('#leftPart').transition().duration(1000).attr('width', that.marginOffset + 'px');

        this.setState({'openGalleryModel': false});
    }
    panEnd(e){
        console.log('panEnd')
    }
    pointerDown(event){
        var that = this;
        // console.log(d3.event);
        // that.pointerOnInterface();
        // getNearestElement('be5a214fa3b0575c82931d4084bd29367', that.props.sketchLines)
        // console.log('HEY')
        // if (d3.event.pointerType == 'pen'){
        that.pointerDownPoperties = {'time': Date.now(), 'position':[event.x, event.y]}
        // that.selecting =false;
        that.lastMovePosition = {'x':0, 'y':0};
        that.drawing = false;
        that.erasing = false;
        // that.hasMoved = false;
        // that.press == false && 
        // console.log(event)
        if (that.isItemDragged == false){
            that.down = true;
            // that.createLine();
            // console.log(d3.event)
            // that.duplicating = that.isGuideHold; 
            // if (that.isGuideHold != false){
            //     that.duplicating = true;
            //     // console.log('GO')
            //     // that.duplicateSticky(that.isGuideHold);
            // }
            
            if (event.x < 300){
                that.sticky = true;
            }
            else if (that.isPatternPen){

            }
            else if(event.buttons == 1 && that.selecting != true){
                that.drawing = true;
                // that.createDrawing();
            }
            else if (event.buttons == 32){
                // that.erasing = true;
            }
            else if (event.buttons == 2){
                that.selecting = true;
                // that.createSelecting();
            }
        }
        
    }
    pointermove(event){
        var that = this;
        if (that.down == true  && that.isItemDragged == false){

           
            var transform = getTransformation(d3.select('#panItems').attr('transform'))
            // var X = offsetX + transform.translateX;
            // var Y = offsetY + transform.translateY;


            that.tempArrayStroke.push([event.x - transform.translateX, event.y - transform.translateY]);

            // console.log(that.isGuideHold)

            if (that.press){

            }
            else if (that.drawing){
                that.drawTempStroke();
            }
            
            else if (that.isPatternPen){
                that.drawPattern(event);
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
        }
        
    }
    pointerUp(event, sourceEvent){
        var that = this;
        // console.log('UP')
        if (event.pointerType == 'pen') that.detectingFlick(event);
        // console.log(that.isGuideHold.length, that.isItemDragged)
        if (that.down && that.isItemDragged == false){
            // console.log(that.drawing, that.sticky)
            // console.log(that.drawing)
            // console.log(that.isGuideHold)
            // if (that.duplicating && that.isGuideHold != false){

            // }
            // if (that.selecting) {
                
            //     that.makingGroup();
            //     // selectionGroup
            //     that.selecting = false;
            // }
            if (that.press){

            }
            else if (that.sticky && that.isGuideHold == false){
                // console.log(length)
                // that.findIntersection('penTemp');
                that.addStrokeGuide(); 
                that.sticky = false;
            }
            else if (that.sticky && that.isGuideHold){
                // console.log(length)
                // that.findIntersection('penTemp');
                that.addStrokeGuideCopy(this.isGuideHold, event); 
                that.sticky = false;
            }
            else if (that.isGuideHold){
                // that.drawTempStroke();
                // console.log(that.isGuideHold)
                var objectsSelected = that.findIntersection('penTemp');
                var strokeGuide = JSON.parse(JSON.stringify(that.tempArrayStroke))
                that.findClosestElements(objectsSelected, 'penTemp', strokeGuide).then((elementLines)=> {
                    // that.showBlockOfLinesElement(elementLines);
                    that.makingGroup(elementLines, that.isGuideHold, strokeGuide);
                })
                
            }
            
            
            else if (that.drawing && that.sticky == false && that.isGuideHold == false){
                // var objectsSelected = that.findCloseStrokes();
                var length = d3.select('#penTemp').node().getTotalLength();


                // console.log(sourceEvent.deltaTime, length)
                //It's a guide OR a stroke
                if (length > 150 && sourceEvent.deltaTime < 500){
                    var strokeGuide = JSON.parse(JSON.stringify(that.tempArrayStroke));
                    that.findCloseStrokes().then((closelements)=>{
                        // console.log(closelements)
                        that.findClosestElements(closelements, 'penTemp', strokeGuide).then((elementLines)=> {

                            // console.log(elementLines)
                            that.makingGroup(elementLines, 'initial', strokeGuide);
                        })
                    })
                    
                } else {
                    that.idLine = guid();

                    
                    that.addStroke();
                    that.isNewLine();
                    that.isSameLine();
                }



                // that.addStroke();
                // that.drawing = false;
            }
            that.removeTempStroke();
        }
        that.tempArrayStroke = [];
        that.down = false;
        that.objectIn = [];
        that.sticky = false;
    }
    listenEvents(){
        var that = this;
        // console.log('HEY')

        //Mon click est forcement une selection
        d3.select('#eventReceiver')
            // .on('pointerdown', function(){
            //     that.pointerDown(d3.event)
            // })
            // .on('pointermove', function(){
            //     that.pointermove(d3.event)
            // })
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
            // .on('pointerup', function(){
            //     that.pointerUp(d3.event)
            // })
    }
    detectingFlick(event){
        // that.pointerDownPoperties = {'time': Date.now(), 'position':[d3.event.x, d3.event.y]};
        // console.log(Date.now() -  this.pointerDownPoperties['time'])
        var time = Date.now() -  this.pointerDownPoperties['time'];
        var dist = distance(this.pointerDownPoperties['position'][0], event.x, this.pointerDownPoperties['position'][1], event.y)

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


        var modelData = this.props.stickyLines.find(x => x.id == model);

        
        


        // console.log(modelData)
        var id = guid();
        var group = {
            'id': id, 
            'lines':lines, 
            'position': [0,0],
            'model': modelData,
            'stroke': {'points':arrayPoints, 'position': [firstPoint[0],firstPoint[1]]}
        };
        // console.log(group)
        // this.props.addLinesClass({'idLines':selection, 'class':['group-'+id]})
        this.props.createGroupLines(group);
        // this.props.removeSketchLines();


        // for (var i in selection){
        //     d3.select('#item-'+selection[i]).classed('group-'+id, true);
        // }

        // console.log(selection)
    }
    findClosestElements(objects, idGuide, tempArrayStroke){

        // console.log(objects)
        return new Promise((resolve, reject) => {
            // console.log(tempArrayStroke)
            var firstPoint = {'x': tempArrayStroke[0][0] , 'y': tempArrayStroke[1][1]  };
            var lastPoint = {'x': tempArrayStroke[tempArrayStroke.length-1][0], 'y': tempArrayStroke[tempArrayStroke.length-1][1] };
            var pointOnLine = [];
            var centerBox = [0];
            var pointsThroughLine = [];
            var alreadyAdded = [];

            
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
                this.expandText(centerBox[i], pointOnLine[i],  3,  pointsThroughLine[i], alreadyAdded[i], +1, JSON.parse(JSON.stringify(this.props.sketchLines)))
            })

            // console.log(alreadyAdded)

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
           
            var insideandWhichGroup = that.props.groupLines.find(group => group.lines.find((arrayEntry)=> arrayEntry.indexOf(id) > -1))//.indexOf(idSImple) > -1);//x.id == this.guideTapped.item)
         
            // console.log(insideandWhichGroup)

            
            if (alreadyAdded.indexOf(id) == -1 && insideandWhichGroup == undefined){
                
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

    findCloseStrokes = async() => {
        var offsetBBox = 100;

        var BBTemp = await _getBBoxPromise(d3.select('#penTemp').attr('id'));
        BBTemp.x -= offsetBBox;
        BBTemp.width += offsetBBox*2
        // showBboxBB(BBTemp, 'red')
        var BBid = [];
        d3.select('.standAloneLines').selectAll('g').each(function(){
            BBid.push(d3.select(this).attr('id'))
        })
        for (var i in BBid){
            var BB = await _getBBoxPromise(BBid[i]);
            var idSImple = BBid[i].split('-')[1]
            var insideandWhichGroup = this.props.groupLines.find(group => group.lines.find((arrayEntry)=> arrayEntry.indexOf(idSImple) > -1))//.indexOf(idSImple) > -1);//x.id == this.guideTapped.item)
            // console.log(idSImple, insideandWhichGroup)
            var intersected = boxBox(BB.x, BB.y, BB.width, BB.height, BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
            if (intersected && insideandWhichGroup == undefined) this.objectIn.push({'id':BBid[i].split('-')[1]})
            // console.log(BBid[i])
        }

        // console.log(this.objectIn)
        return JSON.parse(JSON.stringify(this.objectIn))
        // var BB = await _getBBoxPromise(d3.select(this).attr('id'))
            
        //     console.log(BB, BBTemp)
        // })
    } 
    
    //Pour les guides
    findIntersection(){
        //Getting all objects
        var that = this;
        this.objectIn = [];
        var offset = 10;

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
                i+=1;
            }
        })
        // console.log(that.objectIn)

        /**
        *   CHECK INTERSECTION BETWEEN BOXES OR CLOSEST
        */
        var indexToSLice = []
        for (var i = 0; i < that.objectIn.length; i++){
            var id1 = that.objectIn[i];
            var BB1 = _getBBox('item-'+id1.id);
            BB1.x -= 10
            BB1.width += 20
            
            // showBboxBB(BB1, 'red');
            for (var j = i+1; j < that.objectIn.length; j++){
                var id2 = that.objectIn[j];
                var BB2 = _getBBox('item-'+id2.id);
                var intersected = boxBox(BB1.x, BB1.y, BB1.width, BB1.height, BB2.x, BB2.y, BB2.width, BB2.height);
                var dist = distance(BB1.x + (BB1.width /2),BB2.x + (BB2.width /2), BB1.y + (BB1.height /2), BB2.y + (BB2.height /2) );
                // console.log(i, dist)
                //  indexToSLice.push(i);
                if ((intersected || dist < 30) && indexToSLice.indexOf(i) == -1){
                    // console.log(intersected, i, j)
                    indexToSLice.push(i);
                }
            }
            
        }
        // console.log(indexToSLice)


        for (var i = indexToSLice.length - 1; i >= 0; i--) {
            that.objectIn.splice(indexToSLice[i], 1);
        }
       

        for (var i = 0; i < that.objectIn.length; i++){
            var id1 = that.objectIn[i];
            var BB1 = _getBBox('item-'+id1.id)
            // showBboxBB(BB1, 'red');
        }

        console.log(that.objectIn)
        return JSON.parse(JSON.stringify(that.objectIn))
    }
    
    showBlockOfLinesElement(lines){
        lines.forEach((line)=>{
            var sketchLines = JSON.parse(JSON.stringify(this.props.sketchLines))
            line.forEach((D)=>{
                var oobb = getoobb(D, sketchLines);
                drawPath(oobb.oobb)
            })
        })
        
    }
    addStrokeGuideCopy(guideToCopy, evt){
        var sticky = JSON.parse(JSON.stringify(this.props.stickyLines.find(x => x.id == guideToCopy)));
        // this.props.stickyLines
        console.log(evt)
        // sticky.forEach(st => {
        sticky.id = guid();
        sticky.placeHolder.forEach(element => {
            // console.log(element)
            element.lines.forEach((d)=>{
                d.id = guid();
            })
        });
        sticky.position = [evt.x, evt.y];

        this.props.addStickyLines(sticky);
        // });
    }
    addStrokeGuide(){
        var id = guid();
        var that = this;
        
        var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
        var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke));
        arrayPoints.forEach((d)=>{
            d[0] = d[0] - firstPoint[0];
            d[1] = d[1] - firstPoint[1]
        })


       arrayPoints = simplify(arrayPoints, 2)

        // var data = {
        //     'points': arrayPoints, 
        //     'id': id,
        //     'paddingBetweenLines': 50,  
        //     'width':100,
        //     'height':100,
        //     'placeHolder': [
        //         {'id':'background', 'data': {'method': 'repeat'}, 'lines':[]}, 
        //         {'id':'topbackground', 'data': {'method': 'repeat'}, 'lines':[]}, 
        //         {'id':'leftbackground', 'data': {'method': 'repeat'}, 'lines':[]}, 
        //         {'id':'rightbackground', 'data': {'method': 'repeat'}, 'lines':[]}, 
        //         {'id':'bottombackground', 'data': {'method': 'repeat'}, 'lines':[]}, 

        //         {'id':'topLeftCorner', 'data': {}, 'lines':[]}, 
        //         {'id':'topRightCorner', 'data': {}, 'lines':[]}, 
        //         {'id':'bottomLeftCorner', 'data': {}, 'lines':[]}, 
        //         {'id':'bottomRightCorner', 'data': {}, 'lines':[]}, 
               
        //         {'id':'left', 'data': {}, 'lines':[]}, 
        //         {'id':'right', 'data': {}, 'lines':[]}, 
        //         {'id':'middle', 'data': {}, 'lines':[]}],
        //     'position': [firstPoint[0],firstPoint[1]],
        //     'textPosition': {'where': 'right', 'position': [25,20]},
            
        // }

        var data = {
            'points': arrayPoints, 
            'id': id,
            'paddingBetweenLines': 50,  
            'width':100,
            'height':100,
            'placeHolder': [
                {'id':'outerBackground', 'data': {'method': 'scale'}, 'lines':[]},
                {'id':'background', 'data': {'method': 'scale'}, 'lines':[]}
            ],
            'position': [firstPoint[0],firstPoint[1]],
            'textPosition': {'where': 'right', 'position': [25,20]},
            
        }

        this.props.addStickyLines(data);

        // console.log({'idLines':that.objectIn, 'class':['item-'+id]})
        //Add class to element
        
        // this.props.addLinesClass({'idLines':that.objectIn, 'class':['item-'+id]})
        // for (var i in this.objectIn){
        //     d3.select('#item-'+that.objectIn[i]).classed('sticky-'+id, true);
        // }
    }
    /**
     * PATTERN
     */
    drawPattern(event){
        var that = this;
        var line = d3.line()
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'));

        var dist = distance(that.lastMovePosition.x, event['x'], that.lastMovePosition.y, event['y']);
        if (dist > that.patternBBOX.width){
            that.lastMovePosition = {'x': event['x'],'y': event['y']};

            // console.log(this.patternPen)
            this.patternPen.forEach((d)=>{
                var X = event['x']+ d.position[0] - transformPan.translateX;
                var Y = event['y']+ d.position[1] - transformPan.translateY;
                d3.select('#tempGroup').append('g').attr("transform", (f) => 'translate('+X+','+Y+')')
                .append('path')
                .attr('d', (f)=>  line(d.points))
                .attr('fill', 'none')
                .attr('stroke', d.data.colorStroke)
                .attr('stroke-width', d.data.sizeStroke)
                .attr("stroke-dasharray", 'none')
                .attr('stroke-linejoin', "round")
            })
        }

        // console.log(this.patternBBOX, dist)
        // that.lastMovePosition

        

        // console.log(that.lastMovePosition)
        // d3.select('#tempGroup').selectAll('g')
        //     .data(that.patternPen).enter()

        //     .append('g').attr("transform", (d) => 'translate('+event['x']+','+event['y']+')')
        //     .append('path')
        //     .attr('d', (d)=>  line(d.points))
        // //     .attr("d", line(that.tempArrayStroke))
        //     .attr('fill', 'red')
        //     .attr('stroke', that.colorPen)
        //     .attr('stroke-width', that.sizePen)
        //     .attr("stroke-dasharray", 'none')
        //     .attr('stroke-linejoin', "round")
    }
/**
     * STROKE
     */
    drawTempStroke(){
        var that = this;
        var line = d3.line()
        d3.select('#penTemp')
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', that.colorPen)
            .attr('stroke-width', that.sizePen)
            .attr("stroke-dasharray", 'none')
            .attr('stroke-linejoin', "round")
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

    drawEraseStroke(){
        // console.log('HEY')
        var that = this;
        var line = d3.line()
        // d3.select('#penTemp')
        //     .attr("d", line(that.tempArrayStroke))
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black')
        //     .attr('stroke-width', '10')
        //     .attr('opacity', '0.2')
        //     .attr("stroke-dasharray", "10");
    }
    eraseStroke(){

        var lastPoint = this.tempArrayStroke[this.tempArrayStroke.length-1];

        var element = document.elementFromPoint(lastPoint[0], lastPoint[1]);

        if (element.tagName == 'path' && element.className.baseVal == "fakeStroke"){
            
            var id = element.id.split('-')[1];
            // console.log(id)
            this.props.removeSketchLines([id]);
        }
    }
    isSameLine= async() => {
        var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
        var whichGroup = false;
        // console.log(this.props.groupLines)
        for (var i in this.props.groupLines){
            var item = this.props.groupLines[i];
            var id = item['id'];
            var arrayNode = [];
            // console.log(d3.select('#group-'+id))
            d3.select('#group-'+id).selectAll('.containerBackground').each(function(d){
                arrayNode.push(d3.select(this).node());
            })
            for (var j in arrayNode){
                var BB = await _getBBoxPromiseNode(arrayNode[j]);
                var isIn = boxPoint(BB.x, BB.y, BB.width, BB.height, firstPoint[0], firstPoint[1]);
                if (isIn) {
                    // console.log('HEY')
                    var index = d3.select(arrayNode[j]).attr('id').split('-')[1];
                    // console.log(id)
                    // console.log(index)
                    this.props.addLineToExistingGroup({'idLine': [this.idLine], 'idGroup':id, 'iteration':index})
                }
            }
        }
    }
    isNewLine= async() => {
        var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))

        for (var i in this.props.groupLines){
            var item = this.props.groupLines[i];
            var id = item['id'];
            var BB = await _getBBoxPromise('item-'+id);
            
            var offset = 60;
            BB.x -= offset;
            BB.width += 2*offset;

            // showBboxBB(BB, 'red')

            var isIn = boxPoint(BB.x, BB.y, BB.width, BB.height, firstPoint[0], firstPoint[1]);
            if (isIn) {
                this.props.addLineToGroup({'idLine': [[this.idLine]], 'idGroup':id})
            }
        }
    }
    addStroke(){
        
        if (this.tempArrayStroke.length > 1){
            // To have everything in 0,0
            var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
            var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke));
            
            arrayPoints.forEach((d)=>{
                d[0] = d[0] - firstPoint[0];
                d[1] = d[1] - firstPoint[1]
            })
            // console.log(JSON.stringify(arrayPoints))
            var data = {
                'points': arrayPoints, 
                'data': {'class':[], 'sizeStroke': this.sizePen, 'colorStroke': this.colorPen}, 
                'id': this.idLine , 
                'device':this.props.UIid,
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
    holdTag = (d) => {
        console.log('Selection ',d)
        this.setState({'tagHold': d})
    }
    holdGuide = (d) => {
        console.log('Selection '+d)
        this.isGuideHold = d;
        this.setState({'isGuideHold': d})
    }
    // To know if an item was dragged
    dragItem = (d) => {
        this.isItemDragged = d;
    }
    setSelection = (d) => {

        console.log(d)
        this.linesInselection = d;
    }
    openAlphabet = (d) => {
        // console.log('HEY')
        this.setState({shouldOpenAlphabet:d});
    }
    selectPen = (d) => {
        // console.log(d)
        if (d.type == "pattern"){
            this.isPatternPen = true;
        }
        else {
            this.isPatternPen = false;

            var sizePen = 2;
            if (d.type == "highlighter") sizePen = 15
            if (d.type == "ink") sizePen = 2
            this.sizePen = sizePen
            this.setState({'sizeStroke': sizePen})
        }
        
    }
    setPatternPen = (old) => {

        var d = JSON.parse(JSON.stringify(old))
        
        _getBBoxPromise('linesPattern').then((e)=> {
            this.patternBBOX = e

            // console.log(e)
            /**
             * JUST REMOVE EXTRA SPACE
             */
            var position = [d[0].position[0], d[0].position[1]];
            var distance1 = distance(0, position[0], 0, position[1]);
            d.forEach((f)=>{
                var dist = distance(0, f.position[0], 0, f.position[1]);
                if (dist < distance1){
                    position =  [f.position[0], f.position[1]];
                    distance1 = dist
                }
            })
            d.forEach((f)=>{
                f.position[0] -= position[0] //+ (e.width/2);
                f.position[1] -= position[1] //+ (e.height/2);
            })
            this.patternPen = d;
            console.log(d, old, position)
        })
        
        
        // patternBBOX
    }
    setGrid = (d) => {
        console.log(d)
        this.showGrid = d;

        if (d == true){
            this.gridSize = JSON.parse(JSON.stringify(this.gridSizeTemp))
            this.props.setGrid({'data': this.gridSize})
            this.grid = {'x':0, 'y':0, 'width':window.innerWidth*2, 'height':window.innerHeight*2};
            this.drawGrid(this.grid.x,this.grid.y, this.grid.width, this.grid.height);
        } else {
            this.props.setGrid({'data': false})
            this.removeGrid();
        }
        
    }
    selectColor = (d) => {
    
        this.setState({'colorStroke': d})
        this.colorPen = d;
       
    }
    getBBoxEachLine = (d) => {
       
        this.gridSizeTemp[0] = d.width;
        this.gridSizeTemp[1] = d.height;
        // console.log(d)
    }
    setGroupTapped = (d) => {
        console.log(d)
        var sticky = this.props.stickyLines.find(x => x.id == this.isGuideHold);
        var data = {
            'idGroups': [d.item], 
            'model': sticky
        };   
        this.props.changeModelGroupLines(data);

        console.log(data)
    }
    setGuideTapped = (d) => {

        // console.log('GO')
        // console.log(this.linesInselection, d)
        this.guideTapped = d;

        if (this.linesInselection.elements.length != 0){

            // console.log(this.props.stickyLines);

            var sticky = this.props.stickyLines.find(x => x.id == this.guideTapped.item);
            // console.log(sticky)
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
                {/* <div className='leftPart'></div> */}
                
                {/* <div className='lineRed'></div> */}
                <svg id="canvasVisualization">
                    
                    <rect id='eventReceiver'  x={0} y={0} fill='red' opacity='0' />
                    
                    <g id="toggleSideBar">
                        <circle r={35} opacity={0} fill={'#c7e9c0'} id="circlefeedBackVoice" />
                    </g>
                    <g id="item-feedBackVoice">
                        <circle r={35} opacity={0} fill={'#c7e9c0'} id="circlefeedBackVoice" />
                    </g>



                   


                    <g id='panItems' transform={'translate(0,0)'}>
                        <g id="grid" />
                        <g id="item-feedBackVoice"><circle r={35} opacity={0} fill={'#c7e9c0'} id="circlefeedBackVoice" /></g>
                        <g id="tempLines"><path id="penTemp"></path></g>
                        <g id="tempGroup"></g>
                        <Lines />
                        <Groups 
                            setSelection={this.setSelection}
                            setGroupTapped={this.setGroupTapped}

                            tagHold={this.state.tagHold}
                            getBBoxEachLine={this.getBBoxEachLine}
                            isGuideHold={this.isGuideHold}
                            // holdGroup={this.holdGroup}
                        />
                        <Textes />

                    
                        
                    </g>
                    <rect id='leftPart' width={this.marginOffset + 'px'} height={'100%'} x={0} y={0} fill={'#e3e3e3'} />
                     {/* //fill={'url(#grump_avatar)'}/> */}

                    {/* <Menus /> */}
                    
                   

                    {/* <image href="https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png" height="200" width="200"/> */}
                    
                    <Guides 
                        holdGuide={this.holdGuide} 
                        dragItem={this.dragItem}
                        setGuideTapped={this.setGuideTapped}

                        colorStroke = {this.state.colorStroke}
                        sizeStroke = {this.state.sizeStroke}
                    />
                    <Tags 
                    
                        holdTag={this.holdTag} 
                        colorStroke = {this.state.colorStroke}
                        sizeStroke = {this.state.sizeStroke}
                    />

                    {/* <rect id='swipeLayer'  x={0} y={0} fill='red' opacity='0' /> */}
                 
                   
                    <GalleryItmes openGalleryModel={this.state.openGalleryModel} /> 
                   

                    {/* <rect id='swipeLayer'  x={0} y={0} fill='red' opacity='0' /> */}

                    {/* <g id="eventReceiver">
                        </g>     */}
                    {/* <ColorMenu isSticky={this.isSticky} changeColorStroke={this.changeColorStroke} changeWidthStroke={this.changeWidthStroke} changeActionPen={this.changeActionPen}/> */}
                        
               

                </svg>
                
                {/* <svg id="eventReceiver"></svg> */}
                <ColorMenu 
                    openAlphabet={this.openAlphabet}
                    selectPen={this.selectPen}
                    selectThisColor={this.selectColor}
                    colorStroke = {this.state.colorStroke}
                    sizeStroke = {this.state.sizeStroke}

                    setPatternPen = {this.setPatternPen}

                    isSticky={this.isSticky} 
                    isGroup ={this.isGroup} 
                />
                {this.state.shouldOpenAlphabet ? <Lettres openAlphabet={this.openAlphabet} /> : null}
            </div>
        );
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(Document);

