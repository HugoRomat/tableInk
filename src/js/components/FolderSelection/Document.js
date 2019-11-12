import React, { Component } from "react";
import * as d3 from 'd3';
import Lines from './Lines'
import './../../../css/main2.css';
import paper from 'paper';
import update from 'immutability-helper';

class Document extends Component {

    constructor(props) {
        super(props);
        this.state = {
            strokes: [],
            yo:'yo'
        }

        this.down = false;
        this.tempArrayStroke = [];
        this.tempLine = null;
        this.pointText = null;
        this.selection = false;
        this.buffer = [];
        this.selection = null;
        
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
        this.selection = null;
        this.buffer = [];
    }

    setSelection= (d) => {
        
        var that = this;
        // console.log(d)
        this.selection = d;
        console.log(that.selection)
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
              
            })
            .on('pointermove', function(){
                if (that.down == true){
                    that.tempArrayStroke.push([d3.event.x, d3.event.y])
                    // that.drawTempStroke();
                    that.addPointDrawing([d3.event.x, d3.event.y]);
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

                that.tempArrayStroke = [];
                that.removeTempStroke();
            })
    }
    createLine(){
        this.tempLine = new this.scope.Path({
            strokeColor: 'black',
            strokeWidth: 4,
            strokeJoin: 'round'
        });
    }
    addPointDrawing(point){
        this.tempLine.add(point);
    }
    
    removeTempStroke(){
        // var line = d3.line()
        this.tempLine.remove();
        
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
                    <Lines lines={this.state.strokes} scope={this.scope} setTextBounds={this.setTextBounds} setSelection={this.setSelection}/>
             
                 : null }
            </div>
        );
    }
}
export default Document;