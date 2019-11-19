import React, { Component } from "react";
import * as d3 from 'd3';
import Lines from './Lines'
import './../../css/main.css';
import paper from 'paper';
import * as Hammer from 'hammerjs';
import { connect } from 'react-redux';
import { distance, guid, whoIsInside, getTransformation, is_point_inside_selection, getType, showBbox, _getBBox, checkIntersection, getNearestElement, showBboxBB, drawCircle, interpolate, line_intersect, midPosition, getPerpendicularPoint, drawLine } from "./Helper";
import ColorMenu from "./ColorMenu";


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
    findClosestElements(objects, idGuide){
        var that = this;
        console.log(objects)
        var BB1 = _getBBox(idGuide);
        var firstPoint = that.tempArrayStroke[0];
        var lastPoint = that.tempArrayStroke[that.tempArrayStroke.length-1];
        var lineGuide = [{'x': firstPoint[0] ,'y': firstPoint[1]}, {'x': lastPoint[0], 'y': lastPoint[1] }]

        drawCircle(lineGuide[0].x, lineGuide[0].y, 2, 'purple');
        drawCircle(lineGuide[1].x, lineGuide[1].y, 2, 'purple');

        objects.forEach((objectId)=>{
            showBbox('item-'+objectId, 'black');
            var BB = _getBBox('item-'+objectId);
            var line1 = [{'x': BB.x, 'y': BB.y}, {'x': BB.x + BB.width, 'y': BB.y }]
            var line2 = [{'x': BB.x + BB.width, 'y': BB.y}, {'x': BB.x + BB.width, 'y': BB.y + BB.height}]
            var line3 = [{'x': BB.x + BB.width, 'y': BB.y + BB.height}, {'x': BB.x, 'y': BB.y + BB.height }]
            var line4 = [{'x': BB.x, 'y': BB.y + BB.height }, {'x': BB.x , 'y': BB.y }]

            var arrayLine = [line1, line2, line3, line4];
            var arrayIntersection = [];
            arrayLine.forEach((line)=>{
                var isIntersect = line_intersect(line[0].x, line[0].y, line[1].x, line[1].y, lineGuide[0].x, lineGuide[0].y, lineGuide[1].x, lineGuide[1].y);
                if (isIntersect != false) {
                    arrayIntersection.push(isIntersect);
                }
                // console.log(isIntersect)
                // drawCircle(line[0].x, line[0].y, 2, 'red')
                // drawCircle(line[1].x, line[0].y, 2, 'red')
            })
            console.log(arrayIntersection)
            if (arrayIntersection.length != 0){

                var positionMiddle = midPosition(arrayIntersection[0].x, arrayIntersection[0].y, arrayIntersection[1].x,  arrayIntersection[1].y);
                var perpPoint = getPerpendicularPoint(lineGuide[0], positionMiddle, 100)
                drawCircle(perpPoint.x, perpPoint.y, 5, 'red')

                var perpPoint = getPerpendicularPoint(lineGuide[0], positionMiddle, -100)
                drawCircle(perpPoint.x, perpPoint.y, 5, 'red')
                drawCircle(positionMiddle.x, positionMiddle.y, 5, 'red');
            }
            
            // drawCircle(arrayIntersection[0].x, arrayIntersection[0].y, 2, 'red')
            // var middleRight = {'x': BB.x + BB.width, 'y': BB.y + BB.height/2};

            // var point = interpolate(middleLeft, middleRight, 2)
            // drawCircle(positionMiddle.x, positionMiddle.y, 2, 'red')
            // drawCircle(middleLeft.x, middleLeft.y, 2, 'red')
            // drawCircle(middleRight.x, middleRight.y, 2, 'red')
        })

        
        /*objects.forEach((d)=>{
            // showBbox('item-'+d, 'black');
            console.log(d)
            // var id = 'item-'+d;
            // console.log(id)
            getNearestElement(d).then((element)=>{
                console.log(element)
            })
        })*/
    }
    //Pour les guides
    findIntersection(id){
        //Getting all objects
        var that = this;
        this.objectIn = [];

        var firstPoint = that.tempArrayStroke[0];
        var lastPoint = that.tempArrayStroke[that.tempArrayStroke.length-1];
        var lineGuide = [{'x': firstPoint[0] ,'y': firstPoint[1]}, {'x': lastPoint[0], 'y': lastPoint[1] }]

        drawLine(firstPoint[0] ,firstPoint[1],lastPoint[0], lastPoint[1] , 'black' )
        //Regardes les intersections
        d3.select('.standAloneLines').selectAll('g').each(function(){

            var BB = _getBBox(d3.select(this).attr('id'));
            var line1 = [{'x': BB.x, 'y': BB.y}, {'x': BB.x + BB.width, 'y': BB.y }]
            var line2 = [{'x': BB.x + BB.width, 'y': BB.y}, {'x': BB.x + BB.width, 'y': BB.y + BB.height}]
            var line3 = [{'x': BB.x + BB.width, 'y': BB.y + BB.height}, {'x': BB.x, 'y': BB.y + BB.height }]
            var line4 = [{'x': BB.x, 'y': BB.y + BB.height }, {'x': BB.x , 'y': BB.y }];

            var arrayLine = [line1, line2, line3, line4];
            var item = null
            arrayLine.forEach((line)=>{
                var isIntersect = line_intersect(line[0].x, line[0].y, line[1].x, line[1].y, lineGuide[0].x, lineGuide[0].y, lineGuide[1].x, lineGuide[1].y);
                if (isIntersect != false) {
                    console.log('HEY')
                    item = d3.select(this).attr('id').split('-')[1]
                }
            })
            if (item != null) that.objectIn.push(item)

        })
        // console.log(that.objectIn)
        return JSON.parse(JSON.stringify(that.objectIn))
    }
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

