import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import TagInterface from './TagInterface';

import { 
  } from './../../actions';

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        tagsInterface: state.rootReducer.present.tagsInterface,
    };
  };


class TagsInterface extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    } 
    
    render() {
        // console.log('=============')
        const listItems = this.props.tagsInterface.map((d, i) => {
            // console.log(d.position)
                return <TagInterface 
                    key={i} 
                    stroke={d}
            />
        });
       
        return (
            <g className="tagsInterface">{listItems}</g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TagsInterface);