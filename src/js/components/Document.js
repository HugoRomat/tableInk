import React, { Component } from "react";
import * as d3 from 'd3';
import Lines from './Lines'
import './../../css/main.css';
import paper from 'paper';
import * as Hammer from 'hammerjs';
import { connect } from 'react-redux';
import { distance, guid, whoIsInside, getTransformation, is_point_inside_selection } from "./Helper";
import ColorMenu from "./ColorMenu";


import { 
    addSketchLine,
    removeSketchLines,
    createGroupLines,
    addStickyLines
} from '../actions';
import Guides from "./Guides";

const mapDispatchToProps = {  
    addSketchLine,
    removeSketchLines,
    createGroupLines,
    addStickyLines
};


function mapStateToProps(state, ownProps) {

    // console.log(state)
    return {
        sketchLines: state.rootReducer.present.sketchLines
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
    }
    init(){

    }
    componentDidMount(){
        this.listenEvents();
        d3.select('#canvasVisualization').style('width', '100%').style('height', '100%');
        this.listenHammer();
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
          this.mc.on("press", function(ev) {
            //   ev.preventDefault();
                // console.log(that)
              if (ev.pointers[0]['pointerType'] == 'touch'){
                  console.log('PRESS')
                that.press = true;
              }
            })
            this.mc.on("pressup", function(ev) {
                //   ev.preventDefault();
                    // console.log(that)
                  if (ev.pointers[0]['pointerType'] == 'touch'){
                    that.press = false;
                  }
                })
    }
   
    panEnd(e){
        console.log('panEnd')
    }
    listenEvents(){
        var that = this;
        //Mon click est forcement une selection
        d3.select('#canvasVisualization')
            .on('pointerdown', function(){
                // console.log('HEY')
                if (d3.event.pointerType == 'pen'){

                    that.selecting =false;
                    that.drawing = false;
                    that.erasing = false;
                   

                    if (that.press == false){
                        that.down = true;
                        // that.createLine();
                        // console.log(d3.event)
                        if(d3.event.buttons == 1){
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
                    else {
                        that.down = true;
                        var group = JSON.parse(JSON.stringify(that.selectionGroup))
                        group.data.forEach(function(d){
                            d.id = guid()
                        })
                        that.props.createGroupLines({'id': 'group-'+guid(), 'data':group.data, 'position': [d3.event.x, d3.event.y]});
                        that.panPosition = {'x': d3.event.x, "y": d3.event.y };
                    }
                }
                

            })
            .on('pointermove', function(){
                if (d3.event.pointerType == 'pen'){
                    if (that.down == true){
                        // console.log(that.press)
                        if (that.press == false){

                            
                            that.tempArrayStroke.push([d3.event.x, d3.event.y])
                            if (that.drawing){
                                that.drawTempStroke();
                            }
                            if (that.selecting){
                                that.drawTempSelectingStroke();
                            }
                        }
                        else {
                            // console.log(d3.select('#'+that.selectionGroup.id).node().getBBox())

                            var BBWidth = d3.select('#'+that.selectionGroup.id).node().getBBox().width
                            // var BBWidth = text.node().getBBox();
                            // var width = that.newGroup.bounds.height;
                            var dist = distance(that.panPosition.x, d3.event.x, that.panPosition.y, d3.event.y);
                            // console.log(dist)
                            if (dist > BBWidth){
                                var group = JSON.parse(JSON.stringify(that.selectionGroup))
                                group.data.forEach(function(d){ d.id = guid()})
                                // that.props.createGroupLines({'id': 'group-'+guid(), 'data':group.data, 'position': [d3.event.x, d3.event.y]});
                                that.panPosition = {'x': d3.event.x, "y": d3.event.y };
                            }
                        }
                    }
                    
                    
                    

                    // console.log(d3.event)
                }
            })
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
            .on('pointerup', function(){
                if (that.down){
                    // console.log(that.drawing, that.sticky)
                    // console.log(that.drawing)
                    if (that.selecting) {
                        
                        // selectionGroup
                        var selection = whoIsInside(that.props.sketchLines, that.tempArrayStroke);

                        // var soustraire = JSON.parse(JSON.stringify(selection[0]['position']));
                        // selection.forEach((d)=>{
                        //     d.position[0] = d.position[0] - soustraire[0];
                        //     d.position[1] = d.position[1] - soustraire[1]
                        // })
                        // console.log(that.selectionGroup)
                        // that.selectionGroup = {'id': 'group-'+guid(), 'data':selection, 'position': [0,0]}
                        // that.props.createGroupLines(that.selectionGroup);
                        // that.props.removeSketchLines(that.selectionGroup.data.map((d)=> d.id));
                        that.selecting = false;
                    }
                    if (that.sticky){
                        // var length = d3.select('#penTemp').node().getTotalLength();
                        // .getPointAtLength(float distance);
                        // console.log(length)
                        that.findIntersection();
                        that.addStrokeGuide(); 
                    }
                    if (that.drawing && that.sticky == false){
                        that.addStroke();
                        that.drawing = false;
                    }
                    that.removeTempStroke();
                }
                that.tempArrayStroke = [];
                that.down = false;
            })
    }
    findIntersection(){
        //Getting all objects
        var that = this;
        this.objectIn = [];
        
        d3.select('.standAloneLines').selectAll('g').each(function(){
            var BB = d3.select(this).node().getBBox();
            var transform = getTransformation(d3.select(this).attr('transform'))
            var selection = [
                [BB.x+transform.translateX, BB.y+transform.translateY],
                [BB.x+transform.translateX+BB.width, BB.y+transform.translateY],
                [BB.x+transform.translateX+BB.width, BB.y+transform.translateY+BB.height],
                [BB.x+transform.translateX, BB.y+transform.translateY+BB.height],
            ]
            var isIn = false;
            var i = 0;
            //Iterate over all points
            var length = d3.select('#penTemp').node().getTotalLength();
            while( isIn == false && i< length){
                var pointSticky = d3.select('#penTemp').node().getPointAtLength(i);
                var isIn = is_point_inside_selection([pointSticky.x, pointSticky.y],  selection);
                if (isIn) that.objectIn.push( d3.select(this).attr('id').split('-')[1])
                i++;
            }
        })

        // d3.select('svg').append('rect')
        //     .attr('x', BB.x+transform.translateX)
        //     .attr('y', BB.y+transform.translateY)
        //     .attr('width', BB.width)
        //     .attr('height', BB.height)
        
        //Getting Sticky line
       
        // d3.select('#penTemp');
    }
    addStrokeGuide(){
        var id = guid();
        var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke))
        var data = {
            'points': arrayPoints, 
            'data': {'lineAttached': this.objectIn}, 
            'id': id, 
            'position': [0,0]
        }
        this.props.addStickyLines(data);
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


        if (this.sticky) d3.select('#penTemp').attr('stroke', 'red')
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
        // var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
        var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke))
        // arrayPoints.forEach((d)=>{
        //     d[0] = d[0] - firstPoint[0];
        //     d[1] = d[1] - firstPoint[1]
        // })
        // console.log(arrayPoints)
        var data = {
            'points': arrayPoints, 
            'data': {}, 
            'id': id, 
            'position': [0,0]
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
    // setTextBounds= (d) => {
    //     // console.log(d);
    //     this.pointText = d;
    // }

    render() {
        return (
            <div>
                
                <svg id="canvasVisualization">
                    {/* {this.isMount ?  */}
                        <Lines />
                        <Guides />
                        {/* <GroupPattern */}
                        <g id="tempLines">
                            <path id="penTemp"></path>
                        </g>
                        {/* <ColorMenu isSticky={this.isSticky} changeColorStroke={this.changeColorStroke} changeWidthStroke={this.changeWidthStroke} changeActionPen={this.changeActionPen}/> */}
                        
                    {/* : null } */}

                </svg>
                <ColorMenu isSticky={this.isSticky} />
            </div>
        );
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(Document);

