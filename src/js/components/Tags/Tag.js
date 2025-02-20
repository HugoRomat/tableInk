import React, { Component } from "react";
import * as d3 from 'd3';
import { getTransformation, getNearestElement, showBbox, distance, guid, _getBBox, calculateBB, _getBBoxPromise, showOmBB, showBboxBB, getBoundinxBoxLines } from "../Helper";
import { connect } from 'react-redux';
import {d3sketchy} from './../../../../customModules/d3.sketchy'
import html2canvas from 'html2canvas';
import  $ from 'jquery';

import clip from '../../../../static/clip.png';
import pin from '../../../../static/pin.png';
import { 
    addLineToTagGroup,
    addTagSnapped,
    removeTag,
    addTagToGuide,
    updateWidthHeightTag,
    removeTagLine,
    addSketchLine,
    updateTagPosition
} from '../../actions';

import PlaceHolder from "./PlaceHolder";
// import PlaceHolderText from "./PlaceHolderText";
import { boxBox, boxCircle } from "intersects";
import { recognizeInk } from "../InkRecognition/InkRecognition";
import { SpeechRecognitionClass } from "../SpeechReognition/Speech";

const mapDispatchToProps = { 
    addLineToTagGroup,
    addTagSnapped,
    removeTag,
    addTagToGuide,
    updateWidthHeightTag,
    removeTagLine,
    addSketchLine,
    updateTagPosition
};
const mapStateToProps = (state, ownProps) => {  
  
  return { 
    groupLines: state.rootReducer.present.groupLines,
    sketchLines: state.rootReducer.present.sketchLines,
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

        this.iteration = 0;
        this.state = {
            'BBox':{},
            'currentPlaceHolder': null
        };
        this.speech = new SpeechRecognitionClass(this);

    }
    componentDidMount(){
        
        var line = d3.line().curve(d3.curveBasis)
        var that = this;


        var el = document.getElementById('item-'+that.props.stroke.id);
        this.mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':1, threshold: 10});
        // var swipe = new Hammer.Swipe({threshold: 0, pointers: 1, velocity: 0.1});
        var press = new Hammer.Press({time: 250});
        var tap = new Hammer.Tap();
        
       
        this.mc.add(pan);
        this.mc.add(tap);
        // this.mc.add(swipe);
        this.mc.add(press);
        // pan.recognizeWith(swipe);
        pan.recognizeWith(press);
        // pan.requireFailure(swipe);

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
                    if (that.props.holdTag != undefined) that.findIntersection(that.allBoundingBox, ev);
                    if (!$('#item-'+that.props.stroke.id).hasClass( "saveRight" ) && !$('#item-'+that.props.stroke.id).hasClass( "saveTop" )) that.dragged(ev);

                    var absolutePosition = [ev.srcEvent.x, ev.srcEvent.y]

                    if (absolutePosition[0] < 30 && !$('#item-'+that.props.stroke.id).hasClass( "saveRight" )){
                        var transform =  getTransformation(d3.select('#panItems').attr('transform'));
                        var X = absolutePosition[0] - transform.translateX;
                        var Y = absolutePosition[1] - transform.translateY;
                        $('#item-'+that.props.stroke.id).addClass( "saveRight" );
                        d3.select('#item-'+that.props.stroke.id).transition().duration(1000).attr('transform', 'translate('+(20- transform.translateX)+','+Y+')scale(1)rotate(10)')
                        // d3.select('#item-'+that.props.stroke.id).select('#rect-left').attr('fill','red')


                        d3.select('#item-'+that.props.stroke.id).append("svg:image").attr('class', 'imgClip').style('pointer-events', 'none')
                            .attr("xlink:href", clip).attr("width", 75).attr("height", 75).attr("x", -20).attr("y", -30);
                    }


                    if (absolutePosition[1] < 30 && !$('#item-'+that.props.stroke.id).hasClass( "saveTop" )){
                        var transform =  getTransformation(d3.select('#panItems').attr('transform'));
                        var X = absolutePosition[0] - transform.translateX;
                        var Y = absolutePosition[1] - transform.translateY;
                        $('#item-'+that.props.stroke.id).addClass( "saveTop" );
                        d3.select('#item-'+that.props.stroke.id).transition().duration(1000).attr('transform', 'translate('+X+','+(10- transform.translateY)+')scale(1)rotate(0)')
                        // d3.select('#item-'+that.props.stroke.id).select('#rect-left').attr('fill','red')

                        // console.log('#item-'+that.props.stroke.id)
                        d3.select('#item-'+that.props.stroke.id).append("svg:image").attr('class', 'imgClip').style('pointer-events', 'none')
                            .attr("xlink:href", pin).attr("width", 200).attr("height", 200).attr("x", 0).attr("y", -20);
                    }
                    // console.log(absolutePosition)
                    /* if ( $('#item-'+that.props.stroke.id).hasClass( "saveRight" )){
                        $('#item-'+that.props.stroke.id).removeClass( "saveRight" );
                        d3.select('#item-'+that.props.stroke.id).select('.imgClip').remove()
                    } */
                }
            }
        })
        this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){
                that.dragended(ev);
                that.down = false;

                if (d3.select('#item-'+that.props.stroke.id).empty() == false){
                    console.log('GOOOO')
                    var transform = getTransformation(d3.select('#item-'+that.props.stroke.id).attr('transform'));
                    var X = transform.translateX;
                    var Y = transform.translateY;
                    that.props.updateTagPosition({'idTag': that.props.stroke.id, 'position':[X, Y]})
                }
                
            }
        })
        // this.mc.on("swipe", function(ev) {
        //     if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
        //             console.log('SWIPE')
        //             if ( !$('#item-'+that.props.stroke.id).hasClass( "saveRight" )){
                        

        //                 var X = 0;
        //                 var Y = 300
        //                 var where =  d3.selectAll('.saveRight');
        //                 console.log(where.size())
        //                 // if (where.empty()){

        //                 // } else {
        //                 //     var transform = getTransformation(where.attr('transform'));
        //                     Y = (where.size() * 120) + 300
        //                     // console.log(where)
        //                 // }
                        

        //                 $('#item-'+that.props.stroke.id).addClass( "saveRight" );
        //                 d3.select('#item-'+that.props.stroke.id).transition().duration(1000).attr('transform', 'translate('+X+','+Y+')scale(1)rotate(10)')

        //                 d3.select('#item-'+that.props.stroke.id).append("svg:image").attr('class', 'imgClip')
        //                     .attr("xlink:href", clip).attr("width", 75).attr("height", 75).attr("x", -20).attr("y", -30);

        //             }
                   
                
        //     }
            
        // });
        

        this.mc.on('press', function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){


                /** Calculate the BBox for the Tag */
                // var data = JSON.parse(JSON.stringify(that.props.stroke));
                // var lines = data.placeHolder[0]['lines'].map((d)=> d.id)
                // console.log(lines)
                // getBoundinxBoxLines(lines, 'stroke-').then((d)=>{
                //     // showBboxBB(d, 'red')
                //     _getBBoxPromise(['rect-'+that.props.stroke.id]).then((e)=>{
                //         // showBboxBB(e, 'red')
                //         data.offsetX = d.x - e.x;
                //         data.offsetY = d.y - e.y;
                //         data.BB = d;
                // console.log(that.props.holdTag != undefined, that.props.stroke.placeHolder[0]['lines'])
                
                if (that.props.holdTag != undefined && that.props.stroke.placeHolder[0]['lines'].length > 0) {
                    that.colorForHolding(true);
                    that.props.holdTag(that.props.stroke); 
                }

                if (that.props.stroke.placeHolder[0]['lines'] == 0){
                    that.voiceQuery();
                }
                //     })
                // })
                
            }
        })
        this.mc.on('pressup', function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                // that.props.dragItem(false);
                that.speech.stop()
                if (that.props.holdTag != undefined) that.props.holdTag(false);
                if (that.props.holdTag != undefined) that.colorForHolding(false)
            }
        })

        this.mc.on('tap', function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                
                // console.log('TAP')
                if ($('#item-'+that.props.stroke.id).hasClass( "saveTop" )){
                    // console.log('HEY', that.props.stroke);

                    that.props.highlightAllSameTag({'tag':that.props.stroke})
                   
                } else {
                    that.iteration += 1
                    var othersTags = that.props.stroke.tagSnapped;
    
                    if (othersTags.length > 0){
                        var where = that.iteration % (othersTags.length + 1);
                        // console.log(where)
                        /* Pour le premier element */
                        if (where == 0){
                            // console.log(that.props.stroke.placeHolder[0])
                            that.setState({'currentPlaceHolder': JSON.parse(JSON.stringify(that.props.stroke.placeHolder[0]))})
                        } 
                        /* Pour les autres elements */
                        else {
                            var newTag = othersTags[where-1];
                            // console.log(newTag.placeHolder[0])/
                            that.setState({'currentPlaceHolder': JSON.parse(JSON.stringify(newTag.placeHolder[0]))})
                            // console.log(newTag)
                        }
                        
                    }
                }
            }
        })
        
        
            
        d3.select('#item-'+that.props.stroke.id)
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
            
            
            
        // console.log('GUIDE', this.props.stroke.id)
        // var BBox = _getBBox(this.props.stroke.id);
        // console.log(BBox)
        // this.setState({'BBox': BBox})
        this.addBG();
        // this.drawLine()
            // console.log('CREATE TAG', that.props.stroke)
    }
    /** 
     * 1 - Get all groups lines
     * 2 - Apply NLP on them to get the meaning
    */
   voiceQuery(){
        // var firstPoint = JSON.parse(JSON.stringify(this.tempArrayStroke[0]))
        /** Get all lines */
        var allLines = [];
        this.props.groupLines.forEach((d)=>{
            allLines = allLines.concat(d.lines);
        })
        //    console.log(allLines)
        this.speech.getSpeechReco().then((speech)=>{

            recognizeInk(this, allLines, true).then((ink)=> {
                console.log(ink)
                var data = {
                    'id': guid(),
                    'content': speech,
                    'inkDetection': ink,
                    'position': [10,10]
                }

                this.props.addLineToTagGroup({
                    'idTag': this.props.stroke.id,
                    'where': 'left',
                    'data': [data]
                })
                // console.log(data)
                // this.props.addVoiceToTag(data)
            })
            
            // console.log('HEY', speech)
        })
    }
    addBG(){
        var that = this;
        if ( this.props.stroke.tagSnapped.length > 0){
            d3.select('#tagSnapped-'+that.props.stroke.id).selectAll('*').remove();

            for (var i = 0; i >= 0; i--) {
            // for (var i = this.props.stroke.tagSnapped.length - 1; i >= 0; i--) {
                this.drawRectangle(this.props.stroke.width,this.props.stroke.height,-5 * (i+1),-5 * (i+1));
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
            var centerX = BBTemp.x + (BBTemp.width/2);
            var centerY = BBTemp.y + (BBTemp.height/2)
            // var intersected = boxBox(BB.x, BB.y, BB.width, BB.height, BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
            var intersected = boxCircle(BB.x, BB.y, BB.width, BB.height, centerX,centerY,1)

            // console.log(intersected)
            if (intersected) {
                var tagName = BBid[i].split('-')[0];
                var id = BBid[i];
                var idSImple = id.split('-')[1];
                this.props.addTagSnapped({
                    'idReceiver':idSImple, 
                    'idSender':that.props.stroke.id
                })
                this.props.removeTag(this.props.stroke.id)
                this.down = false;
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
    dragstarted(event) {
        // if (d3.event.sourceEvent == tou
        // console.log(d3.event.sourceEvent)
        var that = this;
        that.startPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}

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
        if (this.props.amountDragged) this.props.amountDragged({'x': that.lastPosition.x - that.startPosition.x, 'y': that.lastPosition.y - that.startPosition.y})
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
        // var sketch = d3sketchy();
        // var rec = sketch.rectStroke({ x:x, y:y, width:width, height:height, density: 3, sketch:2});
        // var flattened = [].concat(...rec)

        d3.select('#tagSnapped-'+that.props.stroke.id).append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('x', x)
            .attr('y',y)
            .attr('stroke', 'rgba(186, 186, 186, 1)')
            .attr('fill', 'white')
            

        // for (var i in flattened){
        //     var item = flattened[i];
        //     d3.select('#tagSnapped-'+that.props.stroke.id)
        //         .append('path')
        //         .attr('d', (d)=>{ return item })
        //         .attr('fill', 'none')
        //         .attr('stroke', 'black')
        //         .attr('stroke-width', '0.3')
        //         .style('stroke-linecap', 'round')
        //         .style('stroke-linejoin', 'round')
        // }
        
       
    }
    addLine = (d) => {
        console.log('DOOO', d)
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

        d3.select('#rect-'+that.props.stroke.id).attr('width', 100).attr('height', 100).attr('x', 0).attr('y', 0)
        d3.select('#rect-'+that.props.stroke.id).attr('fill', 'rgba(252, 243, 242, 0)')
        if (isIt == true){
            d3.select('#rect-'+that.props.stroke.id).attr('fill', 'rgba(252, 243, 242, 0.3)')
            
        }
    }
    render() {
        var that = this;
        // console.log(this.props.stroke);
        

        var scale = 1;


        var placeHolder = <PlaceHolder 
                    data={this.props.stroke.placeHolder[0]}
                    parent={this.props.stroke}
                   
                    lines={this.props.stroke.placeHolder[0].lines}
                    addLine={this.addLine}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}

                    updateWidthHeightTag = {this.props.updateWidthHeightTag}
                    removeTagLine = {this.props.removeTagLine}

                    addSketchLine={this.props.addSketchLine}
                />
        if (this.state.currentPlaceHolder != null){
                placeHolder = <PlaceHolder 
                    data={this.state.currentPlaceHolder}
                    parent={this.props.stroke}
                
                    lines={this.state.currentPlaceHolder.lines}
                    addLine={this.addLine}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}

                    updateWidthHeightTag = {this.props.updateWidthHeightTag}
                    removeTagLine = {this.props.removeTagLine}
                    addSketchLine={this.props.addSketchLine}
                />
        }

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


        var translate = [this.props.stroke.position[0],this.props.stroke.position[1]];
        if (!d3.select('#item-'+that.props.stroke.id).empty()){
            var transform = getTransformation(d3.select('#item-'+that.props.stroke.id).attr('transform'));
            var X = transform.translateX;
            var Y = transform.translateY;
            translate = [X, Y]
        }
        // console.log(this.props.stroke)
        // console.log(d3.select('#item-'+that.props.stroke.id).empty())
        return (
            <g id={'item-'+this.props.stroke.id} className={'tagEntities'} transform={`translate(${translate[0]},${translate[1]})scale(${scale})`}>
                <g id={'tagSnapped-' + this.props.stroke.id} style={{'pointerEvents': 'none' }} transform={`translate(0,0)`}>
                    {/* {tagSnapped} */}
                </g>


                
                <path id={this.props.stroke.id}></path>
                {/* <path id={'fake-'+this.props.stroke.id}></path> */}
                <g>{placeHolder}</g>
                <rect id={'rect-'+this.props.stroke.id} style={{'pointerEvents': 'none' }}/>

                

            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Tag);