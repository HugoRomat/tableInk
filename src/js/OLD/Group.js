import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getTransformation } from "./../Helper";

class Group extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        // console.log(this.props)

        // get BoundingBox
        this.moveElements();
        this.getBBoxGroup();
        this.listenEvents();
    }
    listenEvents(){
        var that = this;
        // d3.select('#item-'+that.props.group.id)
        //     .on('pointerdown', function(d){
        //     console.log('HEYYY')
        // })  

        var drag = d3.drag()
            .on("start", function(e){ that.dragstarted(that)})
            .on("drag", function(e){ that.dragged(that)})
            .on("end", function(e){ that.dragended(that)})

        d3.select('#group-'+that.props.group.id).call(drag)
    }
    dragstarted(env) {
        // console.log('HEY', env, this)
        d3.event.sourceEvent.stopPropagation();
        // d3.select('#item-'+env.props.group.id).classed("dragging", true);
    }

    dragged(env) {
        d3.event.sourceEvent.stopPropagation();
        var transform = getTransformation(d3.select('#group-'+env.props.group.id).attr('transform'));
        var X = d3.event.dx + transform.translateX;
        var Y = d3.event.dy + transform.translateY;
        d3.select('#group-'+env.props.group.id).attr('transform', 'translate('+X+','+Y+')')

        var linesAttached = this.props.group.data.idLines;

        for (var i in linesAttached){
            var line = linesAttached[i];
            var identifier = 'item-'+line;
            var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
            var X = d3.event.dx + transform.translateX;
            var Y = d3.event.dy + transform.translateY;
            d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
        }
    }
    dragended(env) {
        // d3.select('#item-'+env.props.group.id).classed("dragging", false);
    }
    getBBoxGroup(){
        var that = this;
        var linesAttached = this.props.group.data.idLines;
        var arrayBbox = [];

        // console.log(linesAttached)
        for (var i in linesAttached){
            var line = linesAttached[i];
            var BBox = d3.select('#item-'+line).node().getBBox();
            BBox.xmax = BBox.x + BBox.width;
            BBox.ymax = BBox.y + BBox.height;
            arrayBbox.push(BBox)
        }

        var Xmax = Math.max.apply(Math, arrayBbox.map(function(o) { return o.xmax; }));
        var Ymax = Math.max.apply(Math, arrayBbox.map(function(o) { return o.ymax; }));
        var Xmin = Math.min.apply(Math, arrayBbox.map(function(o) { return o.x; }));
        var Ymin = Math.min.apply(Math, arrayBbox.map(function(o) { return o.y; }));

        var width = Xmax - Xmin;
        var height = Ymax - Ymin;

        d3.select('#group-'+that.props.group.id).append('rect')
            .attr('id', that.props.group.id)
            .attr('x', Xmin)
            .attr('y', Ymin)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'white')
            .attr('stroke', 'blue')
            .attr('stroke-width', '2')
    }
    moveElements(){
        // console.log(this.props.group)
        var that = this;
        var transform = getTransformation(d3.select('#group-'+that.props.group.id).attr('transform'));
        var X = that.props.group.position[0] + transform.translateX;
        var Y = that.props.group.position[1] + transform.translateY;
        d3.select('#group-'+that.props.group.id).attr('transform', 'translate('+X+','+Y+')')

        var linesAttached = this.props.group.data.idLines;

        for (var i in linesAttached){
            var line = linesAttached[i];
            var identifier = 'item-'+line;
            var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
            var X = that.props.group.position[0] + transform.translateX;
            var Y = that.props.group.position[1] + transform.translateY;
            d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
        }
    }
    componentDidUpdate(){
        
    }
   
    render() {
        return (
            <g id={'group-'+this.props.group.id} transform={`translate(0,0)`}>
                
            </g>
        );
        
    }
}
export default Group;