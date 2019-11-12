import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import slider from './../../../../static/slider.svg';

class Slider extends Component {
    constructor(props) {
        super(props);
        this.insertSlider();
    }
    insertSlider(){
        var that = this;
        var indexUsed = []
        this.knobGroup = null;
        this.lineGroup = null;
        this.props.scope.project.importSVG(slider, {'expandShapes': true, 'onLoad': function(d){

            // d.position.x += 100;
            // d.position.y += 100;
            d.clipped = false;
            d.strokeJoin = 'miter';
            var texte = d.getItems({'class': 'PointText'});
            for (var i in texte){
                texte[i]['style']['fontFamily'] = 'Segoe UI';
            }

            var container = d.children;
            that.knobGroup = d.children['KnobGroup'];
            that.lineGroup = d.children['LineGroup'];


            d.sendToBack();
            // console.log('INSERTED')
        }})
        
    }
    componentDidMount(){
        // var line = this.lineGroup.children[0];
        // console.log(this.lineGroup.children[0])
        // console.log(line.length)

        // var lengthLine = line.length;

        // // var point = path.getPointAt(offset);
        // console.log(lengthLine/10)

        this.props.setGroups(this.lineGroup, this.knobGroup)
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        // console.log(shallowCompare(this, nextProps, nextState))
        return shallowCompare(this, nextProps, nextState);
    }
    translateAlong(){
        var that = this;
        var linearFadeOut = d3.scaleLinear().domain([0, 1]).range([that.knobGroup.position.x, that.props.knob.x])
        return function(d, i, a) {
          return function(t) {
            if (t != 1){
                that.knobGroup.position.x = linearFadeOut(t);
            }
          };
        };
    }
    componentDidUpdate(nextProps, nextState){
        var that = this;
        // console.log(this.props.knob)
        if (this.props.knob.animation == true && this.props.knob.x != nextProps.knob.y){

            // this.knobGroup.position.x = this.props.knob.x;
            d3.select({}).transition().duration(1000).delay(0)
                .tween("circle", that.translateAlong())
                .ease(d3.easePoly)
                .on("end", function(){ 

                }); 
        } else {
            this.knobGroup.position.x = this.props.knob.x;
        }
        
    }
    render() {
        return (
           <React.Fragment>
            </React.Fragment>
        );
        
    }
}
export default Slider;