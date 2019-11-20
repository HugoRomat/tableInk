import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, showOmBB, distance, drawCircle } from "./../Helper";

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
        this.BBox = this.getBoundinxBoxEveryong();
        this.organizedCorners = this.knowWhereIsLeftOrRight(this.BBox);
        console.log(this.props)
       
    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        //Si j'udpate la BBox
        if (this.props.placeholders != prevProps.placeholders){
            // console.log(this.array)
            this.addPlaceHolder();
        }
    }
    getBoundinxBoxEveryong(){
        //  console.log(this.props)
        var pointsAll = []
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
        var oobb = new CalcOmbb(convexHull);
        // console.log(oobb)
        // showOmBB(oobb);
        return oobb;
        
    }
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

        // console.log(newArray.length, p.points.length)
        if (p.points.length > 0) newArray= newArray.concat(p.points);
        // console.log(newArray.length, p.points.length)
        // newArray.forEach((d, i)=>{
        //     drawCircle(d.x, d.y, (i+1)*4,  'blue')
        // })
        // console.log(newArray)


        return newArray;
        // drawCircle(newArray[0]['x'], newArray[0]['y'], 10, 'blue')
        // console.log(newArray)
        // var orientation = 
    }
    addPlaceHolder(){
        console.log(this.props.placeholders);
        var line = d3.line()
        var that = this;

        var polygone = new Polygon(this.organizedCorners);
        var poly2 = polygone.offset(50);
        var array = poly2.points;
        console.log(array)
        // showOmBB(poly2.points, 'red')

        this.props.placeholders.forEach((d)=>{
            if (d.id == 'left'){
                // console.log('GOOOO', d)
                // d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).append('path')
                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', 'black')
                    .attr('stroke-width', '2')
                

                var begin = [array[0]['x'], array[0]['y']];
                var end = [array[array.length-1]['x'], array[array.length-1]['y']];
                var X = ((begin[0] + end[0]) / 2) - (d.BBox.width/2);
                var Y = ((begin[1] + end[1]) / 2) - (d.BBox.height/2);
                // console.log(d)
                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+X+','+Y+')')
                // d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+begin[0]+','+begin[1]+')')

            }
        })
        // if (this.props.placeholders)
    }
    render() {
        return (
            <g transform={`translate(0,0)`}>
               <g id={'placeHolderLeft-'+this.props.iteration +'-'+this.props.id} ></g>
            </g>
        );
        
    }
}
export default LinesGrouping;