import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation, guid, simplify, _getBBoxPromise, showBboxBB, getBoundinxBoxLines } from "../Helper";
import LinePlaceHolder from "./LinePlaceHolder";
// import LinePlaceHolder
import {d3sketchy} from './../../../../customModules/d3.sketchy'
import  $ from 'jquery';

class PlaceHolder extends Component {
    constructor(props) {
        super(props);
        this.down = false;
        this.tempArrayStroke = [];

        this.erasing = false;
    }
    // componentDidMount(){
    //     console.log(this.props.data)
    // }
    
    componentDidMount(){

        this.drawPlaceHolder();
        // console.log(this.props.data)
        var that = this;
        // console.log('placeHolder-' + this.props.data.id)
        d3.select('#placeHolder-' + this.props.data.id + '-' + this.props.parent.id)
            .on('pointerdown', function(d){
                // console.log('HELLOs')
                if (d3.event.buttons == 32 && d3.event.pointerType == 'pen'){
                    // console.log('HELLOs')
                    that.erasing = true;
                    that.tempArrayStrokeErase = [];
                    d3.selectAll('.linesTag').style('pointer-events', 'auto')
                }
                else if (d3.event.pointerType == 'pen' ){
                    that.down = true;
                }
                
                
                /**
                * TO FADEOUT
                */
        
                
                // console.log('Hello')
            })
            .on('pointermove', function(d){
                if (d3.event.pointerType == 'pen' || d3.event.pointerType == 'mouse'){

                   
                    if (that.down){
                        // console.log(that.props.parent);
                        var transform = getTransformation(d3.select('#item-' + that.props.parent.id).attr('transform'))
                        var transformPan = getTransformation(d3.select('#panItems').attr('transform'))
                        // ev.pointers[0].x - transform.translateX, ev.pointers[0].y - transform.translateY

                        var X = d3.event.x - transform.translateX - transformPan.translateX;
                        var Y = d3.event.y - transform.translateY - transformPan.translateY;
                        
                        that.tempArrayStroke.push([X, Y])
                        that.drawLine();
                        if (X > that.props.parent.width){
                            var height = d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).select('rect').attr('height')
                            that.props.updateWidthHeightTag({'idTag': that.props.parent.id, 'width': X, 'height': height})
                        }
                        
                        if (Y > that.props.parent.height){
                            var width = d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).select('rect').attr('width')
                            that.props.updateWidthHeightTag({'idTag': that.props.parent.id, 'width': width, 'height': Y})
                            // d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).select('rect').attr('height', Y)
                        }
                        // console.log(d3.event.x - transform.translateX, d3.event.y - transform.translateY, that.props.parent.width,that.props.parent.height )
                    }
                    if (that.erasing){
                        var transform = getTransformation(d3.select('#panItems').attr('transform'))
                        that.tempArrayStrokeErase.push([d3.event.x - transform.translateX, d3.event.y - transform.translateY]);
                        that.tempArrayStrokeErase = that.tempArrayStrokeErase.slice(-10);
                        that.eraseStroke();
                        // console.log('MOVE')
                    }
                
                    
                }
                // console.log('Hello')
            })
            .on('pointerup', function(d){
                if (d3.event.pointerType == 'pen' || d3.event.pointerType == 'mouse'){
                    var data = {
                        'idTag':that.props.parent.id,
                        'where':that.props.data.id,
                        'data':[{
                            'id': guid(),
                            'data': that.tempArrayStroke,
                            'colorStroke': that.props.colorStroke,
                            'sizeStroke': that.props.sizeStroke
                            // 'position': [firstPoint[0],firstPoint[1]]
                        }]
                    }
                    that.props.addLine(data);
                    that.tempArrayStroke = [];
                    that.down = false;
                    that.removeTempLine();
                    
                }
                if (that.erasing) {
                    that.erasing = false;
                    that.tempArrayStrokeErase = [];
                    d3.selectAll('.linesTag').style('pointer-events', 'none')
                }

                if (d3.event.pointerType == 'pen' && $('#item-'+that.props.parent.id).hasClass( "saveTop" )){
                    that.searchandDrawOnItem()
                }   

                // console.log('Hello')
            })
        // this.addErase('placeHolder-' + this.props.data.id + '-' + this.props.parent.id);
    }
    drawLineOnTagElement(BB, BBTag){
        // showBboxBB(BB, 'red')
        // showBboxBB(BBTag, 'green')
        var line = d3.line()
        var myScaleX = d3.scaleLinear().domain([0, 0 + BBTag.width]).range([BB.x, BB.x + BB.width]);
        var myScaleY = d3.scaleLinear().domain([0, 0 + BBTag.height]).range([BB.y, BB.y + BB.height]);

        var lines = JSON.parse(JSON.stringify(this.props.lines));
        // console.log(lines[j])
        for (var j = 1; j < lines.length; j += 1){
            var points = lines[j]['data'].map((e)=> { return [myScaleX(e[0]), myScaleY(e[1])]  })
            lines[j]['data'] = points;
            // console.log(points)
        }

        for (var i = 1; i < lines.length; i += 1){
                var myLine = lines[i]
                // console.log(myLine)

                var data = {
                    'points': myLine.data, 
                    'data': {'class':[], 'sizeStroke': myLine.sizeStroke, 'colorStroke': myLine.colorStroke}, 
                    'id': guid() , 
                    'device':0,
                    'isAlphabet': false,
                    'position': [0,0]
                }
                this.props.addSketchLine(data);

                // d3.select('#tempGroup').append('path')
                //     .attr('d', ()=>line(myLine.data))
                //     .attr('fill', 'none')
                //     .attr('stroke', ()=> 'red' )
                //     .attr('stroke-width', '20')
            }

    //    lines.forEach((element, i) => {
    //     console.log(i)
    //    });
    }
    searchandDrawOnItem(){
        var that = this;
        var inkDetection = this.props.lines[0];
        // console.log(inkDetection)
        var flattened = [].concat(...inkDetection.inkDetection);

        var result = flattened.filter(x => x.text == inkDetection.content);

        
        var linesG = result.map((d)=> d.idLine)
        // console.log(linesG)
        
        for (var i= 0; i < linesG.length; i += 1){
            getBoundinxBoxLines(linesG[i]).then((BB) => {

                _getBBoxPromise('placeHolder-left-'+that.props.parent.id).then((BBTag) => {
                    // console.log(BBTag)
                    this.drawLineOnTagElement(BB, BBTag);

                })

            })
        }
                // var scaleX = this.tempArrayStroke
                // console.log(tempStroke)
               
                // var myScaleX = d3.scaleLinear().domain([tempStroke[0][0], tempStroke[tempStroke.length-1][0]]).range([BB.x, BB.x + BB.width]);
                // var myScaleY = d3.scaleLinear().domain([tempStroke[0][1], tempStroke[tempStroke.length-1][1]]).range([BB.y, BB.y + BB.height]);
                // tempStroke = tempStroke.map((e)=> {
                //     // return [e[0]+ 50, e[1] + 50 ]
                //     return [myScaleX(e[0]), myScaleY(e[1])]
                // })
            
                // // for (var i = 0; i < lines.length; i += 1){
                //     // var myLine = lines[i]
                //     d3.select('#tempGroup').append('path')
                //         .attr('d', ()=>line(tempStroke))
                //         .attr('fill', 'none')
                //         .attr('stroke', ()=> 'red' )
                //         .attr('stroke-width', '20')
                // }
            
           
    
        // }

    }
    // /** TO ERASE THE STROKE IN THE CANVAS ON THE RIGHT */
    eraseStroke(){

        var lastPoint = JSON.parse(JSON.stringify(this.tempArrayStrokeErase[this.tempArrayStrokeErase.length-1]));
        var transform = getTransformation(d3.select('#panItems').attr('transform'))

        lastPoint[0] += transform.translateX;
        lastPoint[1] += transform.translateY;
        // drawCircle(lastPoint[0], lastPoint[1], 10, 'red')
        var element = document.elementFromPoint(lastPoint[0], lastPoint[1]);
        // console.log(element)
        if (element.tagName == 'path' && element.className.baseVal == "linesTag"){
            var id = element.id.split('-')[1];
            console.log(this.props.parent.id, id)
            this.props.removeTagLine({'idTag': this.props.parent.id, 'idLine': id });
        }
    }
    removeTempLine(){
        var that = this;
        var line = d3.line()
        d3.select('#tempStroke-' + that.props.data.id + '-' + this.props.parent.id).attr("d", null)
    }
    drawLine(){
        var that = this;
        var line = d3.line()
        d3.select('#tempStroke-' + this.props.data.id  + '-' + this.props.parent.id)
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', that.props.colorStroke)
            .attr('stroke-width', that.props.sizeStroke)
            .attr("stroke-dasharray", 'none')
            .attr('stroke-linejoin', "round")
        
    }
    componentDidUpdate(prevProps, prevState){
    
        // console.log( this.props.parent.width)
        this.drawPlaceHolder();
    }
    drawPlaceHolder(){

    
        var that = this;

        var height = 70;//this.props.BBoxParent.height;
        var size = 50;
        var width = 5//this.props.BBoxParent.width;
        var element = d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id)
    
        var rect = null;
        var opacity = 0.2;
        var widthTotal = this.props.parent.width;
        var heightTotal = this.props.parent.height;
        var sketch = d3sketchy()

        
        if (this.props.data.id == 'left'){
            
            var element = d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).select('rect');
            element
                .attr('width', widthTotal)
                .attr('height', heightTotal)
                .attr('x', 0)
                .attr('y',0)
                .attr('stroke', 'rgba(252, 243, 242, 1)')
                .attr('fill', 'white')
        }
    }
    componentWillUnmount(){
        var that = this;
        d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).remove()
    }
    render() {
        // console.log(this.props.lines)
        const listItems = this.props.lines.map((d, i) => {

            // console.log(d)
            return <LinePlaceHolder 
                key={i} 
                stroke={d}

                colorStroke = {this.props.colorStroke}
                sizeStroke = {this.props.sizeStroke}
            />
        });

        return (
            <g id={'placeHolder-' + this.props.data.id + '-' + this.props.parent.id}>
                <g id={'background-' + this.props.data.id + '-' + this.props.parent.id} >
                </g>

                
                <rect id={'rect-' + this.props.data.id} />
                <path id={'tempStroke-'+this.props.data.id  + '-' + this.props.parent.id} />

                <g className='paths'>
                    {listItems}
                </g>

{/*                 
                <line id={'horizontal-'  + this.props.data.id + '-' + this.props.parent.id}/>
                <line id={'vertical-' + this.props.data.id + '-' + this.props.parent.id}/> */}
            </g>
        );
        
    }
}
export default PlaceHolder;