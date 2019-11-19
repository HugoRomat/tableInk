import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement } from "./../Helper";

class Lettre extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
        var that = this;
        // console.log(this.props.lettre)
        d3.select('#item-'+that.props.lettre.id)
            .append('rect')
            .attr('width', 30)
            .attr('height', 30)
            .attr('stroke', 'black')
            .attr('fill', 'white')
            .attr('opacity', 0.4)
           


        d3.select('#item-'+that.props.lettre.id)
            .on('pointerdown', function(d){
                // console.log(d)
            })
    }
    
    componentDidUpdate(){

    }
   
    render() {
        return (
            <g id={'item-'+this.props.lettre.id} transform={`translate(`+((this.props.iteration * 30)+20)+`,10)`}>
               <text dx={15} dy={18} textAnchor={"middle"}> {this.props.lettre.lettre} </text>

            </g>
        );
        
    }
}
export default Lettre;