import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation } from "./../Helper";

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
            if (d3.event.pointerType == 'touch'){
                // console.log('HEY')
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
                            
                            // var gElement = container.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                            container.append('path')
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
                            var transformPan = getTransformation(d3.select('#panItems').attr('transform'));

                            // var X = point['x'] - transformPan.translateX - that.props.stroke.tagHold.offsetX - that.props.stroke.tagHold.BB.width/2;
                            // var Y = point['y'] - transformPan.translateY - that.props.stroke.tagHold.offsetY - that.props.stroke.tagHold.BB.height/2;

                            // var parenGTranslate = container.node().parentNode;
                            // d3.select(parenGTranslate).attr('transform', 'translate('+X+','+Y+')');
                            // var gElement = container.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                            container.append('path')
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
            }
            
            
            // console.log(that.props.stroke, newTag)
        })
    }
    drawTag(event){
        var that = this;
        var line = d3.line()
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke.data))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '10')
            .attr('opacity', '0')
            .attr("stroke-dasharray", "10");
      
        // var step = that.props.stroke.tagHold.BB.width + 30;
        var step = 150;
        var path = d3.select('#'+that.props.stroke.id).node()
        var length = path.getTotalLength();
        var f = 0

        for (var i = 0; i < length; i += step){
            var point = path.getPointAtLength(i);
            // var X = point['x'] - transformPan.translateX - that.props.stroke.tagHold.offsetX - that.props.stroke.tagHold.BB.width/2;
            // var Y = point['y'] - transformPan.translateY - that.props.stroke.tagHold.offsetY - that.props.stroke.tagHold.BB.height/2;
            var X = point['x'] - 75;
            var Y = point['y'] - 75;


            var container = d3.select('#item-'+that.props.stroke.id).select('#patternTag').append('g').attr('transform', 'translate('+X+','+Y+')')

            container.append('rect')
                    .attr('class', 'tapItem')
                    .attr('iteration', '0')
                    .attr('x', 0)//that.props.stroke.tagHold.offsetX + transformPan.translateX)
                    .attr('y', 0)//that.props.stroke.tagHold.offsetY + transformPan.translateY)
                    .attr('width', 150)//that.props.stroke.tagHold.BB.width)
                    .attr('height', 150)//that.props.stroke.tagHold.BB.height)
                    .attr('fill', 'rgba(252, 243, 242, 0.4)')

            if (that.props.stroke.tagHold.tagSnapped.length == 0){

                for (var j = 0; j < that.props.stroke.tagHold.placeHolder[0]['lines'].length; j += 1){
                    var element = that.props.stroke.tagHold.placeHolder[0]['lines'][j];
                    var gElement = container//.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                    gElement.append('path')
                        .attr('class', 'placeholderTag')
                        .attr('d', (d)=>line(element.data))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.colorStroke )
                        .attr('stroke-width', element.sizeStroke)
                        .style('pointer-events', 'none')
                }  
            }
            /** IN CASE OF MANY TAG SNAPPED **/
            else {
                var where = f % (that.props.stroke.tagHold.tagSnapped.length + 1);
                // var container = d3.select('#item-'+that.props.stroke.id).select('#patternTag').append('g').attr('transform', 'translate('+X+','+Y+')')

                if (where != 0){
                    for (var j = 0; j < that.props.stroke.tagHold.tagSnapped[where-1].placeHolder[0]['lines'].length; j += 1){
                        var element = that.props.stroke.tagHold.tagSnapped[where-1].placeHolder[0]['lines'][j];
                        var gElement = container//.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                        gElement.append('path')
                        .attr('class', 'placeholderTag')
                        .attr('d', (d)=>line(element.data))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.colorStroke )
                        .attr('stroke-width', element.sizeStroke)
                        .style('pointer-events', 'none')
                    } 
                } else {
                    // console.log(that.props.stroke.tagHold)
                    for (var j = 0; j < that.props.stroke.tagHold.placeHolder[0]['lines'].length; j += 1){
                        var element = that.props.stroke.tagHold.placeHolder[0]['lines'][j];
                        var gElement = container//.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                        gElement.append('path')
                        .attr('class', 'placeholderTag')
                        .attr('d', (d)=>line(element.data))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.colorStroke )
                        .attr('stroke-width', element.sizeStroke)
                        .style('pointer-events', 'none')
                    } 
                }
                f++;
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