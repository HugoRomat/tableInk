import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Menu from './Menu';

import { 
  } from './../../actions';

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    return { 
        menuItems: state.rootReducer.present.menuItems,
    };
  };


class Menus extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    }  
    render() {

        const listItems = this.props.menuItems.map((d, i) => {
                return <Menu 
                    key={i} 
                    menu={d}
            />
        });

        return (

            <g className="menus">{listItems}</g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Menus);