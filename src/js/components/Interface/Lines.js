import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';



class Lines extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    } 
    
    render() {
       
        const listItems = this.props.sketchLines.map((d, i) => {
            // console.log(d.position)
                return <Line 
                    key={i} 
                    stroke={d}
            />
        });
       
        return (
            <g id="linesPattern">{listItems}</g>
        );
        
    }
}

class Line extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
        var that = this;
        var line = d3.line()
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', that.props.stroke.data.colorStroke)
            .attr('stroke-width', that.props.stroke.data.sizeStroke)
            .attr('stroke-linejoin', "round")
    } 
    
    render() {
       
        
       
        return (
            <g id={'item-'+this.props.stroke.id} transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`}>
                <path style={{'pointerEvents': 'none' }} id={this.props.stroke.id}></path>
              
            </g>
        );
        
    }
}

export default Lines;