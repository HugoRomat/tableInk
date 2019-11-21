import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, showOmBB, distance, drawCircle, getSpPoint, mergeRectangles, showBboxBB, _getBBox, unionRectangles } from "./../Helper";

import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import Polygon from 'polygon';


/**
 * C'est la LIGNE ENTIER DE MOT
 */

class LinesGrouping extends Component {
    constructor(props) {
        super(props);
        this.organizedCorners = [];
    }
    componentDidMount(){
        var that = this;
        this.BBox = this.getBoundinxBoxEveryone();
        this.movePoints();

    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        //Si j'udpate la BBox
        if (this.props.placeholders != prevProps.placeholders){

            // console.log('UPDATE PLACEHOLDER')
            this.addPlaceHolder();
        }
        else if (this.props.sketchLines != prevProps.sketchLines){
            this.BBox = this.getBoundinxBoxEveryone();

            // showBboxBB(this.BBox, 'red');
            this.addPlaceHolder();
            // console.log('UPDATE SKECTHLINES')
        }
    }
    /**
     * FAIT LA BOUNDING BOX DE TOUT LE MONDE
     */
    getBoundinxBoxEveryone(){
        var line = this.props.line;
        var rectangle = null;
        line.forEach(strokeId => {
            // console.log(rectangle)
            var BB = _getBBox('item-'+strokeId);
            // showBboxBB(BB, 'red');
            if (rectangle == null) rectangle = BB;
            else rectangle = unionRectangles(rectangle, BB);

        })
        // showOmBB(oobb);
        return rectangle;
        
    }
    /**
     * BOUGES LES POINTS POUR LES ALIGNER AVEC LA LIGNE
     * @param {*} arrayPositionBox 
     */
    movePoints(){

        // console.log(this.props.line)
        var points =  JSON.parse(JSON.stringify(this.props.stroke.points));
        var begin = points[0];
        var end = points[points.length-1];
        begin[0] += this.props.stroke.position[0];
        begin[1] += this.props.stroke.position[1];

        end[0] += this.props.stroke.position[0];
        end[1] += this.props.stroke.position[1];

        var pointOnLine = getSpPoint({'x':begin[0], 'y': begin[1]}, {'x':end[0], 'y': end[1]}, {'x': this.BBox['x'], 'y': this.BBox['y']});
        // drawCircle(pointOnLine.x, pointOnLine.y, 4,  'blue');

        var offsetX = pointOnLine.x - this.BBox['x']
        var offsetY = pointOnLine.y - this.BBox['y']


        var changePositionArraySketchLines = this.props.line.map((d)=>{
            var stroke = this.props.sketchLines.find(x => x.id == d);
            stroke = JSON.parse(JSON.stringify(stroke))
            return {'id': stroke.id, 'position': [stroke.position[0]+offsetX, stroke.position[1]+offsetY]}
        })
        this.props.moveSketchLines(changePositionArraySketchLines);

        
// 
        // console.log(arrayPositionBox)

        // var arrayModified = arrayPositionBox.map((d, i)=>{
        //     return {'x':d.x +offsetX, 'y':d.y + offsetY};
        // })

        // return arrayModified;
    }
    addPlaceHolder(){
        // console.log(this.props.placeholders);
        var line = d3.line()
        var that = this;

        // var polygone = new Polygon(this.organizedCorners);
        // var poly2 = polygone.offset(50);
        // var array = poly2.points;
        // console.log(array)
        // showOmBB(poly2.points, 'red')
        // drawCircle(array[0]['x'], array[0]['y'], 10, 'blue')
        // drawCircle(array[array.length-1]['x'], array[array.length-1]['y'], 10, 'blue')

        this.props.placeholders.forEach((d)=>{
            if (d.id == 'left' && d.lines.length > 0){
                console.log('GOOOO', d.lines[0]['data'][0])
                // d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).append('path')

                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).selectAll('path').remove()
                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', 'black')
                    .attr('stroke-width', '2')
                
                // console.log(this.BBox, d)
                // var X = this.BBox.x- (d.BBox.width/2) - 50;
                // var Y = (this.BBox.height / 2) + this.BBox.y - (d.BBox.height/2);


                
                var X = this.BBox.x - d.BBox.width - 50;
                var Y = this.BBox.y;
                // var begin = [array[0]['x'], array[0]['y']];

                // drawCircle(newArray[0]['x'], newArray[0]['y'], 10, 'blue')

                // var X = ((end[0] - begin[0]) / 2) + begin[0]- (d.BBox.width/2);
                // var Y = ((end[1] - begin[1]) / 2) + begin[1]- (d.BBox.height/2);

                // var end = [array[array.length-1]['x'], array[array.length-1]['y']];
                // var X = ((end[0] - begin[0]) / 2) + begin[0]- (d.BBox.width/2);
                // var Y = ((end[1] - begin[1]) / 2) + begin[1]- (d.BBox.height/2);

                var cx = d.BBox.x + d.BBox.width/2;
                var cy = d.BBox.y + d.BBox.height/2;
                
                // console.log(this.BBox)

                // drawCircle(cx, cy, 10, 'blue')
                // drawCircle(array[0]['x'], array[0]['y'], 10, 'blue')
                //FOR SCALING
                var scale = 0.7;
                var x = (-cx * (scale - 1)) ;
                var y = (-cy * (scale - 1)) ;
                // console.log(d)
                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+X+','+Y+')')
                // d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+x+','+y+')scale(0.7)')

            }
        })
        // if (this.props.placeholders)
    }
    render() {
        return (
            // <g transform={`translate(0,0)`}>
               <g id={'placeHolderLeft-'+this.props.iteration +'-'+this.props.id} >
                   {/* <g></g> */}
               </g>
            // </g>
        );
        
    }
}
export default LinesGrouping;