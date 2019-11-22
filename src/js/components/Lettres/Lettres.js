import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';


import { 
    addLinesLetter
  } from './../../actions';
import Lettre from "./Lettre";

const mapDispatchToProps = { 
    addLinesLetter
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        lettres: state.rootReducer.present.lettres,
        // groupLines: state.rootReducer.present.groupLines
    };
  };


class Lettres extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        // console.log('LETTRES')
        var that = this;

        d3.select('#closeModal')
            .on('pointerdown', function(d){
                setTimeout(function(){
                    // d3.event.preventDefault();
                    that.props.openAlphabet(false);
                }, 100)
                
            })
    }  
    addLine = (d) => {
        this.props.addLinesLetter(d);
    }
    render() {

        // console.log( this.props.lettres)
        const listItems = this.props.lettres.map((d, i) => {
                return <Lettre 
                    key={i} 
                    lettre={d.id}
                    iteration={i}
                    lines={d.lines}
                    iteration={i}

                    addLine={this.addLine}
            />
        });


        
        return (
            // <g id="linesGroup">
                <div className="lettres">

                    <div className={'containerLetters'}>{listItems}</div>
                    <button id={'closeModal'}>CLOSE</button>
                </div>
            
            // </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Lettres);