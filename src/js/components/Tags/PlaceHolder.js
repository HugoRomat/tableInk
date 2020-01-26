import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation, guid, simplify, _getBBoxPromise } from "../Helper";
import LinePlaceHolder from "./LinePlaceHolder";
// import LinePlaceHolder
import {d3sketchy} from './../../../../customModules/d3.sketchy'


class PlaceHolder extends Component {
    constructor(props) {
        super(props);
        this.down = false;
        this.tempArrayStroke = [];
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
                if (d3.event.pointerType == 'pen' ){
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
                        // console.log('#item-' + that.props.parent.id)
                        var transform = getTransformation(d3.select('#item-' + that.props.parent.id).attr('transform'))
                        that.tempArrayStroke.push([d3.event.x - transform.translateX, d3.event.y - transform.translateY])
                        that.drawLine();
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

                // console.log('Hello')
            })
        
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
        // console.log('DRAZ')
        // this.drawPlaceHolder();
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
            // var rec = sketch.rectStroke({ x:0, y:0, width:widthTotal, height:heightTotal, density: 3, sketch:2});
            // var flattened = [].concat(...rec)

            // element.selectAll('path')
            //     .data(flattened).enter()
            //     .append('path')
            //     .attr('d', (d)=>{ return d })
            //     .attr('fill', 'none')
            //     .attr('stroke', 'black')
            //     .attr('stroke-width', '0.3')
            //     .style('stroke-linecap', 'round')
            //     .style('stroke-linejoin', 'round')
            
            var element = d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).select('rect');
            element
                .attr('width', widthTotal)
                .attr('height', heightTotal)
                .attr('x', 0)
                .attr('y',0)
                // .attr('fill', 'rgba(252, 243, 242, 1)')
                // .style("filter", "url(#drop-shadow)")
                .attr('stroke', 'rgba(252, 243, 242, 1)')
                .attr('fill', 'white')
        }

        
        // d3.select('#horizontal-' + that.props.data.id + '-' + that.props.parent.id)
        //     .attr('x1', 0).attr('y1', 50)
        //     .attr('x2', 100).attr('y2', 50)
        //     .attr('stroke-width', '1').attr('stroke', 'red').attr('opacity', '0.2')

        // d3.select('#vertical-' + that.props.data.id + '-' + that.props.parent.id)
        //     .attr('x1', 50).attr('y1', 0)
        //     .attr('x2', 50).attr('y2', 100)
        //     .attr('stroke-width', '1').attr('stroke', 'red').attr('opacity', '0.2')

        // <rect id={'horizontal-' + this.props.data.id} />
        // <rect id={'vertical-' + this.props.data.id} />
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

                
                <line id={'horizontal-'  + this.props.data.id + '-' + this.props.parent.id}/>
                <line id={'vertical-' + this.props.data.id + '-' + this.props.parent.id}/>
            </g>
        );
        
    }
}
export default PlaceHolder;