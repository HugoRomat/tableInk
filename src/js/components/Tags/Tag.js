import React, { Component } from "react";
import * as d3 from 'd3';
import { getTransformation, getNearestElement, showBbox, distance, guid, _getBBox, calculateBB } from "../Helper";
import { connect } from 'react-redux';


import { 
    addLineToTagGroup
} from '../../actions';

import PlaceHolder from "./PlaceHolder";
import PlaceHolderText from "./PlaceHolderText";

const mapDispatchToProps = { 
    addLineToTagGroup
};
const mapStateToProps = (state, ownProps) => {  
  
  return { 
    
  };
};



class Tag extends Component {
    constructor(props) {
        super(props);
        this.timerPress = null;
        this.press = false;
        this.startPosition = {};
        this.lastPosition = {};
        this.drag = false;

        this.state = {
            'BBox':{}
        };
    }
    componentDidMount(){
        
        var line = d3.line().curve(d3.curveBasis)
        var that = this;

        
        var drag = d3.drag()
            // .subject(function (d) { return d; })
            .on("start", function(e){ that.dragstarted(that)})
            .on("drag", function(e){ that.dragged(that)})
            .on("end", function(e){ that.dragended(that)})
            .clickDistance(40)
        
            
        d3.select('#item-'+that.props.stroke.id)
            .on('pointerdown', function(d){
                if (d3.event.pointerType == 'touch'){
                    that.startPosition = {'x': d3.event.x, 'y':d3.event.y,  'time': Date.now()};
                    that.lastPosition = {'x': d3.event.x, 'y':d3.event.y}
                    that.dragstarted(that);
                }
            })
            .on('pointermove', function(d){
                if (d3.event.pointerType == 'touch'){
                    var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
                    var differenceTime = that.startPosition.time - Date.now();
                    
                    if (dist > 10 ){
                        that.dragged(that);
                    }
                }
            })
            .on('pointerup', function(d){
                if (d3.event.pointerType == 'touch'){
                    that.dragended(that);
                }
            })
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
            
            
            
        // console.log('GUIDE', this.props.stroke.id)
        // var BBox = _getBBox(this.props.stroke.id);
        // console.log(BBox)
        // this.setState({'BBox': BBox})
       
    
    }

    dragstarted(env) {
        // if (d3.event.sourceEvent == tou
        // console.log(d3.event.sourceEvent)
        var that = env;
        // that.startPosition = {'x': d3.event.x, 'y':d3.event.y,  'time': Date.now()}
        that.drag = false;
        // console.log('HEY', env, this)
        // d3.event.sourceEvent.stopPropagation();
        // d3.select('#item-'+env.props.stroke.id).classed("dragging", true);

        // console.log('GO DRAG')
        // that.props.dragItem(true);
        // d3.event.preventDefault();
        that.timerPress = setTimeout(function(){
            console.log('PRESS')
            if (that.drag == false){
                // d3.event.preventDefault();
                // that.expandSelection(that.props.stroke.id);
                that.colorForHolding(true);
                that.props.holdGuide(that.props.stroke.id);
                // console.log(that.props)
                that.press = true;
                // that.props.dragItem(false);
                that.drag = false;
            }
        }, 1000)

    }

    dragged(env) {  
        // console.log(d3.event)
        var that = env;
        that.drag = true;
        // console.log('GO')
        

        // var dist = distance(env.startPosition.x, d3.event.x, env.startPosition.y, d3.event.y);

        // console.log(dist)
        // if (dist > 10){
        clearTimeout(that.timerPress);
        d3.event.preventDefault();
        var transform = getTransformation(d3.select('#item-'+env.props.stroke.id).attr('transform'));
        // console.log(transform)
        var offsetX = d3.event.x - that.lastPosition.x;
        var offsetY = d3.event.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#item-'+env.props.stroke.id).attr('transform', 'translate('+X+','+Y+')')


            
            var linesAttached = env.props.stroke.linesAttached;
            for (var i in linesAttached){
                var line = linesAttached[i];
                var identifier = 'item-'+line;
                var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
                var X = offsetX + transform.translateX;
                var Y = offsetY + transform.translateY;
                d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
            }
            
        // }
        
        // d3.select('svg').append('circle')
        //     .attr('cx', X)
        //     .attr('cy', Y)
        //     .attr('r', 10)
        that.lastPosition = {'x': d3.event.x, 'y':d3.event.y}

    }
    dragended(env) {
        var that = env;
        that.drag = false;
        // d3.select('#item-'+env.props.stroke.id).classed("dragging", false);

        // To say nothing is holded anymore and dragged
        clearTimeout(that.timerPress);
        
        if (that.props.isGallery == false){
            // that.props.dragItem(false);
            that.props.holdGuide(false);
            that.colorForHolding(false)
       

        
            // TO detect the tap
            var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
            var time = Date.now() -  that.startPosition['time'];

            // console.log(dist, time)
            if (dist < 10 && time < 100){
                clearTimeout(that.timerPress);
            }
        }

    }
    componentDidUpdate(){
        // console.log('HELLO')
      
    }
    addLine = (d) => {
        // console.log('DOOO')
       this.props.addLineToTagGroup({
           'idTag': d.idTag,
           'where':d.where,
           'data': d.data
       })

    }
    /**
     * WHEN SELECTED ITEM
     * @param {*} isIt 
     */
    colorForHolding(isIt){
        
        d3.select('#rect-'+this.props.stroke.id)
            .attr('width', 0)
            .attr('height', 0)
        
       
        if (isIt == true){
            var BBox = _getBBox('item-'+this.props.stroke.id);
            var x = this.props.stroke.position[0] - BBox.x;
            var y = this.props.stroke.position[1] - BBox.y;
            // console.log(BBox)

            d3.select('#rect-'+this.props.stroke.id)
                .attr('x', -x)
                .attr('y', -y)
                .attr('width', BBox.width)
                .attr('height', BBox.height)

                // .attr('fill', '#9C9EDEDF')
                .attr('opacity', '0.2')
        }
    }
    render() {
        // console.log(this.props.stroke);
        var translate = [this.props.stroke.position[0],this.props.stroke.position[1]]

        var scale = 1;
        const listPlaceHolder = this.props.stroke.placeHolder.map((d, i) => {
                return <PlaceHolder 
                    key={i}
                    data={d}
                    parent={this.props.stroke}
                   
                    lines={d['lines']}
                    addLine={this.addLine}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
                />
        });
        // console.log(this.props.stroke)

        return (
            <g id={'item-'+this.props.stroke.id} transform={`translate(${translate[0]},${translate[1]})scale(${scale})`}>
            

                <rect id={'rect-'+this.props.stroke.id} />
                <path id={this.props.stroke.id}></path>
                {/* <path id={'fake-'+this.props.stroke.id}></path> */}
                {listPlaceHolder}

            

                {/* <PlaceHolderText 
                    data={this.props.stroke.textPosition}
                    dataParent={this.props.stroke} 
                /> 
                 */}

                
                
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Tag);