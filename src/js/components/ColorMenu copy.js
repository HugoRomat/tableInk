import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import paper, { Path } from 'paper';
import $ from 'jquery';

import highlighter from './../../../static/highlighter.svg';
import pencil from './../../../static/pencil.svg';
import pen from './../../../static/pen.svg';
import { 
    
} from './../actions';


const mapDispatchToProps = { 
    
 };
const mapStateToProps = (state, ownProps) => {  
    return { 
        dataset: state.rootReducer.present.dataset, 
    };
  };

class ColorsMenu extends Component {

    constructor(props) {
        super(props);
        this.handedness = 'right'
    }
    componentDidMount(){

        var that = this;
        var colors = ['#ffc125', '#ff7f00', '#dc143c', '#8B4513', "#1e90ff", '#00c5cd', "#3cb371", "#BA55D3", "#000000"];
        var pens = [{size:2, color: '#1e90ff', opacity:0.7}, {size:7, color: '#1e90ff', opacity:0.7}, {size:20, color: '#1e90ff', opacity:0.3}];
        
        // create the color elements
        var color = d3.select('#colorsMenu').selectAll('.colorCircles').data(colors).enter()
            .append('g')//.attr('transform', (d,i) => 'translate(0,' + (i*50) + ')')
            .attr('transform', (d,i) => {
                if (i == 4 && that.handedness == 'right') return 'translate(50,' + (i*50) + ')';
                else if (i == 4) return 'translate(-50,' + (i*50) + ')';
                return 'translate(0,' + (i*50) + ')';
            })
            .attr('class', 'colorCircles')

           
        // fill the color circles and background circles
        color.append('circle')
            .attr('r', 20).attr('fill', (d)=>{ return d })
            .attr('stroke', (d)=>{ return '#cccccc' })
            .attr('stroke-width', (d)=>{ return 5 })

        color.on("pointerdown", function(d, i)  {
           
            if ((d3.event.pointerType == 'mouse' || d3.event.pointerType == 'pen' || d3.event.pointerType == 'touch') && that.itemSelected != undefined) {
                that.props.changeColorStroke(d, pens[that.itemSelected.index]['opacity']);
                
                if (that.itemSelected.index == 2) that.itemSelected.node.selectAll('path').attr('opacity', pens[that.itemSelected.index].opacity)

                pens.forEach((p)=>{
                    p.color = d;
                })

                d3.selectAll('.colorCircles')
                    .transition()
                    .delay(0) 
                    .duration(100).attr('transform', (d,i) => { 
                        return 'translate(0,' + (i*50) + ')'
                    })

                var translate = d3.select(this).attr("transform").substring( d3.select(this).attr("transform").indexOf("(")+1,  d3.select(this).attr("transform").indexOf(")")).split(",");
                // console.log(translate)
                d3.select(this).transition()
                    .delay(150) 
                    .duration(100)
                    .attr("transform", function(d,i){
                        if (that.handedness == 'right')return 'translate(50,'+(translate[1]) +')'
                        return 'translate(-50,'+(translate[1]) +')'
                    })
            }
            // if (d3.event.pointerType == 'touch'){
                // this.props.selectByColor({'color': d});
            // }
        })


        var size = d3.select('#pensMenu').selectAll('.pensCircles').data(pens).enter()
            .append('g').attr('transform', function(d,i){
                if (that.handedness == 'right' && i == 0 ) return 'translate(20,' + (i*100) + ')';
                else if (that.handedness == 'right'){
                    that.itemSelected = {node:d3.select(this), index:0};
                    return 'translate(-30,' + (i*100) + ')'
                }
                else if (i != 0) return 'translate(0,' + (i*100) + ')';
                else {
                    that.itemSelected = {node:d3.select(this), index:0};
                    return 'translate(-50,' + (i*100) + ')'
                };
            })
            .attr('class', 'pensCircles')
            
        // size.append('circle')
        //     .attr('r', 20).attr('fill', 'white')
        //     .attr('stroke', (d)=>{ return '#cccccc' })
        //     .attr('stroke-width', (d)=>{ return 0 })

        size.append('g').attr("transform", 'translate(0,0)scale(1)')
            // .attr('id', function(d,i){return 'penSize' + d})
            .attr("color", function(d,i){
                var object = this;

                if (d.size == 20){
                    // console.log(highlighter)
                    var container = d3.select(this).attr("transform", 'translate(80,-80)scale(2)rotate(45)')
                    if (that.handedness == 'right') container = d3.select(this).attr("transform", 'translate(0,0)scale(2)rotate(225)')
                    $(d3.select(object).node()).append(highlighter);
                    // container.selectAll('path').attr('stroke-width', 0).attr('fill', 'dodgerblue')
                    container.select('svg').style('pointer-events', 'visible')
                }
                if (d.size == 7){
                    // console.log(highlighter)
                    var container = d3.select(this).attr("transform", 'translate(80,-80)scale(2)rotate(45)')
                    if (that.handedness == 'right') container = d3.select(this).attr("transform", 'translate(0,0)scale(2)rotate(225)')
                    $(d3.select(object).node()).append(pencil);
                    // container.selectAll('path').attr('stroke-width', 0).attr('fill', 'dodgerblue')
                    container.select('svg').style('pointer-events', 'visible')
                }
                if (d.size == 2){
                    // console.log(highlighter)
                    var container = d3.select(this).attr("transform", 'translate(80,-80)scale(2)rotate(45)')
                    if (that.handedness == 'right') container = d3.select(this).attr("transform", 'translate(0,0)scale(2)rotate(225)')
                    $(d3.select(object).node()).append(pen);
                    // container.selectAll('path').attr('stroke-width', 0).attr('fill', 'dodgerblue')
                    container.select('svg').style('pointer-events', 'visible')
                }
            })

            size.append('rect')
                .attr('width', 200)
                .attr('height', 100)
                .attr('x', function (d,i){
                    if (that.handedness == 'right') return -50;
                    else return 50
                })
                .attr('y', function (d,i){
                    if (that.handedness == 'right') return -200;
                    else return 0
                })
                .attr('fill','red')
                .attr('opacity','0');


        size.on("click", function(d, index){
            // console.log(d)
            that.itemSelected = {node:d3.select(this), index:index};
            that.props.changeWidthStroke(d.size);
            that.props.changeColorStroke(d.color, d.opacity);
            that.props.changeActionPen(null);
            // console.log(d3.select(this).attr("transform"))
           
            d3.selectAll('.pensCircles')
                // .transition()
                // .delay(0) 
                // .duration(100)
                .attr("transform", function(d,i){
                    if (that.handedness == 'right') return 'translate('+( -30)+','+ (i*100) +')';
                    return 'translate(0,' + (i*100) + ')'
                })


            var translate = d3.select(this).attr("transform").substring( d3.select(this).attr("transform").indexOf("(")+1,  d3.select(this).attr("transform").indexOf(")")).split(",");
            
            d3.select(this).transition()
                .delay(150) 
                .duration(100)
                .attr("transform", function(d,i){
                    if (that.handedness == 'right') return 'translate('+( 20)+','+(translate[1]) +')';
                    return 'translate('+(0 - 30)+','+(translate[1]) +')';
                })

        })
        .on("mouseover", function(d,i){
            // console.log(this)

            
        })


        d3.select('#rule').on("click", function(d, index){
            d3.event.stopPropagation();
            if (d3.select(this).attr('issticky') == 'false'){
                that.props.isSticky(true);
                d3.select(this).attr('issticky', 'true')
                d3.select(this).select('rect').attr('fill', 'red')
            } else{
                that.props.isSticky(false);
                d3.select(this).attr('issticky', 'false')
                d3.select(this).select('rect').attr('fill', 'grey')
            }
            
        })
        

    }
    componentWillUnmount(){
        d3.select('#colorsMenu').transition().duration(500).attr('opacity',0)
            .on('end', function(d){ 
                d3.select(this).remove();
            })
    }
    // calculateData(){
    //     // console.log("CALCULATE", this.props.dataset)


    // }
    render() {
        // this.calculateData();
        var width = window.innerWidth;

        var translate = 'translate('+ (width - 40) +',100)';
        var translateSize = 'translate('+ (width - 50) +',600)';

        if (this.handedness == 'right') {
            var translate = 'translate(40,100)';
            var translateSize = 'translate(40,800)';
        }
        return (
            <g>
                <g id="colorsMenu" transform={translate}>
                </g>
                <g id="pensMenu" transform={translateSize}>
                </g>

                <g id="rule" issticky='false' transform={'translate(400,20)'}>
                    <rect fill='black' width='100' height='50' x='0' stroke='black' fill='grey'> hello</rect>
                    <text y='27' x='27'> Rule </text>
                </g>
            </g>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ColorsMenu);