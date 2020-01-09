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

        // console.log( this.props.stickyLines)
        const listItems = this.props.stickyLines.map((d, i) => {
                return <Guide 
                    key={i} 
                    stroke={d}
                    isGallery={false}

                    holdGuide={this.props.holdGuide}
                    dragItem={this.props.dragItem}
                    setGuideTapped={this.setGuideTapped}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
                    penType = {this.props.penType}
                    patternPenData = {this.props.patternPenData}
            />
        });
        // console.log(listItems);



        





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
      
                <g id="guides">{listItems}</g>
         
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Guides);