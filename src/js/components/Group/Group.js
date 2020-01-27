import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getTransformation, unionRectangles, showOmBB, showBboxBB, mergeRectangles, drawCircle, distance, _getBBox, _getBBoxPromise, _getBBoxPan, guid, getBoundinxBoxLines, groupBy } from "./../Helper";
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
import { boxBox } from "intersects";
import { postIt } from "./postIt";

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
        this.offsetX = [];

        this.i= 0;
        this.allBoundingBox = null;
        this.press = false;

        this.strokePath = JSON.parse(JSON.stringify(this.props.group.stroke['points']))
        
        this.BBOxPathMain = null;

        
        
    }
    createStroke(){
        var line = d3.line()
        var that = this;
        d3.select('#'+that.props.group.id)
            .attr("d", line(that.strokePath))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "5")
            .attr('opacity', '0.0')
        
        d3.select('#fake-'+that.props.group.id)
            .attr("d", line(that.strokePath))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '1')
            .attr('opacity', '0.0')

        
            // getBoundinxBoxLines([that.props.group.id]).then((d)=>{
            //     d3.select('#pathBB-' + that.props.group.id)
            //         .attr('width', d.width + 80)
            //         .attr('height', d.height)
            //         .attr('x', d.x)
            //         .attr('y', d.y)
            //         .attr('fill', 'rgba(255,0,0,0.3)')
            // })
    
    }
    updateStroke(){
        var that = this;
        var line = d3.line()
        d3.select('#'+that.props.group.id).attr("d", line(that.strokePath))
        d3.select('#fake-'+that.props.group.id).attr("d", line(that.strokePath))
    }
    updateLine(){
        var that = this;
        // console.log(this.props.group)
        this.placeHolder = JSON.parse(JSON.stringify(this.props.group.model.placeHolder)); 

        
        

        var el = document.getElementById('fake-'+that.props.group.id);
        this.mc = new Hammer.Manager(el);
        // var press = new Hammer.Press({time: 250});
        var pan = new Hammer.Pan({'pointers':0, threshold: 1});
        // var pan2fingers = new Hammer.Pan({'pointers':1, threshold: 1});
        // var tap = new Hammer.Tap();

        // this.mc.add(press);
        this.mc.add(pan);
        // this.mc.add(tap);
        // pan.recognizeWith(press);
        // $(el).on('touchstart touchmove', function(e){e.preventDefault(); })

        // pan.recognizeWith(tap);

        
        // this.mc.on("tap", function(ev) {
        //     if (ev.pointers[0].pointerType == 'pen' ){
        //         if (that.props.isGuideHold){
        //             that.props.setGroupTapped({'item': that.props.group.id});
        //             that.colorForTaping(false);
        //         }
        //         else {
        //             // console.log(that.props.isGuideHold)
        //             that.colorForTaping(true);
        //             that.props.addToSelection({'id':that.props.group.id});
                    
        //         }
        //     }
        // })
        this.mc.on("panstart", function(event) {
            if (event.pointers[0].pointerType == 'pen' ){
                that.startPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y,  'time': Date.now()};
                that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}
                _getBBoxPromise('item-'+that.props.group.id).then((d)=>{
                    that.BBOxPathMain  = d;
                })
            }
        })
        this.mc.on("panmove", function(ev) {
           
                
            /** Si c'est pen sur stroke */
            if (ev.pointers[0].pointerType == 'pen' ){
                var X = ev.pointers[0].x - that.BBOxPathMain.x;// - transform.translateX// - getPan.translateX;
                var Y = ev.pointers[0].y - that.BBOxPathMain.y;// - transform.translateY// - getPan.translateY;;
               
                // drawCircle(that.BBOxPathMain.x, that.BBOxPathMain.y + that.BBOxPathMain.height, 10, 'red')
                // console.log(Y+ that.BBOxPathMain.y, that.BBOxPathMain.y + that.BBOxPathMain.height)
                if (Y+ that.BBOxPathMain.y > that.BBOxPathMain.y + that.BBOxPathMain.height){
                    that.strokePath.push([X,Y])
                    that.updateStroke();
                } else {
                    // var lastPoint = 
                    // that.strokePath.push([X,Y])
                }
            }
        })
        // this.mc.on("panend", function(ev) {
        // })
        // this.mc.on("press", function(ev) {
        //     // console.log('press')
        //     if (ev.pointers[0].pointerType == 'touch' ){
        //         // that.press = true;
        //         that.props.holdGuide(that.props.group.id);
        //     }
        // })
        // this.mc.on("pressup", function(ev) {
        //     if (ev.pointers[0].pointerType == 'touch' ){
        //         // that.press = false;
        //         that.props.holdGuide(false);
        //     }
        // })
        
          


        /*d3.select('#fake-'+that.props.group.id)
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
            })*/
            d3.select('#fake-'+that.props.group.id).on('contextmenu', function(){
                d3.event.preventDefault();
            })


        // console.log(JSON.parse(JSON.stringify(this.placeHolder)))\
        // console.log('BEGINNING')
        if (this.props.group.lines.length >0){
            this.getBoundinxBoxEveryone().then(()=> {
            
                this.computePosition();
                this.computeLinesPlaceHOlder(JSON.parse(JSON.stringify(this.placeHolder)))
            })     
        } else {
            this.getBoundinxBoxEveryone().then(()=> {
                this.computeLinesPlaceHOlder(JSON.parse(JSON.stringify(this.placeHolder)))
            })    
        }
        


        //Swipe on the BIG box
        // var that = this;
        // var el = d3.select('#rect-'+this.props.group.id).node()
        // this.mc = new Hammer.Manager(el);
        // var swipe = new Hammer.Swipe({pointers: 1});
        // this.mc.add(swipe);

        // this.mc.on("swipeleft", function(ev) {
        //     if (ev.pointers[0].pointerType == 'touch'){
        //         console.log('swipeleft', ev.direction)
        //         that.createTable();
                
        //         // var data = {
        //         //     'id': guid(), 
        //         //     'idGroupline':that.props.iteration +'-'+that.props.id, 
        //         //     'position': [0,0],
        //         //     'model': that.props.tagHold
        //         // };
        //         // that.props.addTagToGroup(data)
        //         // // console.log('TAP', that.props.tagHold)
        //     }
        // }) 
    }

    getAllBoundingBox = async(id) => {
        var that = this;

        //ADD BBOX LINE FOR having at least one when pushing
        // var transformPan = {'translateX': 0, 'translateY': 0}
        // console.log(that.props.group.id)
        var BBLine = await _getBBoxPromise('item-'+id);
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        BBLine.x = BBLine.x - transformPan.translateX;
        BBLine.y = BBLine.y - transformPan.translateY;
        // console.log(transformPan)
        return new Promise(resolve => {
            that.getBoundinxBoxEveryone().then((BBox)=>{
                // console.log(BBox)
               
                var BBox1 = BBLine;
                if (BBox.length != 0){
                    // var BBox1 = BBox[0];
                    for (var i = 0; i< BBox.length; i++){
                        // showBboxBB(BBox[i], 'red');
                        BBox1 = unionRectangles(BBox1, BBox[i]);
                    }
                }


                // showBboxBB(BBox1, 'red');
                resolve(BBox1);
            })
            
        })
    }
    
    getAllIntersectsForGroup (){
       
    }
   
    componentDidMount(){
        console.log('GOs')
        this.updateLine();   
        this.createStroke();
        this.postIt = new postIt(this);
        this.postIt.init().then(()=>{
           
        })
       

        d3.select('#postItImage-' + this.props.group.id).style('opacity', 0)
    }
    drawBG(){

        var that = this;
        this.postIt.update();
    }
    dragstarted(env) {
        var that = env;;
    }
    

    dragended(event) {
        var that = this;
        that.drag = false;
       
        // var dist = distance(that.startPosition.x, event.srcEvent.x, that.startPosition.y, event.srcEvent.y);
        // var time = Date.now() -  that.startPosition['time'];


        // console.log(dist, time)
        // if (dist < 10 && time < 200){
        //     clearTimeout(that.timerPress);

        //     if (that.props.isGuideHold){
        //         // console.log(that.props.isGuideHold)
        //         that.props.setGroupTapped({'item': env.props.group.id});
        //         that.colorForTaping(false);
        //     }
        //     else {
        //         console.log(that.props.isGuideHold)
        //         that.colorForTaping(true);
    
        //         that.props.addToSelection({'id':env.props.group.id});
               
        //     }
            
        // }
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
    // SERT A METTRE MES OBJETS EN 0 ABSOLU ++ 
    // Update ma BBOX de mon objet PLACEHOLDER
    computeLinesPlaceHOlder = async(placeholder) => {
        var that = this;
        var itemsGuide = [];
        for (var j in placeholder){
            var element = placeholder[j];
            var lines = element.lines;
            // console.log(lines)
            

            if (lines.length > 0){

                // const grouped = groupBy(lines, line => line.type);
                await this.computeBBoxInPlaceHolder(element, lines)

                // var pattern = grouped.get("pattern")
                // var scale = grouped.get("normal");
                // if (pattern.length > 0){
                //     var linesId = pattern.map((g)=> g.id)
                //     // console.log('=================', element)
                //     element.BBoxPattern = await getBoundinxBoxLines(linesId)
                // }
                // if (scale.length > 0){
                //     var linesId = scale.map((g)=> g.id)
                //     element.BBoxScale = await getBoundinxBoxLines(linesId)
                // }

                // console.log(grouped.get("pattern"), grouped.get("normal"));
            }
        };
        // console.log(JSON.parse(JSON.stringify(placeholder)))
        // console.log('endPlaceHolder')
        this.setState({'placeholders': placeholder});
        // console.log(placeholder)
    }
    computeBBoxInPlaceHolder = async(element, lines) => {
        var that = this;
        var arrayBBox = [];


        var transform = {'translateX': 0, 'translateY': 0}
        transform = getTransformation(d3.select('#item-'+that.props.group.model.id).attr('transform'))
        // var oldScale = transform.scaleX;
        // console.log(transform.translateX, transform.translateY)
        d3.select('#item-'+that.props.group.model.id).attr('transform', 'translate('+transform.translateX+','+transform.translateY+')scale(1)');

        // console.log(that.props.group.model.id)
        var nodeId = d3.select('#placeHolder-'+element.id +'-' + that.props.group.model.id).attr('id');
        var BB = await _getBBoxPromise(nodeId);
        showBboxBB(JSON.parse(JSON.stringify(BB)), 'red')
        console.log(d3.select('#placeHolder-'+element.id +'-' + that.props.group.model.id).node())
        /** APPLY THE SCALE OF THE GUIDE */
        // BB.width *= 1/transform.scaleX;
        // BB.height *= 1/transform.scaleX;
        // console.log(transform)
        // BB.x = BB.x - transform.translateX;
        // BB.y = BB.y - transform.translateY;
        arrayBBox.push(BB);
        
        // SERT A TROUVER LE COIN EN HAUT A GAUCHE
        var polygon;
        if (arrayBBox.length > 1){
            polygon = mergeRectangles(arrayBBox[0], arrayBBox[1])
            for (var i = 2; i < arrayBBox.length; i++){
                polygon = mergeRectangles(polygon, arrayBBox[i])
            }
        } else polygon = arrayBBox[0]

        console.log(lines)
        
        //UNE FOIS QUE c'EST FAIT TOUT LE NONDE EN 0
        lines.forEach((d)=>{
            d.data = d.data.map((f)=> [f[0] - polygon.x, f[1] - polygon.y])
        })
        element.BBox = polygon;


        // transform = getTransformation(d3.select('#item-'+that.props.group.model.id).attr('transform'))
        d3.select('#item-'+that.props.group.model.id).attr('transform', 'translate('+transform.translateX+','+transform.translateY+')scale(1)');

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
     * FAIT LA BOUNDING BOX DE TOUTE LES LIGNES
     */
    getBoundinxBoxEveryone = async () => {
        // var BB = await _getBBoxPromise('item-'+strokeId);
        // return new Promise((resolve, reject) => {
            // console.log('GO', this.props.group.lines)
        var BBox = [];
        // console.log(this.props.group.lines)
        // const grouped = this.props.group.lines(pets, pet => pet.type);
        // d3.selectAll('.BB').remove()
        for (let i = 0; i < this.props.group.lines.length; i++) {
            var line = this.props.group.lines[i];
            var rectangle = null;
            var that = this;
            

            for (let index = 0; index < line.length; index++) {
                // console.log(line[index])
                var strokeId = line[index];
                var BB = await _getBBoxPromise('item-'+strokeId);

                if (rectangle == null) rectangle = BB;
                else rectangle = unionRectangles(rectangle, BB);
                // showBboxBB(BB, 'red');
            }
           
            var transformPan = {'translateX': 0, 'translateY': 0}
            var transformDrag = {'translateX': 0, 'translateY': 0}
            var item = d3.select('#panItems').node()
            if (item != null){
                transformPan = getTransformation(d3.select('#panItems').attr('transform'));
            } 
            var item = d3.select('#group-'+ that.props.group.id).node()
            // GET apres le drag en compte sur les BBox
            // console.log(transform)
            rectangle.x = rectangle.x - transformPan.translateX;
            rectangle.y = rectangle.y - transformPan.translateY;

            BBox.push(rectangle)

            
            // showBboxBB(rectangle, 'red');
            // console.log('PUSH')
        }

        
        
        console.log('GO',BBox)
        // showBboxBB(BBox[0], 'red');
        this.BB = BBox;

       
        // this.props.getBBoxEachLine({'bb':this.BB, 'iteration': this.props.iteration});
        // console.log('endBBox')
        // this.computePosition();
        

        
        return BBox;

    }
    computePosition(){
        var offset = [];
        
        var padding = this.props.group.model.paddingBetweenLines;
        // console.log(padding)
        var bb = JSON.parse(JSON.stringify(this.BB));
        // this.BB.forEach((d)=> console.log(d))
        var bbwithIndex = this.BB.map((d, i)=>{ d.index = i; return d })
        bbwithIndex.sort((a, b) => a.y - b.y);
        //Premiere position ne change pas
        var initialPosition = JSON.parse(JSON.stringify(bbwithIndex[0]['y']));
        
        bbwithIndex.forEach((d, i)=>{
            offset.push({'position': initialPosition, 'index':d.index});
            initialPosition += d.height  + padding;
            
        })
        // console.log(offset)
        // this.BB.sort((a, b) => );
        this.offset = offset.map((d, i)=>{
            return {'index': d.index, 'value':bbwithIndex[i]['y'] - d.position }
        })

        this.offset.sort((a, b) => a.index - b.index);
        this.state.offsetY = this.offset.map((d)=>{
            return d.value;
        })
        this.state.offsetX = this.state.offsetY.map((d)=> 0)
        // this.state.offsetY = []
        // this.setState({'offsetY': this.offsetY})
        // console.log(this.state.offsetY)
    }
    // shouldComponentUpdate(nextProps, nextState) {
        
          
    // }
    
    componentDidUpdate(prevProps, prevState){
        var that = this;
        // console.log('did update')
        // console.log('GOOOO', this.props.group.lines.join().split(','))
        // this.getAllIntersectsForGroup()
        
        

        if (this.props.sketchLines != prevProps.sketchLines){
            // this.setState({'sketchLines': this.props.sketchLines})
            // this.getBoundinxBoxEveryone()
            
        }
        /** POUR UNE NOUVELL LIGNE OU ECRIRE SUR LA MEME*/
        else if ([].concat(...this.props.group.lines).length != [].concat(...prevProps.group.lines).length ){
            // console.log('GO updateLines')
            //NOUVELLE LIGNE
            // if (this.props.group.lines.length != prevProps.group.lines.length){
                // console.log('GOOOO', this.props.group.lines)
            this.placeholder = JSON.parse(JSON.stringify(this.props.group.model.placeHolder))
            this.getBoundinxBoxEveryone().then(()=> {
                this.computePosition();
                this.computeLinesPlaceHOlder(this.placeholder);
            })
        }
        
        else if (this.props.shouldUnselect != prevProps.shouldUnselect){
            d3.select('#fake-'+that.props.group.id).attr('opacity', '0.2')
        }
        else if (this.props.shouldUnselect != prevProps.shouldUnselect){
            d3.select('#fake-'+that.props.group.id).attr('opacity', '0.2')
        }
        else if (this.props.sketchLines != prevProps.sketchLines){
            d3.select('#fake-'+that.props.group.id).attr('opacity', '0.2')
        }
        else if (this.props.group.model.placeHolder != prevProps.group.model.placeHolder){
            console.log('gO')
            // console.log(JSON.parse(JSON.stringify(this.props.group.model.placeHolder)))
            this.placeholder = JSON.parse(JSON.stringify(this.props.group.model.placeHolder))
            this.getBoundinxBoxEveryone().then(()=> {
                if (this.props.group.lines.length > 0) this.computePosition();
                this.computeLinesPlaceHOlder(this.placeholder);
                
            })
            // console.log('placeholder')
        }
        
        else if (this.props.groupHolded != prevProps.groupHolded){
            
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
        // console.log(this.props)
        if (this.props.group.swipe != prevProps.group.swipe){
            var modelId = this.props.group.model.id;

            if (this.props.group.swipe == false){

                d3.select('#postItImage-' + that.props.group.id).select('.path2').style('opacity',1);
                d3.select('#postItImage-' + that.props.group.id).select('.path1').style('opacity',1);

                d3.select('#postItImage-' + that.props.group.id).transition().duration(1000).style('opacity', 0);
                this.postIt.reverseTransition();

                d3.select('#item-'+modelId).transition().duration(1000).style('opacity', 0);
                setTimeout(function(){ that.hideStyleGuide();  }, 1000);

                /** HIDE THE STROKE */
                d3.select('#'+that.props.group.id).transition().duration(1000).attr('opacity', '0.0')
                d3.select('#fake-'+that.props.group.id).transition().duration(1000).attr('opacity', '0.0').attr('stroke-width', '1')
            }
            else if (this.props.group.swipe){
                // console.log('SWIPE')
                d3.select('#postItImage-' + that.props.group.id).style('opacity', 1);
                // 
                this.postIt.transition();

                setTimeout(function(){ 
                    d3.select('#postItImage-' + that.props.group.id).select('.path2').transition().duration(1000).style('opacity',0);
                    d3.select('#postItImage-' + that.props.group.id).select('.path1').transition().duration(1000).style('opacity',0);
                    d3.select('#postItImage-' + that.props.group.id).select('.rectangle').transition().duration(1000).style('opacity',0);
                }, 1000)


                // d3.select('#item-'+modelId).style('opacity', 0);

                //MONTRE LES LIGNES DU GUIDE
                setTimeout(function(){  that.showStyleGuide();  }, 1000)

                /** HIDE THE STROKE */
                d3.select('#'+that.props.group.id).transition().duration(1000).attr('opacity', '0.0')
                d3.select('#fake-'+that.props.group.id).transition().duration(1000).attr('opacity', '0.0').attr('stroke-width', '1')


            }
        }
        if (this.props.group.tap != prevProps.group.tap){
            // console.log('HEY', this.props.group)
            var modelId = this.props.group.model.id;
            if (this.props.group.tap == false){
                d3.select('#item-'+modelId).attr('transform', 'translate(0,0)scale(0.3)')
                d3.select('#'+that.props.group.id).transition().duration(500).attr('opacity', '0.0')
                d3.select('#fake-'+that.props.group.id).transition().duration(500).attr('opacity', '0.0').attr('stroke-width', '1')
                d3.select('#postItImage-' + that.props.group.id).transition().duration(500).style('opacity', 0)

                // d3.select('#postItImage-' + that.props.group.id).style('pointer-events', 'none')
            }
            else if (this.props.group.tap){
                d3.select('#'+that.props.group.id).transition().duration(500).attr('opacity', '0.4')
                d3.select('#fake-'+that.props.group.id).transition().duration(500).attr('opacity', '0.4').attr('stroke-width', '50')
                d3.select('#postItImage-' + that.props.group.id).transition().duration(500).style('opacity', 1);

                // d3.select('#postItImage-' + that.props.group.id).style('pointer-events', 'auto')


            }
        }
    }
    showStyleGuide(){
        var that = this;
        var modelId = this.props.group.model.id;
        // console.log(this.props.group)
        this.getAllBoundingBox(this.props.group.id).then((BBgroup)=> {
            // console.log('HEY', modelId);
            // drawCircle(BBgroup.x, BBgroup.y, 10, 'red')
            var X = BBgroup.x - 90;
            var Y = BBgroup.y - 50;
            var width = BBgroup.width + 240;
            var height = BBgroup.height + 100;

            var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        // BBLine.x = BBLine.x - transformPan.translateX;
        // BBLine.y = BBLine.y - transformPan.translateY;

            // showBboxBB(BBgroup, 'red')
            // console.log(this.props.group.id,this.props.group.tap)
            /** BBOX DU GROUPE ENTIER */
            _getBBoxPromise('item-'+modelId).then((BBguide)=>{
                // var ratioX = BBguide.width/width;
                // var ratioY = BBguide.height/height;
                d3.select('#item-'+modelId).attr('transform', 'translate('+X+','+Y+')scale(1)')
                d3.select('#item-'+modelId).select('#rect-outerBackground').attr('width', width).attr('height', height)

                var firstLineItem = d3.select('#containerBackground-0-' + that.props.group.id);

                /** BBOX DE LA PREMIERE LIGNE ***/
                _getBBoxPromise('containerBackground-0-' + that.props.group.id).then((BBfirstLine)=>{

                    var widthLine = BBfirstLine.width + 40;
                    var heightLine = BBfirstLine.height + 40;


                    var xLine = BBfirstLine.x - X - 80 - transformPan.translateX;
                    var yLine = BBfirstLine.y - Y - 20 - transformPan.translateY;
                    
                    // d3.select('#item-'+modelId).select('#placeHolder-backgroundLine-'+modelId).attr('transform', 'translate('+xLine+','+yLine+')scale(1)')
                    d3.select('#item-'+modelId).select('#rect-backgroundLine').attr('width', widthLine).attr('height', heightLine).attr('x', xLine).attr('y', yLine)
                    
                    
                    d3.select('#item-'+modelId).select('#rect-backgroundText')
                        .attr('width', widthLine - 100)
                        .attr('height', heightLine - 40)
                        .attr('x',  xLine + 80)
                        .attr('y', yLine + 20)

                    d3.select('#item-'+modelId).transition().duration(1000).style('opacity', 1);
                })

            })
        })
    }
    hideStyleGuide(){
        var modelId = this.props.group.model.id;
        d3.select('#item-'+modelId).attr('transform', 'translate(0,0)scale(0.1)')
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
        // console.log('start')

    }
   
    render() {

        // console.log(this.props.group.lines)
        // console.log('render')
        // console.log(BB)
        // var sticky = this.props.stickyLines.find(x => x.id == this.guideTapped.item)
        // console.log(this.props.group.lines)
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
                    sketchLines={this.props.sketchLines}
                    placeholders={this.state.placeholders}
                    stroke={this.props.group.stroke}
                    id={this.props.group.id}
                    iteration={i}
                    BBs={this.BB} 
                    offsetY={this.state.offsetY}
                    offsetX={this.state.offsetX}
                    showGrid={this.props.showGrid}
    
                    moveLines={this.moveLines}

                    tagHold={this.props.tagHold}
                    addTagToGroup={this.props.addTagToGroup}
                    tags={results}

                />
            });
        }
    //    console.log(this.props.group.lines)
        
        return (
            <g id={'group-'+this.props.group.id} transform={`translate(${this.props.group.position[0]},${this.props.group.position[1]})`}>
                <g id={"postIt-" + this.props.group.id} className="postit"> 
                    <rect id={"rectAllBB-" + this.props.group.id} />
                    <g id={"postItImage-" + this.props.group.id}> 
                    </g>
                </g>
               
                {/* <g>{this.state.placeholders.length > 0 ? : <g></g> }</g> */}
                {listItems} 

                   {/* { (this.props.group.lines > 0) ? */}
                    <Background
                        sketchLines={this.props.sketchLines}
                        placeholders={this.state.placeholders}
                        stroke={this.props.group.stroke}
                        id={this.props.group.id}
                        

                        group={this.props.group}

             
                    />
                    {/* : null } */}
                 
                
                <g id={'item-'+this.props.group.id} className={'groupPath'} transform={`translate(${this.props.group.stroke.position[0]},${this.props.group.stroke.position[1]})`}>
                    <path style={{'pointerEvents': 'none' }} id={this.props.group.id}/> 
                    <path id={'fake-'+this.props.group.id}  className={'fakePath'}></path>
                </g>

                <rect className={'bbGroup'} id={'pathBB-'+this.props.group.id} />
                <rect id={'rect-'+this.props.group.id} />
                

                <g id={'groupStyle-'+this.props.group.id} ></g>
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Group);