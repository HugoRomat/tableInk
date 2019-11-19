import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';


import { 
  } from './../../actions';
import Lettre from "./Lettre";

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        lettres: state.rootReducer.present.lettres,
        // groupLines: state.rootReducer.present.groupLines
    };
  };


class Lettres extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    }  
    render() {

        // console.log( this.props.sketchLines)
        const listItems = this.props.lettres.map((d, i) => {
                return <Lettre 
                    key={i} 
                    lettre={d}
                    iteration={i}
            />
        });
        // console.log(this.props.groupLines)
        // const groupItems = this.props.groupLines.map((d, i) => {
        //     // console.log(d)
        //     return <g className="group" id={d.id} key={i} transform={`translate(${d.position[0]},${d.position[1]})`} > 
        //         {d.data.map((e, j) => { return <g key={j} transform={`translate(${e.position[0]},${e.position[1]})`}>
        //             <Line key={j} stroke={e}/>
        //             </g> })}
        //     </g>
        // });

        // console.log(groupItems)
        
        return (
            // <g id="linesGroup">
                <g className="lettres">{listItems}</g>
            
            // </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Lettres);