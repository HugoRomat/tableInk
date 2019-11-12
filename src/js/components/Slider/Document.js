import React, { Component } from "react";
import * as d3 from 'd3';
import Lines from './Lines'
import './../../../css/main3.css';
import paper from 'paper';
import update from 'immutability-helper';
import Slider from "./Slider";

class Document extends Component {

    constructor(props) {
        super(props);
        this.state = {
            strokes: [],
            knob:{'x':0, 'y':0, 'animation': false},
            strokeWidth: 3,
            stepsSlider: []
        }

        this.down = false;
        this.tempArrayStroke = [];
        this.tempLine = null;
        this.pointText = null;
        this.selection = false;
        this.buffer = [];
        this.selection = null;
        this.isOnKnob = false;
        this.intersection = false;
        
    }
    init(){
        this.scope = new paper.PaperScope();
        this.canvas = document.getElementById('canvasVisualization')
        this.scope.setup(this.canvas);

    }

    deleteDetection(){
        var that = this;
        if (that.timer != null) {
          clearTimeout(that.timer);
          
          
        }
    }  
    activateDetection(){
        var that = this;
        that.timer = setTimeout(function(){
          that.detect();
        }, 1500);
    }
    detect(){
        // console.log(this.buffer)
        // if (this.buffer.length == 1){
            this.state.strokes.forEach((element, index)=>{
                if (this.buffer.indexOf(element['id']) > -1){
                this.state = update(this.state, { 
                    strokes: { 
                    [index] : {
                            shouldFadeOut: {$set: true},
                        }
                    }
                })
                }
            })
            // console.log(this.buffer)
            this.setState(this.state)
        // }
        if (this.buffer.length > 1 && this.intersection != false){

        }
        // this.setState({
        //     // images: this.state.strokes.map( (img, i) => i === key ? value : img),
        //     strokes: this.state.strokes.map( (img, i) => {
        //         if (this.buffer.indexOf(img['id']) > -1) {
        //             // img.shouldFadeOut = true;
        //             console.log('GO')
        //             return img 
        //         } else {
        //             return img
        //         }
        //     })
        // })
        // console.log(this.state.strokes)
        this.intersection = false;
        this.selection = null;
        this.buffer = [];
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
        this.init();

        this.isMount = true;
        this.forceUpdate();
    }

    listenEvents(){
        var that = this;
        //Mon click est forcement une selection
        d3.select('#canvasVisualization')
            .on('pointerdown', function(){
                that.down = true;
                that.deleteDetection();
                that.createLine();
                that.checkOnKnob([d3.event.x, d3.event.y]);
              
            })
            .on('pointermove', function(){
                if (that.down == true){
                    that.tempArrayStroke.push([d3.event.x, d3.event.y])
                    // that.drawTempStroke();
                    that.addPointDrawing([d3.event.x, d3.event.y]);
                    // console.log(that.isOnKnob)
                    if (that.isOnKnob == false) that.checkWhere([d3.event.x, d3.event.y]);
                    else {
                        // console.log('ON SLIDER')
                        that.moveSlider([d3.event.x, d3.event.y])
                    }
                }
            })
            .on('pointerup', function(){
                that.down = false;
                that.activateDetection();
                // console.log('pointerup')
                var id = that.guid()
                // console.log(that.selection)
                that.setState(prevState => ({ strokes: [...prevState.strokes, {
                        'data': that.tempArrayStroke,
                        'id': id,
                        'shouldFadeOut': false,
                        'selection': that.selection
                    }
                ]}));

                that.buffer.push(id);
                that.isOnKnob = false;
                that.tempArrayStroke = [];
                that.removeTempStroke();
            })
    }
    createLine(){
        this.tempLine = new this.scope.Path({
            strokeColor: 'black',
            strokeWidth: this.state.strokeWidth,
            strokeJoin: 'round'
        });
    }
    checkOnKnob(point){
        var contain = this.knobGroup.contains({'x':point[0], 'y':point[1]});
        if (contain) this.isOnKnob = true;
        // console.log(intersection)
    }
    addPointDrawing(point){
        this.tempLine.add(point);
    }
    moveSlider(point){
        // console.log('GO')
        this.setState({'knob':{'x':point[0], 'y':point[1], 'animation': false}})
    }
    checkWhere(point){
        var line = this.lineGroup.children[0];

        var intersections = this.tempLine.getIntersections(line);
        intersections = intersections.map((d)=> d.point)

        // console.log(intersections)
        if (intersections.length > 0) {
            var offset = line.getOffsetOf({'x':intersections[0]['x'], 'y':intersections[0]['y']})
            // console.log(offset)
            this.intersection = {'x':intersections[0]['x'], 'y':intersections[0]['y'], 'offset': offset};
            this.setState({'knob':{'x':intersections[0]['x'], 'y':intersections[0]['y'], 'animation': true}});
            // console.log('EHO')
        }
        // console.log(intersections)
        // console.log(this.lineGroup.children[0])
        // console.log(line.length)

        // var lengthLine = line.length;

        // // // var point = path.getPointAt(offset);
        // console.log(lengthLine/10)
    }
    removeTempStroke(){
        // var line = d3.line()
        this.tempLine.remove();
        
    }
    setGroups = (line, knob) => {
        var that = this;
        this.lineGroup = line;
        this.knobGroup = knob;
    }
    render() {
        return (
            <div>
                <canvas id="canvasVisualization"></canvas>
                {this.isMount ?                     <Lines 
                        lines={this.state.strokes} 
                        scope={this.scope} 
                    /> : null}
                  {this.isMount ? 
                  <Slider
                    knob={this.state.knob}
                    setGroups={this.setGroups}
                    scope={this.scope} 
                  /> : null}
            </div>
        );
    }
}
export default Document;