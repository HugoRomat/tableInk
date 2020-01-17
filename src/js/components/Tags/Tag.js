import React, { Component } from "react";
import * as d3 from 'd3';
import { getTransformation, getNearestElement, showBbox, distance, guid, _getBBox, calculateBB, _getBBoxPromise, showOmBB, showBboxBB, getBoundinxBoxLines } from "../Helper";
import { connect } from 'react-redux';
import {d3sketchy} from './../../../../customModules/d3.sketchy'
import html2canvas from 'html2canvas';

import { 
    addLineToTagGroup,
    addTagSnapped,
    removeTag,
    addTagToGuide
} from '../../actions';

import PlaceHolder from "./PlaceHolder";
// import PlaceHolderText from "./PlaceHolderText";
import { boxBox } from "intersects";

const mapDispatchToProps = { 
    addLineToTagGroup,
    addTagSnapped,
    removeTag,
    addTagToGuide
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


        var el = document.getElementById('item-'+that.props.stroke.id);
        this.mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':1, threshold: 50});
        var swipe = new Hammer.Swipe({threshold: 0, pointers: 1});
        var press = new Hammer.Press({time: 250});
        var tap = new Hammer.Tap();
        
       
        this.mc.add(pan);
        this.mc.add(tap);
        this.mc.add(swipe);
        this.mc.add(press);
        pan.recognizeWith(swipe);
        pan.recognizeWith(press);

       this.mc.add(pan);
       this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' || ev.pointers[0].pointerType == 'pen' ){
                
                    that.startPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y,  'time': Date.now()};
                    that.lastPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y}
                    that.dragstarted(ev);
                    // var getPan =  getTransformation(d3.select('#panItems').attr('transform'));
                    _getBBoxPromise('item-' + that.props.stroke.id).then(( BB)=>{
                        // console.log(BB)
                        that.allBoundingBox = BB;
                        // that.allBoundingBox.x += getPan.translateX;
                        // that.allBoundingBox.y += getPan.translateY;
                    })
                    that.down = true
               
            }
            if (ev.pointers[0].pointerType == 'pen' ){
                
            }
            
        })
        this.mc.on("panmove", function(ev) {
            if (ev.pointers[0].pointerType == 'touch'){
                if (that.down){
                    // console.log(that.down)
                    that.findIntersection(that.allBoundingBox, ev);
                    that.dragged(ev);
                }
            }
        })
        this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){
                that.dragended(ev);
                that.down = false;
            }
        })
        this.mc.on("swipeleft", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                
            }
            
        });
        this.mc.on("swipeleft", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                
            }
            
        });

        this.mc.on('press', function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                that.colorForHolding(true);

                /** Calculate the BBox for the Tag */
                var data = JSON.parse(JSON.stringify(that.props.stroke));
                var lines = data.placeHolder[0]['lines'].map((d)=> d.id)
                // console.log(lines)
                getBoundinxBoxLines(lines, 'stroke-').then((d)=>{
                    // showBboxBB(d, 'red')
                    _getBBoxPromise(['rect-'+that.props.stroke.id]).then((e)=>{
                        // showBboxBB(e, 'red')
                        data.offsetX = d.x - e.x;
                        data.offsetY = d.y - e.y;
                        data.BB = d;
                        that.props.holdTag(data); 
                    })
                })
                
            }
        })
        this.mc.on('pressup', function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                // that.props.dragItem(false);
                that.props.holdTag(false);
                that.colorForHolding(false)
            }
        })
        
            
        d3.select('#item-'+that.props.stroke.id)
            // .on('pointerdown', function(d){
            //     if (d3.event.pointerType == 'touch'){
            //         that.startPosition = {'x': d3.event.x, 'y':d3.event.y,  'time': Date.now()};
            //         that.lastPosition = {'x': d3.event.x, 'y':d3.event.y}
            //         that.dragstarted(that);
            //     }
            // })
            // .on('pointermove', function(d){
            //     if (d3.event.pointerType == 'touch'){
            //         var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
            //         var differenceTime = that.startPosition.time - Date.now();
                    
            //         if (dist > 10 ){
            //             that.dragged(that);
            //         }
            //     }
            // })
            // .on('pointerup', function(d){
            //     if (d3.event.pointerType == 'touch'){
            //         that.dragended(that);
            //     }
            // })
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
            
            
            
        // console.log('GUIDE', this.props.stroke.id)
        // var BBox = _getBBox(this.props.stroke.id);
        // console.log(BBox)
        // this.setState({'BBox': BBox})
            this.addBG()
    
    }
    addBG(){
        var that = this;
        if ( this.props.stroke.tagSnapped.length > 0){
            d3.select('#tagSnapped-'+that.props.stroke.id).selectAll('*').remove()
            for (var i = this.props.stroke.tagSnapped.length - 1; i >= 0; i--) {
                this.drawRectangle(this.props.stroke.width,this.props.stroke.height,-10 * (i+1),-10 * (i+1));
            }

        }
    }
    findIntersection = async(BBTemp, ev) => {
        // console.log(BBTemp)
        var that = this;
        var offsetX = ev.pointers[0].x - this.lastPosition.x;
        var offsetY = ev.pointers[0].y - this.lastPosition.y;
        BBTemp.x += offsetX; //+ transformPan.translateX;
        BBTemp.y += offsetY; //+ transformPan.translateY;
        
        // console.log(BBTemp)
        // showBboxBB(BBTemp, 'blue');
      
        var BBid = [];
        var arrayRectangle = []
        // showBboxBB(BBTemp, 'red');

        //Put my lines in an array FOR TAGS
        d3.selectAll('.tagEntities').each(function(){
            var idSImple = d3.select(this).attr('id').split('-')[1]
            if (arrayRectangle.indexOf(idSImple) == -1 && idSImple != that.props.stroke.id) BBid.push(d3.select(this).attr('id'))
        })
        //Put my lines in an array FOR GUIDES
        // d3.selectAll('.guide').each(function(){
        //     var idSImple = d3.select(this).attr('id').split('-')[1]
        //     if (arrayRectangle.indexOf(idSImple) == -1 && idSImple != that.props.stroke.id) BBid.push(d3.select(this).attr('id'))
        // })

        
        // Check for all these lines
        for (var i in BBid){
            var BB = await _getBBoxPromise(BBid[i])
            // showBboxBB(BB, 'red');
            // showBboxBB(BBTemp, 'blue');
            var intersected = boxBox(BB.x, BB.y, BB.width, BB.height, BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
            // console.log(intersected)
            if (intersected) {
                var tagName = BBid[i].split('-')[0];

                // console.log(tagName)
                // if (tagName == 'item'){
/*
                    var id = BBid[i];
                    var idSImple = id.split('-')[1];
                    // showBboxBB(BBTemp, 'red')
                    // console.log(JSON.stringify(BBTemp))
                    html2canvas(document.body, { 'useCORS': true, 'x':BBTemp.x, 'y':BBTemp.y,'taintTest': false,'allowTaint': false}).then((canvas) =>{
                    
                        // 'height': BBTemp.height, 'width': BBTemp.width, 'x':BBTemp.x, 'y':BBTemp.y,
                    // this.getScreenshotOfElement(document.body,BBTemp.x, BBTemp.y,  BBTemp.width,  BBTemp.height).then((image)=>{

                        var outputCanvas = document.createElement('canvas');
                        var outputContext = outputCanvas.getContext('2d');
                        outputCanvas.width = BBTemp.width;
                        outputCanvas.height = BBTemp.height;
                        outputContext.drawImage(canvas,0,0,window.innerWidth,window.innerHeight);
                        // console.log(image)
                        var image = outputCanvas.toDataURL()
                        var dataTagToGuide = JSON.parse(JSON.stringify(that.props.stroke));
                        dataTagToGuide.image = image
                        this.props.addTagToGuide({
                            'idGuide':idSImple, 
                            'tag':dataTagToGuide,
                            
                        })
                    })
                        // var ctx = canvas.getContext("2d");
                        // var imageData = ctx.getImageData(BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
                        // console.log(canvas.toDataURL())
                       
                        this.props.removeTag(this.props.stroke.id)
                    // });*/
                    
                //     this.down = false;
                // }
                // else {
                    var id = BBid[i];
                    var idSImple = id.split('-')[1];
                    this.props.addTagSnapped({
                        'idReceiver':idSImple, 
                        'idSender':that.props.stroke.id
                    })
                    this.props.removeTag(this.props.stroke.id)
                    this.down = false;
                // }
                
            }
        }
    }
    getScreenshotOfElement(element, posX, posY, width, height, callback) {
        
        return new Promise(resolve => {
            html2canvas(element, {width: width, height: height,useCORS: true, taintTest: false,allowTaint: false}).then(function(canvas) {
               
                    var context = canvas.getContext('2d');
                    var imageData = context.getImageData(posX, posY, width, height).data;
                    var outputCanvas = document.createElement('canvas');
                    var outputContext = outputCanvas.getContext('2d');
                    outputCanvas.width = width;
                    outputCanvas.height = height;
        
                    var idata = outputContext.createImageData(width, height);
                    idata.data.set(imageData);
                    outputContext.putImageData(idata, 0, 0);
                   
                    resolve(outputCanvas.toDataURL().replace("data:image/png;base64,", ""));
                
            });

        })
    }
    dragstarted(env) {
        // if (d3.event.sourceEvent == tou
        // console.log(d3.event.sourceEvent)
        var that = env;
        // that.startPosition = {'x': d3.event.x, 'y':d3.event.y,  'time': Date.now()}
        // that.drag = false;
        // console.log('HEY', env, this)
        // d3.event.sourceEvent.stopPropagation();
        // d3.select('#item-'+env.props.stroke.id).classed("dragging", true);

        // console.log('GO DRAG')
        // that.props.dragItem(true);
        // d3.event.preventDefault();
        
        /*that.timerPress = setTimeout(function(){
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
        }, 1000)*/

    }

    dragged(event) {  
        // console.log(d3.event)
        var that = this;
        // that.drag = true;
        // console.log('GO')
        

        // var dist = distance(env.startPosition.x, d3.event.x, env.startPosition.y, d3.event.y);

        // console.log(dist)
        // if (dist > 10){
        // clearTimeout(that.timerPress);
        // d3.event.preventDefault();
        var transform = getTransformation(d3.select('#item-'+that.props.stroke.id).attr('transform'));
        // console.log(transform)
        var offsetX = event.srcEvent.x - that.lastPosition.x;
        var offsetY = event.srcEvent.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#item-'+that.props.stroke.id).attr('transform', 'translate('+X+','+Y+')')

        that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}

    }
    dragended(event) {
        var that = this;
        // that.drag = false;
        // d3.select('#item-'+env.props.stroke.id).classed("dragging", false);

        // To say nothing is holded anymore and dragged
        // clearTimeout(that.timerPress);
        
        if (that.props.isGallery == false){
            // that.props.dragItem(false);
            // that.props.holdGuide(false);
            // that.colorForHolding(false)
       

        
            // TO detect the tap
            /*var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
            var time = Date.now() -  that.startPosition['time'];

            // console.log(dist, time)
            if (dist < 10 && time < 100){
                clearTimeout(that.timerPress);
            }*/
        }

    }
    componentDidUpdate(prevProps, prevState){
        // console.log('HELLO', this.props.stroke)
        this.addBG();
    }
    drawRectangle(width, height, x, y){
        var that = this;
        var sketch = d3sketchy();
        var rec = sketch.rectStroke({ x:x, y:y, width:width, height:height, density: 3, sketch:2});
        var flattened = [].concat(...rec)

        d3.select('#tagSnapped-'+that.props.stroke.id).append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('x', x)
            .attr('y',y)
            .attr('fill', 'rgba(252, 243, 242, 1)')

        for (var i in flattened){
            var item = flattened[i];
            d3.select('#tagSnapped-'+that.props.stroke.id)
            .append('path')
            .attr('d', (d)=>{ return item })
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '0.3')
            .style('stroke-linecap', 'round')
            .style('stroke-linejoin', 'round')
        }
        
       
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
        var that = this;

        d3.select('#rect-'+that.props.stroke.id).attr('width', 200).attr('height', 200).attr('x', 0).attr('y', 0)
        d3.select('#rect-'+that.props.stroke.id).attr('fill', 'rgba(252, 243, 242, 0)')
        if (isIt == true){
            d3.select('#rect-'+that.props.stroke.id).attr('fill', 'grey')
            
        }
    }
    render() {
        // console.log(this.props.stroke);
        var translate = [this.props.stroke.position[0],this.props.stroke.position[1]]

        var scale = 1;

        // console.log(this.props.stroke.placeHolder)
        const listPlaceHolder = this.props.stroke.placeHolder.map((d, i) => {
                return <PlaceHolder 
                    key={i}
                    data={d}
                    parent={this.props.stroke}
                   
                    lines={d.lines}
                    addLine={this.addLine}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
                />
        });

        // const tagSnapped = this.props.stroke.tagSnapped.map((d, i) => {
        //     return <Tag 
        //             key={i} 
        //             stroke={d}
        //             isGallery={false}
        //             holdGuide={false}
        //             colorStroke = {'red'}
        //             sizeStroke = {'red'}
        //         />
        // });



        // console.log(this.props.stroke)

        return (
            <g id={'item-'+this.props.stroke.id} className={'tagEntities'} transform={`translate(${translate[0]},${translate[1]})scale(${scale})`}>
                <g id={'tagSnapped-' + this.props.stroke.id} style={{'pointerEvents': 'none' }} transform={`translate(0,0)`}>
                    {/* {tagSnapped} */}
                </g>


                
                <path id={this.props.stroke.id}></path>
                {/* <path id={'fake-'+this.props.stroke.id}></path> */}
                {listPlaceHolder}
                <rect id={'rect-'+this.props.stroke.id} style={{'pointerEvents': 'none' }}/>

                

            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Tag);