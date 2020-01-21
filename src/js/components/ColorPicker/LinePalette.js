
import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { _getBBoxPromise, drawCircle, checkIfSomething } from "../Helper";


class LinePalette extends Component {
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
            .attr('stroke-width', '30')
            .attr('stroke-opacity', '0')
            .attr('stroke-linejoin', "round")
        
        _getBBoxPromise('palette-'+this.props.stroke.id).then((BBox)=>{
            this.BBox = BBox;
        })
    }
    componentDidUpdate(){
        // console.log('Update')
        // console.log(this.props.stroke.data.class)
        // var line = d3.line()
        // var that = this;
        // d3.select('#'+that.props.stroke.id)
        //     .attr("d", line(that.props.stroke['points']))
        //     .attr('fill', 'none')
        //     .attr('stroke', that.props.stroke.data.colorStroke)
        //     .attr('stroke-width', that.props.stroke.data.sizeStroke)
        //     .attr('stroke-linejoin', "round")

        // d3.select('#fake-'+that.props.stroke.id)
        //     .attr("d", line(that.props.stroke['points']))
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black')
        //     .attr('stroke-width', '1')
        //     .attr('stroke-opacity', '0')
        
        // d3.select('#palette-'+that.props.stroke.id).attr('class', that.props.stroke.data.class.join(" "))
    }
    componentWillUnmount(){
    }
    
    render() {
        // console
        return (
            <g id={'palette-'+this.props.stroke.id} style={{'pointerEvents': 'none' }} transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`}>
                <path  className="fake" id={'fake-'+this.props.stroke.id}></path>
                <path  className="nonfake" id={this.props.stroke.id}></path>
                

                {/* <path id={'selection-'+this.props.stroke.id} /> */}
                {/* <path style={{'pointerEvents': 'none' }} className="fakeStroke" id={'fake-'+this.props.stroke.id}></path> */}
            </g>
        );
        
    }
}
export default LinePalette;