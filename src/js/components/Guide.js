import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';

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
            .attr('stroke-opacity', '0.5')
            
            
            
            d3.select('#group-'+that.props.stroke.id)
            .call(drag)
            // console.log(d3.select('#group-'+that.props.stroke.id))
            
            //.call(drag);
        
        
       
    
    }
    dragstarted(env) {
        // console.log('HEY', env, this)
        d3.event.sourceEvent.stopPropagation();
        // d3.select(this).classed("dragging", true);
    }

    dragged(env) {
        var X = d3.event.x - env.props.stroke['points'][0][0];
        var Y = d3.event.y - env.props.stroke['points'][0][1];
        d3.select('#group-'+env.props.stroke.id).attr('transform', 'translate('+X+','+Y+')')
        // d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    dragended(env) {
        // d3.select(this).classed("dragging", false);
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
            <g  id={'group-'+this.props.stroke.id}>
                <path id={this.props.stroke.id}></path>
                <path id={'fake-'+this.props.stroke.id}></path>
            </g>
        );
        
    }
}
export default Guide;