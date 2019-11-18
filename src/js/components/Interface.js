import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { guid } from "./Helper";

class Interface extends Component {
    constructor(props) {
        super(props);

        this.id = guid();
    }
    componentDidMount(){
      
            
    
    }
    componentDidUpdate(){

    }
   
    render() {
        return (
            <g className='interface' transform={`translate(0,0)`}>
               
            </g>
        );
        
    }
}
export default Interface;