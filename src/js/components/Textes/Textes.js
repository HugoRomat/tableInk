import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Texte from './Texte';

import { 
  } from './../../actions';
import { calculateBB, mergeRectangles, showBboxBB } from "../Helper";

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        textes: state.rootReducer.present.textes,
        lettres: state.rootReducer.present.lettres,
        // groupLines: state.rootReducer.present.groupLines
    };
  };


class Textes extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     'lettres': []
        // }
        
    }
    // componentDidUpdate(prevProps, prevState){

    //     if (this.props.lettres != this.state.letters){
    //         console.log(this.props.lettres);
    //         // this.setState({'lettres': letters})
    //     }
    // }
    componentDidMount(){
        // var letters = JSON.parse(JSON.stringify(this.props.lettres));
        // letters.forEach((d)=>{
        //     // console.log(d)
        //     this.computeLinesPlaceHOlder(d)
        // })
        // this.setState({'lettres': letters})
        
    }  
    computeLinesPlaceHOlder(data){
        var arrayBBox = [];
        data.lines.forEach(line => {
            var BB = calculateBB(line['points']);
            BB.height = 100;
            BB.y = 0;
            // console.log(BB);
            // showBboxBB(BB, 'red')
            arrayBBox.push(BB)
        });
        var polygon;
        if (arrayBBox.length > 1){
            polygon = mergeRectangles(arrayBBox[0], arrayBBox[1])
            for (var i = 2; i < arrayBBox.length; i++){
                polygon = mergeRectangles(polygon, arrayBBox[i])
            }
        } else polygon = arrayBBox[0]
        
        data.lines.forEach((d)=>{
            d['points'] = d['points'].map((f)=> [f[0] - polygon.x, f[1] - polygon.y])
        })
        // console.log(lines)
        data.BBox = polygon;

    }
    render() {
        var letters = JSON.parse(JSON.stringify(this.props.lettres));
        letters.forEach((d)=>{
            // console.log(d)
            this.computeLinesPlaceHOlder(d)
        })
        // console.log('GO')
        // this.setState({'lettres': letters})
        // console.log(this.props.lettres, letters)
        const listItems = this.props.textes.map((d, i) => {
                return <Texte 
                    key={i} 
                    texte={d}
                    lettresDefinition={letters}
            />
        });

        return (
            <g className="textes">{listItems}</g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Textes);