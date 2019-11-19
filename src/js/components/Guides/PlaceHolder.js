import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation, guid } from "../Helper";
import LinePlaceHolder from "./LinePlaceHolder";
import PlaceHolderText from "./PlaceHolderText";


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
        // console.log(this.props.data)
        var that = this;
        
        d3.select('#placeHolder-' + this.props.data.id)
            .on('pointerdown', function(d){
                // console.log(d3.event)
                if (d3.event.pointerType == 'pen' || d3.event.pointerType == 'mouse'){

                    that.down = true;
                }
                
                // console.log('Hello')
            })
            .on('pointermove', function(d){
                if (d3.event.pointerType == 'pen' || d3.event.pointerType == 'mouse'){
                    if (that.down){

                        
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
                        'idGuide':that.props.parent.id,
                        'where':that.props.data.id,
                        'data':[{'id': guid(),
                            'data': that.tempArrayStroke
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
        d3.select('#tempStroke-' + that.props.data.id).attr("d", null)
    }
    drawLine(){
        var that = this;
        var line = d3.line()
        d3.select('#tempStroke-' + this.props.data.id)
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", 'none');

        
    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        //Si j'udpate la BBox
        if (this.props.BBoxParent != prevProps.BBoxParent){
            console.log('UPDATE BOX', that.props.data.id);
            var height = this.props.BBoxParent.height;
            var width = this.props.BBoxParent.width;
            var element = d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).select('rect');
            var rect = null;
            if (this.props.data.id == 'left'){
                rect = element
                    .attr('width', 150-(width))
                    .attr('height', height)
                    .attr('x', -150)
                    .attr('y',0)
            }
            else if (this.props.data.id == 'right'){
                rect = element
                    .attr('width', 150 -(width))
                    .attr('height', height)
                    .attr('x', (width))
                    .attr('y',0)
            }
            else if (this.props.data.id == 'top'){
                rect = element
                    .attr('width', 150*2)
                    .attr('height', 50)
                    .attr('x', -150)
                    .attr('y',-50)
            }
            else if (this.props.data.id == 'bottom'){
                rect = element
                    .attr('width', 150*2)
                    .attr('height', 50)
                    .attr('x', -150)
                    .attr('y',height)
            }
            else if (this.props.data.id == 'middle'){
                rect = element
                    .attr('width', width*2)
                    .attr('height', height)
                    .attr('x', -width)
                    .attr('y',0)
            }
    
            if (rect != null){
                rect.attr('stroke', 'black')
                    .attr('fill', 'rgba(0,0,0,0)')
                    .attr('stroke-dasharray', 10)
                    .attr('opacity', '0.2')
                    // .attr('stroke-width', '4')
            }
        }
    }
   
    render() {
        // console.log(this.props.data.id,  this.props.lines)
        const listItems = this.props.lines.map((d, i) => {
            return <LinePlaceHolder 
                key={i} 
                stroke={d}
            />
        });


        return (
            <g id={'placeHolder-' + this.props.data.id + '-' + this.props.parent.id}>
                <rect id={'rect-' + this.props.data.id} />
                <path id={'tempStroke-'+this.props.data.id} />

                <g className='paths'>
                    {listItems}
                </g>

               
            </g>
        );
        
    }
}
export default PlaceHolder;