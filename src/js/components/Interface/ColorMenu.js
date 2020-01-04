import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import paper, { Path } from 'paper';
import $ from 'jquery';

import alphabet from './../../../../static/alphabet.png';
// import highlighter from './../../../static/higlighter.png';

// import w1 from './../../../js/usecases/workspace1.json';
// import w2 from './../../js/usecases/workspace2.json';


import highlighter from './../../../../static/higlighter.png';
import pen from './../../../../static/pen2.png';
import pattern from './../../../../static/patternPen.png';


import { 
    setWorkspace
} from '../../actions';
import { guid, _getBBoxPromise } from "../Helper";
import Lines from "./Lines";


const mapDispatchToProps = { 
    setWorkspace
 };
const mapStateToProps = (state, ownProps) => {  
    return { 
        stickyLines: state.rootReducer.present.stickyLines
    };
  };

class ColorsMenu extends Component {

    constructor(props) {
        super(props);
        this.handedness = 'right';
        this.state = {
            'patternLines': []
        }

        this.colors = ['#ffc125', '#ff7f00', '#dc143c', '#8B4513', "#1e90ff", '#00c5cd', "#3cb371", "#BA55D3", "#000000"];
    }
    componentDidMount(){
        var that = this;

        /****
         * FOR THE COLOR ONLY
         */

        d3.select('#colorsMenu').selectAll('div')
            .data(that.colors).enter()
            .append('div').attr('class', 'colorPen').attr('selected', false)
            .style('background', (d)=>{return d})
            .on("click", function(d, index){
                d3.event.stopPropagation();


                // For the attribut selected
                d3.selectAll('.colorPen').each(function (d){
                    d3.select(this).attr('selected', 'false');
                })
                d3.select(this).attr('selected', 'true');

                //For the position
                d3.selectAll('.colorPen').each(function (d){
                    var selected = d3.select(this).attr('selected')
                    if (selected == 'true'){
                        d3.select(this).transition().duration(500).style('right', '30px');
                        
                    } else {
                        d3.select(this).transition().duration(500).style('right', '0px');
                    }
                })


                that.props.selectThisColor(d)
    
            })











        /****
         * FOR THE PEN ONLY
         */
        d3.selectAll('.pen').attr('selected', false);
        d3.select('#inking').attr('selected', true).style('right', '50px');

        var that = this;

        d3.select('#downloadSticky').on("click", function(d, index){
           
            var sticky = that.props.stickyLines;

            
            // var st = sticky[1]
            // console.log(sticky)
            sticky.forEach(st => {
                st.id = guid();
                st.placeHolder.forEach(element => {
                    // console.log(element)
                    element.lines.forEach((d)=>{
                        d.id = guid();
                    })
                });
            });
            

            console.log(JSON.stringify(sticky))
        })

        d3.select('#alphabetButton').on("click", function(d, index){
            d3.event.stopPropagation();
            
            that.props.openAlphabet(true)

        })



        d3.select('#highlighting').on("click", function(d, index){
            d3.event.stopPropagation();
            
 
            that.selectThisPen(this);
            that.movePens();
            that.props.selectPen({'type': "highlighter"})
        })

        d3.select('#inking').on("click", function(d, index){
            d3.event.stopPropagation();
            
            that.props.selectPen({'type': "ink"})
            
            that.selectThisPen(this);
            that.movePens();
        })
        d3.select('#pattern').on("pointerdown", function(d, index){
            if (d3.event.pointerType == 'touch'){
                // d3.event.stopPropagation();
                that.props.selectPen({'type': "pattern"})
                that.selectThisPen(this);
                that.movePens();

                
            }
            // console.log('LCIK', d3.event)
            
        })



        this.drawSVGPattern();



    }
    drawSVGPattern = async() => {
        var that = this;
        this.tempArrayStroke = [];
        this.positionBox = await _getBBoxPromise('patternSVG');
        var el = document.getElementById("patternSVG");
        this.mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':1, threshold: 1});
        // var tap = new Hammer.Tap();
        this.mc.add(pan);
        // this.mc.add(tap);
        // pan.recognizeWith(tap);

        // this.mc.on("tap", function(ev) {
        //     if (ev.pointers[0].pointerType == 'touch' ){
        //        console.log('TEP')
        //     }
        // })

        this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                that.tempArrayStroke = [];
                // var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
                _getBBoxPromise('patternSVG').then((d)=>{
                    // d.x += transformPan.translateX;
                    // d.y += transformPan.translateY;
                    that.positionBox = d;
                    // console.log('GO', transformPan)
                })
            }
          })
          this.mc.on("pan", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                var X = ev.srcEvent.x - that.positionBox.x;
                var Y = ev.srcEvent.y - that.positionBox.y;
                that.tempArrayStroke.push([X, Y]);
                that.drawTempStroke();
            }
          })
          this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'pen'){
                var firstPoint = JSON.parse(JSON.stringify(that.tempArrayStroke[0]))
                var arrayPoints = JSON.parse(JSON.stringify(that.tempArrayStroke));
                arrayPoints.forEach((d)=>{
                    d[0] = d[0] - firstPoint[0];
                    d[1] = d[1] - firstPoint[1]
                })
                var data = {
                    'points': arrayPoints, 
                    'data': {'class':[], 'sizeStroke': that.props.sizeStroke, 'colorStroke': that.props.colorStroke}, 
                    'id': guid() , 
                    'position': [firstPoint[0],firstPoint[1]]
                }
                that.setState({'patternLines': [...that.state.patternLines, data]});
                that.props.setPatternPen(that.state.patternLines)
                d3.select('#penTempPattern').attr("d", [])
            }
          })
      

    }
    drawTempStroke(){
        var that = this;
        var line = d3.line()
        // console.log(that.props)
        d3.select('#penTempPattern')
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', that.props.colorStroke)
            .attr('stroke-width', that.props.sizeStroke)
            .attr("stroke-dasharray", 'none')
            .attr('stroke-linejoin', "round")
    }
    selectThisPen(element){
        d3.selectAll('.pen').each(function (d){
            d3.select(this).attr('selected', 'false');
        })
        d3.select(element).attr('selected', 'true');
    }
    movePens(){
        d3.selectAll('.pen').each(function (d){
            var selected = d3.select(this).attr('selected')
            if (selected == 'true'){
                d3.select(this).transition().duration(500).style('right', '50px');
                
            } else {
                d3.select(this).transition().duration(500).style('right', '0px');
            }
        })
    }
    render() {
       
        return (
           <div id="buttons">
               {/* <button className="buttonMenu" issticky='false' id="abcd"> abcd </button> */}

               <div id="abcd" className="buttonMenu"> 

                    {/* <div id="downloadSticky" className="buttonMenu" > 
                            download sticky
                    </div> */}
                    <div id="alphabetButton" > 
                            <img src={alphabet} />
                    </div>
                    
                    
               </div>
              


               <div id="pens" > 
                    <div className="pen" id="inking"><img src={pen} /></div>
                    <div className="pen" id="highlighting"><img src={highlighter} /></div>
                    <div className="pen" id="pattern"><img src={pattern} />
                        <svg id="patternSVG">
                            <g id="options"></g>
                            <path id="penTempPattern"></path>
                                <Lines 
                                    sketchLines = {this.state.patternLines}
                                />
                            </svg>
                        </div>
               </div>

                <div id="colorsMenu">
                </div>

                {/* <div id="layers">
                    <div id="showGrid" className="buttonMenu"> 
                        Grid
                    </div>
                    <div id="showExcel" className="buttonMenu"> 
                        Excel
                    </div>
                    <div id="showNormal" className="buttonMenu"> 
                        Normal
                    </div>
                </div> */}

               





               {/* <button className="buttonMenu" issticky='false' id="rule"> noSticky </button> */}
               {/* <button className="buttonMenu" isgroup='false' id="grouping"> noGroup </button> */}
                {/* <g id="rule" issticky='false' transform={'translate(400,20)'}>
                    <rect fill='black' width='100' height='50' x='0' stroke='black' fill='grey'> hello</rect>
                    <text y='27' x='27'> Rule </text>
                </g> */}
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ColorsMenu);