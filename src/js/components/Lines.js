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
        groupLines: state.rootReducer.present.groupLines
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
                return <g key={i} transform={`translate(${d.position[0]},${d.position[1]})`}><Line 
                    key={i} 
                    stroke={d}
            /></g>
        });
        // console.log(this.props.groupLines)
        const groupItems = this.props.groupLines.map((d, i) => {
            // console.log(d)
            return <g className="group" id={d.id} key={i} transform={`translate(${d.position[0]},${d.position[1]})`} > 
                {d.data.map((e, j) => { return <g key={j} transform={`translate(${e.position[0]},${e.position[1]})`}>
                    <Line key={j} stroke={e}/>
                    </g> })}
            </g>
        });

        // console.log(groupItems)
        
        return (
            <g id="linesGroup">
                <g className="standAloneLines">{listItems}</g>
                {groupItems}
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Lines);