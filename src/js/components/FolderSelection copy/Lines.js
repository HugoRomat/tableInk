import React, { Component } from "react";
import * as d3 from 'd3';

import Line from './Line';
class Lines extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    }
    
    componentDidMount(){
    }
   
    render() {
        // console.log(this.props.scope)
        // console.log('HELLO')
        const listItems = this.props.lines.map((d, i) => {
                return <Line 
                    key={i} 
                    stroke={d} 
                    scope={this.props.scope}
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