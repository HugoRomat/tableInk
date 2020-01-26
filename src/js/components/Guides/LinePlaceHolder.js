import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation } from "../Helper";
import Tag from "../Tags/Tag";


class LinePlaceHolder extends Component {
    constructor(props) {
        super(props);

    }

    
    componentDidMount(){
        console.log(this.props)
        var line = d3.line().curve(d3.curveBasis)
        var that = this;

        if (this.props.stroke.type == "pattern"){

                var that = this;
                var line = d3.line()
    
                d3.select('#item-'+that.props.stroke.id)
                .attr("d", line(that.props.stroke.data))
                .attr('stroke', that.props.stroke.colorStroke)
                .attr('stroke-width', that.props.stroke.sizeStroke)
                // .attr('stroke', that.props.colorStroke)
                // .attr('stroke-width', that.props.sizeStroke)
                .attr('fill', 'none')
                .attr('opacity', 0)
                .attr('stroke-linejoin', "round")
        
                var step = that.props.stroke.pattern.BBox.width;
                var path = d3.select('#item-'+that.props.stroke.id).node()
                var length = path.getTotalLength();
        
                for (var i = 0; i < length; i += step){
                    var point = path.getPointAtLength(i);
                    var X = point['x'] - that.props.stroke.pattern.BBox.width/2
                    var Y = point['y'] - that.props.stroke.pattern.BBox.height/2
        
                    var container = d3.select('#pattern-' + that.props.stroke.id).append('g').attr('transform', 'translate('+X+','+Y+')')
                    for (var j = 0; j < that.props.stroke.pattern.strokes.length; j += 1){
                        var element = that.props.stroke.pattern.strokes[j];
                        container.append('g').attr('transform', 'translate('+element.position[0]+','+element.position[1]+')')
                        .append('path')
                        .attr('d', (d)=>line(element.points))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.data.colorStroke )
                        .attr('stroke-width', element.data.sizeStroke)
                    }    
                }    
        } else {
            d3.select('#item-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke.data))
            .attr('stroke', that.props.stroke.colorStroke)
            .attr('stroke-width', that.props.stroke.sizeStroke)
            // .attr('stroke', that.props.colorStroke)
            // .attr('stroke-width', that.props.sizeStroke)
            .attr('fill', 'none')
            .attr('stroke-linejoin', "round")
        }
       
    }
    // componentDidUpdate(){
    //     var that = this;
    //     d3.select('#stroke-'+that.props.stroke.id)
    //         .attr("d", line(that.props.stroke.data))
    //         .attr('stroke', that.props.stroke.colorStroke)
    //         .attr('stroke-width', that.props.stroke.sizeStroke)
    //         .attr('fill', 'none') 
    // }
    amountDragged = (d) => {
        this.props.moveTag(d);
    }
    render() {

        var tag = null;
        // console.log(this.props.stroke)
        if (this.props.stroke.tag != undefined){

            tag = <Tag
                    key={0} 
                    stroke={this.props.stroke.tag}
                    colorStroke = {'red'}
                    sizeStroke = {10}
                    amountDragged={this.amountDragged}
                />
        }
        return (
            <g>
                <path id={'item-'+this.props.stroke.id} />
                <g id={'pattern-'+this.props.stroke.id} ></g>
                {tag}
            </g>
            //transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`} /> 

        );
        
    }
}
export default LinePlaceHolder;