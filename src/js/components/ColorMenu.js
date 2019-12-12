import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import paper, { Path } from 'paper';
import $ from 'jquery';

import alphabet from './../../../static/alphabet.png';
import highlighter from './../../../static/highlighter.png';
import pen from './../../../static/pen.png';
import { 
    
} from './../actions';
import { guid } from "./Helper";


const mapDispatchToProps = { 
    
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
        d3.select('#inking').attr('selected', true).style('left', '50px');

        var that = this;

        d3.select('#downloadSticky').on("click", function(d, index){
           
            var sticky = that.props.stickyLines;

            var st = sticky[1]
            // console.log(sticky)
            // sticky.forEach(st => {
                st.id = guid();
                st.placeHolder.forEach(element => {
                    // console.log(element)
                    element.lines.forEach((d)=>{
                        d.id = guid();
                    })
                });
            // });
            

            console.log(JSON.stringify(st))
        })

        d3.select('#alphabetButton').on("click", function(d, index){
            d3.event.stopPropagation();
            
            that.props.openAlphabet(true)

        })



        d3.select('#highlighting').on("click", function(d, index){
            d3.event.stopPropagation();
            
 
            that.selectThisPen(this);
            that.movePens();
            that.props.selectPen(8)
        })

        d3.select('#inking').on("click", function(d, index){
            d3.event.stopPropagation();
            
            that.props.selectPen(2)
            
            that.selectThisPen(this);
            that.movePens();
        })


        d3.select('#showGrid').attr('selected', 'false');
        d3.select('#showGrid').on("click", function(d, index){
            var selected = d3.select(this).attr('selected')
            if (selected == 'true') {
                that.props.setGrid(false)
                d3.select('#showGrid').attr('selected', 'false');
            } else {
                that.props.setGrid(true)
                d3.select('#showGrid').attr('selected', 'true');
            } 
        })
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
                d3.select(this).transition().duration(500).style('left', '50px');
                
            } else {
                d3.select(this).transition().duration(500).style('left', '0px');
            }
        })
    }
    render() {
       
        return (
           <div id="buttons">
               {/* <button className="buttonMenu" issticky='false' id="abcd"> abcd </button> */}

               <div id="abcd" className="buttonMenu"> 

                    <div id="downloadSticky" className="buttonMenu" > 
                            download sticky
                    </div>
                    <div id="alphabetButton" > 
                            <img src={alphabet} />
                    </div>
                    
                    
               </div>
              


               <div id="pens" > 
                    <div className="pen" id="inking"><img src={pen} /></div>
                    <div className="pen" id="highlighting"><img src={highlighter} /></div>
               </div>

                <div id="colorsMenu">
                </div>

                <div id="layers">
                <div id="showGrid" className="buttonMenu"> 
                        GRID
                    </div>
                </div>


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