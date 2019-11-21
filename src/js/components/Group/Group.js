import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getTransformation, showOmBB, showBboxBB, mergeRectangles, drawCircle, distance, _getBBox } from "./../Helper";
import { connect } from 'react-redux';

import {
    moveSketchLines
} from './../../actions';
import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import LinesGrouping from "./LinesGrouping";
import Polygon from 'polygon'

const mapDispatchToProps = { 
    moveSketchLines
};
const mapStateToProps = (state, ownProps) => {  

  return { 
      sketchLines: state.rootReducer.present.sketchLines,
  };
};


class Group extends Component {
    constructor(props) {
        super(props);

        this.state = {
            'placeholders':[],
            'sketchLines': this.props.sketchLines
        }

        this.selected = false;
    }
    componentDidMount(){
        var that = this;
        // console.log(this.props.group)
        this.placeHolder = this.props.group.model.placeHolder; 

        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.group.id)
            .attr("d", line(that.props.group.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "5");
        
        d3.select('#fake-'+that.props.group.id)
            .attr("d", line(that.props.group.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '30')
            .attr('opacity', '0.2')

        d3.select('#fake-'+that.props.group.id)
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



        this.computeLinesPlaceHOlder(JSON.parse(JSON.stringify(this.placeHolder)))
    }
    dragstarted(env) {
        var that = env;
        that.drag = false;
        that.timerPress = setTimeout(function(){
            console.log('PRESS')
            if (that.drag == false){
                // that.colorForHolding(true);
                // that.props.holdGuide(that.props.stroke.id);
                that.press = true;
                // that.props.dragItem(false);
                that.drag = false;
            }
        }, 1000)

    }

    dragged(env) {  
        var that = env;
        that.drag = true;

        clearTimeout(that.timerPress);
        var transform = getTransformation(d3.select('#item-'+env.props.group.id).attr('transform'));

        var offsetX = d3.event.x - that.lastPosition.x;
        var offsetY = d3.event.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#item-'+env.props.group.id).attr('transform', 'translate('+X+','+Y+')')


        var linesAttached = that.props.group['lines'];


        // console.log(that.props.group)
        linesAttached.forEach((groupLine)=>{
            groupLine.forEach((lineId)=>{
                var id = 'item-'+lineId;
                var transform = getTransformation(d3.select('#'+id).attr('transform'));
                var X = offsetX + transform.translateX;
                var Y = offsetY + transform.translateY;
                d3.select('#'+id).attr('transform', 'translate('+X+','+Y+')')
            })
        })
        // for (var i in linesAttached){
        //     var line = linesAttached[i];
        //     var identifier = 'item-'+line;
        //     var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
        //     var X = offsetX + transform.translateX;
        //     var Y = offsetY + transform.translateY;
        //     d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
        // }

        that.lastPosition = {'x': d3.event.x, 'y':d3.event.y}

    }
    dragended(env) {
        var that = env;
        that.drag = false;
       
        clearTimeout(that.timerPress);

        var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
        var time = Date.now() -  that.startPosition['time'];

        // console.log(dist, time)
        if (dist < 10 && time < 200){
            clearTimeout(that.timerPress);

            that.props.addToSelection({'id':env.props.group.id});
            that.colorForTaping(true);
            // console.log('Thats a tap')
            // var BBox = _getBBox('item-'+env.props.group.id)
            // that.props.shouldOpenMenu({
            //     'id': guid(),
            //     'shouldOpen': true,
            //     'position': [BBox.x, BBox.y],
            //     'idGuide': env.props.stroke.id,
            //     'idLines': []//env.props.stroke.data.linesAttached
            // })
        }
    }
    colorForTaping(isIt){
        var that = this;
        d3.select('#fake-'+that.props.group.id)
            .attr('opacity', '0.2')

        if (isIt == true){
            d3.select('#fake-'+that.props.group.id)
                .attr('opacity', '1')
            that.selected = true;
        }
        else that.selected = false;
    }
    //SERT A METTRE MES OBJETS EN 0 ABSOLU ++ Update ma BBOX de mon objet PLACEHOLDER
    computeLinesPlaceHOlder(placeholder){
        var itemsGuide = [];
        placeholder.forEach(element => {
            var lines = element.lines;

            if (lines.length > 0){
                var arrayBBox = []
                lines.forEach((d)=>{
                    var node = d3.select('#stroke-'+d.id).node();
                    var nodeParent = d3.select(node.parentNode.parentNode.parentNode);
                    var transform = getTransformation(nodeParent.attr('transform'));
                    var BB = node.getBBox();
                    BB.x = BB.x+transform.translateX;
                    BB.y = BB.y+transform.translateY;
                    arrayBBox.push(BB);
                    d.data = d.data.map((f)=> [f[0] + transform.translateX, f[1] + transform.translateY])
                })
                // SERT A TROUVER LE COIN EN HAUT A GAUCHE
                var polygon;
                if (arrayBBox.length > 1){
                    polygon = mergeRectangles(arrayBBox[0], arrayBBox[1])
                    for (var i = 2; i < arrayBBox.length; i++){
                        polygon = mergeRectangles(polygon, arrayBBox[i])
                    }
                } else polygon = arrayBBox[0]
                // showBboxBB(polygon, 'red');
                // console.log(polygon);
                //UNE FOIS QUE c'EST FAIT TOUT LE NONDE EN 0
                lines.forEach((d)=>{
                    d.data = d.data.map((f)=> [f[0] - polygon.x, f[1] - polygon.y])
                    // console.log(d.data)
                })
                element.BBox = polygon;
               
            }
            
            // console.log(element)
        });
//  console.log(placeholder)
        this.setState({'placeholders': placeholder});
        // console.log(placeholder)
    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        if (this.props.sketchLines != prevProps.sketchLines){
            // console.log('UPDATE SKECTHLINES')
            this.setState({'sketchLines': this.props.sketchLines})
        }
        // console.log('UPDATE', this.props.model, prevProps.model)
        // console.log(this.props.selected, that.selected)
        if (this.props.shouldUnselect != prevProps.shouldUnselect){
            d3.select('#fake-'+that.props.group.id).attr('opacity', '0.2')
        }

        if (this.props.group.model != prevProps.group.model){
            // console.log('GOO')
            this.computeLinesPlaceHOlder(JSON.parse(JSON.stringify(this.props.group.model.placeHolder)))
        } 
    }
    getBoundinxBoxEveryong(){
        // console.log(this.props)
    }
    moveSketchLines = (d) => {
        this.props.moveSketchLines(d);
    }
    render() {
        const listItems = this.props.group.lines.map((d, i) => {
            return <LinesGrouping 
                key={i} 
                line={d}
                sketchLines={this.state.sketchLines}
                placeholders={this.state.placeholders}
                stroke={this.props.group.stroke}
                id={this.props.group.id}
                iteration={i}

                moveSketchLines={this.moveSketchLines}
            />
        });

        return (
            <g id={'group-'+this.props.group.id} transform={`translate(0,0)`}>
                {listItems}
                <g id={'item-'+this.props.group.id} transform={`translate(${this.props.group.stroke.position[0]},${this.props.group.stroke.position[1]})`}>
                    <path style={{'pointerEvents': 'none' }} id={this.props.group.id}/>
                    <path id={'fake-'+this.props.group.id}></path>
                </g>
                {/* <rect id={'rect-'+this.props.group.id} /> */}
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Group);