import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement } from "./../Helper";
import reducers from "../../reducers";

class Image extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){

    }
    
    componentDidUpdate(){
        
    }
    componentWillUnmount(){
        // console.log("BYE BYEs")
    }
    render() {
        // console.log(this.props.stroke.position[0])
        return (
            <g id={'image-'+this.props.image.id} style={{'pointerEvents': 'none' }} transform={`translate(${this.props.image.position[0]},${this.props.image.position[1]})`}>
                <image href={this.props.image.src} />
            </g>
        );
        
    }
}
export default Image;