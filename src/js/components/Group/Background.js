import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, showOmBB, distance, drawCircle, getSpPoint, mergeRectangles, showBboxBB, _getBBox, unionRectangles, _getBBoxPromise, simplify, groupBy, guid } from "../Helper";

import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import Polygon from 'polygon';
import Tag from "../Tags/Tag";
// import { resolve } from "dns";


/**
 * C'est la LIGNE ENTIER DE MOT
 */

class Background extends Component {
    constructor(props) {
        super(props);
        this.organizedCorners = [];

        this.state = {
            tagInsideBG: null
        }
    }
    componentDidMount(){
        var that = this;
        // this.BBox = this.getBoundinxBoxEveryone().then((d)=>{
            
        // })

        this.getBoundinxBoxEveryone().then((d)=>{  
            this.BBox = d;

            
            this.addPlaceHolder();
        })
        // this.movePoints();
        // console.log('HELLO BG')
    }
    componentDidUpdate(prevProps, prevState){
        var that = this;
        //Si j'udpate la BBox
        
        if (this.props.placeholders != prevProps.placeholders){
            // console.log('Update placeHolders')
            this.getBoundinxBoxEveryone().then((d)=>{
                // console.log(d)
                // console.log(this.props.placeholders)
                this.BBox = d;
                this.addPlaceHolder();
            })
            
        }
        else if (this.props.sketchLines != prevProps.sketchLines){
            // console.log('Update sketchlines')
            this.getBoundinxBoxEveryone().then((d)=>{
                // console.log(JSON.stringify(d));
                // showBboxBB(d, 'red');
                // console.log(this.props.placeholders)
                this.BBox = d;
                this.addPlaceHolder();
            })
           
        }
        // this.addPlaceHolder();
    }
    /**
     * FAIT LA BOUNDING BOX DE TOUT LE MONDE
     */
    getBoundinxBoxEveryone = async () => {
        var that = this;
        



        var BBLine = await _getBBoxPromise('item-'+that.props.group.id);
        // console.log(BBLine)
        var rectangle = BBLine;
        // var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        // BBLine.x = BBLine.x - transformPan.translateX;
        // BBLine.y = BBLine.y - transformPan.translateY;

        /** GET BBOX OF all Lines */
        for (let i = 0; i < this.props.group.lines.length; i++) {
            var line = this.props.group.lines[i];
            // line.forEach(strokeId => {
                // console.log(line)
                for (let index = 0; index < line.length; index++) {
                    var strokeId = line[index];
                    
                    var BB = await _getBBoxPromise('item-'+strokeId);
                    
                    if (rectangle == null) rectangle = BB;
                    else rectangle = unionRectangles(rectangle, BB);
    
            }

           
            // GET apres le drag en compte sur les BBox
            //
            // // console.log(transform)
            // rectangle.x -= transform.translateX;
            // rectangle.y -= transform.translateY;
        }
        // showBboxBB(rectangle, 'red');
        if (rectangle != null){
            var transformPan = {'translateX': 0, 'translateY': 0}
            transformPan = getTransformation(d3.select('#panItems').attr('transform'));
            rectangle.x = rectangle.x - transformPan.translateX;
            rectangle.y = rectangle.y - transformPan.translateY;
        }
       
        // console.log(rectangle)
        return rectangle;
        // resolve(rectangle);

    }
    addPlaceHolder(){
        var that = this;

        // console.log('GO', JSON.parse(JSON.stringify(that.BBox)))
        // console.log(this.props.placeholders)
        // showBboxBB(this.BBox, 'red');
        // console.log(this.BBox)
        var line = d3.line().curve(d3.curveBasis)
        
        var transform = {"translateX":0, "translateY" :0};
        transform = getTransformation(d3.select('#group-'+that.props.id).attr('transform'));
        var offsetX = 0;
        var offsetY = 0;
        var totalHeight = 0;
        var totalWidth = 0;
        var offsetWidth = 25 + transform.translateX;
        var offsetHeight = 25 + transform.translateY;

     
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'))
        d3.select('#placeHolderBGLine-'+that.props.id).selectAll('g').remove()
        d3.select('#placeHolderText-'+that.props.id).selectAll('g').remove();
        
        
        d3.select('#placeHolderOuterBG-'+that.props.id).selectAll('g').remove();
        d3.select('#placeHolderOuterBG-'+that.props.id).selectAll('path').remove();
        d3.select('#placeHolderOuterBGPattern-'+that.props.id).selectAll('g').remove();
        var lineBG = this.props.placeholders.find(x => x.id == 'backgroundLine')
        
        this.props.placeholders.forEach((d)=>{
            // console.log(d)
            if (d.id == 'outerBackground' && d.lines.length > 0){

                const grouped = groupBy(d.lines, line => line.type);
                var scale = grouped.get("normal");
                var pattern = grouped.get("pattern");
                var tag = grouped.get("tag");

                // console.log(tag)
                // /** For scale data */
                // console.log(d.BBox.y, d.BBox.y + d.BBox.height, that.BBox.y - 100 , that.BBox.y + that.BBox.height + 70)
                
                if (scale != undefined && scale.length > 0){
                    var lines = JSON.parse(JSON.stringify(scale))

                    for (var i = 0; i < lines.length; i += 1){
                        var myLine = lines[i];

                        /** BOX */
                        
                        var BBoxOriginalHolder = myLine.BBoxPlaceHolder

                        // console.log(d, BBoxOriginalHolder)
                        // console.log(BBoxOriginalHolder.x, BBoxOriginalHolder.x + BBoxOriginalHolder.width, d.BBox.x, d.BBox.x + d.BBox.width)
                        // var myScaleX = d3.scaleLinear().domain([BBoxOriginalHolder.x, BBoxOriginalHolder.x + BBoxOriginalHolder.width]).range([that.BBox.x - 80 , that.BBox.x + that.BBox.width + 170]);
                        // var myScaleY = d3.scaleLinear().domain([BBoxOriginalHolder.y, BBoxOriginalHolder.y + BBoxOriginalHolder.height]).range([that.BBox.y - 100 , that.BBox.y + that.BBox.height + 70]);
                        var myScaleX = d3.scaleLinear().domain([BBoxOriginalHolder.x, BBoxOriginalHolder.x + BBoxOriginalHolder.width]).range([d.x, d.x + d.width]);
                        var myScaleY = d3.scaleLinear().domain([BBoxOriginalHolder.y, BBoxOriginalHolder.y + BBoxOriginalHolder.height]).range([d.y , d.y + d.height]);


                        var points =  myLine.data.map((e)=> {
                            return [myScaleX(e[0] ) - transform.translateX, myScaleY(e[1]) - transform.translateY]
                        })
                        d3.select('#placeHolderOuterBG-'+that.props.id).append('path')
                            .attr('d', ()=>line(points))
                            .attr('fill', 'none')
                            .attr('stroke', ()=> myLine.colorStroke )
                            .attr('stroke-width', (e)=>{return myLine.sizeStroke})// + (that.BBox.width / d.BBox.width);})
                    }
                }

                if (tag != undefined && tag.length > 0){
                    var lines = JSON.parse(JSON.stringify(tag));

                    
                    for (var i = 0; i < lines.length; i += 1){
                        var myLine = lines[i];

                        console.log(myLine)
                        var BBoxOriginalHolder = myLine.BBoxPlaceHolder

                        var myScaleX = d3.scaleLinear().domain([BBoxOriginalHolder.x, BBoxOriginalHolder.x + BBoxOriginalHolder.width]).range([d.x - 80 , d.x + d.width + 170]);
                        var myScaleY = d3.scaleLinear().domain([BBoxOriginalHolder.y, BBoxOriginalHolder.y + BBoxOriginalHolder.height]).range([d.y - 100 , d.y + d.height + 70]);


                        var tag = JSON.parse(JSON.stringify(myLine.tag));
                        tag.id = guid();
                        tag.placeHolder[0]['lines'].forEach(element => { element.id = guid() });
                        for (var j in tag.tagSnapped){
                            tag.tagSnapped[j].id = guid()
                            var placeHolderTagSnapped = tag.tagSnapped[j]['placeHolder'];
                            // console.log(tag.tagSnapped[j])
                            placeHolderTagSnapped[0]['lines'].forEach(element => {element.id = guid()});
                        }
                        this.setState({tagInsideBG: <Tag key={0} stroke={tag} isGallery={false} holdTag={null} colorStroke={'red'} sizeStroke = {10} /> })
                    }
                }


                /** for pattern data */
                if (pattern != undefined && pattern.length > 0){
                //    console.log(d)
                    pattern.forEach((myPattern, i)=>{
                        var container = d3.select('#placeHolderOuterBGPattern-'+that.props.id)

                        
                        var BBoxOriginalHolder = myPattern.BBoxPlaceHolder
                        var myScaleX = d3.scaleLinear().domain([BBoxOriginalHolder.x, BBoxOriginalHolder.x + BBoxOriginalHolder.width]).range([d.x, d.x + d.width]);
                        var myScaleY = d3.scaleLinear().domain([BBoxOriginalHolder.y, BBoxOriginalHolder.y + BBoxOriginalHolder.height]).range([d.y, d.y + d.height]);
                        var myLine = JSON.parse(JSON.stringify(myPattern['data']))
                        var myNewLine = myLine.map((e)=> {return [myScaleX(e[0]) - transform.translateX, myScaleY(e[1]) - transform.translateY]})
                            
                        // console.log()
                            
                        var pathSelection = d3.select('#placeHolderOuterBGPattern-'+that.props.id)
                            .append('path')
                            .attr('id', 'pathLine-'+that.props.id+'-'+i)
                            .attr('d', (d)=>line(myNewLine))
                            .attr('fill', 'none')
                            .attr('stroke', (d)=> myPattern.colorStroke )
                            .attr('stroke-width', (e)=>{return myLine.sizeStroke})// + (that.BBox.width / d.BBox.width))
                            .attr('opacity', '0')

                            var step = myPattern.pattern.BBox.width;
                            var path = pathSelection.node()
                            var length = path.getTotalLength();

                            for (var i = 0; i < length; i += step){
                                var point = path.getPointAtLength(i);
                                // that.props.patternPenData.BBox.width/2;
                                var X = point['x'] - myPattern.pattern.BBox.width/2// + that.props.parent.position[0];
                                var Y = point['y'] - myPattern.pattern.BBox.height/2// + that.props.parent.position[1];
                    
                                var container = d3.select('#placeHolderOuterBGPattern-'+that.props.id).append('g').attr('transform', 'translate('+X+','+Y+')')
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
                }
            }

        })



    }
    render() {
        // console.log('GO')
        return (
            <g id={'background-'+this.props.id} transform={`translate(0,0)`}>
               <g id={'placeHolderOuterBG-'+this.props.id} ></g>
               <g id={'placeHolderOuterBGPattern-'+this.props.id} ></g>
               {this.state.tagInsideBG}
        {/* <g id={'placeHolderText-'+this.props.id} ></g>
               <g id={'placeHolderBGLine-'+this.props.id} ></g> */}
            </g>
        );
        
    }
}
export default Background;