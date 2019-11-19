import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation } from "../Helper";


class LinePlaceHolder extends Component {
    constructor(props) {
        super(props);

    }

    
    componentDidMount(){
        console.log(this.props.stroke)
        var line = d3.line()
        var that = this;
        d3.select('#stroke-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke.data))
            .attr('stroke', 'black')
            .attr('fill', 'none')
            .attr('stroke-width', '2')
    }
   
    render() {
        return (
 
            <path id={'stroke-'+this.props.stroke.id} />

        );
        
    }
}
export default LinePlaceHolder;