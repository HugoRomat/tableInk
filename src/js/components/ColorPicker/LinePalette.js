
import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { _getBBoxPromise, drawCircle, checkIfSomething, createPositionAtLengthAngle, getTransformation, distance } from "../Helper";


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
        

            d3.select('#'+that.props.stroke.id).style('opacity', 1)
        _getBBoxPromise('palette-'+this.props.stroke.id).then((BBox)=>{
            this.BBox = BBox;
        })
        
        
        if (this.props.stroke.pattern != undefined){
            this.drawPattern();
            d3.select('#'+that.props.stroke.id).style('opacity', 0)
        }
        if (this.props.stroke.stretch != undefined){
            this.drawStretch();
            d3.select('#'+that.props.stroke.id).style('opacity', 0)
        }


        d3.select('#item-'+that.props.stroke.id)
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
    
    }
    drawPattern(){
        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.stroke.id).attr('opacity', 0)
        // var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        // console.log(that.props.stroke)
        var step = that.props.stroke.pattern.BBox.width;
        var path = d3.select('#'+that.props.stroke.id).node()
        var length = path.getTotalLength();
        for (var i = 0; i < length; i += step){
            var point = path.getPointAtLength(i);

            this.props.stroke.pattern.strokes.forEach((d)=>{

                var X = point['x']+ d.position[0]  - that.props.stroke.pattern.BBox.width/2;
                var Y = point['y']+ d.position[1]   - that.props.stroke.pattern.BBox.height/2;
                d3.select('#tempGroup-'+ that.props.stroke.id).append('g').attr("transform", (f) => 'translate('+X+','+Y+')')
                    .append('path')
                    .attr('d', (f)=>  line(d.points))
                    .attr('fill', 'none')
                    .attr('stroke', d.data.colorStroke)
                    .attr('stroke-width', d.data.sizeStroke)
                    .attr("stroke-dasharray", 'none')
                    .attr('stroke-linejoin', "round")
            })
        }
    }
    drawStretch(event){
        var that = this;
        var path = d3.select('#'+that.props.stroke.id).node()
        var line = d3.line(d3.curveCardinal);
        var length = path.getTotalLength();
        var step = 20;
        // console.log(that.props.stroke)
        var diff = that.props.stroke.stretch.map((d, i)=>{ 
            var points = d.points;
            return distance(that.props.stroke.stretch[0].points[0][0], points[0][0], that.props.stroke.stretch[0].points[0][1], points[0][1]);
        })
        that.props.stroke.stretch.forEach((d, k)=>{
            var allPoints = []
            var j = 0;
            for (var i = 0; i < length; i += step){
                var point = path.getPointAtLength(i);
                var pointBefore = path.getPointAtLength(i-1);
                var angle = Math.atan2(point.y-pointBefore.y, point.x-pointBefore.x) //* 180 / Math.PI;
                var newPointCos = createPositionAtLengthAngle(point, angle - (Math.PI/2), diff[k])
                var newPoint = [newPointCos['x'], newPointCos['y']];
                allPoints.push(newPoint)
                j++;
            }
            d3.select('#tempGroup-'+ that.props.stroke.id).append('g')
                .append('path')
                .attr('d', (f)=>  line(allPoints))
                .attr('fill', 'none')
                .attr('stroke', d.data.colorStroke)
                .attr('stroke-width', d.data.sizeStroke)
                .attr("stroke-dasharray", 'none')
                .attr('stroke-linejoin', "round")
        })
    }
    componentDidUpdate(){
        var that = this;
        var line = d3.line()
        // console.log(that.props.stroke)
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
            // .attr('stroke-opacity', '0')
            .attr('stroke-linejoin', "round")
        
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
                
                <g id={"tempGroup-"+this.props.stroke.id} style={{'pointerEvents': 'none' }} >

                </g>
                {/* <path id={'selection-'+this.props.stroke.id} /> */}
                {/* <path style={{'pointerEvents': 'none' }} className="fakeStroke" id={'fake-'+this.props.stroke.id}></path> */}
            </g>
        );
        
    }
}
export default LinePalette;