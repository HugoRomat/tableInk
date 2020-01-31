import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation } from "../Helper";


class LinePlaceHolder extends Component {
    constructor(props) {
        super(props);

    }

    
    componentDidMount(){
        var that = this;
        // console.log(this.props.stroke)

        if (this.props.stroke.content == undefined){
            var line = d3.line().curve(d3.curveBasis)
            d3.select('#stroke-'+that.props.stroke.id)
                .attr("d", line(that.props.stroke.data))
                .attr('stroke', that.props.stroke.colorStroke)
                .attr('stroke-width', that.props.stroke.sizeStroke)
                // .attr('stroke', that.props.colorStroke)
                // .attr('stroke-width', that.props.sizeStroke)
                .attr('fill', 'none')
                .attr('stroke-linejoin', "round")
        } else {
            d3.select('#stroke-'+that.props.stroke.id).text(that.props.stroke.content)
        }
       
    }
    componentDidUpdate(){
        var that = this;

        if (this.props.stroke.content == undefined){
            var line = d3.line().curve(d3.curveBasis)
            d3.select('#stroke-'+that.props.stroke.id)
                .attr("d", line(that.props.stroke.data))
                .attr('stroke', that.props.stroke.colorStroke)
                .attr('stroke-width', that.props.stroke.sizeStroke)
                // .attr('stroke', that.props.colorStroke)
                // .attr('stroke-width', that.props.sizeStroke)
                .attr('fill', 'none')
                .style('stroke-linejoin', "round")
        }
        else {
            d3.select('#stroke-'+that.props.stroke.id).text(that.props.stroke.content)
        }
    }
   
    render() {
        var item = null;

        if (this.props.stroke.content == undefined){
            item = <path id={'stroke-'+this.props.stroke.id} className={'linesTag'} style={{'pointerEvents': 'none' }}></path>
        } else {
            item = <text id={'stroke-'+this.props.stroke.id} className={'linesTag'} style={{'pointerEvents': 'none', 'fontSize': '30px' }} dy={"60"}></text>
        }
        return (
            <g>{item}</g> 
           //transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`} /> 

        );
        
    }
}
export default LinePlaceHolder;