import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Image from './Image';

import { 
  } from './../../actions';

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        imagesCanvas: state.rootReducer.present.imagesCanvas,
        
        // groupLines: state.rootReducer.present.groupLines
    };
  };


class Images extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    } 
    
    render() {
        // console.log('=============')
        const listItems = this.props.imagesCanvas.map((d, i) => {
            // console.log(d.position)
                return <Image 
                    key={i} 
                    image={d}
            />
        });
       
        return (
            <g className="standAloneImages">{listItems}</g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Images);