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
                that.testIfOnSomething([d3.event.x, d3.event.y]);
            })
            .on('pointermove', function(){
                if (that.down == true){
                    that.tempArrayStroke.push([d3.event.x, d3.event.y])
                    // that.drawTempStroke();
                    that.addPointDrawing([d3.event.x, d3.event.y]);
                    
                    
                    if (that.selection) that.movePoint([d3.event.x, d3.event.y]);
                    if (!that.selection) that.removeFromSelection([d3.event.x, d3.event.y]);
                }
                // console.log('pointerMOve')
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
    drawTempStroke(){
        var that = this;
        // var line = d3.line();

        
        // console.log(that.tempArrayStroke)

        // d3.select('#penTemp')
        //     .attr("d", line(that.tempArrayStroke))
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black')
        //     .attr('stroke-width', '2')
    }
    testIfOnSomething(point){
        // var point_ = new paper.Path({insert: false});
        // point_.add(point);
        for (var i in this.pointText){
            var text = this.pointText[i];
            // if (){
            // if (point_.isInside(text.bounds)){
            //     console.log('HEY')
            // } 
            if (text.data.bounds.contains(point)){
                console.log('HEY', text.data.bounds.opacity)
                if (text.data.bounds.opacity == 0) this.selection = true;
                else this.selection = false;
            }
        }
    }
    removeFromSelection(point){
        var firstPoint = this.tempArrayStroke[0];
        for (var i in this.pointText){
            var text = this.pointText[i];

            var text = this.pointText[i];
            if (text.bounds.y + text.bounds.height > firstPoint[1] && text.bounds.y < firstPoint[1]){
                if (text.bounds.x + text.bounds.width > firstPoint[0]){
                    text.data.bounds.opacity = 0;
                } 
            }
            // CORP
            else if (text.bounds.y + text.bounds.height > firstPoint[1] && text.bounds.y + text.bounds.height < point[1]){
                text.data.bounds.opacity = 0;
                // text.data.bounds.fillColor = 'blue';
            }
            //DERNIERE LIGNE
            else if (text.bounds.y < point[1] && text.bounds.y + text.bounds.height > point[1]){

                if (text.bounds.x  < point[0]){
                    text.data.bounds.opacity = 0
                    // text.data.bounds.fillColor = 'red';
                } 
            }
        }
    }
    movePoint(point){
        
        var firstPoint = this.tempArrayStroke[0];
        for (var i in this.pointText){
            var text = this.pointText[i];
            text.data.bounds.opacity = 0;
            // text.data.bounds.fillColor = 'red';
        

        
            var text = this.pointText[i];
         
            //BEFORE
            // if (text.bounds.y + text.bounds.height < firstPoint[1]){
            //     text.data.bounds.opacity = 0.5;
            //     text.data.bounds.fillColor = 'yellow';
            // }
            //FIRSTLINE
            if (text.bounds.y + text.bounds.height > firstPoint[1] && text.bounds.y < firstPoint[1]){
                if (text.bounds.x + text.bounds.width > firstPoint[0]){
                    text.data.bounds.opacity = 0.5;
                    // text.data.bounds.fillColor = 'red';
                } 
            }
            // CORP
            else if (text.bounds.y + text.bounds.height > firstPoint[1] && text.bounds.y + text.bounds.height < point[1]){
                text.data.bounds.opacity = 0.5;
                // text.data.bounds.fillColor = 'blue';
            }
            //DERNIERE LIGNE
            else if (text.bounds.y < point[1] && text.bounds.y + text.bounds.height > point[1]){

                if (text.bounds.x  < point[0]){
                    text.data.bounds.opacity = 0.5;
                    // text.data.bounds.fillColor = 'red';
                } 
            }
        }
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
                    <Lines lines={this.state.strokes} scope={this.scope} setTextBounds={this.setTextBounds}/>
             
                 : null }
            </div>
        );
    }
}
export default Document;