import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Line from './Line';

import { 
  } from './../actions';

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        sketchLines: state.rootReducer.present.sketchLines,
        
        // groupLines: state.rootReducer.present.groupLines
    };
  };


class Lines extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    } 
    
    render() {
       
        const listItems = this.props.sketchLines.map((d, i) => {
                return <Line 
                    key={i} 
                    stroke={d}
            />
        });
       
        return (
            <g className="standAloneLines">{listItems}</g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Lines);