import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement } from "./../Helper";

class TagInterface extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
        // console.log(this.props.stroke.device)
        var line = d3.line()
        var that = this;

        // console.log(that.props.stroke.data.colorStroke)

        this.drawTag();
        this.addMechanism();
            
           
    
    }
    addMechanism(){
        var line = d3.line()
        var that = this;
        d3.select('#item-'+this.props.stroke.id).selectAll('.tapItem')
        .on('pointerdown', function(d){
            var othersTags = that.props.stroke.tagHold.tagSnapped;
            var iteration = parseInt(d3.select(this).attr('iteration'));

            // console.log(iteration)
            if (othersTags.length > 0){

                var parent = d3.select(this).node().parentNode;
                d3.select(parent).selectAll('.placeholderTag').remove();
                var where = iteration % (othersTags.length + 1);


                /* Pour le premier element */
                if (where == othersTags.length){
                    var newTag = othersTags[where];
                    var container = d3.select(parent);
                    for (var j = 0; j < that.props.stroke.tagHold.placeHolder[0]['lines'].length; j += 1){
                        var element = that.props.stroke.tagHold.placeHolder[0]['lines'][j];
                        var gElement = container.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')
        
                        gElement.append('path')
                            .attr('class', 'placeholderTag')
                            .attr('d', (d)=>line(element.data))
                            .attr('fill', 'none')
                            .attr('stroke', (d)=> element.colorStroke )
                            .attr('stroke-width', element.sizeStroke)
                            .style('pointer-events', 'none')
                    }
                } 
                /* Pour les autres elements */
                else {
                    var newTag = othersTags[where];
                    var container = d3.select(parent);
                    for (var j = 0; j < newTag.placeHolder[0]['lines'].length; j += 1){
                        var element = newTag.placeHolder[0]['lines'][j];
                        var gElement = container.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')
        
                        gElement.append('path')
                            .attr('class', 'placeholderTag')
                            .attr('d', (d)=>line(element.data))
                            .attr('fill', 'none')
                            .attr('stroke', (d)=> element.colorStroke )
                            .attr('stroke-width', element.sizeStroke)
                            .style('pointer-events', 'none')
                    }   
                    
                }
                iteration += 1
                d3.select(this).attr('iteration', String(iteration))
            }
            
            // console.log(that.props.stroke, newTag)
        })
    }
    drawTag(event){
        var that = this;
        var line = d3.line()
        
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke.data))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '10')
            .attr('opacity', '0')
            .attr("stroke-dasharray", "10");
      
        var step = that.props.stroke.tagHold.BB.width + 30;
        var path = d3.select('#'+that.props.stroke.id).node()
        var length = path.getTotalLength();

        for (var i = 0; i < length; i += step){
            var point = path.getPointAtLength(i);
            var X = point['x']
            var Y = point['y']

            var container = d3.select('#item-'+that.props.stroke.id).select('#patternTag').append('g').attr('transform', 'translate('+X+','+Y+')')

            container.append('rect')
                    .attr('class', 'tapItem')
                    .attr('iteration', '0')
                    .attr('x', -10)
                    .attr('y', -10)
                    .attr('width',that.props.stroke.tagHold.BB.width)
                    .attr('height', that.props.stroke.tagHold.BB.height)
                    .attr('fill', 'rgba(252, 243, 242, 0)')

            for (var j = 0; j < that.props.stroke.tagHold.placeHolder[0]['lines'].length; j += 1){
                var element = that.props.stroke.tagHold.placeHolder[0]['lines'][j];
                var gElement = container.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                gElement.append('path')
                    .attr('class', 'placeholderTag')
                    .attr('d', (d)=>line(element.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=> element.colorStroke )
                    .attr('stroke-width', element.sizeStroke)
                    .style('pointer-events', 'none')
            }    
        }
        
    }
    componentDidUpdate(){
        
    }
    componentWillUnmount(){

    }
    render() {

        return (
            <g id={'item-'+this.props.stroke.id} transform={`translate(0,0)`}>
                <path style={{'pointerEvents': 'none' }} id={this.props.stroke.id}></path>
                <g id="patternTag"></g>
            </g>
        );
        
    }
}
export default TagInterface;