import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, showOmBB, distance, drawCircle, getSpPoint, mergeRectangles, showBboxBB, _getBBox, unionRectangles, distToSegment, guid, getBoundinxBoxEveryone, getBoundinxBoxLines } from "./../Helper";

import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import Polygon from 'polygon';
import {boxPoint, polygonBox} from 'intersects';

import intersect from 'path-intersection'

// import paper from 'paper';
// paper.setup([640, 480]);
/**
 * C'est la LIGNE ENTIER DE MOT
 */

class LinesGrouping extends Component {
    constructor(props) {
        super(props);
        this.organizedCorners = [];
        this.tableAlignement = {'x':0, 'y':0}
        this.shouldRecalculatePosition = false;
    }
    componentDidMount(){
        var that = this;
        // this.BBox = this.getBoundinxBoxEveryone();
        
        this.BBox = this.props.BBs[this.props.iteration];
        // console.log(this.BBox)
        // this.movePoints();
        // console.log('LINES GROUPING', this.props.iteration, this.props.BBs)
        this.addEventsContainer();
        this.addTags()
        if (this.BBox != null) this.movePoints();
        // this.addPlaceHolder();
    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        // console.log(this.props.line)
        //Si j'udpate la BBox
        if (this.props.placeholders != prevProps.placeholders){
            // console.log(this.props.BBs)
            
            this.BBox = this.props.BBs[this.props.iteration]
            // console.log(this.props.BBs, prevProps.BBs)
            // console.log(this.props.line)
            this.addContainer();


            this.addPlaceHolder();

            if (this.props.BBs.length != prevProps.BBs.length){
                // console.log('MOVE POINTS')
                this.movePoints();
                // this.shouldRecalculatePosition = true;
            }
            // this.addContainer();
            // this.addTags()
            // this.movePoints();
        }
        else if (this.props.sketchLines != prevProps.sketchLines){

            // showBboxBB(this.BBox, 'red');
            // this.addPlaceHolder();
            // console.log(this.props.line)
            getBoundinxBoxLines(this.props.line).then((d)=>{
                this.BBox = d;
                this.addContainer();

                this.addPlaceHolder();
                // if (this.shouldRecalculatePosition){
                //     console.log('Sketcline')
                //     this.addPlaceHolder();
                //     this.shouldRecalculatePosition = false;
                // }
            })
            // console.log(this.props.BBs, prevProps.BBs)
            //Si j'ai deja bouge mes points
            // console.log('SKETCH LINESs', this.props.BBs, prevProps.BBs)
            
            
            // this.addTags()
            // this.movePoints();
            // console.log('UPDATE SKECTHLINES')
        }
        else if (this.props.tags != prevProps.tags){
            this.addTags()
        }
        if (this.props.tagHold != prevProps.tagHold){
            if (this.props.tagHold == false) this.removeContainer();
            else this.addContainer();
        }
        if (this.props.offsetX != prevProps.offsetX){
            // console.log('GO', this.props.showGrid)
            // if (this.props.showGrid != false) this.movePointTable();
            // else this.movePoints();
            // console.log('GOOO')
        }

        // this.addContainer();
        // else if (this.props.offsetY != prevProps.offsetY){
        //     this.BBox = this.props.BBs[this.props.iteration]
        //     showBboxBB(this.BBox, 'red');
        // //     this.movePoints();
        // //     // console.log('UPDATE SKECTHLINES')
        // }
    }
    addContainer(){
        var that = this;
        var transformDrag = {'translateX': 0, 'translateY': 0}
        var item = d3.select('#group-'+ that.props.id).node()
        if (item != null){
            transformDrag = getTransformation(d3.select('#group-'+ that.props.id).attr('transform'));
        }

        d3.select('#containerBackground-'+that.props.iteration +'-'+that.props.id)
            .attr('width', that.BBox.width + 80)
            .attr('height', that.BBox.height)
            .attr('x', that.BBox.x - transformDrag.translateX)
            .attr('y', that.BBox.y - transformDrag.translateY)
            .attr('fill', 'rgba(255,0,0,0.3)')
    }
    removeContainer(){
        var that = this;
        d3.select('#containerBackground-'+that.props.iteration +'-'+that.props.id)
            .attr('width', 0).attr('height', 0).attr('x', 0).attr('y', 0).attr('fill', 'rgba(255,0,0,0.3)')
    }
    addEventsContainer(){
        var that = this;
        var el = d3.select('#containerBackground-'+that.props.iteration +'-'+that.props.id).node()
        this.mc = new Hammer.Manager(el);

        // var press = new Hammer.Press({time: 250});
        var pan = new Hammer.Pan({'pointers':1, threshold: 1});
        // var tap = new Hammer.Tap({pointers: 1});
        this.mc.add(pan);

        this.mc.on("panstart", function(ev) {
            console.log(ev)
            if (ev.pointers[0].pointerType == 'pen'){
                console.log(ev.pointers[0])
                var data = {
                    'id': guid(), 
                    'idGroupline':that.props.iteration +'-'+that.props.id, 
                    'position': [0,0],
                    'model': that.props.tagHold
                };
                that.props.addTagToGroup(data)
                // console.log('TAP', that.props.tagHold)
            }
        })
    }
    movePointTable(){
        // console.log('GO')
        var offsetXAlignement = this.props.offsetX[this.props.iteration];
        var offsetYAlignement = this.props.offsetY[this.props.iteration]

        this.tableAlignement = {'x':-offsetXAlignement, 'y': -offsetYAlignement}
        var changePositionArraySketchLines = this.props.line.map((d)=>{
            var stroke = this.props.sketchLines.find(x => x.id == d);
            stroke = JSON.parse(JSON.stringify(stroke))
            // drawCircle(stroke.position[0]-offsetXAlignement, stroke.position[1]-offsetYAlignement, '10', 'green')
            return {'id': d, 'position': [stroke.position[0]-offsetXAlignement, stroke.position[1]-offsetYAlignement]}
        })
        // console.log(changePositionArraySketchLines)
        this.props.moveLines({'data':changePositionArraySketchLines, 'iteration': this.props.iteration});
    }
    /**
     * BOUGES LES POINTS POUR LES ALIGNER AVEC LA LIGNE
     * UTILE SEULEMENT AU DEBUT
     * @param {*} arrayPositionBox 
     */
    movePoints(){
        
        var that = this;
        var line = d3.line()

        var offsetYAlignement = this.props.offsetY[this.props.iteration]
        // offsetY = 150
        // console.log(offsetY)
        var points =  JSON.parse(JSON.stringify(this.props.stroke.points));

        /**
         * POUR LE DRAG SEULENT DE L'ITEM
         */
        var transformDrag = {'translateX': 0, 'translateY': 0}
        var item = d3.select('#group-'+ that.props.id).node()
        if (item != null){
            transformDrag = getTransformation(d3.select('#group-'+ that.props.id).attr('transform'));
        }
        // console.log(transformDrag, this.props.stroke.position)


        // POINTS DE LA LIGNE
        points = points.map((d)=>{
            // drawCircle(d[0] + this.props.stroke.position[0] + transformDrag.translateX, d[1] + this.props.stroke.position[1] + transformDrag.translateY, 10, 'red')
            return [d[0] + this.props.stroke.position[0] + transformDrag.translateX, d[1] + this.props.stroke.position[1] + transformDrag.translateY]
        })
        /*var points =  JSON.parse(JSON.stringify(this.props.stroke.points));
        points = points.map((d)=>{
            return [d[0] + this.props.stroke.position[0], d[1] + this.props.stroke.position[1]]
        })*/
        // console.log(this.BBox)

        var i = 0;
        var isIn = false;
        var distanceMemory = 1000000;
        var increment = 0;
        while (i < points.length-1){

            // drawCircle(points[i][0], points[i][1], 10, 'red')
            var dist = distToSegment([points[i][0], points[i][1]], [this.BBox['x'], this.BBox['y'] + (this.BBox['height']/2)], [this.BBox['x'] + this.BBox['width'], this.BBox['y'] + (this.BBox['height']/2)])
            // var dist = distance(this.BBox['x'] , points[i][0], this.BBox['y'] + (this.BBox['height']/2),  points[i][1])
            // console.log(dist)
            if (dist < distanceMemory){
                increment = i;
                distanceMemory = dist;
            }
            // var isIn = boxPoint(this.BBox['x'], this.BBox['y'], this.BBox['width'], this.BBox['height'], points[i][0], points[i][1])
            i++;
        }
        var pointOnLine = points[increment];
        // console.log(pointOnLine)
        // drawCircle(this.BBox['x'], this.BBox['y'], 10, 'red')
        // drawCircle(pointOnLine[0], pointOnLine[1], 4,  'blue');
      
        var pointOnLine = points[increment];
        var offsetX = pointOnLine[0] - this.BBox['x'];
        // if (offsetXAlignement != 0) offsetX = 0;
        // var offsetY = pointOnLine[1] - this.BBox['y']

        // console.log(offsetX, this.props.iteration)

        var changePositionArraySketchLines = this.props.line.map((d)=>{
            var stroke = this.props.sketchLines.find(x => x.id == d);
            stroke = JSON.parse(JSON.stringify(stroke))
            var transformLine = getTransformation(d3.select('#item-'+ stroke.id).attr('transform'));
            // console.log(transformLine, stroke.position)
            // return {'id': stroke.id, 'position': [stroke.position[0]+offsetX, stroke.position[1]-offsetYAlignement]}
            return {'id': stroke.id, 'position': [transformLine.translateX+offsetX , transformLine.translateY-offsetYAlignement]}
        })
        // console.log(changePositionArraySketchLines)
        this.props.moveLines({'data':changePositionArraySketchLines, 'iteration': this.props.iteration});
    }
    addTags(){
        var that = this;
        var line = d3.line();
        
        if (this.props.tags.length != 0){
            // console.log(that.props.tags)
            var placeHolder = d3.select('#tags-'+that.props.iteration +'-'+that.props.id).selectAll('g')
                .data(that.props.tags).enter()
                .append('g')


            var X = this.BBox.x + this.BBox.width;
            var Y = this.BBox.y - 50;//+ (this.BBox.height/2);;

            var LeftorRight = placeHolder.selectAll('g')
                .data((d)=>d.model.placeHolder).enter()
                .append('g')
                .attr('transform', 'translate('+X+','+Y+')scale(2)')
                
                LeftorRight.selectAll('path')
                    .data((d)=>d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>{ console.log(d); return line(d.data) })
                    .attr('fill', 'none')
                    .attr('stroke', (d)=>d.colorStroke)
                    .attr('stroke-width', (d)=>d.sizeStroke)
        }
        
    }
    addPlaceHolder(){
        // console.log(this.props.placeholders);
        var line = d3.line()
        var that = this;


        // console.log(this.BBox)
        // var polygone = new Polygon(this.organizedCorners);
        // var poly2 = polygone.offset(50);
        // var array = poly2.points;
        // console.log(array)
        // showBboxBB(this.BBox, 'red')
        // drawCircle(array[0]['x'], array[0]['y'], 10, 'blue')
        // drawCircle(array[array.length-1]['x'], array[array.length-1]['y'], 10, 'blue')

        // console.log('GO  PLACEHOLDER')
        d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).selectAll('path').remove()
        this.props.placeholders.forEach((d)=>{
            // console.log(d)
            // 
            if (d.id == 'left' && d.lines.length > 0){
                // console.log(d)
                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).selectAll('path')
                    .data(d.lines).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=>d.colorStroke)
                    .attr('stroke-width', (d)=>d.sizeStroke)
                
                
                var transformDrag = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
                var X = this.BBox.x - transformDrag.translateX - d.BBox.width*2;
                var Y = this.BBox.y - transformDrag.translateY- d.BBox.height/2 + this.BBox.height/2;

                // console.log(X, Y)
                // var cx = d.BBox.x + d.BBox.width/2;
                // var cy = d.BBox.y + d.BBox.height/2;
                
                // //FOR SCALING
                // var scale = 0.7;
                // var x = (-cx * (scale - 1)) ;
                // var y = (-cy * (scale - 1)) ;
                // console.log(d)
                d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+X+','+Y+')')
                // d3.select('#placeHolderLeft-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+x+','+y+')scale(0.7)')

            }

        })
        // if (this.props.placeholders)
    }
    render() {
        return (
            <g transform={`translate(0,0)`}>
               <g id={'placeHolderLeft-'+this.props.iteration +'-'+this.props.id} >
                   {/* <g></g> */}
               </g>
               

               <rect style={{'pointerEvents': 'none' }} className={'containerBackground'} id={'containerBackground-'+this.props.iteration +'-'+this.props.id} />
               
                <g id={'tags-'+this.props.iteration +'-'+this.props.id} transform={`translate(0,0)scale(1)`}>

                </g>
            </g>
        );
        
    }
}
export default LinesGrouping;