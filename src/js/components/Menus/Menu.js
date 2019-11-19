import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, _getBBox, interpolate, showBboxBB } from "./../Helper";

class Menu extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
       console.log('HEY');
       var that = this;
       var menuOptions = [
        //    'alignMiddle',
           'alignLeft', 
           'alignRight',
           'distribute'
       ]

       var globalElementMenu = d3.select('#item-'+this.props.menu.id)
        .selectAll('g')//.attr('transform', function(d){ return 'translate('+that.props.menu.position[0]+','+that.props.menu.position[1]+')'})
        .data(menuOptions).enter()
        .append('g')
        .attr('transform', function(d, i){ return 'translate('+0+','+(i*50)+')'})
        .on('click', function(d){
            // console.log('CLICK')
            // d3.event.sourceEvent.stopPropagation();
            if (d == 'distribute'){
                that.distributesItemsAlongLine(that.props.menu.idLines, that.props.menu.idGuide)
            }
            if (d == 'alignRight'){
                that.rightALignement(that.props.menu.idLines, that.props.menu.idGuide)
            }
            if (d == 'alignLeft'){
                that.leftALignement(that.props.menu.idLines, that.props.menu.idGuide)
            }
        })

        globalElementMenu.append('rect')
        .attr('width', 40)
        .attr('height', 40)
        .attr('fill', '#D9D9D9FF')

        globalElementMenu.append('text')
        .attr('dy', 25)
        .html(function(d){return d})


       console.log(this.props.menu)
    }
    
    componentDidUpdate(){
      
    }
    rightALignement(idLines, idGuide){
        //Get the BBox 
        var BBox = _getBBox('item-'+idGuide);
        var firstPoint = {'x':BBox.x + BBox.width, 'y': BBox.y};
        // var secondPoint = {'x':BBox.x + BBox.width + transform.translateX, 'y': BBox.y + BBox.height + transform.translateY};
        // interpolate(firstPoint, secondPoint, 0.5);
        idLines.forEach((d)=>{
            var pathLine = d3.select('#item-'+d);
            var BBox2 = _getBBox('item-'+d);
            // var offsetX = firstPoint.x - BBox.x;
            var offsetX = firstPoint.x - BBox2.x;
            var transform = getTransformation(d3.select('#item-'+d).attr('transform'));

            var X = offsetX+transform.translateX;
            var Y = transform.translateY;
            pathLine.attr('transform', 'translate('+X+','+Y+')')
        })
        
    }
    leftALignement(idLines, idGuide){
        //Get the BBox 
        var BBox = _getBBox('item-'+idGuide);
        var firstPoint = {'x':BBox.x, 'y': BBox.y};
        // var secondPoint = {'x':BBox.x + BBox.width + transform.translateX, 'y': BBox.y + BBox.height + transform.translateY};
        idLines.forEach((d)=>{
            var pathLine = d3.select('#item-'+d);
            var BBox2 = _getBBox('item-'+d);
            var offsetX = firstPoint.x - (BBox2.x + BBox2.width);
            var transform = getTransformation(d3.select('#item-'+d).attr('transform'));

            var X = offsetX+transform.translateX;
            var Y = transform.translateY;
            pathLine.attr('transform', 'translate('+X+','+Y+')')
        })
        
    }
    distributesItemsAlongLine(idLines, idGuide){
        var pathItem = d3.select('#'+idGuide);
        var length = pathItem.node().getTotalLength();
        // console.log(length)
        var numberSeparation = idLines.length;
        var arrayPosition = [];

        var transform = getTransformation(d3.select('#item-'+idGuide).attr('transform'));
            // console.log(path)
// var point = interpolate(firstPoint, secondPoint, itr);
        for (var i=1; i < numberSeparation+1; i++){
            //Get g transform
            
            var pointLength = Math.floor(length/numberSeparation) * i;
            // console.log(pointLength)
            var position = pathItem.node().getPointAtLength(pointLength);
            position.x += transform.translateX;
            position.y += transform.translateY;
            arrayPosition.push({'position': position, 'idLine': idLines[i-1]});
        }


        //Apply transformation du G au dessus

        arrayPosition.forEach((d)=>{
            //Get the line
            var pathLine = d3.select('#item-'+d['idLine']);
            //Get the BBox 
            var BBox = _getBBox(d['idLine'])
            
            //Apply the thing
            var X = d['position'].x - BBox.width/2; // minus their position
            var Y = d['position'].y - BBox.height/2;// + transform.translateY;
            // console.log(X,Y)
            pathLine.attr('transform', 'translate('+X+','+Y+')')
        })

    }
   
    render() {
        return (
            <g id={'item-'+this.props.menu.id} transform={`translate(${this.props.menu.position[0]},${this.props.menu.position[1]})`}>
            </g>
        );
        
    }
}
export default Menu;