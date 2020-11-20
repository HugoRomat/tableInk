import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Guide from './Guide';

import { 
  } from '../../actions';

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        stickyLines: state.rootReducer.present.stickyLines
    };
  };


class Guides extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    }  
    setGuideTapped = (d) => {
        this.props.setGuideTapped(d)
    }
    render() {

        // console.log( this.props.tagHold)
        console.log(this.props.stickyLines)
        const listItems = this.props.stickyLines.map((d, i) => {
                return <Guide 
                    key={i} 
                    stroke={d}
                    isGallery={false}

                    holdGuide={this.props.holdGuide}
                    dragItem={this.props.dragItem}
                    setGuideTapped={this.setGuideTapped}
                    tagHold={this.props.tagHold}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
                    penType = {this.props.penType}
                    patternPenData = {this.props.patternPenData}
            />
        });
        return (
      
                <g id="guides">{listItems}</g>
         
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Guides);