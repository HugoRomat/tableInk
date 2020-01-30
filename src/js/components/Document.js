import React, { Component } from "react";
import * as d3 from 'd3';
import  $ from 'jquery';
import Lines from './Lines'
import './../../css/main.css';

import * as Hammer from 'hammerjs';
import { connect } from 'react-redux';
import { distance, guid, drawRect, whoIsInside, retrieveStyle, getTransformation, is_point_inside_selection, getType, showBbox, _getBBox, checkIntersection, getNearestElement, showBboxBB, drawCircle, interpolate, line_intersect, midPosition, getPerpendicularPoint, drawLine, distToSegment, lineIntersectsSquare, lineIntersectsPolygone, showOmBB, center, getSpPoint, LeastSquares, createPositionAtLengthAngle, getCenterPolygon, drawPath, getoobb, FgetBBox, simplify, _getBBoxPromise, getBoundinxBoxLines, _getBBoxPromiseNode, findMinMax, checkIfSomething, whereIsPointer, findIntersectionRecursive } from "./Helper";
import ColorMenu from "./Interface/ColorMenu";
import Polygon from 'polygon'
import {d3sketchy} from './../../../customModules/d3.sketchy'

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
    addLineToExistingGroup,
    addTag,
    addVoiceQueries,
    addTagCanvas,
    addImage,
    tapGroup,
    swipeGroup,
    moveSketchLines,
    changeStrokesProperties,
    closeGallery
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
import { recognizeInk } from "./InkRecognition/InkRecognition";
import VoiceQuerys from "./VoiceQuery/VoiceQuerys";
import TagsInterface from "./TagsInterface/TagsInterface";
import Picker from "./ColorPicker/Picker";
import Images from "./Images/Images";

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
    addLineToExistingGroup,
    addTag,
    addVoiceQueries,
    addTagCanvas,
    addImage,
    tapGroup,
    swipeGroup,
    moveSketchLines,
    changeStrokesProperties,
    closeGallery
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
            tagHold: false,
            'penType': 'normal',
            'styleHolder': {'color': 'black', 'size': 15},
            'isHoldingCanvas': false,
            'guideTapped': false
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
        this.isStretchPen = false;
        this.isFunctionPen = false;
        this.commandFunction = {'command': 'AVG', 'args': []};
        
        this.patternPen = [];
        this.patternBBOX = null;
        this.straightLine = false;
        this.write = false;
        this.lastStepTagPattern = 0;
        this.stateLeftBar = 'normal';
        this.init();

        this.positionTag = [];
        this.lastStepTagPattern = 0;
        this.colorPaletteTapped = false;
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
        var that = this;
        this.listenHammer();
        // this.listenHammerRectangle();
        this.listenEvents();

        d3.select('#abcd').style('top', (window.innerHeight-100) + 'px')
        
        // d3.select('#canvasVisualization').style('width', '100%').style('height', '100%');
        // d3.select('#eventReceiver').style('width', '100%').style('height', '100%');
        // var zoom = d3.zoom().on("zoom", function () {
        //     console.log(d3.event.transform)
        //     // svg.attr("transform", d3.event.transform)
        //  })

        // d3.select('#panItems').attr("transform", 'translate(0,0)')

        this.speech = new SpeechRecognitionClass(this);
        this.speech.setAlphabet(this.props.lettres)


        

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

            // var defs = svg.append("defs");

            var filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");
        
        // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // convolve that with a Gaussian with standard deviation 3 and store result
        // in blur
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 5)
        
        // translate output of Gaussian blur to the right and downwards with 2px
        // store result in offsetBlur
        filter.append("feOffset")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result", "offsetBlur");
        
        // Control opacity of shadow filter
        var feTransfer = filter.append("feComponentTransfer");
        
        feTransfer.append("feFuncA")
            .attr("type", "linear")
            .attr("slope", 0.2)
        
        // overlay original SourceGraphic over translated blurred opacity by using
        // feMerge filter. Order of specifying inputs is important!
        var feMerge = filter.append("feMerge");
        
        feMerge.append("feMergeNode")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");	
          


            // var filter = defs.append("filter")
            //     .attr("id", "drop-shadow")
            //     .attr("height", "130%");
            // filter.append("feGaussianBlur")
            //     .attr("in", "SourceGraphic")
            //     .attr("stdDeviation", 5)
            //     .attr("result", "blur");
            // filter.append("feOffset")
            //     .attr("in", "blur")
            //     .attr("dx", 5)
            //     .attr("dy", 5)
            //     .attr("result", "offsetBlur");
            // var feMerge = filter.append("feMerge");
            // feMerge.append("feMergeNode")
            //     .attr("in", "offsetBlur")
            // feMerge.append("feMergeNode")
            //     .attr("in", "SourceGraphic");

            
        // this.init();

        // this.isMount = true;
        // this.forceUpdate();

        // console.log(this.props)
        // this.grid = {'x':0, 'y':0, 'width':window.innerWidth*2, 'height':window.innerHeight*2};
        // this.drawGrid(this.grid.x,this.grid.y, this.grid.width, this.grid.height);
        
        // <rect id='leftPart' width={this.marginOffset + 'px'} height={'110%'} x={0} y={'-5%'}  fill={'white'} />

        // var sketch = d3sketchy()
        // var rec = sketch.rectStroke({ x:0, y:-100, width:0, height:window.innerWidth+100, density: 1, sketch:10});
            

        // var flattened = [].concat(...rec)
        // d3.select('#leftPart').selectAll('path')
        //     .data(flattened).enter()
        //     .append('path')
        //     .attr('d', (d)=>{ return d })
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black')
        //     .attr('stroke-width', '0.3')
        //     .style('stroke-linecap', 'round')
        //     .style('stroke-linejoin', 'round')

            $('#eventReceiver').on({
                'dragover dragenter': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                },
                'drop': function(e) {
                    //console.log(e.originalEvent instanceof DragEvent);
                    var dataTransfer =  e.originalEvent.dataTransfer;
                    if( dataTransfer && dataTransfer.files.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        $.each( dataTransfer.files, function(i, file) { 
                          var reader = new FileReader();
                          reader.onload = $.proxy(function(file, $fileList, event) {
                            // var img = file.type.match('image.*') ? "<img src='" + event.target.result + "' /> " : "";
                            // $fileList.prepend( $("<li>").append( img + file.name ) );
                            that.props.addImage({
                                'id': guid(),
                                'position': [400,100],
                                'src': event.target.result
                            })
                          }, this, file, $("#fileList"));
                          reader.readAsDataURL(file);
                        });
                    }
                }
            });
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
    // listenHammerRectangle(){
    //     var that = this;
    //     var el = document.getElementById("leftPart");
    //     this.mc = new Hammer.Manager(el);

    //     var press = new Hammer.Press({time: 250});
    //     var pan = new Hammer.Pan({'pointers':1, threshold: 1});
    //     var swipe = new Hammer.Swipe({threshold: 0, pointers: 1});
    //     this.mc.add(pan);
    //     this.mc.add(swipe);
    //     this.mc.add(press);

    //     pan.recognizeWith(swipe);
    //     pan.recognizeWith(press);

    //     this.mc.on("panstart", function(ev) {
    //         if (ev.pointers[0].pointerType == 'pen'){
    //             that.pointerDown(ev.srcEvent)
    //         }
    //       })
    //       this.mc.on("pan", function(ev) {
    //         if (ev.pointers[0].pointerType == 'pen'){
    //             that.pointermove(ev.srcEvent)
    //         }
    //       })
    //       this.mc.on("panend", function(ev) {
    //         if (ev.pointers[0].pointerType == 'pen'){
    //             that.pointerUp(ev.srcEvent)
    //         }
    //       })
    //     this.mc.on("swiperight", function(ev) {
    //         // console.log(ev)
    //         if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
    //             // if (ev.srcEvent.x < 300){
    //                 that.createSwipeRight(ev);
    //             // }
    //         }
    //     })

    //     this.mc.on("swipeleft", function(ev) {
    //         // console.log(ev)
    //         if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
    //             // if (ev.srcEvent.x < 300){
    //                 that.createSwipeLeft(ev);
    //             // }
    //         }
    //     })
    //     this.mc.on("press", function(ev) {
    //         ev.srcEvent.preventDefault();
    //         if (ev.pointers[0]['pointerType'] == 'touch'){
               
    //             // console.log('listen')
    //             that.voiceQuery({'x':ev.srcEvent.x, 'y' :ev.srcEvent.y});
    //         }
    //     })
    //     this.mc.on("pressup", function(ev) {
    //         ev.srcEvent.preventDefault();
    //     })
        
    //     d3.select('#leftPart').on('contextmenu', function(){
    //         d3.event.preventDefault();
    //     })
    // }
    listenHammer(){
        var that = this;
        this.panGroup = null;
       
        var el = document.getElementById("eventReceiver");
        this.mc = new Hammer.Manager(el);

        var press = new Hammer.Press({time: 250});
        var tap = new Hammer.Tap();
        var pan = new Hammer.Pan({'pointers':0, threshold: 0});
        // var swipe = new Hammer.Swipe({threshold: 0, pointers: 1, velocity: 0.01});

        this.mc.add(press);
        // this.mc.add(swipe);

        this.mc.add(pan);
        this.mc.add(tap);
        pan.recognizeWith(press);
        pan.recognizeWith(tap);
        // $(el).on('touchstart touchmove', function(e){e.preventDefault(); })

        // pan.recognizeWith(swipe);
        // pan.requireFailure(swipe);

        // this.mc.on("swipe", function(ev) {
        //     if (ev.pointers[0].pointerType == 'pen'){
        //         var x = ev.pointers[0]['x'];
        //         var y = ev.pointers[0]['y'];
        //         var element = whereIsPointer(x, y)
        //         var id = element.id;
        //             console.log('SWIPE', id)
        //         if (id == null){
        //         // OPEN GALLERY
        //         } else {

        //             var group = that.props.groupLines.find(x => x.id==id)
        //             if (group != null ) {
        //                 // console.log(group.swipe)
        //                 /** FIND PARENT ELEMENT */
        //                 that.props.swipeGroup({'id': group.id, 'swipe': !group.swipe})
        //             }
        //         }
        //     }
        // })
        
        this.mc.on("panstart", function(ev) {
           
            if (ev.pointers[0].pointerType == 'touch'){
                var element = whereIsPointer(event.x, event.y);
                var id = element.id;
                that.panGroup = that.props.groupLines.find(x => x.id==id)
                that.panStroke = that.props.sketchLines.find(x => x.id==id)
                
                // console.log(element)

                if (that.panGroup) that.panStartGroup(ev);
                else if ( that.panStroke) that.panStartStroke(ev);
                else that.panStartCanvas(ev);
            }
          })
          this.mc.on("pan", function(ev) {
            //   console.log(ev.pointers)
            if (ev.pointers.length == 1 || ev.pointers.length == 2){
                // console.log('OFOFOF')
                if (ev.pointers.length == 2){

                    // that.tempArrayStroke.push([event.x - transform.translateX, event.y - transform.translateY]);
                    var transform = getTransformation(d3.select('#panItems').attr('transform'))
                    // that.tempArrayStroke.push([event.x, event.y]);

                    var x = ev.pointers[1]['x'] - transform.translateX;
                    var y = ev.pointers[1]['y'] - transform.translateY;


                    that.straightLine = {'x': x, 'y': y};
                }
                
            }
            if (ev.pointers.length == 1 && ev.pointers[0].pointerType == 'touch'){

                if (that.panGroup) that.panMoveGroup(ev);
                else if ( that.panStroke) that.panMoveStroke(ev);
                else that.panCanvas(ev);
            }
          })
          this.mc.on("panend", function(ev) {
            
            if (ev.pointers[0].pointerType == 'touch'){
               

                if (that.panGroup) that.panEndGroup(ev);
                else if ( that.panStroke) that.panEndStroke(ev);
                that.panGroup = null;
                that.panStroke = null
            }
            
          })


        
        this.mc.on("press", function(ev) {
            ev.srcEvent.preventDefault();
            // console.log('PRESS', )
            if (ev.pointers[0]['pointerType'] == 'touch'){

                var x = ev.pointers[0]['x'];
                var y = ev.pointers[0]['y'];
                checkIfSomething(x, y).then((element)=>{
                    // console.log(element)
                    if (element != null){
                        var type = element.split('-')[0];
                    }
                    
                    if (element != null && type == 'item') {
                        
                        retrieveStyle(element).then((style)=>{
                            // console.log(style)
                            that.setState({'isHoldingCanvas': style})
                            // that.setState({'styleHolder': style})
                        })
                    } else if (element != null && type == 'image') {
                        var href = d3.select('#'+element).select('image').attr('href');

                        _getBBoxPromise(element).then((BBoxImage)=>{
                            // console.log(BBoxImage)
                            var X = ev.pointers[0]['x'] - BBoxImage.x;
                            var Y = ev.pointers[0]['y'] - BBoxImage.y;
                            var canvas = document.getElementById("canvasGetPixel");
                            var ctx = canvas.getContext("2d");
                            canvas.height = BBoxImage.height;
                            canvas.width = BBoxImage.width;
                            var image = new Image();
                                image.onload = function() {
                                ctx.drawImage(image, 0, 0);
                                // drawCircle(X, Y, 10, 'red')
                                var pixelData = ctx.getImageData(X, Y, 1, 1).data;
                                var color = 'rgb('+pixelData[0]+','+pixelData[1] +','+pixelData[2]+')';
                                var style = {'size': 5, 'color': color}
                                // console.log(style)
                                that.setState({'isHoldingCanvas': style})
                            };
                            image.src = href;

                        })
                        // console.log(href)
                        
                        // 
                    }
                    else {
                        that.press = true;
                        that.speech.setAlphabet(that.props.lettres)
                        that.speech.start({'x':ev.srcEvent.x, 'y' :ev.srcEvent.y});
                    }
                    // 
                })



                /*
               
                */
                
            }
        })
        this.mc.on("pressup", function(ev) {
            // console.log('PRESSUP')
            //   ev.preventDefault();
            // console.log(that)
            if (ev.pointers[0]['pointerType'] == 'touch' ){//|| ev.pointers[0]['pointerType'] == 'pen'){
                that.press = false;
                console.log(that.speech)
                that.speech.stop();
                that.setState({'isHoldingCanvas': false})
            }
        })
        this.mc.on("tap", function(ev) {
            if (ev.pointers[0]['pointerType'] == 'pen' ){
                that.props.removeSketchLines([that.idLine]);
                var x = ev.pointers[0]['x'];
                var y = ev.pointers[0]['y'];
                var element = whereIsPointer(x, y)
                var id = element.id;
                var line = that.props.sketchLines.find((d)=> d.id == id)
                    
                if (id != null && line != undefined){
                    var myLine = JSON.parse(JSON.stringify(line));
                    var data = JSON.parse(JSON.stringify(that.colorPaletteTapped));
                    if (data.stretch != undefined) myLine.stretch = data.stretch;
                    if (data.pattern != undefined) myLine.pattern = data.pattern;
                    myLine.data = data.data;
                    that.props.changeStrokesProperties({
                        'id': id,
                        'data': myLine
                    }) 
                }
            }
            if (ev.pointers[0]['pointerType'] == 'touch' ){
                // console.log('TAP')
                var x = ev.pointers[0]['x'];
                var y = ev.pointers[0]['y'];
                var element = whereIsPointer(x, y)
                var id = element.id;
                    // console.log(element)
                if (id == null){
                    that.speech.setAlphabet(that.props.lettres)
                    var transform = getTransformation(d3.select('#panItems').attr('transform'))
                    that.speech.setPositionTyping([ev.srcEvent.x - transform.translateX, ev.srcEvent.y - transform.translateY])

                    that.props.groupLines.forEach((d)=>{
                        that.props.swipeGroup({'id': d.id, 'swipe': false});
                        that.props.tapGroup({'id': d.id, 'tap': false})
                    })

                    that.props.closeGallery({'isOpen': false})
                    d3.select('.groups').selectAll('.groupLine').style('opacity', 1)
                    d3.select('.standAloneLines').selectAll('.realStroke').style('opacity', 1)
                    

                } else {
                    var group = that.props.groupLines.find(x => x.id==id)
                    // var panStroke = that.props.sketchLines.find(x => x.id==id)
                    // console.log(group)
                    // var type = element.split('-')[0];
                    if (group != null ) {
                        /** FIN PARENT ELEMENT */
                        // var id = element.split('-')[1];
                        // var group = that.props.groupLines.find(x => [].concat(... x['lines']).find(x => x == id))
                        
                        // console.log(!group.tap)
                        // console.log(group.id)
                        that.props.tapGroup({'id': group.id, 'tap': !group.tap})
                    }
                }
                
             
            }
        })
        /** FOR TEXT ENTRY */
        d3.select("body")
            .on("keypress", function() { 
                var letter = d3.event.key.toLowerCase()
                
                that.speech.addTextTyping(letter)
            })


        /** Mainly for erasing strokes */
        d3.select('#eventReceiver')
            
            .on('pointerdown', function(){
                if (d3.event.pointerType == 'mouse'){
                    that.speech.setAlphabet(that.props.lettres)
                    var transform = getTransformation(d3.select('#panItems').attr('transform'))
                    that.speech.setPositionTyping([d3.event.x - transform.translateX, d3.event.y - transform.translateY])
                }
                
                if (d3.event.buttons == 32 && d3.event.pointerType == 'pen'){
                    that.erasing = true;
                    d3.selectAll('.fakeStroke').style('pointer-events', 'auto')
                }
                else if (d3.event.pointerType == 'pen'){
                    that.pointerDown(d3.event)
                    
                }
                // console.log("HELLO", d3.event)
            }) 
            .on('pointermove', function(){
                if (that.erasing){
                    var transform = getTransformation(d3.select('#panItems').attr('transform'))
                    that.tempArrayStroke.push([d3.event.x - transform.translateX, d3.event.y - transform.translateY]);

                    that.tempArrayStroke = that.tempArrayStroke.slice(-10);
                    // console.log('erase')
                    that.eraseStroke();
                    that.drawEraseStroke();
                }
                else if (d3.event.pointerType == 'pen'){
                   
                        that.pointermove(d3.event);
                        // that.write = true;
                     
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
                else if (d3.event.pointerType == 'pen'){
                    that.pointerUp(d3.event)
                    // that.write = false;
                }
            
            })  
    }
    /** PAN START A GROUP ***/
    panStartGroup(ev){
        var that = this;
        this.startPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y,  'time': Date.now()};
        this.lastPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y}
        // console.log(that.panGroup)
        var getPan = getTransformation(d3.select('#panItems').attr('transform'));
        _getBBoxPromise('group-' + that.panGroup.id).then((BB)=> {
            // showBboxBB(BB, 'red')
            that.allBoundingBox = BB;
            // that.allBoundingBox.x += getPan.translateX - 20;
            // that.allBoundingBox.y += getPan.translateY - 20;
            that.allBoundingBox.width += 40;
            that.allBoundingBox.height += 40;
        })
    }
    /** PAN MOVE A GROUP ***/
    panMoveGroup(event){
        var that = this;       
        var transform = getTransformation(d3.select('#group-'+that.panGroup.id).attr('transform'));  
        var offsetX = event.srcEvent.x - that.lastPosition.x;
        var offsetY = event.srcEvent.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#group-'+that.panGroup.id).attr('transform', 'translate('+X+','+Y+')')
        var linesAttached = that.panGroup['lines'];

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

        if (that.allBoundingBox) findIntersectionRecursive(that.allBoundingBox, event, this.lastPosition, that.panGroup.id, this.props.groupLines);



        that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}
    }
    panEndGroup(){
        // console.log('panend')
        var lines = [].concat(...this.panGroup['lines'])
        
        // var data = lines.map((d)=>{
        //     // console.log(d)
        //     var transform = getTransformation(d3.select('#item-'+d).attr('transform'))
        //     return {'id': d, 'position': [transform.translateX, transform.translateY]};
        // })
        var data = []
        // d3.select('.standAloneLines').selectAll('g').each(function(){
        //     var id = d3.select(this).attr('id').split('-')[1];
        //     var transform = getTransformation(d3.select('#item-'+id).attr('transform'))
        //     data.push({'id': id, 'position': [transform.translateX, transform.translateY]})
        //     // this.props.moveSketchLines([]);
        // })

        // this.props.moveSketchLines(data);
    }
    /** PAN START A GROUP ***/
    panStartStroke(ev){
        var that = this;
        this.startPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y,  'time': Date.now()};
        this.lastPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y}
        // console.log(that.panGroup)
        var getPan = getTransformation(d3.select('#panItems').attr('transform'));
        _getBBoxPromise('item-' + that.panStroke.id).then((BB)=> {
            // showBboxBB(BB, 'red')
            that.allBoundingBox = BB;
            // that.allBoundingBox.x += getPan.translateX;
            // that.allBoundingBox.y += getPan.translateY;
            that.allBoundingBox.width += 0;
            that.allBoundingBox.height += 0;
        })
    }
    /** PAN MOVE A STROKE ***/
    panMoveStroke(event){
        var that = this;       
        var transform = getTransformation(d3.select('#item-'+that.panStroke.id).attr('transform'));  
        var offsetX = event.srcEvent.x - that.lastPosition.x;
        var offsetY = event.srcEvent.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#item-'+that.panStroke.id).attr('transform', 'translate('+X+','+Y+')')   
        if (that.allBoundingBox) findIntersectionRecursive(that.allBoundingBox, event, this.lastPosition, that.panStroke.id, this.props.groupLines);
        that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}
    }
    panEndStroke(event){
        var that = this;
        //     return {'id': d, 'position': [stroke.position[0]-offsetXAlignement, stroke.position[1]-offsetYAlignement]}
        // })
        var data = [];
        // d3.select('.standAloneLines').selectAll('g').each(function(){
        //     var id = d3.select(this).attr('id').split('-')[1];
        //     var transform = getTransformation(d3.select('#item-'+id).attr('transform'))
        //     data.push({'id': id, 'position': [transform.translateX, transform.translateY]})
        //     // this.props.moveSketchLines([]);
        // })

        // this.props.moveSketchLines(data);

        // d3.select('.standAloneLines').selectAll('g').each(function(){
        //     var id = d3.select(this).attr('id').split('-')[1];
        //     var transform = getTransformation(d3.select('#item-'+id).attr('transform'))
        //     this.props.moveSketchLines([{'id': id, 'position': [transform.translateX, transform.translateY]}]);
        // })
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


        /*** POUR MA BARRE DE GAUCHE ***/
        d3.selectAll('.saveRight').each(function(){
            var transform = getTransformation(d3.select(this).attr('transform'))
            var X = transform.translateX - offsetX;
            var Y = transform.translateY - offsetY;

            d3.select(this).attr('transform', 'translate('+X+','+Y+')rotate('+transform.rotate+')')
        })

        /*** POUR MA BARRE DE GAUCHE ***/
        d3.selectAll('.saveTop').each(function(){
            var transform = getTransformation(d3.select(this).attr('transform'))
            var X = transform.translateX - offsetX;
            var Y = transform.translateY - offsetY;

            d3.select(this).attr('transform', 'translate('+X+','+Y+')rotate('+transform.rotate+')')
        })
 

    }
    // createSwipeRight(){
    //     var that = this;
    //     // console.log('GO', window.innerWidth)
    //     if (this.stateLeftBar == 'normal'){
    //         d3.select('.lineRed').transition().duration(1000).style('left', window.innerWidth);
    //         d3.select('#leftPart').transition().duration(1000).attr('transform', 'translate('+window.innerWidth +','+0+')');
    //         d3.select('#nameApp').transition().duration(1000).style('opacity', '0'); 
    //         this.setState({'openGalleryModel': true});
    //         this.stateLeftBar = 'gallery';
    //     }
    //     else if (this.stateLeftBar == 'small'){
    //         d3.select('.lineRed').transition().duration(1000).style('left',  that.marginOffset + 'px');
    //         d3.select('#leftPart').transition().duration(1000).attr('transform', 'translate('+that.marginOffset +','+0+')');
    //         d3.select('#nameApp').transition().duration(1000).style('left', '323px');

    //         that.arrangeGuideNormal();

    //         this.setState({'openGalleryModel': false});
    //         this.stateLeftBar = 'normal'
    //     }
    // }
    // createSwipeLeft(){
    //     var that = this;

    //     if (this.stateLeftBar == 'gallery'){
    //         d3.select('.lineRed').transition().duration(1000).style('left',  that.marginOffset + 'px');
    //         d3.select('#leftPart').transition().duration(1000).attr('transform', 'translate('+that.marginOffset +','+0+')');
    //         d3.select('#nameApp').transition().duration(1000).style('opacity', '1');
    //         // d3.select('#nameApp').transition().duration(1000).style('left', '323px');

    //         this.setState({'openGalleryModel': false});
    //         this.stateLeftBar = 'normal'
    //     }
    //     else if (this.stateLeftBar == 'normal'){
    //         d3.select('.lineRed').transition().duration(1000).style('left',  '100px');
    //         d3.select('#leftPart').transition().duration(1000).attr('transform', 'translate(100,'+0+')');
    //         d3.select('#nameApp').transition().duration(1000).style('left', '123px');

    //         that.arrangeGuideSmall();
    
    //         this.setState({'openGalleryModel': false});
    //         this.stateLeftBar = 'small'
    //     }
        
    // }
    arrangeGuideSmall(){
        d3.select('#guides').selectAll('.guide').each(function(d, i){
            // var transform = getTransformation(d3.select(this).attr('transform'))
            var Y = (i*180) + 200;
            d3.select(this).transition().duration(1000).attr('transform', 'translate(-20,'+ Y +')')
            
        })
    }
    arrangeGuideNormal(){
        d3.select('#guides').selectAll('.guide').each(function(d, i){
            // var transform = getTransformation(d3.select(this).attr('transform'))
            var Y = (i*180) + 200;
            d3.select(this).transition().duration(1000).attr('transform', 'translate(120,'+ Y +')')
            
        }) 
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
        // if (that.isItemDragged == false){
            that.down = true;
            // that.createLine();
            // console.log(d3.event)
            // that.duplicating = that.isGuideHold; 
            // if (that.isGuideHold != false){
            //     that.duplicating = true;
            //     // console.log('GO')
            //     // that.duplicateSticky(that.isGuideHold);
            // }
            
            // if (event.x < 300){
            //     that.sticky = true;
            // }
           
            // if (that.guideTapped){
            //     that.tapGuide = that.guideTapped;
            // }
            // else 
            if (that.isPatternPen){

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
        // }
        
    }

    pointermove(event){
        var that = this;
        // console.log(that.isGuideHold, )
        if (that.down == true){

           
            var transform = getTransformation(d3.select('#panItems').attr('transform'))
            // var X = offsetX + transform.translateX;
            // var Y = offsetY + transform.translateY;


            that.tempArrayStroke.push([event.x - transform.translateX, event.y - transform.translateY]);

            // console.log(that.isStretchPen)

            if (that.tapGuide){
                that.drawTempStroke();
            }
            if (that.straightLine != false){
                that.drawTempStrokeStraightLine();
            }
            
            
            else if (that.isPatternPen){
                that.drawPattern(event);
                that.drawTempStroke();
            }
            else if (that.isStretchPen){
                that.drawStretch(event);
                that.drawTempStroke();
            }
            else if (that.state.tagHold){
                that.drawTag(event);
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
            
            /** New function */
            if (that.isGuideHold){
                that.duplicateGuide();
            } 
            
        }
        
    }
    pointerUp(event){
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

            // console.log(that.isFlick)
            if (that.isFlick){
                
            }
            else if (that.isPatternPen){
                that.addStrokePattern();
                that.removeTempGroup();
                // that.drawPattern(event);
            }
            else if (that.isStretchPen){
                that.addStrokeStretch();
                that.removeTempGroup();
            }
            else if (that.press){

            }
            else if (that.state.tagHold){
                that.addTagOnCanvas(event);
            }
            // else if (that.sticky && that.isGuideHold == false){
            //     that.addStrokeTag(event); 
            //     // that.addStrokeGuide(); 
            // }
            /** Instancie un guide vide  */
            /*else if (that.sticky && that.isGuideHold == false){
                // console.log(length)
                // that.findIntersection('penTemp');
                that.addStrokeGuide(); 
                that.sticky = false;
            }*/
            else if (that.straightLine != false){
                var strokeGuide = JSON.parse(JSON.stringify(that.tempArrayStroke))

                //that.makingGroup([], 'initial', strokeGuide);
            }
            else if (that.isFunctionPen){
                var transform = getTransformation(d3.select('#panItems').attr('transform'))
                console.log(event)
                var penPosition = JSON.parse(JSON.stringify([event.x - transform.translateX, event.y - transform.translateY]))
                var strokeGuide = JSON.parse(JSON.stringify(that.tempArrayStroke))
                that.findCloseStrokes().then((closelements)=>{
                    that.findClosestElements(closelements, 'penTemp', strokeGuide).then((elementLines)=> {

                        recognizeInk(this, elementLines).then((ink)=> {

                            that.makeActionsFunctionPen(penPosition, ink, elementLines);
                            
                        })
                        

                        
                        // console.log(elementLines)
                        
                    })
                })
            }
            /** Copie un guide a gauche //DUPLICATION */
            else if (that.sticky && that.isGuideHold){
                that.addStrokeGuideCopy(this.isGuideHold, event, guid()); 
            }
            /** Tap a guide to create a sticky */
            else if (that.tapGuide){
               
                // console.log(that.tapGuide)
                /*var modelId = that.tapGuide;
                var objectsSelected = that.findIntersection('penTemp');
                var strokeGuide = JSON.parse(JSON.stringify(that.tempArrayStroke))
                that.findClosestElements(objectsSelected, 'penTemp', strokeGuide).then((elementLines)=> {
                    that.makingGroup(elementLines, modelId, strokeGuide);
                })*/
                var modelId = that.tapGuide;
                var strokeGuide = JSON.parse(JSON.stringify(that.tempArrayStroke))
                that.findCloseStrokes().then((closelements)=>{
                    that.findClosestElements(closelements, 'penTemp', strokeGuide).then((elementLines)=> {
                        that.makingGroup(elementLines, modelId, strokeGuide);
                    })
                })
                
            }

            /** Quisk swipe to draw or create a sticky */
            else if (that.drawing && that.sticky == false && that.isGuideHold == false){
                // var objectsSelected = that.findCloseStrokes();
                var length = d3.select('#penTemp').node().getTotalLength();

                // _getBBoxPromise('penTemp').then((d)=>{
                //     console.log(d)
                // })
                //It's a guide OR a stroke

                // console.log()
                if (length > 150 && Date.now() - that.pointerDownPoperties.time < 400){
                    var strokeGuide = JSON.parse(JSON.stringify(that.tempArrayStroke));


                    var BB = findMinMax(strokeGuide);
                    // showBboxBB(BB, 'red')

                    /** Si c'est grand alors je cherche dedans */
                    if (BB.height > 30){
                        // console.log('HEY')
                        that.findCloseStrokes().then((closelements)=>{
                            console.log(closelements)
                            that.findClosestElements(closelements, 'penTemp', strokeGuide).then((elementLines)=> {
    
                                
                               that.makingGroup(elementLines, 'initial', strokeGuide);
                            })
                        })
                    }
                    /** Si c'est petit alors on s'en fout */ 
                    else {
                        that.makingGroup([], 'initial', strokeGuide);
                    } 
                } 
                // Or a stroke
                else {
                    // console.log('ADD')
                    that.idLine = guid();
                    // if (that.tempArrayStroke.length > 15){
                        that.addStroke();
                        that.isNewLine();
                        that.isSameLine();
                    // }
                }



                // that.addStroke();
                // that.drawing = false;
            }
            that.removeTempStroke();
        }
        that.straightLine = false;
        that.tempArrayStroke = [];
        that.down = false;
        that.objectIn = [];
        that.sticky = false;
        that.tapGuide = false;
        that.isFlick = false;
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
        var that = this;
        // that.pointerDownPoperties = {'time': Date.now(), 'position':[d3.event.x, d3.event.y]};
        // console.log(Date.now() -  this.pointerDownPoperties['time'])
        var time = Date.now() - this.pointerDownPoperties['time'];
        var dist = distance(this.pointerDownPoperties['position'][0], event.x, this.pointerDownPoperties['position'][1], event.y);
        this.isFlick = false;
        //Setup for the flick
        if (time < 200 && dist < 200 && dist > 30){
            var x = event['x'];
            var y = event['y'];
            d3.select('#penTemp').style('pointer-events', 'none');
            var element = whereIsPointer(x, y);
            var id = element.id;
            if (id == null){
                // OPEN GALLERY
            } else {
                var group = that.props.groupLines.find(x => x.id==id);
                if (group != null ) {
                    this.isFlick = true;
                    that.props.swipeGroup({'id': group.id, 'swipe': !group.swipe});
                }
            }
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
        
        var firstPoint = JSON.parse(JSON.stringify(strokeGuide[0]))
        var arrayPoints = strokeGuide;
        arrayPoints.forEach((d)=>{
            d[0] = d[0] - firstPoint[0];
            d[1] = d[1] - firstPoint[1]
        })
        var idChild = guid();

        /** Create the guide */
        arrayPoints = simplify(arrayPoints, 2)
        var data = {
            'points': arrayPoints, 
            'id': guid(),
            "paddingBetweenLines": 50,
            'child':idChild,
            'placeHolder': [
                {'id':'outerBackground', 'position':[0,0], 'lines':[], 'width': 400, 'height': 400, 'x':0, 'y':0},
                {'id':'backgroundLine', 'position':[0,0], 'lines':[], 'width': 400, 'height': 400, 'x':0, 'y':0},
                {'id':'backgroundText', 'position':[0,0], 'lines':[], 'width': 400, 'height': 400, 'x':0, 'y':0}
            ],
            'position': [0,0]
        }

        /** Create the group */
        var group = {
            'id': idChild, 
            'lines':lines, 
            'position': [0,0],
            'model': data,
            'tap': false,
            'swipe': false,
            'stroke': {'points':arrayPoints, 'position': [firstPoint[0],firstPoint[1]]}
        };
        this.props.createGroupLines(group);

        this.props.tapGroup({'id': idChild, 'tap':true})
        // this.props.removeSketchLines();

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

            /**
             * Delete empty arrays
             */
            for (var i = realArray.length - 1; i >= 0; i--) {
                if (realArray[i].length == 0) realArray.splice(i, 1);
            }
    

            // console.log(realArray, arrayDoublons)
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
            showBboxBB(BB1, 'red');
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
        var sticky = JSON.parse(JSON.stringify(guideToCopy));
        // this.props.stickyLines
        // console.log(evt)
        // sticky.forEach(st => {
        // sticky.id = id;
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
    /** Instantiate an empty Tag in the margin */
    addStrokeTag(ev){
        console.log(ev)
        var id = guid();
        var firstPoint = [ev['x'], ev['y']];
        var data = {
            'id': id,
            'width': 100,
            'height': 100,
            'placeHolder': [
                {'id':'left', 'data': {}, 'lines':[]}
            ],
            'tagSnapped': [],
            'position': [firstPoint[0],firstPoint[1]]
            
        }
        this.props.addTag(data)
    }
    /** Instantiate an empty guide in the margin */
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
            'width':200,
            'height':150,
            'placeHolder': [
                {'id':'outerBackground', 'position':[0,0], 'lines':[]},
                {'id':'backgroundLine', 'position':[0,0], 'lines':[]},
                {'id':'backgroundText', 'position':[0,0], 'lines':[]}
            ],
            'position': [firstPoint[0],firstPoint[1]]
            
        }

        this.props.addStickyLines(data);

        // console.log({'idLines':that.objectIn, 'class':['item-'+id]})
        //Add class to element
        
        // this.props.addLinesClass({'idLines':that.objectIn, 'class':['item-'+id]})
        // for (var i in this.objectIn){
        //     d3.select('#item-'+that.objectIn[i]).classed('sticky-'+id, true);
        // }
    }
    addStrokeStretch(){
        if (this.tempArrayStroke.length > 1){
            // To have everything in 0,0
            var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
            var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke));
            arrayPoints.forEach((d)=>{ d[0] = d[0] - firstPoint[0]; d[1] = d[1] - firstPoint[1] })
            var data = {
                'points': arrayPoints, 
                'data': {'class':[], 'sizeStroke': this.sizePen, 'colorStroke': this.colorPen}, 
                'id': guid() , 
                // 'device':this.props.UIid,
                'stretch':this.stretchPen,
                'isAlphabet': false,
                'position': [firstPoint[0],firstPoint[1]]
            }
            this.props.addSketchLine(data);
        }
    }
    addStrokePattern(){
        if (this.tempArrayStroke.length > 1){
            // To have everything in 0,0
            var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
            var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke));
            arrayPoints.forEach((d)=>{ d[0] = d[0] - firstPoint[0]; d[1] = d[1] - firstPoint[1] })
            var data = {
                'points': arrayPoints, 
                'data': {'class':[], 'sizeStroke': this.sizePen, 'colorStroke': this.colorPen}, 
                'id': guid() , 
                // 'device':this.props.UIid,
                'pattern':this.patternPen,
                'patternBBox': this.patternBBOX,
                'isAlphabet': false,
                'position': [firstPoint[0],firstPoint[1]]
            }
            this.props.addSketchLine(data);
        }
    }
    removeTempGroup(){
        d3.select('#tempGroup').selectAll('*').remove()
    }

    /**
     * PATTERN
     */
    drawPattern(event){
        var that = this;
        var line = d3.line()
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'));

        var step = that.patternBBOX.width;
        var path = d3.select('#penTemp').node()
        var length = path.getTotalLength();
        if (length - this.lastStepTagPattern > step){
            this.lastStepTagPattern = length;
            for (var i = 0; i < length; i += step){
                var point = path.getPointAtLength(i);

                this.patternPen.forEach((d)=>{

                    var X = point['x']+ d.position[0] - that.patternBBOX.width/2;
                    var Y = point['y']+ d.position[1]   - that.patternBBOX.height/2;
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
        }
    }
    drawStretch(event){
        // 
        var path = d3.select('#penTemp').node();
        var line = d3.line(d3.curveCardinal);
        var length = path.getTotalLength();

        var dataPoints = this.stretchPen[0].points
        var lengthStretch = dataPoints.length;

        var step = 20//length/lengthStretch;



        var diff = this.stretchPen.map((d, i)=>{ 
            var points = d.points;
            return distance(this.stretchPen[0].points[0][0], points[0][0], this.stretchPen[0].points[0][1], points[0][1]);
        })


        // console.log('===============', diff)

        if (length - this.lastStepTagPattern > step){
            this.removeTempGroup();
            this.lastStepTagPattern = length;

            this.stretchPen.forEach((d, k)=>{
                // var dataPoints = this.stretchPen[k].points
                var allPoints = []
                var j = 0;
                for (var i = 0; i < length; i += step){
                    var point = path.getPointAtLength(i);
                    
                    // if ( dataPoints[j] != undefined) {

                        // console.log(dataPoints[j][1])
                        // console.log(dataPoints[j][1] - point['y'])
                    var pointBefore = path.getPointAtLength(i-1);
                    var angle = Math.atan2(point.y-pointBefore.y, point.x-pointBefore.x) //* 180 / Math.PI;
                    // console.log(angle)
                    var newPointCos = createPositionAtLengthAngle(point, angle - (Math.PI/2), diff[k])
                    // drawCircle(newPoint['x'], newPoint['y'], 10, 'red')
                    var newPoint = [newPointCos['x'], newPointCos['y']];

                    // var newPoint = [point['x'], point['y'] + dataPoints[j][1]];
                    allPoints.push(newPoint)
                    // }
                    j++;
                }
                d3.select('#tempGroup').append('g')
                    .append('path')
                    .attr('d', (f)=>  line(allPoints))
                    .attr('fill', 'none')
                    .attr('stroke', d.data.colorStroke)
                    .attr('stroke-width', d.data.sizeStroke)
                    .attr("stroke-dasharray", 'none')
                    .attr('stroke-linejoin', "round")
            })
            // console.log(allPoints)
        }


    }
    duplicateGuide(){
        var that = this;
        var line = d3.line()
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        console.log()
        var dist = distance(that.lastMovePosition.x, event['x'], that.lastMovePosition.y, event['y']);
        if (dist > this.isGuideHold.placeHolder[0]['width']){//(this.guidHoldObject.width)){
            that.lastMovePosition = {'x': event['x'],'y': event['y']};
            // drawCircle(event['x'], event['y'], 10, 'red');
            // var newGuidePoints = [
            //     [event['x'] - transformPan.translateX, event['y'] - transformPan.translateY],
            //     [event['x'] - transformPan.translateX, event['y'] + 80 - transformPan.translateY]
            // ];
            var newGuidePoints = [
                [event['x'] - transformPan.translateX, event['y'] - transformPan.translateY],
                [event['x'] - transformPan.translateX, event['y'] + 300 - transformPan.translateY]
            ];
            
            var idChild = guid();

            /** Create the guide */
            // arrayPoints = simplify(arrayPoints, 2)
            // var data = {
            //     'points': newGuide, 
            //     'id': guid(),
            //     "paddingBetweenLines": 50,
            //     'child':idChild,
            //     'placeHolder': [
            //         {'id':'outerBackground', 'position':[0,0], 'lines':[], 'width': 800, 'height': 800, 'x':0, 'y':0},
            //         {'id':'backgroundLine', 'position':[0,0], 'lines':[], 'width': 800, 'height': 800, 'x':0, 'y':0},
            //         {'id':'backgroundText', 'position':[0,0], 'lines':[], 'width': 800, 'height': 800, 'x':0, 'y':0}
            //     ],
            //     'position': [0,0]
            // }

           
            // console.log(newGuidePoints[0],  this.isGuideHold)
            var newGuide = JSON.parse(JSON.stringify(this.isGuideHold));
            newGuide.points = newGuidePoints
            newGuide.id =  guid();
            newGuide.child = idChild;
            newGuide.placeHolder.forEach((d)=>{
                d.lines.forEach((d)=> d.id = guid());
                // d.width = 500
                
                // console.log(d)
            })

            /** Create the group */
            var group = {
                'id': idChild, 
                'lines':[], 
                'position': [0,0],
                'model': newGuide,
                'tap': false,
                'swipe': true,
                'stroke': {'points':newGuidePoints, 'position': [0,0]}
            };
            // console.log(group)
            this.props.createGroupLines(group);

            this.props.tapGroup({'id': idChild, 'tap':true})
        }
    }

    drawTag(event){
        var that = this;
        var line = d3.line()
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        d3.select('#penTemp')
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '10')
            .attr('opacity', '0.2')
            .attr("stroke-dasharray", "10");
      
      

        var step = 130;
        var f = 0;
        var path = d3.select('#penTemp').node()
        var length = path.getTotalLength();
        // console.log('==========', length - this.lastStepTagPattern)

        if (this.positionTag.length == 0 || length - this.lastStepTagPattern > step){
            this.lastStepTagPattern = length;
            // console.log(that.state.tagHold)
            d3.select('#tempTag').selectAll('*').remove()
            that.positionTag = [];
            for (var i = 0; i < length; i += step){
                var point = path.getPointAtLength(i);
                // var X = point['x'] - transformPan.translateX - that.state.tagHold.offsetX - that.state.tagHold.BB.width/2;
                // var Y = point['y'] - transformPan.translateY - that.state.tagHold.offsetY - that.state.tagHold.BB.height/2;
                var X = point['x'] - 50;
                var Y = point['y']  - 50;
    
                that.positionTag.push({'x': X, 'y': Y})
                // console.log(that.positionTag)
                if (that.state.tagHold.tagSnapped.length == 0){
                    var container = d3.select('#tempTag').append('g').attr('transform', 'translate('+X+','+Y+')')
                    for (var j = 0; j < that.state.tagHold.placeHolder[0]['lines'].length; j += 1){
                        var element = that.state.tagHold.placeHolder[0]['lines'][j];
                        container//.append('g').attr('transform', 'translate('+(- that.state.tagHold.offsetX)+','+(- that.state.tagHold.offsetY )+')')
                            .append('path')
                            .attr('d', (d)=>line(element.data))
                            .attr('fill', 'none')
                            .attr('stroke', (d)=> element.colorStroke )
                            .attr('stroke-width', element.sizeStroke)
                    } 
                } 
                /** IN CASE OF MANY TAG SNAPPED **/
                else {
                    var where = f % (that.state.tagHold.tagSnapped.length + 1);
                    // console.log(where)
                    if (where != 0){
                        var container = d3.select('#tempTag').append('g').attr('transform', 'translate('+X+','+Y+')')
                        for (var j = 0; j < that.state.tagHold.tagSnapped[where-1].placeHolder[0]['lines'].length; j += 1){
                            var element = that.state.tagHold.tagSnapped[where-1].placeHolder[0]['lines'][j];
                            container//.append('g').attr('transform', 'translate('+(- that.state.tagHold.offsetX)+','+(- that.state.tagHold.offsetY )+')')
                                .append('path')
                                .attr('d', (d)=>line(element.data))
                                .attr('fill', 'none')
                                .attr('stroke', (d)=> element.colorStroke )
                                .attr('stroke-width', element.sizeStroke)
                        } 
                    } else {
                        var container = d3.select('#tempTag').append('g').attr('transform', 'translate('+X+','+Y+')')
                        for (var j = 0; j < that.state.tagHold.placeHolder[0]['lines'].length; j += 1){
                            var element = that.state.tagHold.placeHolder[0]['lines'][j];
                            container//.append('g').attr('transform', 'translate('+(- that.state.tagHold.offsetX)+','+(- that.state.tagHold.offsetY )+')')
                                .append('path')
                                .attr('d', (d)=>line(element.data))
                                .attr('fill', 'none')
                                .attr('stroke', (d)=> element.colorStroke )
                                .attr('stroke-width', element.sizeStroke)
                        } 
                    }
                    f++;
                }
                
            }
        }
    }
    addTagOnCanvas(ev){
        var that = this;
        // var data = {
        //     'id': guid(),
        //     'data':  that.tempArrayStroke,
        //     'tagHold': that.state.tagHold,
        //     'isPattern': (that.state.tagHold) ? true : false
        // }
        // console.log(data)
        // this.props.addTagCanvas(data);


        // var data = {
        //     'id': id,
        //     'width': 100,
        //     'height': 100,
        //     'placeHolder': [
        //         {'id':'left', 'data': {}, 'lines':[]}
        //     ],
        //     'tagSnapped': [],
        //     'position': [firstPoint[0],firstPoint[1]]
            
        // }
        // console.log(that.positionTag)
        for (var i in that.positionTag){
            var position = that.positionTag[i]
            // var id = guid();
            var firstPoint = [position['x'], position['y']];
            var data = JSON.parse(JSON.stringify(that.state.tagHold));
            // data.data = that.tempArrayStroke;
            data.id = guid();
            data.position = firstPoint;
            data.placeHolder[0]['lines'].forEach(element => {
                element.id = guid()
            });

            for (var j in data.tagSnapped){

                var placeHolderTagSnapped = data.tagSnapped[j]['placeHolder'];
                placeHolderTagSnapped[0]['lines'].forEach(element => {element.id = guid()});
                // console.log(data.tagSnapped[j])
            }

    
            // console.log(data)
            this.props.addTag(data)
        }
      
        that.positionTag = []
        // console.log(data)
    }
/**
     * STROKE
     */
    drawTempStrokeStraightLine(){
        var that = this;
        var line = d3.line()
        var touchPoint = that.straightLine;

        
        var penPoint = {'x': that.tempArrayStroke[that.tempArrayStroke.length-1][0] , 'y': that.tempArrayStroke[that.tempArrayStroke.length-1][1]};

        that.tempArrayStroke = [
            [touchPoint.x, touchPoint.y],
            [penPoint.x, penPoint.y]
        ]
        // var angle = Math.atan2(penPoint.y-touchPoint.y, penPoint.x-touchPoint.x)
        // var point = createPositionAtLengthAngle(penPoint, angle, 200);
        // console.log(angle)
        // drawCircle(point.x, point.y, 30, 'red')
        d3.select('#penTemp')
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', that.colorPen)
            .attr('stroke-width', that.sizePen)
            .attr("stroke-dasharray", 'none')
            .attr('stroke-linejoin', "round")
    }
    drawTempStroke(){
        var that = this;
        var line = d3.line()
        // console.log(that.colorPen)
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
        d3.select('#tempTag').selectAll('*').remove()
        this.lastStepTagPattern = 0
    }
    addStrokeFilledData(data){
        // console.log(data)
        this.props.addSketchLine(data);
    }
    
    drawEraseStroke(){
        // console.log('HEY')
        var that = this;
        var line = d3.line()
        d3.select('#penTemp')
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', 'grey')
            .attr('stroke-width', '10')
            .attr("stroke-dasharray", "10");
    }
    eraseStroke(){

        var lastPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[this.tempArrayStroke.length-1]));
        var transform = getTransformation(d3.select('#panItems').attr('transform'))

        lastPoint[0] += transform.translateX;
        lastPoint[1] += transform.translateY;
        // drawCircle(lastPoint[0], lastPoint[1], 10, 'red')
        var element = document.elementFromPoint(lastPoint[0], lastPoint[1]);
        // console.log(element)
        if (element.tagName == 'path' && element.className.baseVal == "fakeStroke"){
            
            var id = element.id.split('-')[1];
            // console.log(id)
            this.props.removeSketchLines([id]);
        }
    }
    makeActionsFunctionPen(penPosition, ink, elementLines){
        
        var that = this;
        console.log(ink, that.commandFunction)
        /** For average */
        if (that.commandFunction.command == 'AVG'){
            ink = ink.map((d)=> parseFloat(d))
            var average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
            var result = String(average(ink)).split('');
            that.speech.setPositionTyping([penPosition[0], penPosition[1]])
            // drawCircle(penPosition[0], penPosition[1], 10, 'red')
            result.forEach((d)=>{
                
                that.speech.addTextTyping(d)
            })
        }
        /** For average */
        if (that.commandFunction.command == 'SUM'){
            ink = ink.map((d)=> parseFloat(d))
            var average = arr => arr.reduce( ( p, c ) => p + c, 0 );
            var result = String(average(ink)).split('');
            that.speech.setPositionTyping([penPosition[0], penPosition[1]])
            // drawCircle(penPosition[0], penPosition[1], 10, 'red')
            result.forEach((d)=> that.speech.addTextTyping(d))
        }
        else if (that.commandFunction.command == 'highlight'){
            var arrayPromise = elementLines.map((d)=> getBoundinxBoxLines(d));
            var color = that.commandFunction.args;
            var c = d3.color(color)
            c.opacity = 0.2;
            Promise.all(arrayPromise).then(function(values) {
                values.forEach((BB)=> drawRect(BB.x, BB.y, BB.width, BB.height, c.toString()))
            })
        }
    }
    isSameLine = async() => {
        var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
        var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
        var transform = getTransformation(d3.select('#panItems').attr('transform'))

        firstPoint[0] += transform.translateX;
        firstPoint[1] += transform.translateY;
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
        var transform = getTransformation(d3.select('#panItems').attr('transform'))

        firstPoint[0] += transform.translateX;
        firstPoint[1] += transform.translateY;

        var dictBBox = {};
        var groupNotToCheck = []

        /** Check for guideIntersection */
        for (var i in this.props.groupLines){
            var item = this.props.groupLines[i];
            var id = item['id'];
            var BB = await _getBBoxPromise('item-'+id);
            dictBBox[id] = BB;
            // showBboxBB(BB, 'red')
        }  
        
        for (var i = 0 ; i <  Object.keys(dictBBox).length; i++){
            var key1 = Object.keys(dictBBox)[i]
            var BB1 = dictBBox[key1]
            // console.log(Object.keys(dictBBox).length, i)
            for (var j = i+1 ; j <  Object.keys(dictBBox).length; j++){
                var key = Object.keys(dictBBox)[j]
                var BB2 = dictBBox[key]
                var isIntersect = boxBox(BB1.x, BB1.y, BB1.width, BB1.height,BB2.x, BB2.y, BB2.width, BB2.height)
                if (isIntersect){
                    groupNotToCheck.push(key);
                    groupNotToCheck.push(key1);
                    // showBboxBB(BB1, 'red')
                }
                // console.log(isIntersect)
            }
        }
        // console.log(groupNotToCheck)

        for (var i in this.props.groupLines){
            var item = this.props.groupLines[i];
            var id = item['id'];

            /* Sure to not have crossing groups */
            if (groupNotToCheck.indexOf(id) == -1){
                // console.log(item)
                var BB = dictBBox[id]
                            
                var offset = 80;
                BB.x -= offset;
                BB.width += 2*offset;

                // showBboxBB(BB, 'red')

                var isIn = boxPoint(BB.x, BB.y, BB.width, BB.height, firstPoint[0], firstPoint[1]);
                if (isIn) {
                    this.props.addLineToGroup({'idLine': [[this.idLine]], 'idGroup':id})
                }
                // console.log(isIn)
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
        console.log('TagHolded ',d)
        this.setState({'tagHold': d})
    }
    holdGuide = (d) => {
        // console.log('GuideHolded '+d)
        this.isGuideHold = d;
        // if (d != false) this.guidHoldObject = JSON.parse(JSON.stringify(this.props.stickyLines.find(x => x.id == d)));
        // else this.guidHoldObject = false;
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
    setCommandFunction = (d) => {
        // console.log(d)
        this.commandFunction = d;
    }
    openAlphabet = (d) => {
        // console.log('HEY')
        this.setState({shouldOpenAlphabet:d});
    }
    selectPen = (d) => {
        // console.log(d)
        if (d.type == "function"){
            this.isFunctionPen = true;
            this.isPatternPen = false;
            this.isStretchPen = false;
            this.setState({'penType': 'function'})
        }
        else if (d.type == "pattern"){
            this.isPatternPen = true;
            this.isFunctionPen = false;
            this.isStretchPen = false;
            this.setState({'penType': 'pattern'})
        }
        else if (d.type == "stretch"){
            // console.log('HEY')
            this.isPatternPen = false;
            this.isFunctionPen = false;
            this.isStretchPen = true;
            this.setState({'penType': 'stretch'})
        }
        else {
            this.isPatternPen = false;
            this.isFunctionPen = false;
            this.isStretchPen = false;
            this.setState({'penType': 'normal'})
            var sizePen = 2;
            if (d.type == "highlighter") {
                sizePen = 15
                this.setOpacityColor(0.5);
                
            }
            if (d.type == "ink") {
                this.setOpacityColor(1);
                sizePen = 2
            }
            this.sizePen = sizePen
            this.setState({'sizeStroke': sizePen})
        } 
    }
    setOpacityColor(op){
        var c = d3.rgb(this.colorPen)
        c.opacity = op;
        // console.log(c.toString());
        this.colorPen = c.toString();
        // console.log(c.toString())
        this.setState({'colorStroke': c.toString()})
    }
    setOpacity = (d) => {
        this.setOpacityColor(d);
    }
    selectColor = (d) => {
        this.colorPen = d;
        if (this.sizePen > 10) this.setOpacityColor(0.5);
        else this.setOpacityColor(1);
        // this.setState({'colorStroke':this.colorPen})
        
    }
    selectColorSize = (d) => {
        this.colorPen = d.color;
        this.sizePen = d.size;
        this.setState({'sizeStroke': d.size})
        this.setState({'colorStroke': d.color})
    }
    setPatternPen = (old) => {
        console.log(old)
        var d = JSON.parse(JSON.stringify(old))
        _getBBoxPromise('linesPattern').then((e)=> {
            this.patternBBOX = e

            this.patternBBOX.x -= 5;
            this.patternBBOX.y -= 5;
            this.patternBBOX.width += 10;
            this.patternBBOX.height += 10;
            /**
             * JUST REMOVE EXTRA SPACE
             */
            _getBBoxPromise('patternSVG').then((f)=> {
                var offsetX = this.patternBBOX.x - f.x;
                var offsetY = this.patternBBOX.y - f.y;

                d.forEach((f)=>{
                    f.position[0] -= offsetX //+ (e.width/2);
                    f.position[1] -= offsetY //+ (e.height/2);
                })
                this.patternPen = d;
                // console.log(offsetX, offsetY)
            })            
        })
    }
    setStretchPen = (strecth) => {
        var newStretch = JSON.parse(JSON.stringify(strecth));

        _getBBoxPromise('linesStretch').then((e)=> {
            this.patternBBOXStretch = e
            /**
             * JUST REMOVE EXTRA SPACE
             */
            _getBBoxPromise('stretchSVG').then((f)=> {
                var offsetX = this.patternBBOXStretch.x - f.x;
                var offsetY = this.patternBBOXStretch.y - f.y;
                // console.log(offsetX, offsetY)
                newStretch.forEach((f)=>{
                    f.position[0] -= offsetX;
                    f.position[1] -= offsetY;

                    f.points = f.points.map((d)=> [d[0] + f.position[0], d[1] + f.position[1]])
                })
                
                this.stretchPen = newStretch;
            })            
        })

        
        // var myImaginaryLine
       
        // console.log(strecth)
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
    setColorPaletteTapped = (d) => {
        // console.log(d)
        this.colorPaletteTapped = d;
    }
    setGuideTapped = (d) => {

        console.log('tap', d)
        // console.log(this.linesInselection)
        // this.guideTapped = d;

        if (d != false){
            // var group = this.props.groupLines.find(x => x.id == d);
            // this.setState({'guideTapped': group.model})
            this.setState({'guideTapped': d})
            // console.log(group.model)
        } else {
            this.setState({'guideTapped': d})
        }
        // if (this.linesInselection.length != 0 && this.linesInselection.elements.length != 0 && this.guideTapped != false){
        
        // var data = {
        //     'idGroups': this.linesInselection.elements, 
        //     'model': sticky
        // };
        //     this.props.changeModelGroupLines(data);
        //     this.guideTapped = false;
        // }
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
                        
                        
                        <Groups 
                            setSelection={this.setSelection}
                            setGroupTapped={this.setGroupTapped}

                            tagHold={this.state.tagHold}
                            getBBoxEachLine={this.getBBoxEachLine}
                            isGuideHold={this.isGuideHold}

                            colorStroke = {this.state.colorStroke}
                            sizeStroke = {this.state.sizeStroke}
                            penType = {this.state.penType}
                            tagHold={this.state.tagHold}

                            holdGuide={this.holdGuide}

                            patternPenData={{'BBox': this.patternBBOX, 'strokes': this.patternPen}}

                            setGuideTapped={this.setGuideTapped}
                            guideTapped={this.state.guideTapped}
                        />
                       <Lines />
                        <Textes />
                        {/* <TagsInterface
                            holdTag={this.holdTag} 
                        /> */}
                        <Tags 
                    
                            holdTag={this.holdTag} 
                            colorStroke = {this.state.colorStroke}
                            sizeStroke = {this.state.sizeStroke}
                        /> 
                        <Images/>
                        {/* <Guides 
                            holdGuide={this.holdGuide} 
                            dragItem={this.dragItem}
                            setGuideTapped={this.setGuideTapped}

                            colorStroke = {this.state.colorStroke}
                            sizeStroke = {this.state.sizeStroke}
                            penType = {this.state.penType}
                            tagHold={this.state.tagHold}

                            patternPenData={{'BBox': this.patternBBOX, 'strokes': this.patternPen}}
                        /> */}
                        <g id="tempLines"><path id="penTemp"></path></g>
                        <g id="tempGroup">

                            
                        </g>
                        <g id ="tempTag"> </g>
                        
                    </g>

                   {/* <g id="leftPart" transform={`translate(300,0)`}>
                        <rect width={'100%'} height={'110%'} x={'-100%'} y={'-5%'}  fill={'white'} />
                   </g> */}
                    {/* <rect id='leftPart' width={this.marginOffset + 'px'} height={'110%'} x={0} y={'-5%'}  fill={'white'} /> */}
                    {/* <image id="imageRect" width={this.marginOffset + 'px'} height={'110%'} x={0} y={'-5%'} href={paperTexture} /> */}
                     {/* //fill={'url(#grump_avatar)'}/> */}

                    {/* <Menus /> */}
                    
                   

                    {/* <image href="https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png" height="200" width="200"/> */}
                    {/* <VoiceQuerys /> */}

                    <Picker 
                        isHoldingCanvas = {this.state.isHoldingCanvas}
                        colorStroke = {this.state.colorStroke}
                        sizeStroke = {this.state.sizeStroke}
                        stretchPen = {this.stretchPen}
                        patternPenData={{'BBox': this.patternBBOX, 'strokes': this.patternPen}}
                        penType = {this.state.penType}
                        selectPen = {this.selectPen}

                        selectColorSize = {this.selectColorSize}
                        setColorPaletteTapped = {this.setColorPaletteTapped}
                    />
                    
                 
                    {/* */}

                    {/* <rect id='swipeLayer'  x={0} y={0} fill='red' opacity='0' /> */}
                 
                   
                    <GalleryItmes 
                        setGuideTapped={this.setGuideTapped}
                    /> 
                   

                    {/* <rect id='swipeLayer'  x={0} y={0} fill='red' opacity='0' /> */}

                    {/* <g id="eventReceiver">
                        </g>     */}
                    {/* <ColorMenu isSticky={this.isSticky} changeColorStroke={this.changeColorStroke} changeWidthStroke={this.changeWidthStroke} changeActionPen={this.changeActionPen}/> */}
                        
               

                </svg>
                <div id="canvasTemp">
                    <canvas id="canvasGetPixel"/>
                </div>
                {/* <svg id="eventReceiver"></svg> */}
                <ColorMenu 
                    openAlphabet={this.openAlphabet}
                    selectPen={this.selectPen}
                    setOpacity={this.setOpacity}
                    selectThisColor={this.selectColor}
                    colorStroke = {this.state.colorStroke}
                    sizeStroke = {this.state.sizeStroke}
                    
                    setStretchPen = {this.setStretchPen}

                    setPatternPen = {this.setPatternPen}
                    setCommandFunction = {this.setCommandFunction}
                    isSticky={this.isSticky} 
                    isGroup ={this.isGroup} 
                />
                 <div id="nameApp"> Bl(ink) </div>
                {this.state.shouldOpenAlphabet ? <Lettres openAlphabet={this.openAlphabet} /> : null}
            </div>
        );
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(Document);

