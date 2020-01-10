import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import {d3sketchy} from './../../../../customModules/d3.sketchy'
import { _getBBoxPromise, showBboxBB, getTransformation, getBoundinxBoxLines } from "../Helper";


class VoiceQuery extends Component {
    constructor(props) {
        super(props);
        this.tempArrayStroke = [];
    }
    componentDidMount(){
        var that = this;
        this.drawBackground()
        var el = document.getElementById('item-'+this.props.query.id);
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
                that.pointerUp(ev.srcEvent);
                that.colorText();
            }
        })
    } 
    pointerDown(event){
        this.lastMovePosition = {'x':0, 'y':0};

    }
    pointerMove(event){
        var that = this;
            // console.log('#item-' + that.props.parent.id)
            var transform = getTransformation(d3.select('#item-' + that.props.query.id).attr('transform'))
            that.tempArrayStroke.push([event.x - transform.translateX, event.y - transform.translateY])
            that.drawLine();
        
       
    }
    pointerUp(event){
        var that = this;


        // var data = {
        //     'idGuide':that.props.parent.id,
        //     'where':that.props.data.id,
        //     'data':[{
        //         'id': guid(),
        //         'data': that.tempArrayStroke,
        //         'colorStroke': that.props.colorStroke,
        //         'sizeStroke': that.props.sizeStroke,
        //         'type': 'normal'
        //         // 'position': [firstPoint[0],firstPoint[1]]
        //     }]
        // }
        // that.props.addLine(data);
        // that.tempArrayStroke = [];
        that.down = false;
        // that.removeTempLine();
    }
    colorText(){
        var line = d3.line()
        var that = this;
        var flattened = [].concat(...this.props.query.inkDetection);
        var result = flattened.filter(x => x.text == this.props.query.content);

        // console.log(result)
        // var transform = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
        var linesG = result.map((d)=> d.idLine)
        // console.log(linesG)

        for (var i in linesG){
            var tempStroke = JSON.parse(JSON.stringify(that.tempArrayStroke));
            getBoundinxBoxLines(linesG[i]).then((BB) => {
                // var scaleX = this.tempArrayStroke
                // console.log(tempStroke)
                var myScaleX = d3.scaleLinear().domain([tempStroke[0][0], tempStroke[tempStroke.length-1][0]]).range([BB.x, BB.x + BB.width]);
                var myScaleY = d3.scaleLinear().domain([tempStroke[0][1], tempStroke[tempStroke.length-1][1]]).range([BB.y, BB.y + BB.height]);
                
                
                
                
                tempStroke = tempStroke.map((e)=> {
                    // return [e[0]+ 50, e[1] + 50 ]
                    return [myScaleX(e[0]), myScaleY(e[1])]
                })
            
                // for (var i = 0; i < lines.length; i += 1){
                    // var myLine = lines[i]
                    d3.select('#tempGroup').append('path')
                        .attr('d', ()=>line(tempStroke))
                        .attr('fill', 'none')
                        .attr('stroke', ()=> 'red' )
                        .attr('stroke-width', '20')
                // }
            
            })

            // lines.forEach((line)=>{
            //     line.data = line.data.map((e)=> {
            //         return [myScaleX(e[0] + d.BBox.x) - transform.translateX, myScaleY(e[1] + d.BBox.y) - transform.translateY]
            //     })
            // })
            // console.log(lines)
            
    
        }
        
        // console.log(result)
    }
    removeTempLine(){
        var that = this;
        var line = d3.line()
        d3.select('#tempStroke-' + that.props.query.id).attr("d", null)
        
    }
    drawLine(){
        var that = this;
        var line = d3.line()
        d3.select('#tempStroke-' + that.props.query.id)
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', '10')
            .attr("stroke-dasharray", 'none')
            .attr('stroke-linejoin', "round")
        
    }
    drawBackground(){
        var that = this;
        var sketch = d3sketchy()

        _getBBoxPromise('item-'+this.props.query.id).then((BB) =>{
            // console.log(d)
            // showBboxBB(d, 'red')
            var rec = sketch.rectStroke({ x:0, y:0, width:BB.width + 40, height:BB.height + 40, density: 3, sketch:2});
            var flattened = [].concat(...rec)

            d3.select('#background-' + that.props.query.id).append('rect')
            .attr('width', BB.width + 40)
            .attr('height', BB.height + 40)
            .attr('x', 0)
            .attr('y',0)
            .attr('fill', 'rgba(252, 243, 242, 1)')
            .style("filter", "url(#drop-shadow)")
            
            d3.select('#background-' + that.props.query.id).selectAll('path')
                .data(flattened).enter()
                .append('path')
                .attr('d', (d)=>{ return d })
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', '0.3')
                .style('stroke-linecap', 'round')
                .style('stroke-linejoin', 'round')

               
        })
        d3.select('#item-'+that.props.query.id).on('contextmenu', function(){
            d3.event.preventDefault();
        })
    }
    
    render() {
        // console.log('=============', 'HELLO')
        
       
        return (
            <g id={'item-'+this.props.query.id} transform={`translate(${this.props.query.position[0]},${this.props.query.position[1]})`}>

                <g id={'background-'+this.props.query.id} transform={`translate(-20,-30)`}>
                </g>
                <text> {this.props.query.content}</text>
                <path id={'tempStroke-'+this.props.query.id} style={{'pointerEvents': 'none' }}/>
            </g>
        );
        
    }
}
export default VoiceQuery;