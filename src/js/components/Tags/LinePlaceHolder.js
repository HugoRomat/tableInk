import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation } from "../Helper";


class LinePlaceHolder extends Component {
    constructor(props) {
        super(props);

    }

    
    componentDidMount(){
        // console.log('stroke-'+this.props.stroke.id)
        var line = d3.line().curve(d3.curveBasis)
        var that = this;
        d3.select('#stroke-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke.data))
            .attr('stroke', that.props.stroke.colorStroke)
            .attr('stroke-width', that.props.stroke.sizeStroke)
            // .attr('stroke', that.props.colorStroke)
            // .attr('stroke-width', that.props.sizeStroke)
            .attr('fill', 'none')
    }
    componentDidUpdate(){
        // console.log('UPDATE')
        var line = d3.line().curve(d3.curveBasis)
        var that = this;
        d3.select('#stroke-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke.data))
            .attr('stroke', that.props.stroke.colorStroke)
            .attr('stroke-width', that.props.stroke.sizeStroke)
            // .attr('stroke', that.props.colorStroke)
            // .attr('stroke-width', that.props.sizeStroke)
            .attr('fill', 'none')
    }
   
    render() {
        
        return (
 
            <path id={'stroke-'+this.props.stroke.id} style={{'pointerEvents': 'none' }}/>//transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`} /> 

        );
        
    }
}
export default LinePlaceHolder;