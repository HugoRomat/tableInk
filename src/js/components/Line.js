import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';

class Line extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){

        var line = d3.line()
        var that = this;


        this.line = new this.props.scope.Path();
        this.line.importJSON(this.props.stroke);

        this.props.layer.addChild(this.line)


        if (this.line.data.type == "selecting"){
            that.line.remove();
            // d3.select({}).transition().duration(2000).delay(1000)
            // .tween("circle", that.translateAlong())
            // .ease(d3.easeLinear)
            // .on("end", function(){ 
            //     that.line.remove();
            // }); 
        }
            
    
    }
    translateAlong(){
        var that = this;
        var linearFadeOut = d3.scaleLinear().domain([0, 1]).range([1, 0])
        return function(d, i, a) {
        return function(t) {
            if (t != 1){
                that.line.opacity = linearFadeOut(t)
            }
        };
        };
    }
   
    render() {
        return (
           <React.Fragment>
           </React.Fragment>
        );
        
    }
}
export default Line;