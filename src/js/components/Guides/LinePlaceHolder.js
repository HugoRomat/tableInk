import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation } from "../Helper";


class LinePlaceHolder extends Component {
    constructor(props) {
        super(props);

    }

    
    componentDidMount(){

    }
   
    render() {
        return (
 
            <path id={'stroke-'+this.props.data.id} />

        );
        
    }
}
export default LinePlaceHolder;