import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getTransformation, showOmBB, showBboxBB, mergeRectangles, drawCircle } from "./../Helper";
import { connect } from 'react-redux';

import {
    moveSketchLines
} from './../../actions';
import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import LinesGrouping from "./LinesGrouping";
import Polygon from 'polygon'

const mapDispatchToProps = { 
    moveSketchLines
};
const mapStateToProps = (state, ownProps) => {  

  return { 
      sketchLines: state.rootReducer.present.sketchLines,
  };
};


class Group extends Component {
    constructor(props) {
        super(props);

        this.state = {
            'placeholders':[]
        }
    }
    componentDidMount(){
        var that = this;
        // console.log(this.props.group)
        this.placeHolder = this.props.group.model.placeHolder; 

        var line = d3.line()
        var that = this;
        d3.select('#item-'+that.props.group.id).select('path')
            .attr("d", line(that.props.group.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '2')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "5");


        this.computeLines(this.placeHolder)
    }
    //SERT A METTRE MES OBJETS EN 0 ABSOLU ++ Update ma BBOX de mon objet PLACEHOLDER
    computeLines(placeholder){
        var itemsGuide = [];
        placeholder.forEach(element => {
            var lines = element.lines;

            if (lines.length > 0){
                var arrayBBox = []
                lines.forEach((d)=>{
                    var node = d3.select('#stroke-'+d.id).node();
                    var nodeParent = d3.select(node.parentNode.parentNode.parentNode);
                    var transform = getTransformation(nodeParent.attr('transform'));
                    var BB = node.getBBox();
                    BB.x = BB.x+transform.translateX;
                    BB.y = BB.y+transform.translateY;
                    arrayBBox.push(BB);
                    d.data = d.data.map((f)=> [f[0] + transform.translateX, f[1] + transform.translateY])
                })
                // SERT A TROUVER LE COIN EN HAUT A GAUCHE
                var polygon;
                if (arrayBBox.length > 1){
                    polygon = mergeRectangles(arrayBBox[0], arrayBBox[1])
                    for (var i = 2; i < arrayBBox.length; i++){
                        polygon = mergeRectangles(polygon, arrayBBox[i])
                    }
                } else polygon = arrayBBox[0]
                // showBboxBB(polygon, 'red');
                // console.log(polygon);
                //UNE FOIS QUE c'EST FAIT TOUT LE NONDE EN 0
                lines.forEach((d)=>{
                    d.data = d.data.map((f)=> [f[0] - polygon.x, f[1] - polygon.y])
                    // console.log(d.data)
                })
                element.BBox = polygon;
               
            }
            
            // console.log(element)
        });
//  console.log(placeholder)
        this.setState({'placeholders': placeholder});
        // console.log(placeholder)
    }
    componentDidUpdate(){
        
    }
    getBoundinxBoxEveryong(){
        // console.log(this.props)
    }
    moveSketchLines = (d) => {
        this.props.moveSketchLines(d);
    }
    render() {
        const listItems = this.props.group.lines.map((d, i) => {
            return <LinesGrouping 
                key={i} 
                line={d}
                sketchLines={JSON.parse(JSON.stringify(this.props.sketchLines))}
                placeholders={this.state.placeholders}
                stroke={this.props.group.stroke}
                id={this.props.group.id}
                iteration={i}

                moveSketchLines={this.moveSketchLines}
            />
        });

        return (
            <g id={'group-'+this.props.group.id} transform={`translate(0,0)`}>
                {listItems}
                <g id={'item-'+this.props.group.id} transform={`translate(${this.props.group.stroke.position[0]},${this.props.group.stroke.position[1]})`}>
                    <path />
                </g>
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Group);