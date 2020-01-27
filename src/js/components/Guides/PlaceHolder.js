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
        this.isTag = false;
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
        // var pan = new Hammer.Pan({'pointers':1, threshold: 120});
        var swipe = new Hammer.Swipe({threshold: 0, pointers: 1,velocity: 0.1});

        // this.mc.add(pan);
        this.mc.add(swipe);

        // pan.requireFailure(swipe);
        this.mc.on("swipe", function(ev) {
            // console.log('SWIPE', that.props.parent)
            if (ev.pointers[0].pointerType == 'touch'){

                that.props.swipeGroup({'id': that.props.parent.child})

            }
                
        })
        this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                
            }
        })
        this.mc.on("pan", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                // that.pointerMove(ev.srcEvent)
            }
        })
        this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                // that.pointerUp(ev.srcEvent)
            }
        })


        d3.select('#placeHolder-' + this.props.data.id + '-' + this.props.parent.id).on('pointerdown', function(){
            if (d3.event.pointerType == 'pen'){
                that.down = true;
                that.pointerDown(d3.event)
            }
        }) 
        .on('pointermove', function(){
            if (d3.event.pointerType == 'pen'){
                // console.log(that.props.tagHold)
                if (that.props.tagHold && that.down) {
                    that.pointerMove(d3.event);
                    that.isTag = that.props.tagHold;
                }
                else if (that.down) that.pointerMove(d3.event)
            }
        })
        .on('pointerup', function(){
            if (d3.event.pointerType == 'pen'){
                if (that.down) that.pointerUp(d3.event)
                that.isTag = false;
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
            var transformPan = getTransformation(d3.select('#panItems').attr('transform'))
            var transform = getTransformation(d3.select('#item-' + that.props.parent.id).attr('transform'))
            that.tempArrayStroke.push([event.x - transform.translateX - transformPan.translateX, event.y - transform.translateY - transformPan.translateY])
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
        // console.log('GOOO') ;

        if (this.isTag){

            /** JUST TO REMOVE IDS AND MAKE A NEW ONE */
            var firstPoint = [that.tempArrayStroke[0][0], that.tempArrayStroke[0][1]];
            var dataNewTag = JSON.parse(JSON.stringify(this.isTag));
            dataNewTag.id = guid();
            dataNewTag.position = firstPoint;
            dataNewTag.placeHolder[0]['lines'].forEach(element => {element.id = guid() });
            for (var j in dataNewTag.tagSnapped){
                var placeHolderTagSnapped = dataNewTag.tagSnapped[j]['placeHolder'];
                placeHolderTagSnapped[0]['lines'].forEach(element => {element.id = guid()});
            }

            /******** ADD TO THE LINE  ****/

            var data = {
                'idGuide':that.props.parent.id,
                'where':that.props.data.id,
                'data':[{
                    'id': guid(),
                    'data': that.tempArrayStroke,
                    'colorStroke': that.props.colorStroke,
                    'sizeStroke': that.props.sizeStroke,
                    'tag': dataNewTag
                    // 'position': [firstPoint[0],firstPoint[1]]
                }]
            }
            that.props.addLine(data);
            that.tempArrayStroke = [];
            that.down = false;
            that.removeTempLine();
        }
        else if (this.props.penType == 'normal'){
            
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
        // console.log(that.props.parent)
        this.props.updatePlaceHolderGroup({'idGroup': that.props.parent.child, 'model':that.props.parent})
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
        var that = this;
        // console.log('UPDATE', this.props.shouldExpand)
        // this.drawPlaceHolder();
        if (this.props.data.id == 'backgroundLine'){
            if (this.props.parent.tag){
                //     console.log(that.props.parent.tag)
                d3.select('#imageTag-' + that.props.data.id + '-' + that.props.parent.id)
                    .attr('viewBox', '0 0 30 20')
                    .attr('xlink:href', that.props.parent.tag.image)
                    .attr('height', 50)
                    .attr('width', 50)
                    .attr('x', 35)
                    .attr('y',50)
              

                    
            } 
        }
    }
    drawPlaceHolder(){
        
        // console.log(sketch, rec)

        var widthTotal = this.props.parent.width;
        var heightTotal = this.props.parent.height;
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
            // var rec = sketch.rectStroke({ x:100, y:300, width:widthTotal - 300, height:heightTotal - 600, density: 3, sketch:2});
            // var flattened = [].concat(...rec)

            // d3.select('#background-' + that.props.data.id + '-' + that.props.parent.id).selectAll('path')
            //     .data(flattened).enter()
            //     .append('path')
            //     .attr('d', (d)=>{ return d })
            //     .attr('fill', 'none')
            //     .attr('stroke', 'black')
            //     .attr('stroke-width', '0.3')
            //     .style('stroke-linecap', 'round')
            //     .style('stroke-linejoin', 'round')
            //     .style('opacity', 0.1)

            // rect = element
            //     .attr('width', 130)
            //     .attr('height', 80)
            //     .attr('x', 35)
            //     .attr('y',35)
            //     .attr('fill', 'rgba(252, 243, 242,  0.4)')
            //     .style("filter", "url(#drop-shadow)")

                rect = element
                .attr('width', widthTotal - 300)
                .attr('height', heightTotal - 600)
                .attr('x', 100)
                .attr('y',300)
                .attr('fill', 'rgba(247, 247, 247, 0.0)')
                .style("filter", "url(#drop-shadow)")

            // if (this.props.parent.tag){
            //     d3.select('#tag-' + that.props.data.id + '-' + that.props.parent.id)
            //         .attr('width', 50)
            //         .attr('height', 50)
            //         .attr('x', 0)
            //         .attr('y',0)
            //         .attr('fill', 'rgba(247, 247, 247, 0.4)')
            // } 

        }
        else if (this.props.data.id == 'backgroundText'){
            // var rec = sketch.rectStroke({ x:250, y:350, width:widthTotal - 500, height:heightTotal - 700, density: 3, sketch:2});
            // var flattened = [].concat(...rec)
            
            // d3.select('#background-' + that.props.data.id + '-' + that.props.parent.id).selectAll('path')
            //     .data(flattened).enter()
            //     .append('path')
            //     .attr('d', (d)=>{ return d })
            //     .attr('fill', 'none')
            //     .attr('stroke', 'black')
            //     .attr('stroke-width', '0.3')
            //     .style('stroke-linecap', 'round')
            //     .style('stroke-linejoin', 'round')
            //     .style('opacity', 0.1)

            rect = element
            .attr('width', widthTotal - 500)
            .attr('height', heightTotal - 700)
                .attr('x', 250)
                .attr('y', 350)
                .attr('fill', 'rgba(247, 247, 247, 0.0)')
                .style("filter", "url(#drop-shadow)")

            // rect = element
            //     .attr('width', 75)
            //     .attr('height', 40)
            //     .attr('x', 80)
            //     .attr('y', 55 )
            //     .attr('fill', 'rgba(166, 166, 166, 1)')
        }
        else if (this.props.data.id == 'outerBackground'){
            
            // var rec = sketch.rectStroke({ x:0, y:0, width:widthTotal, height:heightTotal, density: 3, sketch:2});
            // var line = d3.line();

            // var flattened = [].concat(...rec);

            // var width = (this.props.shouldExpand) ? 800 : widthTotal;
            // var height = (this.props.shouldExpand) ? 800 : heightTotal;

            // console.log(flattened)

            // d3.select('#background-' + that.props.data.id + '-' + that.props.parent.id).selectAll('path')
            //     .data(flattened).enter()
            //     .append('path')
            //     .attr('d', (d)=>{ return d })
            //     .attr('fill', 'none')
            //     .attr('stroke', 'black')
            //     .attr('stroke-width', '0.3')
            //     .style('stroke-linecap', 'round')
            //     .style('stroke-linejoin', 'round')

            rect = element
                .attr('width', widthTotal)
                .attr('height', heightTotal)
                .attr('x', 0)
                .attr('y',0)
                .attr('fill', 'rgba(247, 247, 247, 0.3)')
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
            rect.attr('stroke', 'rgba(79, 79, 79, 0.15)')
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
                moveTag = {this.props.moveTag}
            />
        });


        return (
            <g id={'placeHolder-' + this.props.data.id + '-' + this.props.parent.id} >
                <rect id={'rect-' + this.props.data.id} />
                <g id={'background-' + this.props.data.id + '-' + this.props.parent.id} >
                </g>

                <rect id={'tag-' + this.props.data.id + '-' + this.props.parent.id} />
                <image id={'imageTag-' + this.props.data.id + '-' + this.props.parent.id} />


               
                <g className='paths'>
                    {listItems}
                </g>
                <path id={'tempStroke-'+this.props.data.id  + '-' + this.props.parent.id} style={{'pointerEvents': 'none' }}/>

                <g id={'tempPattern-'+this.props.data.id  + '-' + this.props.parent.id} style={{'pointerEvents': 'none' }}></g>


               
            </g>
        );
        
    }
}
export default PlaceHolder;