import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, showOmBB, distance, drawCircle, getSpPoint, mergeRectangles, showBboxBB, _getBBox, unionRectangles, _getBBoxPromise, simplify, groupBy } from "../Helper";

import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import Polygon from 'polygon';
// import { resolve } from "dns";


/**
 * C'est la LIGNE ENTIER DE MOT
 */

class Background extends Component {
    constructor(props) {
        super(props);
        this.organizedCorners = [];
    }
    componentDidMount(){
        var that = this;
        this.BBox = this.getBoundinxBoxEveryone();

        // this.getBoundinxBoxEveryone().then((d)=>{  
        //     this.BBox = d;
        //     this.addPlaceHolder();
        // })
        // this.movePoints();
        // console.log('HELLO BG')
    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        //Si j'udpate la BBox
        
        if (this.props.placeholders != prevProps.placeholders){
            // console.log('Update placeHolders')
            this.getBoundinxBoxEveryone().then((d)=>{
                // console.log(d)
                this.BBox = d;
                this.addPlaceHolder();
            })
            
        }
        else if (this.props.sketchLines != prevProps.sketchLines){
            // console.log('Update sketchlines')
            this.getBoundinxBoxEveryone().then((d)=>{
                // console.log(JSON.stringify(d))
                this.BBox = d;
                this.addPlaceHolder();
            })
           
        }
    }
    /**
     * FAIT LA BOUNDING BOX DE TOUT LE MONDE
     */
    getBoundinxBoxEveryone = async () => {
        var that = this;
        



        var BBLine = await _getBBoxPromise('item-'+that.props.group.id);
        // console.log(BBLine)
        var rectangle = BBLine;
        // var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        // BBLine.x = BBLine.x - transformPan.translateX;
        // BBLine.y = BBLine.y - transformPan.translateY;

        /** GET BBOX OF all Lines */
        for (let i = 0; i < this.props.group.lines.length; i++) {
            var line = this.props.group.lines[i];
            // line.forEach(strokeId => {
            
                for (let index = 0; index < line.length; index++) {
                    var strokeId = line[index];
                    var BB = await _getBBoxPromise('item-'+strokeId);
                    
                    if (rectangle == null) rectangle = BB;
                    else rectangle = unionRectangles(rectangle, BB);
    
            }

           
            // GET apres le drag en compte sur les BBox
            //
            // // console.log(transform)
            // rectangle.x -= transform.translateX;
            // rectangle.y -= transform.translateY;
        }
        // showBboxBB(rectangle, 'red');
        if (rectangle != null){
            var transformPan = {'translateX': 0, 'translateY': 0}
            transformPan = getTransformation(d3.select('#panItems').attr('transform'));
            rectangle.x = rectangle.x - transformPan.translateX;
            rectangle.y = rectangle.y - transformPan.translateY;
        }
       
        // console.log(rectangle)
        return rectangle;
        // resolve(rectangle);

    }
    addPlaceHolder(){
        
        // console.log(this.props.placeholders)
        // showBboxBB(this.BBox, 'red');
        // console.log(this.BBox)
        var line = d3.line().curve(d3.curveBasis)
        var that = this;

        var transform = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
        var offsetX = 0;
        var offsetY = 0;
        var totalHeight = 0;
        var totalWidth = 0;
        var offsetWidth = 25 + transform.translateX;
        var offsetHeight = 25 + transform.translateY;

     

        // d3.select('#placeHolderBGLine-'+that.props.id).selectAll('g').remove()
        // d3.select('#placeHolderText-'+that.props.id).selectAll('g').remove();
        
        
        d3.select('#placeHolderOuterBG-'+that.props.id).selectAll('g').remove();
        d3.select('#placeHolderOuterBG-'+that.props.id).selectAll('path').remove();
        d3.select('#placeHolderOuterBGPattern-'+that.props.id).selectAll('g').remove();
        
        
        this.props.placeholders.forEach((d)=>{
            // console.log(d)
            if (d.id == 'outerBackground' && d.lines.length > 0){
                // console.log(d.BBox.x + d.BBox.width, that.BBox.x + that.BBox.width)
                var myScaleX = d3.scaleLinear().domain([d.BBox.x, d.BBox.x + d.BBox.width]).range([that.BBox.x - 100, that.BBox.x + that.BBox.width +100]);
                var myScaleY = d3.scaleLinear().domain([d.BBox.y, d.BBox.y + d.BBox.height]).range([that.BBox.y - 100, that.BBox.y + that.BBox.height + 100]);
                const grouped = groupBy(d.lines, line => line.type);
                
                var scale = grouped.get("normal");
                var pattern = grouped.get("pattern");

                // console.log(pattern)
                /** For scale data */
                if (scale != undefined && scale.length > 0){
                    // console.log('GOO')
                    var lines = JSON.parse(JSON.stringify(scale))
                    lines.forEach((line)=>{
                        line.data = line.data.map((e)=> {
                            return [myScaleX(e[0] + d.BBox.x) - transform.translateX, myScaleY(e[1] + d.BBox.y) - transform.translateY]
                        })
                    })
                    // console.log(lines)
                    for (var i = 0; i < lines.length; i += 1){
                        var myLine = lines[i]
                        d3.select('#placeHolderOuterBG-'+that.props.id).append('path')
                        .attr('d', ()=>line(myLine.data))
                        .attr('fill', 'none')
                        .attr('stroke', ()=> myLine.colorStroke )
                        .attr('stroke-width', (e)=>{return myLine.sizeStroke})// + (that.BBox.width / d.BBox.width);})
                    }
                }

                /** for pattern data */
                if (pattern != undefined && pattern.length > 0){
                   
                    pattern.forEach((myPattern, i)=>{
                        var container = d3.select('#placeHolderOuterBGPattern-'+that.props.id)
                        var myLine = JSON.parse(JSON.stringify(myPattern['data']))
                        var myNewLine = myLine.map((e)=> {return [myScaleX(e[0] + d.BBox.x) - transform.translateX, myScaleY(e[1] + d.BBox.y) - transform.translateY]})
                            
                            
                        var pathSelection = d3.select('#placeHolderOuterBGPattern-'+that.props.id)
                            .append('path')
                            .attr('id', 'pathLine-'+that.props.id+'-'+i)
                            .attr('d', (d)=>line(myNewLine))
                            .attr('fill', 'none')
                            .attr('stroke', (d)=> myPattern.colorStroke )
                            .attr('stroke-width', (e)=>{return myLine.sizeStroke})// + (that.BBox.width / d.BBox.width))
                            .attr('opacity', '0')

                            var step = myPattern.pattern.BBox.width;
                            var path = pathSelection.node()
                            var length = path.getTotalLength();

                            for (var i = 0; i < length; i += step){
                                var point = path.getPointAtLength(i);
                                var X = point['x']// + that.props.parent.position[0];
                                var Y = point['y']// + that.props.parent.position[1];
                    
                                var container = d3.select('#placeHolderOuterBGPattern-'+that.props.id).append('g').attr('transform', 'translate('+X+','+Y+')')
                                for (var j = 0; j < myPattern.pattern.strokes.length; j += 1){
                                    var element = myPattern.pattern.strokes[j];
                                    container.append('g').attr('transform', 'translate('+element.position[0]+','+element.position[1]+')')
                                    .append('path')
                                    .attr('d', (d)=>line(element.points))
                                    .attr('fill', 'none')
                                    .attr('stroke', (d)=> element.data.colorStroke )
                                    .attr('stroke-width', element.data.sizeStroke)
                                }    
                            }

                    })
                }
            }

        })



    }
    render() {
        // console.log('GO')
        return (
            <g id={'background-'+this.props.id} transform={`translate(0,0)`}>
               <g id={'placeHolderOuterBG-'+this.props.id} ></g>
               <g id={'placeHolderOuterBGPattern-'+this.props.id} ></g>
               {/* <g id={'placeHolderText-'+this.props.id} ></g>
               <g id={'placeHolderBGLine-'+this.props.id} ></g> */}
            </g>
        );
        
    }
}
export default Background;