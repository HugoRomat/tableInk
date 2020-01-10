import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Tag from './Tag';

import { 
  } from '../../actions';

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        tags: state.rootReducer.present.tags
    };
  };


class Tags extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    }  
    setGuideTapped = (d) => {
        this.props.setGuideTapped(d)
    }
    // holdTagF = (d) => {

    //     if (d != false){
    //         var myTag = this.props.tags.find(x => x.id == d);

    //         // console.log()
    //         this.props.holdTag(JSON.parse(JSON.stringify(myTag)))
    //         // console.log(myTag, d)
    //     }
    //     else this.props.holdTag(false)
        
    // }
    render() {
        console.log(this.props.tags)
        const listItems = this.props.tags.map((d, i) => {
                return <Tag 
                    key={i} 
                    stroke={d}
                    isGallery={false}

                    holdTag={this.props.holdTag}
                    // dragItem={this.props.dragItem}
                    // setGuideTapped={this.setGuideTapped}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
            />
        });
        
        return (
      
                <g id="tags">{listItems}</g>
         
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Tags);