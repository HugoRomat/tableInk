import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, getTransformation, _getBBoxPromise, showBboxBB } from "./../Helper";
import { boxBox } from "intersects";

class TagInterface extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
        // console.log(this.props.stroke.device)
        var line = d3.line()
        var that = this;

        // console.log(that.props.stroke.data.colorStroke)

        this.drawTag();
        this.addMechanism();
        this.addInterface()
           
    
    }
    addInterface(){
        var that = this;
        var el = document.getElementById('item-'+that.props.stroke.id);
        this.mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':1, threshold: 0});
        // var swipe = new Hammer.Swipe({threshold: 0, pointers: 1});
        var press = new Hammer.Press({time: 250});
        var tap = new Hammer.Tap();
        
       
        this.mc.add(pan);
        this.mc.add(tap);
        this.mc.add(press);
        pan.recognizeWith(press);

       this.mc.add(pan);
       this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' || ev.pointers[0].pointerType == 'pen' ){
                
                    that.startPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y,  'time': Date.now()};
                    that.lastPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y}
                    // var getPan =  getTransformation(d3.select('#panItems').attr('transform'));
                    _getBBoxPromise('item-' + that.props.stroke.id).then(( BB)=>{
                        that.allBoundingBox = BB;
                    })
                    that.down = true
                    // console.log('HEY')
            }
            if (ev.pointers[0].pointerType == 'pen' ){
                
            }
            
        })
        this.mc.on("panmove", function(ev) {
            if (ev.pointers[0].pointerType == 'touch'){
                if (that.down){
                    
                    that.findIntersection(that.allBoundingBox, ev);
                    that.dragged(ev);
                }
            }
        })
        this.mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){
                // that.dragended(ev);
                that.down = false;
            }
        })
        this.mc.on('press', function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                that.colorForHolding(true);

                /** Calculate the BBox for the Tag */
                // var data = JSON.parse(JSON.stringify(that.props.stroke));
                // console.log(data)
                // var lines = data.placeHolder[0]['lines'].map((d)=> d.id)
                // console.log(lines)
                // getBoundinxBoxLines(lines, 'stroke-').then((d)=>{
                //     // showBboxBB(d, 'red')
                //     _getBBoxPromise(['rect-'+that.props.stroke.id]).then((e)=>{
                //         // showBboxBB(e, 'red')
                        // data.offsetX = d.x - e.x;
                        // data.offsetY = d.y - e.y;
                        // data.BB = d;
                        that.props.holdTag(that.props.stroke.tagHold); 
                //     })
                // })
                
            }
        })
        this.mc.on('pressup', function(ev) {
            if (ev.pointers[0].pointerType == 'touch' && ev.pointers.length == 1){
                // that.props.dragItem(false);
                that.props.holdTag(false);
                that.colorForHolding(false)
            }
        })

        d3.select('#item-'+that.props.stroke.id).on('contextmenu', function(){d3.event.preventDefault();})
    }
    findIntersection = async(BBTemp, ev) => {
        // console.log(BBTemp)
        var that = this;
        var offsetX = ev.pointers[0].x - this.lastPosition.x;
        var offsetY = ev.pointers[0].y - this.lastPosition.y;
        BBTemp.x += offsetX; //+ transformPan.translateX;
        BBTemp.y += offsetY; //+ transformPan.translateY;
        var BBid = [];
        var arrayRectangle = []
        showBboxBB(BBTemp, 'red');
        console.log(offsetX, offsetY)

        //Put my lines in an array FOR TAGS
        d3.selectAll('.tagInterface').each(function(){
            var idSImple = d3.select(this).attr('id').split('-')[1]
            if (arrayRectangle.indexOf(idSImple) == -1 && idSImple != that.props.stroke.id) BBid.push(d3.select(this).attr('id'))
        })
        // Check for all these lines
        for (var i in BBid){
            var BB = await _getBBoxPromise(BBid[i])
            // showBboxBB(BB, 'red');
            // showBboxBB(BBTemp, 'blue');
            var intersected = boxBox(BB.x, BB.y, BB.width, BB.height, BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
            // console.log(intersected)
            if (intersected) {
                var tagName = BBid[i].split('-')[0];
                var id = BBid[i];
                // console.log(id)
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
    colorForHolding(isIt){
        var that = this;

        d3.select('#item-'+that.props.stroke.id).select('rect').attr('width', 100).attr('height', 100).attr('x', 0).attr('y', 0)
        d3.select('#item-'+that.props.stroke.id).select('rect').attr('fill', 'rgba(252, 243, 242, 0)')
        if (isIt == true){
            d3.select('#item-'+that.props.stroke.id).select('rect').attr('fill', 'rgba(252, 243, 242, 0.3)')
            
        }
    }
    dragged(event) {  
        // console.log(d3.event)
        var that = this;
        var transform = getTransformation(d3.select('#item-'+that.props.stroke.id).attr('transform'));
        var offsetX = event.srcEvent.x - that.lastPosition.x;
        var offsetY = event.srcEvent.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#item-'+that.props.stroke.id).attr('transform', 'translate('+X+','+Y+')')

        that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}

    }
    addMechanism(){
        var line = d3.line()
        var that = this;
        d3.select('#item-'+this.props.stroke.id).selectAll('.tapItem')
        .on('pointerdown', function(d){
            if (d3.event.pointerType == 'touch'){
                // console.log('HEY')
                var othersTags = that.props.stroke.tagHold.tagSnapped;
                var iteration = parseInt(d3.select(this).attr('iteration'));

                // console.log(iteration)
                if (othersTags.length > 0){

                    var parent = d3.select(this).node().parentNode;
                    d3.select(parent).selectAll('.placeholderTag').remove();
                    var where = iteration % (othersTags.length + 1);


                    /* Pour le premier element */
                    if (where == othersTags.length){
                        var newTag = othersTags[where];
                        var container = d3.select(parent);
                        for (var j = 0; j < that.props.stroke.tagHold.placeHolder[0]['lines'].length; j += 1){
                            var element = that.props.stroke.tagHold.placeHolder[0]['lines'][j];
                            
                            // var gElement = container.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                            container.append('path')
                                .attr('class', 'placeholderTag')
                                .attr('d', (d)=>line(element.data))
                                .attr('fill', 'none')
                                .attr('stroke', (d)=> element.colorStroke )
                                .attr('stroke-width', element.sizeStroke)
                                .style('pointer-events', 'none')
                        }
                    } 
                    /* Pour les autres elements */
                    else {
                        var newTag = othersTags[where];
                        var container = d3.select(parent);
                        for (var j = 0; j < newTag.placeHolder[0]['lines'].length; j += 1){
                            var element = newTag.placeHolder[0]['lines'][j];
                            var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
                            container.append('path')
                                .attr('class', 'placeholderTag')
                                .attr('d', (d)=>line(element.data))
                                .attr('fill', 'none')
                                .attr('stroke', (d)=> element.colorStroke )
                                .attr('stroke-width', element.sizeStroke)
                                .style('pointer-events', 'none')
                        }   
                        
                    }
                    iteration += 1
                    d3.select(this).attr('iteration', String(iteration))
                }
            }
            
            
            // console.log(that.props.stroke, newTag)
        })
    }
    drawTag(event){
        var that = this;
        var line = d3.line()
        var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        d3.select('#'+that.props.stroke.id)
            .attr("d", line(that.props.stroke.data))
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '1')
            .attr('opacity', '0.1')
            .attr("stroke-dasharray", "10")
            .attr('stroke-linejoin', "round")
      
        // var step = that.props.stroke.tagHold.BB.width + 30;
        var step = 100;
        var path = d3.select('#'+that.props.stroke.id).node()
        var length = path.getTotalLength();
        var f = 0
        // console.log(that.props.stroke)
        for (var i = 0; i < length; i += step){
            var point = path.getPointAtLength(i);
            // var X = point['x'] - transformPan.translateX - that.props.stroke.tagHold.offsetX - that.props.stroke.tagHold.BB.width/2;
            // var Y = point['y'] - transformPan.translateY - that.props.stroke.tagHold.offsetY - that.props.stroke.tagHold.BB.height/2;
            var X = point['x'] - 50;
            var Y = point['y'] - 50;


            var container = d3.select('#item-'+that.props.stroke.id).select('#patternTag').append('g').attr('transform', 'translate('+X+','+Y+')')

            container.append('rect')
                    .attr('class', 'tapItem')
                    .attr('iteration', '0')
                    .attr('x', 0)//that.props.stroke.tagHold.offsetX + transformPan.translateX)
                    .attr('y', 0)//that.props.stroke.tagHold.offsetY + transformPan.translateY)
                    .attr('width', 100)//that.props.stroke.tagHold.BB.width)
                    .attr('height', 100)//that.props.stroke.tagHold.BB.height)
                    .attr('fill', 'rgba(252, 243, 242, 0.4)')
                    .attr('stroke-linejoin', "round")
                    // console.log(that.props.stroke.tagHold.tagSnapped)
            if (that.props.stroke.tagHold.tagSnapped.length == 0){
                
                for (var j = 0; j < that.props.stroke.tagHold.placeHolder[0]['lines'].length; j += 1){
                    var element = that.props.stroke.tagHold.placeHolder[0]['lines'][j];
                    var gElement = container//.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')
                    // console.log(element)
                    gElement.append('path')
                        .attr('class', 'placeholderTag')
                        .attr('d', (d)=>line(element.data))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.colorStroke )
                        .attr('stroke-width', element.sizeStroke)
                        .style('pointer-events', 'none')
                        .attr('stroke-linejoin', "round")
                }  
            }
            /** IN CASE OF MANY TAG SNAPPED **/
            else {
                var where = f % (that.props.stroke.tagHold.tagSnapped.length + 1);
                // var container = d3.select('#item-'+that.props.stroke.id).select('#patternTag').append('g').attr('transform', 'translate('+X+','+Y+')')

                if (where != 0){
                    for (var j = 0; j < that.props.stroke.tagHold.tagSnapped[where-1].placeHolder[0]['lines'].length; j += 1){
                        var element = that.props.stroke.tagHold.tagSnapped[where-1].placeHolder[0]['lines'][j];
                        var gElement = container//.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                        gElement.append('path')
                        .attr('class', 'placeholderTag')
                        .attr('d', (d)=>line(element.data))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.colorStroke )
                        .attr('stroke-width', element.sizeStroke)
                        .style('pointer-events', 'none')
                        .attr('stroke-linejoin', "round")
                    } 
                } else {
                    // console.log(that.props.stroke.tagHold)
                    for (var j = 0; j < that.props.stroke.tagHold.placeHolder[0]['lines'].length; j += 1){
                        var element = that.props.stroke.tagHold.placeHolder[0]['lines'][j];
                        var gElement = container//.append('g').attr('transform', 'translate('+(- that.props.stroke.tagHold.offsetX)+','+(- that.props.stroke.tagHold.offsetY)+')')

                        gElement.append('path')
                        .attr('class', 'placeholderTag')
                        .attr('d', (d)=>line(element.data))
                        .attr('fill', 'none')
                        .attr('stroke', (d)=> element.colorStroke )
                        .attr('stroke-width', element.sizeStroke)
                        .style('pointer-events', 'none')
                        .attr('stroke-linejoin', "round")
                    } 
                }
                f++;
            }
                  
        }
        
    }
    componentDidUpdate(){
        
    }
    componentWillUnmount(){

    }
    render() {

        return (
            <g id={'item-'+this.props.stroke.id} className="tagInterface" transform={`translate(0,0)`}>
                <path style={{'pointerEvents': 'none' }} id={this.props.stroke.id}></path>
                <g id="patternTag"></g>
            </g>
        );
        
    }
}

export default TagInterface;