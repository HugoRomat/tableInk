import React, { Component } from "react";
import * as d3 from 'd3';
import Lines from './Lines'
import './../../../css/main.css';
import paper from 'paper';


class Document extends Component {

    constructor(props) {
        super(props);
        this.state = {
            strokes: []
        }

        this.down = false;
        this.tempArrayStroke = [];
        this.tempLine = null;
        this.pointText = null;
        this.selection = false;
        
    }
    init(){
        this.scope = new paper.PaperScope();
        this.canvas = document.getElementById('canvasVisualization')
        this.scope.setup(this.canvas);

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
        // d3.select('#canvasVisualization').style('width', '100%').style('height', '100%')
    }

    listenEvents(){
        var that = this;
        //Mon click est forcement une selection
        d3.select('#canvasVisualization')
            .on('pointerdown', function(){
                that.down = true;
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
                // console.log('pointerup')
                
                that.setState(prevState => ({ strokes: [...prevState.strokes, {
                        'data': that.tempArrayStroke,
                        'id': that.guid()
                    }

                ]}));
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
   d
    setTextBounds= (d) => {
        // console.log(d);
        this.pointText = d;
    }

    render() {
        return (
            <div>
                <canvas id="canvasVisualization"></canvas>
                {this.isMount ? 
                    <Lines lines={this.state.strokes} scope={this.scope} setTextBounds={this.setTextBounds}/>
             
                 : null }
            </div>
        );
    }
}
export default Document;