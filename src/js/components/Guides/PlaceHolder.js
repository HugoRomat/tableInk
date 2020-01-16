import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation, guid, simplify, _getBBoxPromise, distance, drawCircle } from "../Helper";
import LinePlaceHolder from "./LinePlaceHolder";
import PlaceHolderText from "./PlaceHolderText";
import {d3sketchy} from './../../../../customModules/d3.sketchy'

class PlaceHolder extends Component {
    constructor(props) {
        super(props);
        this.down = false;
        this.tempArrayStroke = [];
        this.lastStepTagPattern = 0;
    }
    // componentDidMount(){
    //     console.log(this.props.data)
    // }
    
    componentDidMount(){

        this.drawPlaceHolder();
        // console.log(this.props.data)
        var that = this;

        var el = document.getElementById('placeHolder-' + this.props.data.id + '-' + this.props.parent.id);
        this.mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':1, threshold: 1});
        this.mc.add(pan);

        this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                that.pointerDown(ev.srcEvent)
            }
        })
        this.mc.on("pan", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                that.pointerMove(ev.srcEvent)
            }
        })
        this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                that.pointerUp(ev.srcEvent)
            }
        })


      
        
    }
    pointerDown(event){
        this.lastMovePosition = {'x':0, 'y':0};

        // var that = this;
        // if (this.props.data.id == 'outerBackground'){
        //     d3.select('#background-outerBackground-' + that.props.parent.id).attr('opacity', 1)
        //     d3.select('#background-backgroundLine-' + that.props.parent.id).attr('opacity', 0)
        //     d3.select('#background-backgroundText-' + that.props.parent.id).attr('opacity', 0)
        // }
        // if (this.props.data.id == 'backgroundLine'){
        //     d3.select('#background-outerBackground-' + that.props.parent.id).attr('opacity', 0)
        //     d3.select('#background-backgroundLine-' + that.props.parent.id).attr('opacity', 1)
        //     d3.select('#background-backgroundText-' + that.props.parent.id).attr('opacity', 0)
        // }
        // if (this.props.data.id == 'backgroundText'){
        //     d3.select('#background-outerBackground-' + that.props.parent.id).attr('opacity', 0)
        //     d3.select('#background-backgroundLine-' + that.props.parent.id).attr('opacity', 0)
        //     d3.select('#background-backgroundText-' + that.props.parent.id).attr('opacity', 1)
        // } 
    }
    pointerMove(event){
        var that = this;
        if (that.props.penType == 'normal'){
            // console.log('#item-' + that.props.parent.id)
            var transform = getTransformation(d3.select('#item-' + that.props.parent.id).attr('transform'))
            that.tempArrayStroke.push([event.x - transform.translateX, event.y - transform.translateY])
            that.drawLine();
        } 
        else {
            var transform = getTransformation(d3.select('#item-' + that.props.parent.id).attr('transform'))
            that.tempArrayStroke.push([event.x - transform.translateX, event.y - transform.translateY])
            that.drawLinePattern ();
            /*var dist = distance(that.lastMovePosition.x, event['x'], that.lastMovePosition.y, event['y']);

            if (dist > that.props.patternPenData.BBox.width){
                that.lastMovePosition = {'x': event['x'],'y': event['y']};
                that.props.patternPenData.strokes.forEach((d)=>{
                    var X = event['x'] + d.position[0] - this.props.parent.position[0];
                    var Y = event['y'] + d.position[1] - this.props.parent.position[1];

                    var points = d.points.map((d)=>[d[0]+X, d[1]+Y])
                    var data = {
                        'idGuide':that.props.parent.id,
                        'where':that.props.data.id,
                        'data':[{
                            'id': guid(),
                            'data': points,
                            'colorStroke': that.props.colorStroke,
                            'sizeStroke': that.props.sizeStroke,
                            'type': 'pattern-' + event.pointerId
                            // 'pattern': d.points
                        }]
                    }
                    console.log(event.pointerId)
                    that.props.addLine(data);
                })
            }*/
        }
    }
    pointerUp(event){
        var that = this;
        console.log('GOOO') 
        if (this.props.penType == 'normal'){
            
            var data = {
                'idGuide':that.props.parent.id,
                'where':that.props.data.id,
                'data':[{
                    'id': guid(),
                    'data': that.tempArrayStroke,
                    'colorStroke': that.props.colorStroke,
                    'sizeStroke': that.props.sizeStroke,
                    'type': 'normal'
                    // 'position': [firstPoint[0],firstPoint[1]]
                }]
            }
            that.props.addLine(data);
            that.tempArrayStroke = [];
            that.down = false;
            that.removeTempLine();
        } else {

            var data = {
                'idGuide':that.props.parent.id,
                'where':that.props.data.id,
                'data':[{
                    'id': guid(),
                    'data': that.tempArrayStroke,
                    'colorStroke': that.props.colorStroke,
                    'sizeStroke': that.props.sizeStroke,
                    'type': 'pattern',
                    'pattern': that.props.patternPenData
                    // 'position': [firstPoint[0],firstPoint[1]]
                }]
            }
            that.props.addLine(data);
            that.tempArrayStroke = [];
            that.down = false;
            that.removeTempLine();

        }
    }
    removeTempLine(){
        var that = this;
        var line = d3.line()
        d3.select('#tempStroke-' + that.props.data.id + '-' + this.props.parent.id).attr("d", null)
        d3.select('#tempPattern-' + that.props.data.id + '-' + this.props.parent.id).selectAll('*').remove();
        
    }
    drawLinePattern(){
        
        var that = this;
        var line = d3.line()
       

        // console.log('DRAWPATTERN')

        d3.select('#tempStroke-' + this.props.data.id  + '-' + this.props.parent.id)
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', that.props.colorStroke)
            .attr('stroke-width', that.props.sizeStroke)
            .attr("stroke-dasharray", 'none')
            .attr("opacity", '1');

        var step = that.props.patternPenData.BBox.width;
        var path = d3.select('#tempStroke-' + this.props.data.id  + '-' + this.props.parent.id).node()
        var length = path.getTotalLength();

        // console.log(that.props.patternPenData.strokes)
        
        if (length - this.lastStepTagPattern > step){
            d3.select('#tempPattern-' + that.props.data.id + '-' + that.props.parent.id).selectAll('*').remove();
            this.lastStepTagPattern = length;
            for (var i = 0; i < length; i += step){
                var point = path.getPointAtLength(i);
                // console.log(that.props.patternPenData.BBox.width)
                var X = point['x']- that.props.patternPenData.BBox.width/2; // + that.props.parent.position[0];
                var Y = point['y']- that.props.patternPenData.BBox.height/2// + that.props.parent.position[1];
                // console.log('GO')
                var container = d3.select('#tempPattern-' + this.props.data.id  + '-' + this.props.parent.id).append('g').attr('transform', 'translate('+X+','+Y+')')

                // container.append('rect')
                //     .attr('x', 0)
                //     .attr('y', 0)
                //     .attr('width', that.props.patternPenData.BBox.width)
                //     .attr('height', that.props.patternPenData.BBox.height)
                //     .attr('fill', 'none')
                //     .attr('stroke', 'red')
                // console.log('GO')

                for (var j = 0; j < that.props.patternPenData.strokes.length; j += 1){
                    var element = that.props.patternPenData.strokes[j];
                    // console.log(element)
                    container.append('g').attr('transform', 'translate('+(element.position[0]) +','+(element.position[1])+')')
                        .append('path')
                        .attr('d', (d)=>line(element.points))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.data.colorStroke )
                        .attr('stroke-width', element.data.sizeStroke)
                }    
            }
        }


    }
    drawLine(){
        var that = this;
        var line = d3.line()
        // console.log('DRAW')
        d3.select('#tempStroke-' + this.props.data.id  + '-' + this.props.parent.id)
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', that.props.colorStroke)
            .attr('stroke-width', that.props.sizeStroke)
            .attr("stroke-dasharray", 'none')
            .attr("opacity", '1');
        
    }
    componentDidUpdate(prevProps, prevState){
    }
    drawPlaceHolder(){
        
        // console.log(sketch, rec)

        var widthTotal = 200//this.props.parent.width;
        var heightTotal = 200//this.props.parent.height;
        // console.log(this.props.parent.width)
        var that = this;

        var widthContainer = 25;
        //Si j'udpate la BBox
        // if (this.props.BBoxParent != prevProps.BBoxParent){
            // console.log('UPDATE BOX', that.props.data.id);
        // var height = 70;//this.props.BBoxParent.height;
        var size = 50;
        // var width = 5//this.props.BBoxParent.width;
        var element = d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).select('rect');
        var rect = null;
        var sketch = d3sketchy()

        if (this.props.data.id == 'backgroundLine'){
            var rec = sketch.rectStroke({ x:35, y:35, width:130, height:80, density: 3, sketch:2});
            var flattened = [].concat(...rec)

            d3.select('#background-' + that.props.data.id + '-' + that.props.parent.id).selectAll('path')
                .data(flattened).enter()
                .append('path')
                .attr('d', (d)=>{ return d })
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', '0.3')
                .style('stroke-linecap', 'round')
                .style('stroke-linejoin', 'round')
                .style('opacity', 0.1)

            rect = element
                .attr('width', 130)
                .attr('height', 80)
                .attr('x', 35)
                .attr('y',35)
                .attr('fill', 'rgba(252, 243, 242,  0.4)')
                .style("filter", "url(#drop-shadow)")

            // rect = element
            //     .attr('width', 130)
            //     .attr('height', 80)
            //     .attr('x',35)
            //     .attr('y', 35 )
            //     .attr('fill', 'rgba(166, 166, 166, 1)')
        }
        else if (this.props.data.id == 'backgroundText'){
            var rec = sketch.rectStroke({ x:80, y:55, width:75, height:40, density: 3, sketch:2});
            var flattened = [].concat(...rec)
            
            d3.select('#background-' + that.props.data.id + '-' + that.props.parent.id).selectAll('path')
                .data(flattened).enter()
                .append('path')
                .attr('d', (d)=>{ return d })
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', '0.3')
                .style('stroke-linecap', 'round')
                .style('stroke-linejoin', 'round')
                .style('opacity', 0.1)

            rect = element
                .attr('width', 75)
                .attr('height', 40)
                .attr('x', 80)
                .attr('y',55)
                .attr('fill', 'rgba(252, 243, 242,  0.4)')
                .style("filter", "url(#drop-shadow)")

            // rect = element
            //     .attr('width', 75)
            //     .attr('height', 40)
            //     .attr('x', 80)
            //     .attr('y', 55 )
            //     .attr('fill', 'rgba(166, 166, 166, 1)')
        }
        else if (this.props.data.id == 'outerBackground'){
            
            var rec = sketch.rectStroke({ x:0, y:0, width:widthTotal, height:heightTotal, density: 3, sketch:2});
            var line = d3.line();

            var flattened = [].concat(...rec)

            // console.log(flattened)

            d3.select('#background-' + that.props.data.id + '-' + that.props.parent.id).selectAll('path')
                .data(flattened).enter()
                .append('path')
                .attr('d', (d)=>{ return d })
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', '0.3')
                .style('stroke-linecap', 'round')
                .style('stroke-linejoin', 'round')

            rect = element
                .attr('width', widthTotal)
                .attr('height', heightTotal)
                .attr('x', 0)
                .attr('y',0)
                .attr('fill', 'rgba(252, 243, 242, 0.4)')
                .style("filter", "url(#drop-shadow)")

            
			// var svg = d3.select("#svg");
			// var sketchy = d3sketchy();
			// sketchy.rectStroke({svg:svg, x:50, y:50, width:100, height:100, density:3, sketch:2});

        
            

            /*for (var i in rec){
                var path = rec[i];
                console.log(path)
            }
            rect = element
                .attr('width', widthTotal)
                .attr('height', heightTotal)
                .attr('x', 0)
                .attr('y',0)
                .attr('fill', 'rgba(94, 130, 237, 0.4)')
                .style("filter", "url(#drop-shadow)")*/
        }
        
        if (rect != null){
            rect.attr('stroke', 'grey')
            rect.attr('opacity', 1.0)
                .attr('stroke-width', '1')

          }
        // }
    }
   
    render() {

        const listItems = this.props.lines.map((d, i) => {
            return <LinePlaceHolder 
                key={i} 
                stroke={d}
                colorStroke = {this.props.colorStroke}
                sizeStroke = {this.props.sizeStroke}
            />
        });


        return (
            <g id={'placeHolder-' + this.props.data.id + '-' + this.props.parent.id} >
                <rect id={'rect-' + this.props.data.id} />
                <g id={'background-' + this.props.data.id + '-' + this.props.parent.id} >
                </g>

                <path id={'tempStroke-'+this.props.data.id  + '-' + this.props.parent.id} style={{'pointerEvents': 'none' }}/>

                <g id={'tempPattern-'+this.props.data.id  + '-' + this.props.parent.id} style={{'pointerEvents': 'none' }}></g>

                <g className='paths'>
                    {listItems}
                </g>

               
            </g>
        );
        
    }
}
export default PlaceHolder;