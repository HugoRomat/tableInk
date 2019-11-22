import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, calculateBB, mergeRectangles, showBboxBB } from "../Helper";

class LettreVoice extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
    
        
        this.letterSVG = JSON.parse(JSON.stringify(this.props.lettreDefinition));
        // console.log(this.letterSVG)
        // this.computeLinesPlaceHOlder(this.letterSVG.lines);
        this.drawLetter();
        // console.log(this.letterSVG)
        /*var arrayBBox = [];
        this.letterSVG.lines.forEach(line => {
            var BB = calculateBB(line['points']);
            BB.x += (500 + this.props.position[0]);
            BB.y += 700
            BB.height = 100
            // console.log(BB);
            
            arrayBBox.push(BB)
        });
        var polygon;
        if (arrayBBox.length > 1){
            polygon = mergeRectangles(arrayBBox[0], arrayBBox[1])
            for (var i = 2; i < arrayBBox.length; i++){
                polygon = mergeRectangles(polygon, arrayBBox[i])
            }
        } else polygon = arrayBBox[0]
        showBboxBB(polygon, 'red')*/
    }
    
    drawLetter(){
        var that = this;
        var line = d3.line()

        d3.select('#lettreVoice-'+this.props.iteration+''+this.props.id).selectAll('*').remove();

        // console.log(that.props.lettreDefinition.lines)
        d3.select('#lettreVoice-'+this.props.iteration+''+this.props.id).selectAll('path')
            .data(that.props.lettreDefinition.lines).enter().append('path')
            .attr("d", function(d) {return line(d.points)})
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
            .on('contextmenu', function(){d3.event.preventDefault();})
        // this.letterSVG.lines.forEach(line => {


    }
    componentDidUpdate(){
        // console.log(this.props.lettreDefinition)
        this.letterSVG = JSON.parse(JSON.stringify(this.props.lettreDefinition));

       

        // console.log(this.letterSVG)
        // this.computeLinesPlaceHOlder(this.letterSVG.lines);
        this.drawLetter();
        // }
    }
   
    render() {
        return (
            <g id={'lettreVoice-'+this.props.iteration+''+this.props.id} transform={`translate(${this.props.position[0]},${this.props.position[1]})`}>
                
            </g>
        );
        
    }
}
export default LettreVoice;