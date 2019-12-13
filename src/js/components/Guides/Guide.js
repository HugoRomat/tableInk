import React, { Component } from "react";
import * as d3 from 'd3';
import { getTransformation, getNearestElement, showBbox, distance, guid, _getBBox, calculateBB } from "./../Helper";
import { connect } from 'react-redux';


import { 
    shouldOpenMenu,
    addLineToStickyGroup
} from '../../actions';

import PlaceHolder from "./PlaceHolder";
import PlaceHolderText from "./PlaceHolderText";

const mapDispatchToProps = { 
    shouldOpenMenu,
    addLineToStickyGroup
};
const mapStateToProps = (state, ownProps) => {  
  
  return { 
    //   stickyLines: state.rootReducer.present.stickyLines
  };
};



class Guide extends Component {
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
        


        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            // .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '2')
            
        /*
        d3.select('#fake-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '40')
            .attr('stroke-opacity', '0.1')
        */
            
            
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
        that.props.dragItem(true);
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
                that.props.dragItem(false);
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
            that.props.dragItem(false);
            that.props.holdGuide(false);
            that.colorForHolding(false)
       

        
            // TO detect the tap
            var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
            var time = Date.now() -  that.startPosition['time'];

            // console.log(dist, time)
            if (dist < 10 && time < 100){
                console.log('GO')
                clearTimeout(that.timerPress);

                that.props.setGuideTapped({'item': this.props.stroke.id});
                
                // console.log('Thats a tap')
                // var BBox = _getBBox('item-'+env.props.stroke.id)
                // that.props.shouldOpenMenu({
                //     'id': guid(),
                //     'shouldOpen': true,
                //     'position': [BBox.x, BBox.y],
                //     'idGuide': env.props.stroke.id,
                //     'idLines': []//env.props.stroke.data.linesAttached
                // })
            }
        }

        if (that.props.isGallery){
            if (d3.event.x < 450){
                var transform = getTransformation(d3.select('#item-'+that.props.stroke.id).attr('transform'));
                that.props.addGuideToSticky({'guide':that.props.stroke, 'position':[transform.translateX, transform.translateY]});
                that.goBackInitialposition();
            }
        }
    }
    goBackInitialposition(){
        var that = this;
        // console.log('GOOO')
        d3.select('#item-'+that.props.stroke.id).attr('transform', 'translate('+that.props.stroke.position[0]+','+that.props.stroke.position[1]+')')
        var linesAttached = that.props.stroke.linesAttached;
        for (var i in linesAttached){
            var line = linesAttached[i];
            var identifier = 'item-'+line;
            var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
            var X = transform.translateX;
            var Y = transform.translateY;
            d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
        }

    }
    componentDidUpdate(){
        // console.log('HELLO')
        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            // .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "7");
        // console.log(this.props.stroke)
    }
    addLine = (d) => {
        // console.log('DOOO')
       this.props.addLineToStickyGroup({
           'idGuide': d.idGuide,
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
    resize(){

        var scale = 50/140;
        return scale

    }
    render() {
        var BB = calculateBB(this.props.stroke.points);
        // console.log(this.props.stroke);
        // var translate = [this.props.stroke.position[0],this.props.stroke.position[1]]
        // var scale = 1;
        // if (window.innerWidth < 769){
        //     var BB = calculateBB(this.props.stroke.points);
        //     translate[0] = 50;
        //     scale = this.resize()
        // }

        // console.log(BB)
        // var height = 
        

        const listPlaceHolder = this.props.stroke.placeHolder.map((d, i) => {
                return <PlaceHolder 
                    key={i}
                    data={d}
                    parent={this.props.stroke}
                    BBoxParent={BB}
                    lines={d['lines']}
                    addLine={this.addLine}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
                />
        });
        // console.log(this.props.stroke)

        return (
            <g id={'item-'+this.props.stroke.id} transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`}>
                
                
                {/* { (window.innerWidth < 769) ? <circle cx={10} cy={35} r={120} fill={'white'} stroke={'black'}/> : null } */}


                <rect id={'rect-'+this.props.stroke.id} />
                <path id={this.props.stroke.id}></path>
                {/* <path id={'fake-'+this.props.stroke.id}></path> */}
                {listPlaceHolder}
                <PlaceHolderText 
                    data={this.props.stroke.textPosition}
                    dataParent={this.props.stroke} 
                />
                

                
                
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Guide);