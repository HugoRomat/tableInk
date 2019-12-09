import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getTransformation, unionRectangles, showOmBB, showBboxBB, mergeRectangles, drawCircle, distance, _getBBox, _getBBoxPromise, _getBBoxPan, guid } from "./../Helper";
import { connect } from 'react-redux';
// import shallowCompare from 'react-addons-shallow-compare';
import {
    addTagToGroup,
    moveSketchLines
} from './../../actions';
import Vector from "../../../../customModules/vector";
import CalcConvexHull from "../../../../customModules/convexhull";
import CalcOmbb from "../../../../customModules/ombb";
import LinesGrouping from "./LinesGrouping";
import Polygon from 'polygon'
import Background from "./Background";

const mapDispatchToProps = { 
    moveSketchLines,
    addTagToGroup,
};
const mapStateToProps = (state, ownProps) => {  

  return { 
      sketchLines: state.rootReducer.present.sketchLines,
      tagsGroup: state.rootReducer.present.tagsGroup,
  };
};


class Group extends Component {
    constructor(props) {
        super(props);

        this.state = {
            'placeholders':[],
            'sketchLines': this.props.sketchLines,
            'BBs': [],
            'offsetY': []
        }

        this.selected = false;
        this.getIn = false;

        this.i= 0;
        // setTimeout(()=> {
        
        // }, 3000)
        // console.log('-------------------------ENDED');


        // setTimeout(()=>{
            // console.log(JSON.stringify(d3.select('#panItems').node().getBBox()))
        // }, 1000)
        // this.forLoop()
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


        // console.log(JSON.parse(JSON.stringify(this.placeHolder)))
        this.getBoundinxBoxEveryone().then(()=> {
            this.computeLinesPlaceHOlder(JSON.parse(JSON.stringify(this.placeHolder)))
        })


        //Swipe on the BIG box
        var that = this;
        var el = d3.select('#rect-'+this.props.group.id).node()
        this.mc = new Hammer.Manager(el);
        var swipe = new Hammer.Swipe({pointers: 1});
        this.mc.add(swipe);

        this.mc.on("swipeleft", function(ev) {
            if (ev.pointers[0].pointerType == 'touch'){
                console.log('swipeleft', ev.direction)
                that.createTable();
                
                // var data = {
                //     'id': guid(), 
                //     'idGroupline':that.props.iteration +'-'+that.props.id, 
                //     'position': [0,0],
                //     'model': that.props.tagHold
                // };
                // that.props.addTagToGroup(data)
                // // console.log('TAP', that.props.tagHold)
            }
        }) 

        
        
    }
    initiateTable(){
        // var tables = this.props.group.tables;
        // var master = tables[0];
        // var modelMaster = this.props.allGroups.find(x => x.id == master);
        // var paddingMaster = modelMaster.model.paddingBetweenLines;

        // //CHANGE PADDING FOR ALL GROUPS
        // /******************************/
        // var initial = tables[0];

        // var bb = _getBBoxPan('group-'+initial);
        

        // if (this.i == 0) showBboxBB(bb, 'red');
        // // else showBboxBB(bb, 'green');
        // for (var i = 1; i< tables.length; i++){
        //     // var 
        // }
       
        
        // // var allGroups = 
        // console.log('GO', tables, this.props.group.id);
        // this.i++;
    }
    createTable(){
        var modelMaster = null;
        var idTable = null;
        console.log()
        this.props.tables.forEach((t)=>{
            // console.log(t)
            idTable = t.id;
            modelMaster = t.data.find(x => x.id == this.props.groupHolded);
        })
        // 
        console.log(modelMaster)
        if (modelMaster == null){
            var data = [{
                            'id': this.props.groupHolded,
                            'children':[{
                                'id': this.props.group.id,
                                'direction': 'left'
                            }
                        ]},{   
                            'id': this.props.group.id,
                            'children':[]
                        }]
            this.props.createTable({'id': guid(), 'data':data});
            // this.props.computeTables({'id': this.props.group.id});
        } else {
            // ADD TO LEFT
            this.props.addToTable({'idTable':idTable,  'idParent': this.props.groupHolded, 'data':{'id': this.props.group.id,'direction': 'left'}});
        }
        // this.props.addTables({'id1': this.props.group.id, 'id2': this.props.groupHolded})
    }
    dragstarted(env) {
        var that = env;
        that.drag = false;
        that.timerPress = setTimeout(function(){
            console.log('PRESS')
            if (that.drag == false){
                // that.colorForHolding(true);
                that.props.holdGuide(env.props.group.id);
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
        var transform = getTransformation(d3.select('#group-'+env.props.group.id).attr('transform'));

        var offsetX = d3.event.x - that.lastPosition.x;
        var offsetY = d3.event.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#group-'+env.props.group.id).attr('transform', 'translate('+X+','+Y+')')


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

        that.props.holdGuide(false);

        // console.log(dist, time)
        if (dist < 10 && time < 200){
            clearTimeout(that.timerPress);

            that.props.addToSelection({'id':env.props.group.id});
            that.colorForTaping(true);
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
    // POUR TOUS LES PLACEHOLDER
    //SERT A METTRE MES OBJETS EN 0 ABSOLU ++ Update ma BBOX de mon objet PLACEHOLDER
    computeLinesPlaceHOlder(placeholder){
        var that = this;
        var itemsGuide = [];

        // console.log(placeholder[1]['lines'][0]['data'][0])
        
        placeholder.forEach(element => {
            var lines = element.lines;
            // console.log(lines)
            if (lines.length > 0){
                var arrayBBox = [];
                // console.log('#placeHolder-'+element.id +'-' + that.props.group.model.id);
                var node = d3.select('#placeHolder-'+element.id +'-' + that.props.group.model.id).select('#rect-'+ element.id).node();
                var nodeParent = d3.select(node.parentNode.parentNode);

                var transform = getTransformation(nodeParent.attr('transform'));
                var BB = node.getBBox();
                BB.x = BB.x+transform.translateX;
                BB.y = BB.y+transform.translateY;
                BB.width = d3.select('#placeHolder-'+element.id +'-' + that.props.group.model.id).select('#rect-'+ element.id).attr('width');
                BB.height = d3.select('#placeHolder-'+element.id +'-' + that.props.group.model.id).select('#rect-'+ element.id).attr('height')
                arrayBBox.push(BB);

                // console.log(BB, d3.select('#placeHolder-'+element.id +'-' + that.props.group.model.id).select('#rect-'+ element.id).attr('width'))
                // // console.log(transform)
                lines.forEach((d)=>{
                    
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

                // console.log(lines)
                // showBboxBB(polygon, 'red');
            }
            
            // console.log(polygon, element.id)
        });
        // console.log('endPlaceHolder')
        this.setState({'placeholders': placeholder});
        // console.log(placeholder)
    }
    sleep = () => {
        return new Promise(resolve => setTimeout(resolve, 200))
    }
    forLoop = async () => {
        console.log('Start')
      
        for (let index = 0; index < 800; index++) {
            console.log(index)
          await this.sleep()
        }
      
        console.log('End')
      }
    // async asyncData (app) {
    //     const res = await app.$axios.$get('api.v1/feeds')
    //     return { feeds: res}
    //   }
     /**
     * FAIT LA BOUNDING BOX DE TOUT LE MONDE
     */
    getBoundinxBoxEveryone = async () => {
        // var BB = await _getBBoxPromise('item-'+strokeId);
        // return new Promise((resolve, reject) => {
        var BBox = [];
        // console.log('start')

        for (let i = 0; i < this.props.group.lines.length; i++) {
            var line = this.props.group.lines[i];
            var rectangle = null;
            var that = this;


            for (let index = 0; index < line.length; index++) {
                // console.log(i)
                var strokeId = line[index];
                var BB = await _getBBoxPromise('item-'+strokeId);
    
                // console.log(JSON.stringify(BB))

                if (rectangle == null) rectangle = BB;
                else rectangle = unionRectangles(rectangle, BB);
                
            }
           
            var transformPan = {'translateX': 0, 'translateY': 0}
            var transformDrag = {'translateX': 0, 'translateY': 0}
            var item = d3.select('#panItems').node()
            if (item != null){
                transformPan = getTransformation(d3.select('#panItems').attr('transform'));
            } 
            var item = d3.select('#group-'+ that.props.group.id).node()
            if (item != null){
                transformDrag = getTransformation(d3.select('#group-'+ that.props.group.id).attr('transform'));
            } 
            // GET apres le drag en compte sur les BBox
            // console.log(transform)
            rectangle.x = rectangle.x - transformPan.translateX - transformDrag.translateX;
            rectangle.y = rectangle.y - transformPan.translateY - transformDrag.translateY;
            // showBboxBB(rectangle, 'red');
            // console.log(BBox)
            BBox.push(rectangle)
            // console.log('PUSH')
        }

        this.BB = BBox

        // console.log('endBBox')
        this.computePosition();
        

        
        // return BBox;

    }
    computePosition(){
        var offset = [];
        
        var padding = this.props.group.model.paddingBetweenLines;
        var bb = JSON.parse(JSON.stringify(this.BB));
        // this.BB.forEach((d)=> console.log(d))
        var bbwithIndex = this.BB.map((d, i)=>{ d.index = i; return d })
        bbwithIndex.sort((a, b) => a.y - b.y);
        var initialPosition = JSON.parse(JSON.stringify(bbwithIndex[0]['y']));
        bbwithIndex.forEach((d, i)=>{
            offset.push({'position': initialPosition, 'index':d.index});
            initialPosition += d.height  + padding;
            
        })

        // this.BB.sort((a, b) => );
        this.offset = offset.map((d, i)=>{
            // console.log(JSON.stringify(bb[i]), d.position )
            return {'index': d.index, 'value':bbwithIndex[i]['y'] - d.position }
        })
        this.offset.sort((a, b) => a.index - b.index);
        this.offsetY = this.offset.map((d)=>{
            return d.value;
        })

        // this.setState({'offsetY': this.offsetY})
        // console.log(this.offsetY)
    }
   
    componentDidUpdate(prevProps, prevState){
        var that = this;
        
        if (this.props.shouldUnselect != prevProps.shouldUnselect){
            d3.select('#fake-'+that.props.group.id).attr('opacity', '0.2')
        }
        if (this.props.group.model.placeHolder != prevProps.group.model.placeHolder){
            this.placeholder = JSON.parse(JSON.stringify(this.props.group.model.placeHolder))
            this.getBoundinxBoxEveryone().then(()=> {
                this.computeLinesPlaceHOlder(this.placeholder);
                
            })
            // console.log('placeholder')
        }
        if (this.props.groupHolded != prevProps.groupHolded){
            if (this.props.groupHolded == false){
                d3.select('#rect-'+this.props.group.id).attr('width', 0).attr('height', 0)
            }
            else if (this.props.groupHolded != this.props.group.id){
                // console.log(this.props.groupHolded, this.props.group.id)
                _getBBoxPromise('group-'+this.props.group.id).then((d)=> {
                        var transformPan = {'translateX': 0, 'translateY': 0}
                        var item = d3.select('#panItems').node()
                        if (item != null){
                            transformPan = getTransformation(d3.select('#panItems').attr('transform'));
                        }
                        d3.select('#rect-'+this.props.group.id)
                            .attr('width', d.width)
                            .attr('height', d.height)
                            .attr('x', d.x - transformPan.translateX)
                            .attr('y', d.y - transformPan.translateY)
                            .attr('fill', 'rgba(0,255,0,0.2')
                    
                })
            }
            // console.log('groupHolded')
        }

        // this.initiateTable()
        // DRAW The box for swiping
        /**/

        // var d = _getBBox('background-'+this.props.group.id)
        
        // console.log(d)
        // d3.select('#rect-'+this.props.group.id)
        //     .attr('width', d.width)
        //     .attr('height', d.height)
        //     .attr('x', d.x)
        //     .attr('y', d.y)
        //     .attr('fill', 'rgba(0,255,0,0.3')
    }
    getBoundinxBoxEveryong(){
        // console.log(this.props)
    }
    // moveSketchLines = (d) => {
    //     // console.log('GO')
    //     this.props.moveSketchLines(d);
    // }
    moveLines = (d) => {
        this.props.moveSketchLines(d.data);
        if (d.iteration == this.props.group.lines.length-1){
            this.getBoundinxBoxEveryone().then(()=> {
                this.computeLinesPlaceHOlder(JSON.parse(JSON.stringify(this.placeHolder)))
                this.props.computeTables({'id': this.props.group.id});
            })
        }
    }
    render() {

        // console.log(this.props)

       
        // console.log(BB)
        // var sticky = this.props.stickyLines.find(x => x.id == this.guideTapped.item)

        //Pour chaque ligne reconnu dans mon groupe
        var listItems = this.props.group.lines.map((d, i) => { return <g key={i} ></g>})
        if (this.state.placeholders.length > 0){
            listItems = this.props.group.lines.map((d, i) => {

                // POUR LES TAGS
                var results= this.props.tagsGroup.filter(x => x.idGroupline == i + '-' + this.props.group.id);
                // var sticky = this.props.tagsGroup.find(x => x.idGroupline == i + '-' + this.props.group.id);
                // console.log(sticky, i + '-' + this.props.group.id)
                // console.log(results)
                return <LinesGrouping 
                    key={i} 
                    line={d}
                    sketchLines={this.state.sketchLines}
                    placeholders={this.state.placeholders}
                    stroke={this.props.group.stroke}
                    id={this.props.group.id}
                    iteration={i}
                    BBs={this.BB} 
                    offsetY={this.offsetY}
    
                    moveLines={this.moveLines}

                    tagHold={this.props.tagHold}
                    addTagToGroup={this.props.addTagToGroup}
                    tags={results}
                />
            });
        }
       
        // console.log(this.props.group)
        return (
            <g id={'group-'+this.props.group.id} transform={`translate(${this.props.group.position[0]},${this.props.group.position[1]})`}>
                {/* <g>{this.state.placeholders.length > 0 ? : <g></g> }</g> */}
                {listItems} 
                <Background
                    sketchLines={this.state.sketchLines}
                    placeholders={this.state.placeholders}
                    stroke={this.props.group.stroke}
                    id={this.props.group.id}
                    

                    group={this.props.group}

                />
                 
                
                <g id={'item-'+this.props.group.id} transform={`translate(${this.props.group.stroke.position[0]},${this.props.group.stroke.position[1]})`}>
                    <path style={{'pointerEvents': 'none' }} id={this.props.group.id}/>
                    <path id={'fake-'+this.props.group.id}></path>
                </g>
                <rect id={'rect-'+this.props.group.id} />
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Group);