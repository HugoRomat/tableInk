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
            strokeWidth: 4,
            strokeJoin: 'round'
        });

        console.log(that.props.stroke)
        if (this.props.stroke.selection == null) this.isFolderInside();
        else this.changeText();
        // else{
        //     this.changeText();
        // }
        // console.log(this.props.folders)
    
    }
    changeText(){
        for (var i in this.props.stroke.selection){

            var selection = this.props.stroke.selection[i];

            var line = this.line.clone();
            if (selection.data.glyphAttached == undefined) selection.data.glyphAttached = [line];
            else selection.data.glyphAttached.push(line)   

            var originalHeight = JSON.parse(JSON.stringify(this.line.bounds.height))
            var originalWidth = JSON.parse(JSON.stringify(this.line.bounds.width))

            line.bounds.width = 20;
            line.bounds.height = (line.bounds.width/originalWidth) * originalHeight;
            line.bounds.x = selection.bounds.x +  (25 * ((selection.data.glyphAttached.length) - 1)) ;
            line.bounds.y = selection.bounds.y +  10;
        }
    }
    isFolderInside(){
        var arrayFolder = []
        for (var i in this.props.folders){
            var folder = this.props.folders[i];
            var contains = folder.isInside(this.line.bounds);
            //scope to many folders
            if (contains) arrayFolder.push(folder)
        }

        this.props.setSelection(arrayFolder);
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