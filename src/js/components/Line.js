import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement } from "./Helper";

class Line extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
        // console.log(this.props.stroke)
        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')

        d3.select('#fake-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '40')
            .attr('stroke-opacity', '0.2')
            
           
            
    
    }
    
    componentDidUpdate(){
        // console.log(this.props.stroke)
        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            // .attr('stroke', 'black')
            // .attr('stroke-width', '2')
        
        d3.select('#item-'+that.props.stroke.id).attr('class', that.props.stroke.data.class.join(" "))
    }
   
    render() {
        return (
            <g id={'item-'+this.props.stroke.id} transform={`translate(0,0)`}>
                <path id={this.props.stroke.id}></path>
                <path id={'fake-'+this.props.stroke.id}></path>
            </g>
        );
        
    }
}
export default Line;