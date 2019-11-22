import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, guid } from "./../Helper";

class Lettre extends Component {
    constructor(props) {
        super(props);
        this.tempArrayStroke = [];
        this.arrayStroke = [];
    }
    componentDidMount(){
        var that = this;

        var BBox = d3.select('#item-'+this.props.iteration).node().getBoundingClientRect();
        // console.log(BBox)
        d3.select('#item-'+that.props.iteration)
            .on('pointerdown', function(d){
                that.down = true;
                that.tempArrayStroke.push([]);

                that.arrayStroke = [];
            })
            .on('pointermove', function(d){
                that.arrayStroke.push([d3.event.x - BBox.x, d3.event.y  - BBox.y])
                if (that.down){
                    that.drawTempStroke();
                }
            })
            .on('pointerup', function(d){
                that.down = false;
                that.tempArrayStroke.push(JSON.parse(JSON.stringify(that.arrayStroke)))
                that.props.addLine({'id':that.props.lettre, 'idLine': guid(), 'line':JSON.parse(JSON.stringify(that.arrayStroke))});

                d3.select('#penTemp-'+that.props.iteration).attr("d", null);
                that.arrayStroke = [];
                that.drawTempStroke();

                
            })
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })

            this.drawLines()

            d3.select('#line-'+that.props.iteration)
                .attr('x1', 0)
                .attr('y1', 50)
                .attr('x2', 100)
                .attr('y2', 50)
                .attr('stroke', 'black')
                .attr('stroke-width', '1')
                .attr('opacity', '0.2')
    }
    drawTempStroke(){
        var that = this;
        var line = d3.line()

        d3.select('#penTemp-'+that.props.iteration)
            .attr("d", line(that.arrayStroke))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')

        // d3.select('#g-'+that.props.lettre).selectAll('path')
        //     .data(that.tempArrayStroke).enter().append('path')
        //     .attr("d", function(d) {return line(d)})
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black')
        //     .attr('stroke-width', '2')
    }
    
    componentDidUpdate(prevProps, prevState){
        var that = this;
        if (this.props.lines != prevProps.lines){
            console.log(that.props.lines)

            this.drawLines();
          
        }
    }
    drawLines(){
        var that = this;
        var line = d3.line();
        // console.log(that.props.lines)
        d3.select('#g-'+that.props.iteration).selectAll('path')
            .data(that.props.lines).enter().append('path')
            .attr("d", function(d) {return line(d.points)})
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
    }
    render() {
        return (
            <div>

           
                <div className={'lettreSVG'} >
                    <svg id={'item-'+this.props.iteration} className={'SVGitem'}>

                        <line id={'line-'+this.props.iteration} />
                        <path id={'penTemp-'+this.props.iteration} />
                        <g id={'g-'+this.props.iteration} />
                    </svg>
                </div>
                <div className={'textLabel'}>{this.props.lettre}</div>
            </div>
            // <svg id={'item-'+this.props.lettre} className={'lettreSVG'} width={50} height={50} transform={`translate(`+((this.props.iteration * 30)+20)+`,10)`}>
            //    <text dx={15} dy={18} textAnchor={"middle"}> {this.props.lettre.lettre} </text>

            // </svg>
        );
        
    }
}
export default Lettre;