import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import paper, { Path } from 'paper';
import $ from 'jquery';

import highlighter from './../../../static/highlighter.svg';
import pencil from './../../../static/pencil.svg';
import pen from './../../../static/pen.svg';
import { 
    
} from './../actions';


const mapDispatchToProps = { 
    
 };
const mapStateToProps = (state, ownProps) => {  
    return { 
        dataset: state.rootReducer.present.dataset, 
    };
  };

class ColorsMenu extends Component {

    constructor(props) {
        super(props);
        this.handedness = 'right'
    }
    componentDidMount(){

        var that = this;

        d3.select('#abcd').on("click", function(d, index){
            d3.event.stopPropagation();
            
            that.props.openAlphabet(true)

        })
        // d3.select('#rule').on("click", function(d, index){
        //     d3.event.stopPropagation();
        //     if (d3.select(this).attr('issticky') == 'false'){
        //         that.props.isSticky(true);
        //         d3.select(this).attr('issticky', 'true')
        //         d3.select(this).html('sticky')
        //     } else{
        //         that.props.isSticky(false);
        //         d3.select(this).attr('issticky', 'false')
        //         d3.select(this).html('noSticky')
        //     }
        // })
        // d3.select('#grouping').on("click", function(d, index){
        //     d3.event.stopPropagation();
        //     if (d3.select(this).attr('isgroup') == 'false'){
        //         that.props.isGroup(true);
        //         d3.select(this).attr('isgroup', 'true')
        //         d3.select(this).html('group')
        //     } else{
        //         that.props.isGroup(false);
        //         d3.select(this).attr('isgroup', 'false')
        //         d3.select(this).html('noGroup')
        //     }
        // })
        

    }
    
    render() {
       
        return (
           <div id="buttons">
               <button className="buttonMenu" issticky='false' id="abcd"> abcd </button>
               {/* <button className="buttonMenu" issticky='false' id="rule"> noSticky </button> */}
               {/* <button className="buttonMenu" isgroup='false' id="grouping"> noGroup </button> */}
                {/* <g id="rule" issticky='false' transform={'translate(400,20)'}>
                    <rect fill='black' width='100' height='50' x='0' stroke='black' fill='grey'> hello</rect>
                    <text y='27' x='27'> Rule </text>
                </g> */}
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ColorsMenu);