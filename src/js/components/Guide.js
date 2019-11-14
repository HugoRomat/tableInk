import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getTransformation } from "./Helper";

class Guide extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        // console.log(this.props.stroke)
        var line = d3.line()
        var that = this;


        var drag = d3.drag()
            // .subject(function (d) { return d; })
            .on("start", function(e){ that.dragstarted(that)})
            .on("drag", function(e){ that.dragged(that)})
            .on("end", function(e){ that.dragended(that)})
        


        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', '5')
            

        d3.select('#fake-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', '40')
            .attr('stroke-opacity', '0')
            
            
            
            d3.select('#guide-'+that.props.stroke.id)
                .call(drag)
            
            
            
            console.log()
            
            //.call(drag);
        
        
       
    
    }
    dragstarted(env) {
        // console.log('HEY', env, this)
        d3.event.sourceEvent.stopPropagation();
        d3.select('#guide-'+env.props.stroke.id).classed("dragging", true);
    }

    dragged(env) {
        d3.event.sourceEvent.stopPropagation();
        var transform = getTransformation(d3.select('#guide-'+env.props.stroke.id).attr('transform'));
        var X = d3.event.dx + transform.translateX;
        var Y = d3.event.dy + transform.translateY;
        d3.select('#guide-'+env.props.stroke.id).attr('transform', 'translate('+X+','+Y+')')

        var linesAttached = env.props.stroke.data.linesAttached;
        for (var i in linesAttached){
            var line = linesAttached[i];
            var identifier = 'item-'+line;
            var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
            var X = d3.event.dx + transform.translateX;
            var Y = d3.event.dy + transform.translateY;
            d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
        }
        // d3.select('svg').append('circle')
        //     .attr('cx', X)
        //     .attr('cy', Y)
        //     .attr('r', 10)
           

    }
    dragended(env) {
        d3.select('#guide-'+env.props.stroke.id).classed("dragging", false);
    }
    componentDidUpdate(){
        // console.log('HELLO')
        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', '2')
    }
   
    render() {
        return (
            <g  id={'guide-'+this.props.stroke.id} transform={`translate(0,0)`}>
                <path id={this.props.stroke.id}></path>
                <path id={'fake-'+this.props.stroke.id}></path>
            </g>
        );
        
    }
}
export default Guide;