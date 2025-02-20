import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation } from "../Helper";
import Tag from "../Tags/Tag";


class LinePlaceHolder extends Component {
    constructor(props) {
        super(props);

    }

    
    componentDidMount(){

        

        if (this.props.stroke.BBoxPlaceHolder != undefined) this.drawLines();



    }
    drawLines(){
        // console.log(this.props.stroke)
        var line = d3.line().curve(d3.curveBasis)
        var that = this;

        if (this.props.stroke.type == "pattern"){

                var that = this;
                var line = d3.line()

                var points = JSON.parse(JSON.stringify(that.props.stroke.data))

                var BBoxOriginalHolder = that.props.stroke.BBoxPlaceHolder;
                var myScaleX = d3.scaleLinear().domain([BBoxOriginalHolder.x, BBoxOriginalHolder.x + BBoxOriginalHolder.width]).range([that.props.placeHolder.x , that.props.placeHolder.x + that.props.placeHolder.width]);
                var myScaleY = d3.scaleLinear().domain([BBoxOriginalHolder.y, BBoxOriginalHolder.y + BBoxOriginalHolder.height]).range([that.props.placeHolder.y, that.props.placeHolder.y + that.props.placeHolder.height]);

                var points = points.map((e)=> {
                    return [myScaleX(e[0]), myScaleY(e[1])]
                })
    
                d3.select('#item-'+that.props.stroke.id)
                    .attr("d", line(points))
                    .attr('stroke', that.props.stroke.colorStroke)
                    .attr('stroke-width', that.props.stroke.sizeStroke)
                    // .attr('stroke', that.props.colorStroke)
                    // .attr('stroke-width', that.props.sizeStroke)
                    .attr('fill', 'none')
                    .attr('opacity', 0)
                    .attr('stroke-linejoin', "round")
        
                var step = that.props.stroke.pattern.BBox.width;
                var path = d3.select('#item-'+that.props.stroke.id).node()
                var length = path.getTotalLength();
        
                for (var i = 0; i < length; i += step){
                    var point = path.getPointAtLength(i);
                    var X = point['x'] - that.props.stroke.pattern.BBox.width/2
                    var Y = point['y'] - that.props.stroke.pattern.BBox.height/2
        
                    var container = d3.select('#pattern-' + that.props.stroke.id).append('g').attr('transform', 'translate('+X+','+Y+')')
                    for (var j = 0; j < that.props.stroke.pattern.strokes.length; j += 1){
                        var element = that.props.stroke.pattern.strokes[j];
                        container.append('g').attr('transform', 'translate('+element.position[0]+','+element.position[1]+')')
                        .append('path')
                        .attr('d', (d)=>line(element.points))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.data.colorStroke )
                        .attr('stroke-width', element.data.sizeStroke)
                    }    
                }    
        } else {

            
            var points = JSON.parse(JSON.stringify(that.props.stroke.data))

            var BBoxOriginalHolder = that.props.stroke.BBoxPlaceHolder;
            var myScaleX = d3.scaleLinear().domain([BBoxOriginalHolder.x, BBoxOriginalHolder.x + BBoxOriginalHolder.width]).range([that.props.placeHolder.x , that.props.placeHolder.x + that.props.placeHolder.width]);
            var myScaleY = d3.scaleLinear().domain([BBoxOriginalHolder.y, BBoxOriginalHolder.y + BBoxOriginalHolder.height]).range([that.props.placeHolder.y, that.props.placeHolder.y + that.props.placeHolder.height]);

            var points = points.map((e)=> {
                return [myScaleX(e[0]), myScaleY(e[1])]
            })


            d3.select('#item-'+that.props.stroke.id)
                .attr("d", line(points))
                .attr('stroke', that.props.stroke.colorStroke)
                .attr('stroke-width', that.props.stroke.sizeStroke)
                // .attr('stroke', that.props.colorStroke)
                // .attr('stroke-width', that.props.sizeStroke)
                .attr('fill', 'none')
                .attr('stroke-linejoin', "round")
        }
    }
    componentDidUpdate(){
        // console.log('GO')
        // d3.select('#item-'+this.props.stroke.id).selectAll('*').remove();
        d3.select('#pattern-'+this.props.stroke.id).selectAll('*').remove();
        if (this.props.stroke.BBoxPlaceHolder != undefined) this.drawLines()
    }
    amountDragged = (d) => {
        this.props.moveTag({'idPlaceHolder': this.props.placeHolder.id, 'id':this.props.stroke.id, 'event': d});
    }
    render() {

        var tag = null;
        // console.log(this.props.stroke)
        if (this.props.stroke.tag != undefined){

            tag = <Tag
                    key={0} 
                    stroke={this.props.stroke.tag}
                    colorStroke = {'red'}
                    sizeStroke = {10}
                    amountDragged={this.amountDragged}
                />
        }
        return (
            <g>
                <path id={'item-'+this.props.stroke.id} />
                <g id={'pattern-'+this.props.stroke.id} ></g>
                {tag}
            </g>
            //transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`} /> 

        );
        
    }
}
export default LinePlaceHolder;