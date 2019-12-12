import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement } from "./Helper";
import reducers from "../reducers";

class Line extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
        // console.log(this.props.stroke.device)
        var line = d3.line()
        var that = this;




        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', that.props.stroke.data.colorStroke)
            .attr('stroke-width', that.props.stroke.data.sizeStroke)
            .attr('stroke-linejoin', "round")

        d3.select('#fake-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '10')
            .attr('stroke-opacity', '0.1')
            
           
        // if (this.props.stroke.device != undefined){
        //     // var scale = d3.scaleOrdinal(d3.schemeCategory10);
        //     var scale = d3.scaleOrdinal(d3.schemeCategory10)

        //     // console.log(scale(1), scale(2), scale(3));
        //     // console.log(that.props.stroke.device)
        //     // console.log(that.props.stroke.device)
        //     // var color = 'green';
        //     // if (that.props.stroke.device == 1) color = 'red';
        //     // else color = 'blue'
        //     d3.select('#'+that.props.stroke.id).attr('stroke', scale(that.props.stroke.device +1))
        // }
    
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
        // console.log(this.props.stroke.position[0])
        return (
            <g id={'item-'+this.props.stroke.id} transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`}>
                <path style={{'pointerEvents': 'none' }} id={this.props.stroke.id}></path>
                {/* <path style={{'pointerEvents': 'none' }} id={'fake-'+this.props.stroke.id}></path> */}
            </g>
        );
        
    }
}
export default Line;