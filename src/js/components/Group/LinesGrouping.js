import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, showOmBB, distance, drawCircle, getSpPoint, mergeRectangles, showBboxBB, _getBBox, unionRectangles } from "./../Helper";

import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import Polygon from 'polygon';




class LinesGrouping extends Component {
    constructor(props) {
        super(props);
        this.organizedCorners = [];
        // this.BBheight = 0;
    }

    componentDidMount(){
        var that = this;
        this.BBox = this.getBoundinxBoxEveryone();
        this.movePoints();
        
        // setTimeout(function(){
        //     that.BBox = that.getBoundinxBoxEveryone();
        // }, 1000)
        // this.organizedCorners = this.knowWhereIsLeftOrRight(this.BBox);
        // console.log(this.props)
       
    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        //Si j'udpate la BBox
        if (this.props.placeholders != prevProps.placeholders){
            
            // console.log(this.array)
            this.addPlaceHolder();
        }
        else if (this.props.sketchLines != prevProps.sketchLines){
            this.BBox = this.getBoundinxBoxEveryone();
            this.addPlaceHolder();
            // console.log('UPDATE SKECTHLINES')
        }
    }
    /**
     * FAIT LA BOUNDING BOX DE TOUT LE MONDE
     */
    getBoundinxBoxEveryone(){
        //  console.log(this.props)
        /*var pointsAll = []
        var line = this.props.line;
        line.forEach(strokeId => {
            var stroke = this.props.sketchLines.find(x => x.id == strokeId);
            var points = JSON.parse(JSON.stringify(stroke['points']));
            var transform = getTransformation(d3.select('#item-'+strokeId).attr('transform'))
            points = points.map((d)=>{ return new Vector(d[0] + transform.translateX,d[1] + transform.translateY) })
            var convexHull = CalcConvexHull(points);
            var oobbNew = new CalcOmbb(convexHull);
            pointsAll = pointsAll.concat(oobbNew)
            // showOmBB(oobbNew)
        });
        var convexHull = CalcConvexHull(pointsAll);
        var oobb = new CalcOmbb(convexHull);*/
        var line = this.props.line;
        var rectangle = null;
        line.forEach(strokeId => {
            // console.log(rectangle)
            var BB = _getBBox('item-'+strokeId);
            // showBboxBB(BB, 'red');
            if (rectangle == null) rectangle = BB;
            else rectangle = unionRectangles(rectangle, BB);

        })
        // showBboxBB(rectangle, 'red');
        // console.log(rectangle)
        // showOmBB(oobb);
        return rectangle;
        
    }
    /**
     * RECUPERE LE TOP LEFT CORNER
     * @param {*} BBox 
     */
    knowWhereIsLeftOrRight(BBox){
        var begin = this.props.stroke.points[0];
        var end = this.props.stroke.points[this.props.stroke.points.length-1];

        var angle = Math.atan2(end[1]-begin[1], end[0]-begin[0]) * 180 / Math.PI;

        var newAngle = 90 - angle;
        var p = new Polygon([BBox[0],BBox[1], BBox[2], BBox[3]]);
        var newP = p.rotate(newAngle * (Math.PI/180), undefined, true)

        // showOmBB(p.points, 'red')

        var topLeft = null;
        var oldDistance = 1000000;
        newP.points.forEach((d, i) =>{
            var dist = distance(d.x, 0 , d.y, 0)
            if (dist < oldDistance){
                oldDistance = dist;
                topLeft = i;
            }
        })
        
        
        var newArray = p.points.splice(topLeft);
        if (p.points.length > 0) newArray= newArray.concat(p.points);

        newArray = this.movePoints(newArray);
    
        // drawCircle(newArray[0]['x'], newArray[0]['y'], 10, 'blue')
        return newArray;
        // console.log(newArray)
        // var orientation = 
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
                // console.log('GOOOO', d)
                // d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).append('path')
                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).select('g').selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', 'black')
                    .attr('stroke-width', '2')
                
                // console.log(d)
                var X = this.BBox.x- (d.BBox.width/2) - 50;
                var Y = (this.BBox.height / 2) + this.BBox.y - (d.BBox.height/2);
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
                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).select('g').attr('transform', 'translate('+X+','+Y+')')
                // d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+x+','+y+')scale(0.7)')

            }
        })
        // if (this.props.placeholders)
    }
    render() {
        return (
            <g transform={`translate(0,0)`}>
               <g id={'placeHolderLeft-'+this.props.iteration +'-'+this.props.id} >
                   <g></g>
               </g>
            </g>
        );
        
    }
}
export default LinesGrouping;