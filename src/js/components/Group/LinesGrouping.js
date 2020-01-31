import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, showOmBB, distance, drawCircle, getSpPoint, mergeRectangles, showBboxBB, _getBBox, unionRectangles, distToSegment, guid, getBoundinxBoxEveryone, getBoundinxBoxLines, groupBy } from "./../Helper";

import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import Polygon from 'polygon';
import {boxPoint, polygonBox} from 'intersects';

import intersect from 'path-intersection'
import Tag from "../Tags/Tag";

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

        this.isCreated = true;
        this.BBox = [];
        this.state ={
            tagInsideBullet : null
        }
    }
    componentDidMount(){
        var that = this;
        // this.BBox = this.getBoundinxBoxEveryone();
        
        // this.BBox = this.props.BBs[this.props.iteration];
        // console.log(this.BBox,this.props.iteration)
        // this.movePoints();
        // console.log('LINES GROUPING', this.props.iteration, this.props.BBs)
        this.addEventsContainer();
        this.addTags()
        // if (this.BBox != null && this.BBox != undefined) {
        //     this.movePoints();
        //     this.addContainer();
        // }
        
        // this.addGesturesContainer();
        // this.addPlaceHolder();
    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        // console.log(this.props.line)
        //Si j'udpate la BBox

        // if (this.props.line != prevProps.line){

        //     console.log('MOVE LINES')
        //     this.movePoints();
        // }
        if (this.props.BBs != prevProps.BBs){
            this.BBox = this.props.BBs[this.props.iteration];
            this.addContainer();
            this.addPlaceHolder();
        }
        if (this.props.placeholders != prevProps.placeholders){
            if (this.isCreated == true && this.BBox != undefined){
                this.movePoints();
                this.addContainer();
                this.addPlaceHolder();
                this.isCreated = false;
            }

        }
        else if (this.props.sketchLines != prevProps.sketchLines){

           
            this.addPlaceHolder();

            setTimeout(function(){
                getBoundinxBoxLines(that.props.line).then((d)=>{
                    // console.log('=================== GO', that.props.line)
                    that.BBox = d;
                    // showBboxBB(d, 'red');
                    // d3.selectAll('.BB').remove()
                    // showBboxBB(d, 'red')
                    that.addContainer();

                    that.addPlaceHolder();
                })
            }, 10)
        }
        else if (this.props.tags != prevProps.tags){
            this.addTags()
        }
        if (this.props.tagHold != prevProps.tagHold){
            if (this.props.tagHold == false) this.removeContainer();
            else this.addContainer();
        }
        if (this.props.offsetY != prevProps.offsetY){
            // console.log('GO', this.props.showGrid)
            // this.BBox = this.props.BBs[this.props.iteration]
            // this.movePoints();
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

        /** RED */
        
        d3.select('#containerBackground-'+that.props.iteration +'-'+that.props.id)
            .attr('width', that.BBox.width + 80)
            .attr('height', that.BBox.height)
            .attr('x', that.BBox.x - transformDrag.translateX)
            .attr('y', that.BBox.y - transformDrag.translateY)
            .attr('fill', 'rgba(255,0,0,0.0)')
    
            
    }
    removeContainer(){
        var that = this;
        d3.select('#containerBackground-'+that.props.iteration +'-'+that.props.id)
            .attr('width', 0).attr('height', 0).attr('x', 0).attr('y', 0).attr('fill', 'rgba(255,0,0,0.3)')
    }
    addEventsContainer(){
        // var that = this;
        // var el = d3.select('#containerBackground-'+that.props.iteration +'-'+that.props.id).node()
        // this.mc = new Hammer.Manager(el);

        // // var press = new Hammer.Press({time: 250});
        // var pan = new Hammer.Pan({'pointers':1, threshold: 1});
        // var tap = new Hammer.Tap({pointers: 1});
        // this.mc.add(pan);
        // this.mc.add(tap);

        // this.mc.on("panstart", function(ev) {
        //     console.log(ev)
        //     if (ev.pointers[0].pointerType == 'pen'){
        //         console.log(ev.pointers[0])
        //         var data = {
        //             'id': guid(), 
        //             'idGroupline':that.props.iteration +'-'+that.props.id, 
        //             'position': [0,0],
        //             'model': that.props.tagHold
        //         };
        //         that.props.addTagToGroup(data)
        //         // console.log('TAP', that.props.tagHold)
        //     }
        // })

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

        // console.log(this.props)
        var offsetYAlignement = this.props.offsetY[this.props.iteration]
        // offsetY = 150
        
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

        // console.log(this.BBox['x'])
        // if (offsetXAlignement != 0) offsetX = 0;
        // var offsetY = pointOnLine[1] - this.BBox['y']

        /** DETECT OFFSET IF BULLET */
        var placeHolderLine = this.props.placeholders.find(x => x.id == 'backgroundLine');
        var offset = 50//(placeHolderLine.lines.length>0) ? 150 : 50;
        // console.log(offset, placeHolderLine, placeHolderLine.lines.length)
        

        // console.log(offsetX, this.props.iteration)

        var changePositionArraySketchLines = this.props.line.map((d)=>{
            var stroke = this.props.sketchLines.find(x => x.id == d);
            stroke = JSON.parse(JSON.stringify(stroke))
            var transformLine = getTransformation(d3.select('#item-'+ stroke.id).attr('transform'));
            // console.log(transformLine, stroke.position)
            // return {'id': stroke.id, 'position': [stroke.position[0]+offsetX, stroke.position[1]-offsetYAlignement]}
            return {'id': stroke.id, 'position': [transformLine.translateX+offsetX + offset, transformLine.translateY-offsetYAlignement]}
        })
        // console.log('MOVE LINES')
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
        // console.log(this.props.placeholders)
        var line = d3.line()
        var that = this;
        // d3.select('#placeHolderBulletLine-'+that.props.iteration +'-'+that.props.id).selectAll('*').remove();


        d3.select('#placeHolderBackgroundLine-'+that.props.iteration +'-'+that.props.id).selectAll('*').remove();
        d3.select('#placeHolderBackgroundLinePattern-'+that.props.iteration +'-'+that.props.id).selectAll('*').remove();
        d3.select('#placeHolderTagLine-'+that.props.iteration +'-'+that.props.id).selectAll('*').remove();


        var placeHolderLine = this.props.placeholders.find(x => x.id == 'backgroundLine');
        // var outerBackground = this.props.placeholders.find(x => x.id == 'outerBackground');


        const grouped = groupBy(placeHolderLine.lines, line => line.type);
        var normal = grouped.get("normal");
        var tagLines = grouped.get("tag");


        // console.log(normal, tag)
        if (placeHolderLine.lines.length > 0){
           
            if (normal != undefined && normal.length > 0){
                
                var BBoxCreation = normal[0]['BBoxPlaceHolder'];
                var newBBox = placeHolderLine
                // console.log(, )
                d3.select('#placeHolderBulletLine-'+that.props.iteration +'-'+that.props.id).selectAll('path')
                    .data(normal).enter()
                    .append('path')
                    .attr('d', (d)=>line(d.data))
                    .attr('fill', 'none')
                    .attr('stroke', (d)=>d.colorStroke)
                    .attr('stroke-width', (d)=>d.sizeStroke)
                    .attr('stroke-linejoin', "round")

                // showBboxBB(placeHolderLine, 'red')

                // showBboxBB(this.BBox, 'green')
                var transformDrag = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
                // var transform = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
                // var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
                // var X = this.BBox.x - transformDrag.translateX  - 80; 
                // var Y = this.BBox.y - transformDrag.translateY  - 20;

                // thisBBox = toutes les box des lignes
                // placeholderLine = Premier ligne seulement
                // NewBBox = l'endroit ou je cree mon element
                // BBox creation = la bbox qui a cree cet element
                var X = this.BBox.x - placeHolderLine.x - 80 + (newBBox.x - BBoxCreation.x) - transformDrag.translateX;
                var Y = this.BBox.y - placeHolderLine.y -20 + (newBBox.y - BBoxCreation.y) - transformDrag.translateY;

                // console.log(transformDrag)
                d3.select('#placeHolderBulletLine-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+X+','+Y+')')
            }

            if (tagLines != undefined && tagLines.length > 0){
                // console.log('ITS A TAG', tagLines)

                var BBoxCreation = tagLines[0]['BBoxPlaceHolder'];
                var newBBox = placeHolderLine


                // console.log(newBBox.x - BBoxCreation.x)
                var tag = JSON.parse(JSON.stringify(tagLines[0]['tag']));
                tag.id = that.props.iteration +'-'+ guid();
                tag.placeHolder[0]['lines'].forEach(element => { element.id = that.props.iteration +'-'+ guid() });
                for (var j in tag.tagSnapped){
                    var placeHolderTagSnapped = tag.tagSnapped[j]['placeHolder'];
                    placeHolderTagSnapped[0]['lines'].forEach(element => {element.id = that.props.iteration +'-'+ guid()});
                }
                // console.log(tag)
                this.setState({tagInsideBullet: <Tag key={0} stroke={tag} isGallery={false} holdTag={null} colorStroke = {'red'} sizeStroke = {10} /> })
                // var transformDrag = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
                // var X = this.BBox.x - transformDrag.translateX - 145; 
                // var Y = this.BBox.y - transformDrag.translateY - 100;
                var X = this.BBox.x - placeHolderLine.x - 80 + (newBBox.x - BBoxCreation.x)
                var Y = this.BBox.y - placeHolderLine.y -20 + (newBBox.y - BBoxCreation.y)


                // var difference = 0;
                // for (var i = 0; i < that.props.iteration +1; i++){
                //     if (i != 0) difference += this.props.BBs[i]['y'] - this.props.BBs[i-1]['y']
                // }
                d3.select('#placeHolderBulletLine-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate('+X+','+Y+')')
                // d3.select('#placeHolderBulletLine-'+that.props.iteration +'-'+that.props.id).attr('transform', 'translate(')')
            }

            // console.log(this.props.placeholders)
        }


        var placeHolderText = this.props.placeholders.find(x => x.id == 'backgroundText');

        if (placeHolderText != null && placeHolderText.lines.length > 0){
            var transform = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
            var transformPan = getTransformation(d3.select('#panItems').attr('transform'));

            const grouped = groupBy(placeHolderText.lines, line => line.type);
            var scale = grouped.get("normal");
            var pattern = grouped.get("pattern");


            if (scale != undefined && scale.length > 0){

                var BBoxCreation = scale[0]['BBoxPlaceHolder'];
                var newBBox = placeHolderText

                var X = this.BBox.x + (newBBox.x - BBoxCreation.x) - transform.translateX;
                var Y = this.BBox.y  + (newBBox.y - BBoxCreation.y) - transform.translateY;

                var myScaleX = d3.scaleLinear().domain([placeHolderText.x, placeHolderText.x + placeHolderText.width]).range([X, X + that.BBox.width ]);
                var myScaleY = d3.scaleLinear().domain([placeHolderText.y, placeHolderText.y + placeHolderText.height]).range([Y, Y + that.BBox.height ]);
                var lines = JSON.parse(JSON.stringify(scale))
                // console.log(lines)
                lines.forEach((line, it)=>{ line.data = line.data.map((e)=> { return [myScaleX(e[0] ) , myScaleY(e[1] )] })})
                for (var i = 0; i < lines.length; i += 1){
                    var myLine = lines[i]
                    // console.log(i)
                    d3.select('#placeHolderBackgroundLine-'+that.props.iteration +'-'+that.props.id).append('path')
                        .attr('d', ()=>line(myLine.data))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=>myLine.colorStroke)
                        .attr('stroke-width', (d)=>myLine.sizeStroke)
                }
            }
            /*if (pattern != undefined && pattern.length > 0){
                   
                pattern.forEach((myPattern, i)=>{
                    var container = d3.select('#placeHolderBackgroundLinePattern-'+that.props.iteration +'-'+that.props.id)
                    var myLine = JSON.parse(JSON.stringify(myPattern['data']))
                    var myNewLine = myLine.map((e)=> {return [myScaleX(e[0] + placeHolderText.BBox.x) - transform.translateX, myScaleY(e[1] + placeHolderText.BBox.y) - transform.translateY]})
                        
                        
                    var pathSelection = d3.select('#placeHolderBackgroundLinePattern-'+that.props.iteration +'-'+that.props.id)
                        .append('path')
                        .attr('id', 'pathLine-'+that.props.id+'-'+i)
                        .attr('d', (d)=>line(myNewLine))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> myPattern.colorStroke )
                        .attr('stroke-width', 1)
                        .attr('opacity', '0')
    
                        var step = myPattern.pattern.BBox.width;
                        var path = pathSelection.node()
                        var length = path.getTotalLength();
                        // console.log(length, path)
                        for (var i = 0; i < length; i += step){
                            var point = path.getPointAtLength(i);
                            var X = point['x']// + that.props.parent.position[0];
                            var Y = point['y']// + that.props.parent.position[1];
                            
                            var container = d3.select('#placeHolderBackgroundLinePattern-'+that.props.iteration +'-'+that.props.id).append('g').attr('transform', 'translate('+X+','+Y+')')
                            for (var j = 0; j < myPattern.pattern.strokes.length; j += 1){
                                var element = myPattern.pattern.strokes[j];
                                container.append('g').attr('transform', 'translate('+element.position[0]+','+element.position[1]+')')
                                .append('path')
                                .attr('d', (d)=>line(element.points))
                                .attr('fill', 'none')
                                .attr('stroke', (d)=> element.data.colorStroke )
                                .attr('stroke-width', element.data.sizeStroke)
                            }    
                        }
    
                })
            }*/
        }

        
        


    }
    render() {

        // console.log(this.state.tagInsideBullet)
        return (
            <g transform={`translate(0,0)`}>
               <g id={'placeHolderBulletLine-'+this.props.iteration +'-'+this.props.id} >

                   {this.state.tagInsideBullet}
                   {/* <g></g> */}
               </g>
               <g id={'placeHolderTagLine-'+this.props.iteration +'-'+this.props.id} >
                   {/* <g></g> */}
               </g>

               <g id={'placeHolderBackgroundLine-'+this.props.iteration +'-'+this.props.id} >
                   {/* <g></g> */}
               </g>

               <g id={'placeHolderBackgroundLinePattern-'+this.props.iteration +'-'+this.props.id} >
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