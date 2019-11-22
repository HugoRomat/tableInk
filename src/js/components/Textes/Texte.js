import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement } from "./../Helper";
import LettreVoice from "./LettreVoice";

class Texte extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
        // console.log(this.props.stroke)
        var line = d3.line()
        var that = this;
        // d3.select('#'+that.props.texte.id)
        //     .html(that.props.texte.content)

    }
    
    componentDidUpdate(){
        
    }
   
    render() {
        var that = this;
        var bufferX = 0;
        var oldValue = 0
        const listItems = this.props.texte.content.split('').map(function(d, i){
            // console.log(index )
            // console.log(that)
            var index = that.props.lettresDefinition.indexOf(that.props.lettresDefinition.find(x => x.id == d));
            // console.log(d)
        
            if (d == ' '){
                bufferX += 20;
            }
            if (index > -1 && that.props.lettresDefinition[index]['BBox'] != undefined){
                // console.log(index, that.props.lettresDefinition[index])
                var BBox = that.props.lettresDefinition[index]['BBox'];
                // console.log(BBox)
                bufferX += oldValue;
                oldValue = BBox.width;
                // console.log(BBox.width)
                // bufferY+= BBox.width;
                return <LettreVoice
                        id={that.props.texte.id}
                        key={i} 
                        lettre={d}
                        lettreDefinition={that.props.lettresDefinition[index]}
                        position={[bufferX,-50]}
                        iteration={i}
                   />
            }
           
        });

        // console.log(this.props.texte)

        return (
            <g id={'item-'+this.props.texte.id} transform={`translate(${this.props.texte.position[0]},${this.props.texte.position[1]})`}>
                <text id={this.props.texte.id}></text>
                {listItems}
            </g>
        );
        
    }
}
export default Texte;