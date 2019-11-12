import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';

class Line extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        // console.log(this.props.stroke)

        var line = d3.line()
        var that = this;
        // d3.select('#'+that.props.stroke.id)
        //     .attr("d", line(that.props.stroke['data']))
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black')
        //     .attr('stroke-width', '2')

        this.line = new this.props.scope.Path({
            segments: that.props.stroke['data'],
            strokeColor: 'black',
            strokeWidth: 3,
            strokeJoin: 'round'
        });


        // else{
        //     this.changeText();
        // }
        // console.log(this.props.folders)
    
    }
   
    fadeout(){
        var that = this;
        d3.select({}).transition().duration(2000).delay(1000)
                .tween("circle", that.translateAlong())
                .ease(d3.easeLinear)
                .on("end", function(){ 

                }); 
    }
    translateAlong(){
        var that = this;
        var linearFadeOut = d3.scaleLinear().domain([0, 1]).range([1, 0])
        return function(d, i, a) {
          return function(t) {
            if (t != 1){
                that.line.opacity = linearFadeOut(t)
                // console.log(t)
            }
          };
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        // console.log(shallowCompare(this, nextProps, nextState))
        return shallowCompare(this, nextProps, nextState);
    }
    componentDidUpdate(prevProps){
       
        if (this.props.stroke.shouldFadeOut != prevProps.stroke.shouldFadeOut){
            this.fadeout()
        }
        // console.log(this.props.stroke)
    }

   
    render() {
        return (
           <React.Fragment>
            </React.Fragment>
        );
        
    }
}
export default Line;