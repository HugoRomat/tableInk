import React, { Component } from "react";
import * as d3 from 'd3';
import { getTransformation, getNearestElement, showBbox, distance, guid, _getBBox } from "./Helper";
import { connect } from 'react-redux';


import { 
    shouldOpenMenu
} from '../actions';

const mapDispatchToProps = { 
    shouldOpenMenu
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
        this.drag = false;
    }
    componentDidMount(){
        // console.log(this.props.stroke)
        var line = d3.line()
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
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '2')
            

        d3.select('#fake-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '40')
            .attr('stroke-opacity', '0.1')
            /*.on('pointerdown', function(){
                // console.log(d3.event)
                if (d3.event.pointerType == 'touch'){
                    that.startPosition = {'x': d3.event.x, 'y':d3.event.y}
                    // that.props.holdGuide(['item-'+that.props.stroke.id]);
                    that.timerPress = setTimeout(function(){
                        console.log(that.startPosition)
                        // var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
                        // if (dist < 40){
                            that.expandSelection(that.props.stroke.id);
                            that.press = true;
                            that.props.dragItem(false);
                        // }
                       
                    }, 1000)
    
                    // console.log(this)
                }
                

            })
            .on('pointerup', function(){
                if (d3.event.pointerType == 'touch' && that.press == true){
                    // clearTimeout(that.timerPress);
                    that.props.holdGuide([]);
                    
                    // console.log(dist)
                    // if (that.press == false) that.props.holdGuide([]);
                }
                // console.log('pointerleave')
            })
            */
            
            
            d3.select('#item-'+that.props.stroke.id)
                .call(drag)
            
            
            
            
            
        
       
    
    }
    expandSelection(id){

        getNearestElement(id).then((d)=> {

            for (var i in d){
                var id = d[i];
                // console.log(id)
                showBbox(id, 'black');
               
            }
            this.props.holdGuide(d);
            
            // console.log(d)
        })

        // console.log(items)
        // var BB = d3.select('#item-'+id).node().getBBox();
        // d3.select('svg').append('rect')
        //     .attr('x', BB.x)
        //     .attr('y', BB.y)
        //     .attr('width', BB.width)
        //     .attr('height', BB.height)
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black')
    }
    dragstarted(env) {
        var that = env;
        that.startPosition = {'x': d3.event.x, 'y':d3.event.y,  'time': Date.now()}
        that.drag = false;
        // console.log('HEY', env, this)
        // d3.event.sourceEvent.stopPropagation();
        // d3.select('#item-'+env.props.stroke.id).classed("dragging", true);

        // console.log('GO DRAG')
        that.props.dragItem(true);

        that.timerPress = setTimeout(function(){
            if (that.drag == false){
                that.expandSelection(that.props.stroke.id);
                that.press = true;
                that.props.dragItem(false);
                that.drag = false;
            }
        }, 1000)

    }

    dragged(env) {  
        var that = env;
        that.drag = true;
        // console.log('GO')
        

        // var dist = distance(env.startPosition.x, d3.event.x, env.startPosition.y, d3.event.y);

        // console.log(dist)
        // if (dist > 10){
            clearTimeout(that.timerPress);
            d3.event.sourceEvent.stopPropagation();
            var transform = getTransformation(d3.select('#item-'+env.props.stroke.id).attr('transform'));
            var X = d3.event.dx + transform.translateX;
            var Y = d3.event.dy + transform.translateY;
            d3.select('#item-'+env.props.stroke.id).attr('transform', 'translate('+X+','+Y+')')

            var linesAttached = env.props.stroke.data.linesAttached;
            for (var i in linesAttached){
                var line = linesAttached[i];
                var identifier = 'item-'+line;
                var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
                var X = d3.event.dx + transform.translateX;
                var Y = d3.event.dy + transform.translateY;
                d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
            }
        // }
        
        // d3.select('svg').append('circle')
        //     .attr('cx', X)
        //     .attr('cy', Y)
        //     .attr('r', 10)
           

    }
    dragended(env) {
        var that = env;
        that.drag = false;
        // d3.select('#item-'+env.props.stroke.id).classed("dragging", false);

        // To say nothing is holded anymore and dragged
        that.props.dragItem(false);
        that.props.holdGuide([]);


        // TO detect the tap
        var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
        var time = Date.now() -  that.startPosition['time'];

        // console.log(dist, time)
        if (dist < 10 && time < 100){
            clearTimeout(that.timerPress);
            console.log('Thats a tap')
            var BBox = _getBBox('item-'+env.props.stroke.id)
            that.props.shouldOpenMenu({
                'id': guid(),
                'shouldOpen': true,
                'position': [BBox.x, BBox.y],
                'idGuide': env.props.stroke.id,
                'idLines': env.props.stroke.data.linesAttached
            })
        }
    }
    componentDidUpdate(){
        // console.log('HELLO')
        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', '2')

        // console.log(this.props.stroke)
    }
   
    render() {
        return (
            <g  id={'item-'+this.props.stroke.id} transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`}>
                <path id={this.props.stroke.id}></path>
                <path id={'fake-'+this.props.stroke.id}></path>
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Guide);