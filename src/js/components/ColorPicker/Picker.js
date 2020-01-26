
import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';

import { 
    addPaletteLine
  } from './../../actions';
import LinePalette from "./LinePalette";
import {d3sketchy} from './../../../../customModules/d3.sketchy'
import { _getBBoxPromise, guid, checkIfSomething, drawCircle, distance } from "../Helper";
// import strokesJSON from './../../usecases/paletteLine.json';
import paletteSVG from './../../../../static/palette.svg'

const mapDispatchToProps = { 
    addPaletteLine
};
const mapStateToProps = (state, ownProps) => {  
    return { 
        colorPalette: state.rootReducer.present.colorPalette,
    };
  };


class Picker extends Component {
    constructor(props) {
        super(props); 

        this.tempArrayStroke = [];
        this.startPosition = {'x': 0, 'y':0}
        this.color = 'black';
        this.size = 10;
        this.elementSelected = null;
        this.isDrawing = false;

        this.offsetX = -250;
        this.offsetY = -130;
    }
    htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }
    componentDidMount(){
        var that = this;
        this.drawBG()
        this.interaction();
        this.setInteractionRectangle();

        _getBBoxPromise('colorPalette').then((d)=>{
            that.startPosition = d;
        })
        this.color = this.props.colorStroke;
        this.size = this.props.sizeStroke;
    } 
    setInteractionRectangle(){
        var that = this;
        var el = document.getElementById('overlayGestures');
        this.mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':1, 'threshold': 0});
        this.mc.add(pan);


        var initialPoint = null;
        this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'touch'){
                initialPoint = ev.pointers[0];
            } 
        })
        this.mc.on("panmove", function(ev) {
            if (that.isDrawing == false) var item = d3.select('#'+that.elementSelected).select('.nonfake');
            else var item = d3.select('#pathPalette')
            console.log(item.empty())
            if (item.empty() == false){
                var strokeWidth = parseFloat(item.attr('stroke-width'));
                var color = d3.rgb(item.attr('stroke'));
                // var opacity = color.opacity;
                // console.log(strokeWidth,ev.pointers[0].pointerType )
    
                if (ev.pointers[0].pointerType == 'touch'){
                    var angle = Math.atan2(initialPoint.y-ev.pointers[0].y, initialPoint.x-ev.pointers[0].x) * 180 / Math.PI;
                    var dist = distance(initialPoint.x, ev.pointers[0].x, initialPoint.y, ev.pointers[0].y);
                    if (dist > 10){
                        initialPoint = ev.pointers[0];
                        var absAngle = Math.abs(angle);
                        // console.log(absAngle)
                        /* LEFT */
                        if (absAngle < 45){
                            color.opacity -= 0.05;
                            
                            if (color.opacity > 0 && color.opacity < 1) {
                                that.color = color;
                                item.attr('stroke', color.toString());
                            }
                        } 
                        /* TOP */
                        else if (absAngle < 135 && Math.sign(angle) == 1){
                            strokeWidth += 0.5;
                            that.size += 0.5;
                            // console.log('top', strokeWidth)
                            item.attr('stroke-width', strokeWidth)
    
                            // console.log(strokeWidth)
                        } 
                        /* BOTTOM */
                        else if (absAngle < 135 && Math.sign(angle) == -1){
                            strokeWidth -= 0.5;
                            that.size -= 0.5;
                            // console.log('bottom', strokeWidth)
                            item.attr('stroke-width', strokeWidth)
                        } 
                        /* RIGHT */
                        else if (absAngle < 180){
                            color.opacity += 0.05;
                            
                            if (color.opacity > 0 && color.opacity < 1) {
                                that.color = color;
                                item.attr('stroke', color.toString());
                            }
                        }
                    }
                } 
            }
        })
        this.mc.on("panend", function(ev) {
            // console.log(that.elementSelected)
            if (that.elementSelected != null){
                that.selectItem(that.elementSelected);
                d3.select('#overlayGestures').attr('width', 0).attr('height', 0)
                that.elementSelected = null;
            }
           
        })
    }
    interaction(){
        var that = this;
        var el = document.getElementById('colorPalette');
        this.mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':0, 'threshold': 0});
        var press = new Hammer.Press({time: 250});
        var tap = new Hammer.Tap({'pointers':1});

        this.mc.add(pan);
        this.mc.add(press);
        this.mc.add(tap);
        pan.recognizeWith(tap);
        this.mc.on("panstart", function(ev) {
            // console.log('GO')
            if (ev.pointers[0].pointerType == 'touch'){
                
            }
            if (ev.pointers[0].pointerType == 'pen' ){
                d3.select('#overlayGestures').attr('width', window.innerWidth - 300).attr('height', window.innerHeight)
                that.isDrawing = true;
            }
            
        })
        this.mc.on("panmove", function(ev) {
            
            if (ev.pointers[0].pointerType == 'touch'){
               
            }
            if (ev.pointers[0].pointerType == 'pen'){
                // console.log(ev.srcEvent.x)

                /* ADD OFFSET FOR THE PALETTE */
                var X = ev.pointers[0].x - that.startPosition.x - 240;
                var Y = ev.pointers[0].y - that.startPosition.y - 70;
                that.tempArrayStroke.push([X, Y]);
                that.drawTempStroke();
            }
        })
        this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'pen' ){
                that.addStroke();
                that.tempArrayStroke = []
                that.removeTempStroke();
                d3.select('#overlayGestures').attr('width', 0).attr('height', 0);
                that.isDrawing = false;
            }
        })
        this.mc.on('press', function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                // console.log('PRESS')
                d3.select('#overlayGestures').attr('width', window.innerWidth - 300).attr('height', window.innerHeight)

                d3.select('.linesPalette').selectAll('.fake').style('pointer-events', 'auto')
                var element = document.elementFromPoint(ev.pointers[0]['x'], ev.pointers[0]['y']);
                if (element.tagName == 'path' && element.className.baseVal == "fake"){
                    var id = element.id.split('-')[1];
                    var idNormal = 'palette-'+id;
                    that.selectItem(idNormal);
                    that.elementSelected = idNormal;
                }
                d3.select('.linesPalette').selectAll('.fake').style('pointer-events', 'none')
            }
        })
        this.mc.on('pressup', function(ev) {
            // if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
            if (that.elementSelected != null){
                that.selectItem(that.elementSelected);
                d3.select('#overlayGestures').attr('width', 0).attr('height', 0)
                that.elementSelected = null;
            }
        })

        d3.select('#colorPalette')
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })

        this.mc.on("tap", function(ev) {
            console.log('TAP')
            if (ev.pointers[0]['pointerType'] == 'touch' || ev.pointers[0]['pointerType'] == 'pen'){
                d3.select('.linesPalette').selectAll('.fake').style('pointer-events', 'auto')
                var element = document.elementFromPoint(ev.pointers[0]['x'], ev.pointers[0]['y']);
                if (element.tagName == 'path' && element.className.baseVal == "fake"){
                    var id = element.id.split('-')[1];
                    var idNormal = 'palette-'+id;
                    that.selectItem(idNormal);
                }
                d3.select('.linesPalette').selectAll('.fake').style('pointer-events', 'none')
            }
        })

    }
    selectItem(element){
        // d3.select('#'+element).select('.nonfake').attr('stroke', 'red')
        console.log( d3.select('#'+element).select('.nonfake').attr('stroke-width'))
        d3.selectAll('.fake').attr('stroke-opacity', "0")
        d3.select('#'+element).select('.fake')
                        .attr('stroke-opacity', "0.1")
                        .attr('stroke-width', function(d, i){
                            var strokeSize = parseFloat(d3.select('#'+element).select('.nonfake').attr('stroke-width'))
                            if (parseFloat(d3.select('#'+element).select('.nonfake').attr('stroke-width')) > 10){
                                return strokeSize *2
                            } else {
                                return strokeSize * 5
                            }
                        }) 
                        .attr('stroke', 'grey')

        // console.log(d3.select('#'+element).select('.fake').node())

        d3.selectAll('.pen').each(function (d){
            d3.select(this).attr('selected', 'false')
            d3.select(this).transition().duration(500).style('right', '0px');
        })
        d3.selectAll('.colorPen').each(function (d){
            d3.select(this).attr('selected', 'false')
            d3.select(this).transition().duration(500).style('right', '0px');
        })

        // console.log(d3.select('#'+element).select('.nonfake').attr('stroke-width'))
        this.props.selectColorSize({
            'size':d3.select('#'+element).select('.nonfake').attr('stroke-width'),
            'color':d3.select('#'+element).select('.nonfake').attr('stroke')
        })
        this.size = parseFloat(d3.select('#'+element).select('.nonfake').attr('stroke-width'))
        this.color = d3.select('#'+element).select('.nonfake').attr('stroke')
    }
    removeTempStroke(){
        var line = d3.line()
        d3.select('#pathPalette').attr("d", line([]))
    }
    drawTempStroke(){
        var that = this;
        var line = d3.line()
        // console.log(that.color)
        d3.select('#pathPalette')
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', that.color)
            .attr('stroke-width', that.size)
            .attr("stroke-dasharray", 'none')
            .attr('stroke-linejoin', "round")
    }
    addStroke(){
        if (this.tempArrayStroke.length > 1){
            var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
            var arrayPoints = JSON.parse(JSON.stringify(this.tempArrayStroke));
            var id = guid();
            arrayPoints.forEach((d)=>{
                d[0] = d[0] - firstPoint[0];
                d[1] = d[1] - firstPoint[1]
            })
            // console.log(JSON.stringify(arrayPoints))
            var data = {
                'points': arrayPoints, 
                'data': {'class':[], 'sizeStroke': this.size, 'colorStroke': this.color}, 
                'id':  id, 
                'position': [firstPoint[0],firstPoint[1]]
            }

            
            this.props.addPaletteLine(data);
            this.selectItem('palette-'+id);
        }
        
    }
    componentDidUpdate(nextProps){
        // console.log(this.props)
        this.color = this.props.colorStroke;
        this.size = this.props.sizeStroke;
        // if (nextProps.isHoldingCanvas != this.props.isHoldingCanvas){
            
            if (this.props.isHoldingCanvas){
                this.size = this.props.isHoldingCanvas.size;
                this.color = this.props.isHoldingCanvas.color;
            } 
        // } 
        // console.log(this.props.isHoldingCanvas, this.size, this.color)
       
    }
    drawBG(){
        var that = this;
        // var sketch = d3sketchy()
        
        // var rec = sketch.rectStroke({ x:0, y:0, width:300, height:window.innerHeight - 390, density: 3, sketch:2});
        // var flattened = [].concat(...rec)

       
       

        // d3.select('#colorPalettePaths').append('rect')
        //     .attr('width', 300)
        //     .attr('height', window.innerHeight - 390)
        //     .attr('x', 0)
        //     .attr('y',0)
        //     .attr('fill', 'rgba(252, 243, 242,  0.4)')
        //     .style("filter", "url(#drop-shadow)")
            

             
        var newNode = d3.select('#colorPalettePaths')
            .append('g').attr('id', 'pathEventReceiverPalette')
            .attr('transform', 'translate('+that.offsetX+','+that.offsetY+')scale(1)')
            
            // .append('g').attr('id', 'pathEventReceiverPalette').attr('transform', 'translate(50,900)scale(6)rotate(-120)').attr('stroke', 'black').attr('fill', 'none').style('pointer-events', 'none')


        var td = this.htmlToElement(paletteSVG);
        d3.select(td.childNodes[1]).attr('id', 'pathPaletteSVG')
        newNode.node().append(td.childNodes[1])
        d3.select('#pathPaletteSVG').attr('stroke', 'black').attr('fill', 'rgba(252, 243, 242,  0.4)').style("filter", "url(#drop-shadow)")//.style('pointer-events', 'none')
        
        
        var td = this.htmlToElement(paletteSVG);
        d3.select(td.childNodes[2]).attr('id', 'holePaletteSVG')
        newNode.node().append(td.childNodes[2])
        d3.select('#holePaletteSVG').attr('stroke', 'black').attr('fill', 'white')
        

        // d3.select('#colorPalettePaths').selectAll('path')
        //     .data(flattened).enter()
        //     .append('path')
        //     .attr('d', (d)=>{ return d })
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black')
        //     .attr('stroke-width', '0.3')
        //     .style('stroke-linecap', 'round')
        //     .style('stroke-linejoin', 'round')
        //     .style('opacity', 0.4)

    }
   
    setSelection(){
        d3.select('#selection-'+that.props.stroke.id)
        .attr("d", line(that.props.stroke['points']))
        .attr('fill', 'none')
        .attr('stroke', that.props.stroke.data.colorStroke)
        .attr('stroke-width', 1)
        .attr('stroke-linejoin', "round")
        .attr('stroke-opacity', '0.3')
    }
    render() {
        // console.log(this.props.colorPalette)

        // console.log(JSON.stringify(this.props.colorPalette.lines))
        const listItems = this.props.colorPalette.lines.map((d, i) => {
                return <LinePalette 
                    key={i} 
                    stroke={d}
            />
        });
        var X = window.innerWidth - 290;
        var Y = 600;
        return (

            <g id="colorPalette" transform={`translate(${X},${Y})`}>
                <g id="colorPalettePaths" >
                    
                    </g>
                <g className="templinesPalette"><path id="pathPalette" /></g>
                <g className="linesPalette">{listItems}</g>
                <rect id='overlayGestures' width={0} height={0} x={-X} y={-Y} fill={'red'} opacity={0}/>
               
            </g>
           
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Picker);