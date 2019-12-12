import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation, guid } from "../Helper";
import LinePlaceHolder from "./LinePlaceHolder";


class PlaceHolderText extends Component {
    constructor(props) {
        super(props)
    }

    
    componentDidMount(){
        var that = this;
        var parent = d3.select('#placeHolderText-'+that.props.dataParent.id)
       
        // parent.append('rect')
        //     .attr('width', 20)
        //     .attr('height', 10)
        //     .attr('x', 0)
        //     .attr()

        var drag = d3.drag()
                // .subject(function (d) { return d; })
                .on("start", function(e){ that.dragstarted(that)})
                .on("drag", function(e){ that.dragged(that)})
                .on("end", function(e){ that.dragended(that)})
                // .clickDistance(40)

        parent.call(drag)

    }
    dragstarted(that) {
        d3.select('#placeHolderText-'+that.props.dataParent.id).classed("dragging", true);
    }
    dragged(that) {  
        var transform = getTransformation(d3.select('#placeHolderText-'+that.props.dataParent.id).attr('transform'));
        var X = d3.event.dx + transform.translateX;
        var Y = d3.event.dy + transform.translateY;
        d3.select('#placeHolderText-'+that.props.dataParent.id).attr('transform', 'translate('+X+','+Y+')') 
    }
    dragended(that) {
        d3.select('#placeHolderText-'+that.props.dataParent.id).classed("dragging", false);
    }
   
    render() {

        // console.log(this.props)

        return (
            <g id={'placeHolderText-'+this.props.dataParent.id} transform={`translate(${this.props.data.position[0]},${this.props.data.position[1]})`}>
                {/* <rect width={40} height={30} x={0} y={0} stroke={'black'} fill={'grey'} opacity={0.5}/> */}
                {/* <text style={{'fontSize': '17px', 'fontStyle': 'italic', 'opacity': 0.4}} x={2} dy={22} > Item </text> */}
            </g>
        );
        
    }
}
export default PlaceHolderText;