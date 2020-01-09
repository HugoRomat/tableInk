import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import VoiceQuery from './VoiceQuery';

import { 
  } from './../../actions';

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    return { 
        voiceQueries: state.rootReducer.present.voiceQueries,
    };
  };


class VoiceQuerys extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    } 
    
    render() {
        // console.log('=============')
        const listItems = this.props.voiceQueries.map((d, i) => {
            // console.log(d.position)
                return <VoiceQuery 
                    key={i} 
                    query={d}
            />
        });
       
        return (
            <g className="voiceQuerys">{listItems}</g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(VoiceQuerys);