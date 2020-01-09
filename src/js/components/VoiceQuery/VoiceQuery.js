import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';

class VoiceQuery extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    } 
    
    render() {
        console.log('=============', 'HELLO')
        
       
        return (
            <g id={'item-'+this.props.query.id} transform={`translate(${this.props.query.position[0]},${this.props.query.position[1]})`}>
                <text> {this.props.query.content}</text>
            </g>
        );
        
    }
}
export default VoiceQuery;