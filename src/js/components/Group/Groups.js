import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Group from './Group';

import { 
  } from '../../actions';
import { guid } from "../Helper";

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        groupLines: state.rootReducer.present.groupLines
    };
  };


class Groups extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'shouldUnselect': guid()
        }
        this.selection = [];
        
    }
    componentDidMount(){
   
    } 

    addToSelection = (d) => {
        var that = this;
        this.selection.push(d.id);
        
        that.props.setSelection({'elements':this.selection})
        clearTimeout(that.timeSelection);
        that.timeSelection = setTimeout(function(){
            that.selection = [];
            that.setState({'shouldUnselect': guid()});

            that.props.setSelection({'elements':[]})

            // console.log('GO')
        }, 2000)
    }
    render() {

        console.log(this.props.groupLines)
        const listItems = this.props.groupLines.map((d, i) => {
            return <Group 
                key={i} 
                group={d}
                shouldUnselect={this.state.shouldUnselect}

                addToSelection={this.addToSelection}
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

            <g className="groups">
                {listItems}
            </g>
            

        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Groups);