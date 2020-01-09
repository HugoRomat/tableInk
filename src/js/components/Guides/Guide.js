import React, { Component } from "react";
import * as d3 from 'd3';
import { getTransformation, getNearestElement, showBbox, distance, guid, _getBBox, calculateBB, _getBBoxPromise } from "./../Helper";
import { connect } from 'react-redux';


import { 
    shouldOpenMenu,
    addLineToStickyGroup
} from '../../actions';

import PlaceHolder from "./PlaceHolder";
import PlaceHolderText from "./PlaceHolderText";

const mapDispatchToProps = { 
    shouldOpenMenu,
    addLineToStickyGroup
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
        this.lastPosition = {};
        this.drag = false;

        this.state = {
            'BBox':{}
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
        


        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke['points']))
            .attr('fill', 'none')
            // .attr('stroke', '#9C9EDEDF')
            .attr('stroke-width', '2')
            
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
        var pan = new Hammer.Pan({'pointers':0, threshold: 1});
        var press = new Hammer.Press({time: 250});
        var tap = new Hammer.Tap();

        this.mc.add(press);
        this.mc.add(pan);
        this.mc.add(tap);
        pan.recognizeWith(press);
        pan.recognizeWith(tap)

       this.mc.add(pan);
       this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' || ev.pointers[0].pointerType == 'pen' ){
                that.startPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y,  'time': Date.now()};
                that.lastPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y}
                that.dragstarted(ev);
            }
        })
        this.mc.on("panmove", function(ev) {
            if (ev.pointers[0].pointerType == 'touch'){
                that.dragged(ev);
            }
        })
        this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){
                that.dragended(ev);
            }
        })
        this.mc.on("press", function(event){
            that.props.dragItem(false);
            that.colorForHolding(true);
            that.props.holdGuide(that.props.stroke.id);
        })
        this.mc.on("pressup", function(event){
            that.props.dragItem(false);
            that.colorForHolding(false);
            that.props.holdGuide(false);
        })

        this.mc.on("tap", function(event){
            // console.log('GO',that.props.stroke.id)
            // clearTimeout(that.timerPress);
            that.props.setGuideTapped(that.props.stroke.id);
            that.colorForHolding(true);
            setTimeout(function(){
                that.props.setGuideTapped(false);
                that.colorForHolding(false);
            }, 2000)
            // console.log('Thats a tap')
            // var BBox = _getBBox('item-'+env.props.stroke.id)
            // that.props.shouldOpenMenu({
            //     'id': guid(),
            //     'shouldOpen': true,
            //     'position': [BBox.x, BBox.y],
            //     'idGuide': env.props.stroke.id,
            //     'idLines': []//env.props.stroke.data.linesAttached
            // })
        })


            
        d3.select('#item-'+that.props.stroke.id)
            
        //     .on('pointermove', function(d){
        //         if (d3.event.pointerType == 'touch'){
        //             var dist = distance(that.startPosition.x, d3.event.x, that.startPosition.y, d3.event.y);
        //             var differenceTime = that.startPosition.time - Date.now();
                    
        //             if (dist > 10 ){
        //                 that.dragged(that);
        //             }
        //         }
        //     })
        //     .on('pointerup', function(d){
        //         if (d3.event.pointerType == 'touch'){
        //             that.dragended(that);
        //         }
        //     })
            .on('contextmenu', function(){
                d3.event.preventDefault();
            })
            
            
            
        // console.log('GUIDE', this.props.stroke.id)
        // var BBox = _getBBox(this.props.stroke.id);
        // console.log(BBox)
        // this.setState({'BBox': BBox})
       
    
    }

    dragstarted(event) {
     
        var that = this;

       
        // if (that.props.isGallery == false) that.props.dragItem(true);

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
        d3.select('#item-'+that.props.stroke.id).attr('transform', 'translate('+X+','+Y+')')


            
            var linesAttached = that.props.stroke.linesAttached;
            for (var i in linesAttached){
                var line = linesAttached[i];
                var identifier = 'item-'+line;
                var transform = getTransformation(d3.select('#'+identifier).attr('transform'));
                var X = offsetX + transform.translateX;
                var Y = offsetY + transform.translateY;
                d3.select('#'+identifier).attr('transform', 'translate('+X+','+Y+')')
            }
            
        // }
        
        // d3.select('svg').append('circle')
        //     .attr('cx', X)
        //     .attr('cy', Y)
        //     .attr('r', 10)
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
        // console.log(this.props.stroke)
    }
    addLine = (d) => {
        // console.log('DOOO')
       this.props.addLineToStickyGroup({
           'idGuide': d.idGuide,
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
        // console.log('GO')
        d3.select('#rect-'+this.props.stroke.id)
            .attr('width', 0)
            .attr('height', 0)
        
        
        if (isIt == true){
            var transform = getTransformation(d3.select('#item-'+this.props.stroke.id).attr('transform'))
            // console.log(this.props)
            // _getBBoxPromise('item-'+this.props.stroke.id).then((BBox)=>{
                // var x = transform.x - 100;
                // var y = transform.y - 50;
                // console.log(transform)

                d3.select('#rect-'+that.props.stroke.id)
                    .attr('x', - 50)
                    .attr('y', -25)
                    .attr('width', that.props.stroke.width + 50)
                    .attr('height',  that.props.stroke.height + 50)

                    // .attr('fill', '#9C9EDEDF')
                    .attr('opacity', '0.2')
            // })
            
        }
    }
    resize(){

        var scale = 50/140;
        return scale

    }
    render() {
        var BB = calculateBB(this.props.stroke.points);
        // console.log(this.props.stroke);
        // var translate = [this.props.stroke.position[0],this.props.stroke.position[1]]
        // var scale = 1;
        // if (window.innerWidth < 769){
        //     var BB = calculateBB(this.props.stroke.points);
        //     translate[0] = 50;
        //     scale = this.resize()
        // }

        // console.log(this.props.stroke)
        // var height = 
        

        const listPlaceHolder = this.props.stroke.placeHolder.map((d, i) => {
                return <PlaceHolder 
                    key={i}
                    data={d}
                    parent={this.props.stroke}
                    BBoxParent={BB}
                    lines={d['lines']}
                    addLine={this.addLine}

                    penType = {this.props.penType}
                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
                    patternPenData = {this.props.patternPenData}
                />
        });
        // console.log(this.props.stroke)

        return (
            <g id={'item-'+this.props.stroke.id} className='guide' transform={`translate(${this.props.stroke.position[0]},${this.props.stroke.position[1]})`}>
                
                
                {/* { (window.innerWidth < 769) ? <circle cx={10} cy={35} r={120} fill={'white'} stroke={'black'}/> : null } */}


                <rect id={'rect-'+this.props.stroke.id} />
                <path id={this.props.stroke.id}></path>
                {/* <path id={'fake-'+this.props.stroke.id}></path> */}
                {listPlaceHolder}
                {/* <PlaceHolderText 
                    data={this.props.stroke.textPosition}
                    dataParent={this.props.stroke} 
                /> */}
                

                
                
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Guide);