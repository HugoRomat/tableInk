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
    };
  };


class Lines extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    }  
    render() {
        // console.log(this.props.sketchLines)
        // console.log('HELLO')
        this.props.scope.activate();
        this.props.layer.activate();

        const listItems = this.props.sketchLines.map((d, i) => {
                return <Line 
                    key={i} 
                    stroke={d} 
                    scope={this.props.scope}
                    layer={this.props.layer}
            />
        });
        
        return (
            <React.Fragment>
                {listItems}
            </React.Fragment>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Lines);