import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';


import { 
  } from '../../actions';
import { guid } from "../Helper";

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    return { 
       
    };
  };


class Items extends Component {
    constructor(props) {
        super(props);
        this.state = {
           
        } 
    }
    componentDidMount(){
        // console.log(this.props);
        var line = d3.line().curve(d3.curveBasis)
        var that = this;
        d3.select('#stroke-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke.data))
            .attr('stroke', 'black')
            .attr('fill', 'none')
            .attr('stroke-width', '2')
    } 

    addToSelection = (d) => {
    
    }
    render() {
        return (

            <g className="items">

            </g>
            

        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Items);