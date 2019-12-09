import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, showOmBB, distance, drawCircle, getSpPoint, mergeRectangles, showBboxBB, _getBBox, unionRectangles, _getBBoxPromise } from "../Helper";

import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import Polygon from 'polygon';


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
        // this.movePoints();

    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        //Si j'udpate la BBox
        if (this.props.placeholders != prevProps.placeholders){
            this.BBox = this.getBoundinxBoxEveryone();
            this.addPlaceHolder();
        }
        else if (this.props.sketchLines != prevProps.sketchLines){
            this.BBox = this.getBoundinxBoxEveryone();
            this.addPlaceHolder();
        }
    }
    /**
     * FAIT LA BOUNDING BOX DE TOUT LE MONDE
     */
    getBoundinxBoxEveryone(){
        var that = this;
        var rectangle = null;
        // var line = this.props.line;
        

        this.props.group.lines.forEach((line)=>{
            line.forEach(strokeId => {
                var BB = _getBBox('item-'+strokeId);
                
                if (rectangle == null) rectangle = BB;
                else rectangle = unionRectangles(rectangle, BB);
    
            })
            // GET apres le drag en compte sur les BBox
            //
            // // console.log(transform)
            // rectangle.x -= transform.translateX;
            // rectangle.y -= transform.translateY;
        })
        // showBboxBB(rectangle, 'red');
        
        // console.log(rectangle)
        
        return rectangle;

    }
    addPlaceHolder(){
        var line = d3.line().curve(d3.curveBasis)
        var that = this;

        var transform = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
        var offsetX = 0;
        var offsetY = 0;
        var totalHeight = 0;
        var totalWidth = 0;
        var offsetWidth = 25 + transform.translateX;
        var offsetHeight = 25 + transform.translateY;


        // var placeHolders = JSON.parse(JSON.stringify(this.props.placeholders))

        // d3.select('#placeHolderBG-'+that.props.id).selectAll('path').remove()
        d3.select('#placeHolderCornerTopRight-'+that.props.id).selectAll('g').remove();
        d3.select('#placeHolderCornerTopLeft-'+that.props.id).selectAll('g').remove();
        d3.select('#placeHolderCornerBottomRight-'+that.props.id).selectAll('g').remove();
        d3.select('#placeHolderCornerBottomLeft-'+that.props.id).selectAll('g').remove();

        d3.select('#placeHolderBGLeft-'+that.props.id).selectAll('g').remove()
        d3.select('#placeHolderBGRight-'+that.props.id).selectAll('g').remove()
        d3.select('#placeHolderBGTop-'+that.props.id).selectAll('g').remove()
        d3.select('#placeHolderBGBottom-'+that.props.id).selectAll('g').remove()
        d3.select('#placeHolderBG-'+that.props.id).selectAll('g').remove()
        // placeHolderBG
        this.props.placeholders.forEach((d)=>{

            if (d.id == 'topbackground' && d.lines.length > 0){
                var width = this.BBox.width; 
                var widthPlaceHolder = d.BBox.width;
                var numberIn = Math.ceil(width/widthPlaceHolder);
                offsetX = (numberIn - (width/widthPlaceHolder)) * d.BBox.width; 
                totalWidth = numberIn * widthPlaceHolder
            }

            if (d.id == 'leftbackground' && d.lines.length > 0){
                var height = this.BBox.height; 
                var heightPlaceHolder = d.BBox.height;
                var numberIn = Math.ceil(height/heightPlaceHolder);
                offsetY = (numberIn - (height/heightPlaceHolder)) * d.BBox.height; 
                totalHeight = numberIn * heightPlaceHolder
            }
        })

        // offsetX = offsetX - 100//offsetWidth;
            // console.log(d)
            // var width = this.BBox.width; 
            // var widthPlaceHolder = d.BBox.width;
            // var numberXIn = Math.ceil(width/widthPlaceHolder);

            // var height = this.BBox.height; 
            // var heightPlaceHolder = d.BBox.height;
            // var numberIn = Math.ceil(height/heightPlaceHolder)
        this.props.placeholders.forEach((d)=>{

            if (d.id == 'topbackground' && d.lines.length > 0){


                var width = this.BBox.width; 
                var widthPlaceHolder = d.BBox.width;
                var numberIn = Math.ceil(width/widthPlaceHolder)
                var arrayLines = [];
                var lines = d.lines;
                for (var i = 0; i < numberIn; i++){
                    arrayLines.push(lines);
                }
                // console.log(offsetHeight, offsetWidth)
                // offsetX = (numberIn - (width/widthPlaceHolder)) * d.BBox.width;

                d3.select('#placeHolderBGTop-'+that.props.id).attr('transform', 'translate('+(that.BBox.x  - (offsetX/2) - offsetWidth)+','+(that.BBox.y - 25 - (offsetY/2) - offsetHeight)+')')
                var Gelement = d3.select('#placeHolderBGTop-'+that.props.id).selectAll('g')
                    .data(arrayLines).enter()
                    .append('g')
                    .attr('transform', function (e,i){ return 'translate('+((d.BBox.width*i))+',0)'})

                Gelement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)
            }
  
            if (d.id == 'leftbackground' && d.lines.length > 0){


                var height = this.BBox.height; 
                var heightPlaceHolder = d.BBox.height;
                var numberIn = Math.ceil(height/heightPlaceHolder)
                var arrayLines = [];
                var lines = d.lines;
                for (var i = 0; i < numberIn; i++){
                    arrayLines.push(lines);
                }
            
                d3.select('#placeHolderBGLeft-'+that.props.id).attr('transform', 'translate('+(that.BBox.x - 50 - (offsetX/2) - offsetWidth)+','+(that.BBox.y + 25 - (offsetY/2) - offsetHeight)+')')
                var Gelement = d3.select('#placeHolderBGLeft-'+that.props.id).selectAll('g')
                    .data(arrayLines).enter()
                    .append('g')
                    .attr('transform', function (e,i){ return 'translate(0,'+((d.BBox.height*i))+')'})

                Gelement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)
            }
            if (d.id == 'bottombackground' && d.lines.length > 0){
                var width = this.BBox.width; 
                var widthPlaceHolder = d.BBox.width;
                var numberIn = Math.ceil(width/widthPlaceHolder)
                var arrayLines = [];
                var lines = d.lines;
                for (var i = 0; i < numberIn; i++){
                    arrayLines.push(lines);
                }

                d3.select('#placeHolderBGBottom-'+that.props.id).attr('transform', 'translate('+(that.BBox.x - (offsetX/2) - offsetWidth)+','+(that.BBox.y+totalHeight +25 - offsetHeight)+')')
                var Gelement = d3.select('#placeHolderBGBottom-'+that.props.id).selectAll('g')
                    .data(arrayLines).enter()
                    .append('g')
                    .attr('transform', function (e,i){ return 'translate('+((d.BBox.width*i))+',0)'})

                Gelement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)
            }
            if (d.id == 'rightbackground' && d.lines.length > 0){
                var height = this.BBox.height; 
                var heightPlaceHolder = d.BBox.height;
                var numberIn = Math.ceil(height/heightPlaceHolder)
                var arrayLines = [];
                var lines = d.lines;
                for (var i = 0; i < numberIn; i++){
                    arrayLines.push(lines);
                }
            
                d3.select('#placeHolderBGRight-'+that.props.id).attr('transform', 'translate('+(that.BBox.x + totalWidth +25 - (offsetX/2) - offsetWidth)+','+(that.BBox.y  + 25 - (offsetY/2) - offsetHeight)+')')
                var Gelement = d3.select('#placeHolderBGRight-'+that.props.id).selectAll('g')
                    .data(arrayLines).enter()
                    .append('g')
                    .attr('transform', function (e,i){ return 'translate(0,'+((d.BBox.height*i))+')'})

                Gelement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)
            }
            // console.log(d.id)
            if (d.id == 'background' && d.lines.length > 0){
                var height = this.BBox.height; 
                var heightPlaceHolder = d.BBox.height;
                var numberInHeight = Math.ceil(height/heightPlaceHolder)

                var width = this.BBox.width; 
                var widthPlaceHolder = d.BBox.width;
                var numberInWidth = Math.ceil(width/widthPlaceHolder)
              
                var arrayLines = [];
                for (var j = 0; j < numberInWidth; j++){
                    var array = [];
                    var lines = d.lines;
                    for (var i = 0; i < numberInHeight; i++){
                        array.push(lines);
                    }
                    arrayLines.push(array)
                }
            
                d3.select('#placeHolderBG-'+that.props.id).attr('transform', 'translate('+(that.BBox.x - offsetWidth - (offsetX/2))+','+(that.BBox.y + 25 -  offsetHeight - (offsetY/2))+')')
                var Gelement = d3.select('#placeHolderBG-'+that.props.id).selectAll('g')
                    .data(arrayLines).enter()
                    .append('g')
                    .attr('transform', function (e,i){ return 'translate('+(d.BBox.width*i)+',0)'})
                
                var cellElement = Gelement.selectAll('g')
                    .data((d)=>(d)).enter()
                    .append('g').attr('class', 'cell')
                    .attr('transform', function (e,i){  return 'translate(0,'+((d.BBox.height*i))+')'})

                cellElement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)
                    .attr('opacity', '0.3')

            }
            if (d.id == 'topRightCorner' && d.lines.length > 0){
                d3.select('#placeHolderCornerTopRight-'+that.props.id).attr('transform', 'translate('+(that.BBox.x + totalWidth + 25 - (offsetX/2) - offsetWidth)+','+(that.BBox.y  -25  - (offsetY/2) - offsetHeight)+')')
                var Gelement = d3.select('#placeHolderCornerTopRight-'+that.props.id)
                    .append('g').attr('transform', function (e,i){ return 'translate(0,0)'})

                Gelement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)
            }
            if (d.id == 'topLeftCorner' && d.lines.length > 0){
                d3.select('#placeHolderCornerTopLeft-'+that.props.id).attr('transform', 'translate('+(that.BBox.x - 50 - (offsetX/2) - offsetWidth)+','+(that.BBox.y -25 - (offsetY/2) - offsetHeight)+')')
                var Gelement = d3.select('#placeHolderCornerTopLeft-'+that.props.id)
                    .append('g')
                    .attr('transform', function (e,i){ return 'translate(0,0)'})

                Gelement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)
            }
            if (d.id == 'bottomLeftCorner' && d.lines.length > 0){
                d3.select('#placeHolderCornerBottomLeft-'+that.props.id).attr('transform', 'translate('+(that.BBox.x - 50 - (offsetX/2) - offsetWidth)+','+(that.BBox.y+totalHeight +25 - offsetHeight)+')')
                var Gelement = d3.select('#placeHolderCornerBottomLeft-'+that.props.id)
                    .append('g')
                    .attr('transform', function (e,i){ return 'translate(0,0)'})

                Gelement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)
            }
            if (d.id == 'bottomRightCorner' && d.lines.length > 0){
                d3.select('#placeHolderCornerBottomRight-'+that.props.id).attr('transform', 'translate('+(that.BBox.x + totalWidth +25 - (offsetX/2) - offsetWidth)+','+(that.BBox.y+totalHeight +25 - offsetHeight)+')')
                var Gelement = d3.select('#placeHolderCornerBottomRight-'+that.props.id)
                    .append('g')
                    .attr('transform', function (e,i){ return 'translate(0,0)'})

                Gelement.selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> d.colorStroke )
                    .attr('stroke-width', (d)=> d.sizeStroke)

            }

        })

        
       
            
   

    }
    render() {
        return (
            <g id={'background-'+this.props.id} transform={`translate(0,0)`}>


                <g id={'placeHolderCornerTopRight-'+this.props.id} ></g>
                <g id={'placeHolderCornerTopLeft-'+this.props.id} ></g>
                <g id={'placeHolderCornerBottomRight-'+this.props.id} ></g>
                <g id={'placeHolderCornerBottomLeft-'+this.props.id} ></g>


               <g id={'placeHolderBG-'+this.props.id} ></g>
               <g id={'placeHolderBGLeft-'+this.props.id} ></g>
               <g id={'placeHolderBGRight-'+this.props.id} ></g>
               <g id={'placeHolderBGTop-'+this.props.id} ></g>
               <g id={'placeHolderBGBottom-'+this.props.id} ></g>
            </g>
        );
        
    }
}
export default Background;