import React, { Component } from "react";
import * as d3 from 'd3';
import { getTransformation, getNearestElement, showBbox, distance, guid, _getBBox, calculateBB, _getBBoxPromise, showBboxBB } from "./../Helper";
import { connect } from 'react-redux';


import { 
    shouldOpenMenu,
    addLineToStickyGroup,
    updatePlaceHolder,
    updatePlaceHolderGroup,
    swipeGroup
} from '../../actions';

import PlaceHolder from "./PlaceHolder";
import PlaceHolderText from "./PlaceHolderText";

const mapDispatchToProps = { 
    shouldOpenMenu,
    addLineToStickyGroup,
    updatePlaceHolder,
    updatePlaceHolderGroup,
    swipeGroup
};
const mapStateToProps = (state, ownProps) => {  
  
  return { 
      groupLines: state.rootReducer.present.groupLines
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
        this.isExpand = false;

        this.state = {
            'BBox':{},
            // 'scale': 0.3
            // 'shouldExpand': false
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
        


        // d3.select('#'+that.props.stroke.id)
        //     .attr("d", line(that.props.stroke['points']))
        //     .attr('fill', 'none')
        //     // .attr('stroke', '#9C9EDEDF')
        //     .attr('stroke-width', '2')
            
        /*
        d3.select('#fake-'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '40')
            .attr('stroke-opacity', '0.1')
        */
            


        var el = document.getElementById('item-'+that.props.stroke.id);
        this.mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':1, threshold: 50});
        var tap = new Hammer.Tap();
        var press = new Hammer.Press({time: 250});
        var pinch = new Hammer.Pinch({});

        this.mc.add(press);
        this.mc.add(pan);
        this.mc.add(pinch);
        this.mc.add(tap);


        pan.recognizeWith(press);
        this.mc.on("press", function(event){
            if (event.pointers[0].pointerType == 'touch'){
                // that.props.dragItem(false);
                that.colorForHolding(true);
                that.props.holdGuide(that.props.stroke);
            }
        })
        this.mc.on("pressup", function(event){
            if (event.pointers[0].pointerType == 'touch'){
                // that.props.dragItem(false);
                that.colorForHolding(false);
                that.props.holdGuide(false);
            }
        })

        this.mc.on("tap", function(event){
            // console.log(event)
            // console.log('GO',that.props)
            // clearTimeout(that.timerPress);
            if (event.changedPointers[0].pointerType == 'touch'){
                // console.log(that.props.guideTapped)
                if (that.props.guideTapped == false || that.props.guideTapped == undefined){
                    that.props.setGuideTapped(that.props.stroke);
                    that.colorForHolding(true);
                    setTimeout(function(){
                        that.props.setGuideTapped(false);
                        that.colorForHolding(false);
                    }, 2000)
                } else {
                    // console.log(that.props.guideTapped)
                    var newGuide = JSON.parse(JSON.stringify(that.props.guideTapped))
                    var actualGuide = JSON.parse(JSON.stringify(that.props.stroke))

                    newGuide.id = guid();
                    newGuide.child = actualGuide.child;
                    for (var j in newGuide.placeHolder){
                        newGuide.placeHolder[j]['lines'].forEach(element => {element.id = guid()});
                    }
                    newGuide.placeHolder[0] = {...newGuide.placeHolder[0], 
                        'width': actualGuide.placeHolder[0]['width'],
                        'height': actualGuide.placeHolder[0]['height'],
                        'x': actualGuide.placeHolder[0]['x'],
                        'y': actualGuide.placeHolder[0]['y']
                    }
                    newGuide.placeHolder[1] = {...newGuide.placeHolder[1], 
                        'width': actualGuide.placeHolder[1]['width'],
                        'height': actualGuide.placeHolder[1]['height'],
                        'x': actualGuide.placeHolder[1]['x'],
                        'y': actualGuide.placeHolder[1]['y']
                    }
                    newGuide.placeHolder[2] = {...newGuide.placeHolder[2], 
                        'width': actualGuide.placeHolder[2]['width'],
                        'height': actualGuide.placeHolder[2]['height'],
                        'x': actualGuide.placeHolder[2]['x'],
                        'y': actualGuide.placeHolder[2]['y']
                    }
                    newGuide.position = [0,0]
                    delete newGuide.scale;
                    // console.log(newGuide)
                    that.props.updatePlaceHolderGroup({'idGroup': that.props.stroke.child, 'model':newGuide})
                }
                
            }
         
        })



        d3.select('#item-'+that.props.stroke.id)
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
            
          
    }
    
    expandGuide(){

    }
    dragstarted(event) {
        var that = this;
    }

    dragged(event) {  
        // console.log(d3.event)
        var that = this;


        var transform = getTransformation(d3.select('#item-'+that.props.stroke.id).attr('transform'));
        // console.log(transform)
        var offsetX = event.srcEvent.x - that.lastPosition.x;
        var offsetY = event.srcEvent.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        // console.log(transform)
        d3.select('#item-'+that.props.stroke.id).attr('transform', 'translate('+X+','+Y+')scale('+transform.scaleX+')')


            
        var linesAttached = that.props.stroke.linesAttached;
        for (var i in linesAttached){
            var line = linesAttached[i];
            var identifier = 'item-'+line;
            var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
            var X = offsetX + transform.translateX;
            var Y = offsetY + transform.translateY;
            d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
        }
        that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}

    }
    dragended(event) {
        var that = this;
        that.drag = false;

        if (that.props.isGallery == false){
            // that.props.dragItem(false);
            that.colorForHolding(false)

        }
        // console.log(that.props.isGallery, d3.eventx)
        if (that.props.isGallery){
            if (event.srcEvent.x < 450){
                // console.log('HEY')
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
           
    }
    addLine = (d) => {
        // console.log('DOOO',d)
        this.props.addLineToStickyGroup({
            'idGroup': this.props.stroke.child,
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

        d3.select('#rect-'+this.props.stroke.id)
            .attr('width', 0)
            .attr('height', 0)
        
        if (isIt == true){
            var getData = d3.select('#group-'+ that.props.stroke.child).select('#rect-outerBackground');
            // console.log('rect-'+that.props.stroke.id)

            // console.log(that.props.stroke.placeHolder[0])
            // d3.select('#rect-'+that.props.stroke.id)
            //     .attr('x', getData.attr('x'))
            //     .attr('y', getData.attr('y'))
            //     .attr('width', getData.attr('width'))
            //     .attr('height',  getData.attr('height'))
            //     .attr('opacity', '0.2')

                d3.select('#rect-'+that.props.stroke.id)
                .attr('x', that.props.stroke.placeHolder[0]['x'])
                .attr('y', that.props.stroke.placeHolder[0]['y'])
                .attr('width', that.props.stroke.placeHolder[0]['width'])
                .attr('height', that.props.stroke.placeHolder[0]['height'])
                .attr('opacity', '0.2')
        }
    }
    resize(){

        var scale = 50/140;
        return scale

    }
    swipeGroup = (d) => {
        // console.log(this.props.groupLines, d)
        // that.props.swipeGroup({'id': group.id, 'swipe': !group.swipe})
        var group = this.props.groupLines.find(x => x.id == d.id)

        if (group.swipe == true){
            this.props.updatePlaceHolderGroup({'idGroup': group.id, 'model':this.props.stroke})
    
        }
        // console.log(group)
        this.props.swipeGroup({'id': group.id,  'swipe': !group.swipe})

        
    }
    moveTag = (d) => {
        var placeHolder = this.props.stroke.placeHolder.find(x => x.id == d.idPlaceHolder);

        var line = placeHolder['lines'].find(x => x.id == d.id);
        // console.log(line)
        // var group = this.props.groupLines.find(x => x.id == this.props.stroke.child);
        // var position = group.placeHolder[1]['lines'][0]['tag']['position']
        var position = line['tag']['position']
        position[0] += d.event.x; 
        position[1] += d.event.y;
        this.props.updatePlaceHolderGroup({'idGroup': this.props.stroke.child, 'model':JSON.parse(JSON.stringify(this.props.stroke))})
    //    console.log(this.props.stroke)
    }
    render() {

        // console.log('update', this.props.stroke.placeHolder[0])
        // var BB = calculateBB(this.props.stroke.points);
        var scale = 1;
        if (this.props.stroke.position[2] != undefined) scale = this.props.stroke.position[2]
  
        const listPlaceHolder = this.props.stroke.placeHolder.map((d, i) => {
                return <PlaceHolder 
                    key={i}
                    data={d}
                    parent={this.props.stroke}
                    // BBoxParent={BB}
                    lines={d['lines']}
                    addLine={this.addLine}
                    // shouldExpand={this.state.shouldExpand}

                    tagHold={this.props.tagHold}
                    penType = {this.props.penType}
                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
                    patternPenData = {this.props.patternPenData}
                    updatePlaceHolderGroup = {this.props.updatePlaceHolderGroup}

                    moveTag = {this.moveTag}
                    swipeGroup = {this.swipeGroup}
                />
        });
        // console.log(this.props.stroke)

        return (
            <g id={'item-'+this.props.stroke.id} className='guide' transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})scale(${scale})`}>
                <rect id={'rect-'+this.props.stroke.id} />
                {/* <path id={this.props.stroke.id}></path> */}
                {listPlaceHolder}
            </g>
        );
        
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Guide);

