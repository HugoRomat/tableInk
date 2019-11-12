import React, { Component } from "react";
import * as d3 from 'd3';

import Line from './Line';

import backgroundImg from './../../../../static/realFinder.svg';



class Lines extends Component {
    constructor(props) {
        super(props);
        this.selection = null;
    }

    
    componentDidMount(){
        // this.addFolder();
    }

    setSelection= (d) => {
        
        var that = this;
        this.props.setSelection(d);
        
        // console.log('SELECTION ', d)
    }
   
    render() {
        // console.log(this.props.scope)
        // console.log('HELLO')
        const listItems = this.props.lines.map((d, i) => {
                return <Line 
                    key={i} 
                    stroke={d} 
                    scope={this.props.scope}
                    folders={this.folderArray}
                    setSelection={this.setSelection}
                   
            />
        });
        
        return (
            <React.Fragment>
                {listItems}
            </React.Fragment>
        );
        
    }
}
export default Lines;