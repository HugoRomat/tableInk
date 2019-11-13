import React, { Component } from "react";
import * as d3 from 'd3';
import Lines from './Lines'
import './../../css/main.css';
import paper from 'paper';
import * as Hammer from 'hammerjs';
import { connect } from 'react-redux';

import { 
    addSketchLine
} from '../actions';
import { distance } from "./Helper";
const mapDispatchToProps = {  
    addSketchLine
};


function mapStateToProps(state, ownProps) {
    return {
        state: state
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
    }
    init(){
        this.scope = new paper.PaperScope();
        this.canvas = document.getElementById('canvasVisualization');
        this.canvas.oncontextmenu = function(e){ return false}
        this.scope.setup(this.canvas);
        this.linesLayer = new this.scope.Layer();
        this.linesLayer.name = "linesLayer";

        // this.selectionGroup = new this.scope.Group();
        // this.selectionGroup.name = "selectionGroup";
    }
    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return 'b' + s4() + s4() + s4() +  s4() +s4() +  s4() + s4() + s4();
    }
    componentDidMount(){
        this.listenEvents();
        this.listenHammer();
        this.init();

        this.isMount = true;
        this.forceUpdate();

        console.log(this.props)
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
    pressAction(e){
        console.log('press')
        
    }
    panStart(e){
        console.log('panStart',e)
        this.newGroup = new this.scope.Group({insert: false});
        for (var i in this.selectionGroup){
            var clone = this.selectionGroup[i].clone();
            this.newGroup.addChild(clone);
        }
        this.panPosition = {'x': e.srcEvent.x, "y": e.srcEvent.y };
    }
    panMove(e){
        var width = this.newGroup.bounds.height;
        var dist = distance(this.panPosition.x, e.srcEvent.x, this.panPosition.y, e.srcEvent.y);
        console.log(this.panPosition, width)
        if (dist > width){
            // console.log('hello')
            var group = this.newGroup.clone();
            this.linesLayer.addChild(group)
            group.position = {'x': e.srcEvent.x, "y": e.srcEvent.y };
            this.panPosition = {'x': e.srcEvent.x, "y": e.srcEvent.y };
        }
        // console.log(dist)
        // if ();
        // this.newGroup.position.x += 10;
        // this.newGroup.in
        
        console.log('panMove')
    }
    panEnd(e){
        console.log('panEnd')
    }
    listenEvents(){
        var that = this;
        //Mon click est forcement une selection
        d3.select('#canvasVisualization')
            .on('pointerdown', function(){
                if (d3.event.pointerType == 'pen'){
                    if (that.press == false){
                        that.down = true;
                        // that.createLine();
                        // console.log(d3.event)
                        if(d3.event.buttons == 1){
                            that.drawing = true;
                            that.createDrawing();
                        }
                        else if (d3.event.buttons == 32){
                            that.erasing = true;
                        }
                        else if (d3.event.buttons == 2){
                            that.selecting = true;
                            that.createSelecting();
                        }
                    }
                    else {
                        that.down = true;
                        that.newGroup = new that.scope.Group({insert: false});
                        for (var i in that.selectionGroup){
                            var clone = that.selectionGroup[i].clone();
                            that.newGroup.addChild(clone);
                        }
                        // console.log(d3.event)
                        // that.panPosition = {'x': d3.event.x, "y": d3.event.y };
                        that.panPosition = {'x': 0, "y": 0};
                        var width = that.newGroup.bounds.height;
                        var dist = distance(that.panPosition.x, d3.event.x, that.panPosition.y, d3.event.y);
                        // console.log(that.panPosition, width)
                        if (dist > width){
                            // console.log('hello')
                            var group = that.newGroup.clone();
                            that.linesLayer.addChild(group)
                            group.position = {'x': d3.event.x, "y": d3.event.y };
                            that.panPosition = {'x': d3.event.x, "y": d3.event.y };
                        }

                        that.createDrawing();

                    }
                    
    
                }
                

            })
            .on('pointermove', function(){
                if (d3.event.pointerType == 'pen'){
                    if (that.down == true){
                        if (that.press == false){
                            that.tempArrayStroke.push([d3.event.x, d3.event.y])
                            if (that.drawing || that.selecting){
                                that.addPointDrawing([d3.event.x, d3.event.y]);
                            }
                        }
                        else {
                            var width = that.newGroup.bounds.height;
                            var dist = distance(that.panPosition.x, d3.event.x, that.panPosition.y, d3.event.y);
                            // console.log(that.panPosition, width)
                            if (dist > width){
                                // console.log('hello')
                                var group = that.newGroup.clone();
                                that.linesLayer.addChild(group)
                                group.position = {'x': d3.event.x, "y": d3.event.y };
                                that.panPosition = {'x': d3.event.x, "y": d3.event.y };
                            }

                            that.addPointDrawing([d3.event.x, d3.event.y]);
                        }
                    }
                    
                    
                    

                    // console.log(d3.event)
                }
            })
            .on('pointerup', function(){
                
                // console.log('pointerup')
                
                // that.setState(prevState => ({ strokes: [...prevState.strokes, {
                //         'data': that.tempArrayStroke,
                //         'id': that.guid()
                //     }

                // ]}));
                that.tempArrayStroke = [];
                if (that.down){

                    console.log(that.drawing)
                    if (that.selecting) {
                        that.whoInside();
                        that.selecting = false;
                    }
                    if (that.drawing){
                        that.addStroke();
                        that.drawing = false;
                    }
                    else {
                        console.log(that.scope.project)
                        that.tempLine.remove();
                    }
                }
                
                that.down = false;
            })
    }
    createDrawing(){
        this.tempLine = new this.scope.Path({
            strokeColor: 'black',
            strokeWidth: 4,
            strokeJoin: 'round'
        });
    }
    whoInside(){
        var lines = this.scope.project.layers['linesLayer'].children;
        // console.log(lines)
        for (var line in lines){
            if (lines[line]['id'] != this.tempLine['id']){
                var contains = lines[line].isInside(this.tempLine.bounds);
                if (contains) {
                    this.selectionGroup.push(lines[line]);
                    // lines[line].opacity = 0.3;
                }
            }
        }
    }
    createSelecting(){
        this.tempLine = new this.scope.Path({
            strokeColor: 'black',
            strokeWidth: 4,
            strokeJoin: 'round'
        });
        this.tempLine.dashArray = [10, 8];
        this.tempLine.data.type = "selecting";
    }
    addPointDrawing(point){
        this.tempLine.add(point);
    }
    addStroke(){
        // var line = d3.line();
        // console.log(this.props)
        this.tempLine.simplify();
        var path = this.tempLine.clone({insert: false})
        var clone = JSON.parse(path.exportJSON());

        this.tempLine.remove();
        this.props.addSketchLine(clone);
        
    }
    drawTempStroke(){
        var that = this;

    }

    setTextBounds= (d) => {
        // console.log(d);
        this.pointText = d;
    }

    render() {
        return (
            <div>
                <canvas id="canvasVisualization"></canvas>
                {this.isMount ? 
                    <Lines scope={this.scope} layer={this.linesLayer}/>
             
                 : null }
            </div>
        );
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(Document);

