import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Items from './Items';
import pocket from './../../../../static/pocket2.png';
import returnPocket from './../../../../static/returnPocket.png';
// import pocket2 from './../../../../static/procket2.png';


import { 
    addGuideToSticky,
    closeGallery,
    updatePlaceHolderGroup
  } from '../../actions';
import { guid, getTransformation, whereIsPointer, drawCircle, _getBBoxPromise } from "../Helper";
import Guide from "../Guides/Guide";

const mapDispatchToProps = { 
    addGuideToSticky,
    closeGallery,
    updatePlaceHolderGroup
};
const mapStateToProps = (state, ownProps) => {  
    return { 
        galleryItems: state.rootReducer.present.galleryItems,
        groupLines:  state.rootReducer.present.groupLines
    };
  };


class GalleryItmes extends Component {
    constructor(props) {
        super(props);
        this.state = {
           item: null
        } 

        this.listItems = [];
        this.iteration = 0;
    }

    backPile(){
        var that = this;
        var el = document.getElementById('backPile');
        this.mc = new Hammer.Manager(el);
        var swipe = new Hammer.Swipe({pointers: 1});
        this.mc.add(swipe);
        this.mc.on("swipe", function(ev) {
            if (ev.pointers[0].pointerType == 'touch'){
                that.swipe();
            }
        })

    }
    componentDidMount(){
        var that = this;

        this.backPile();

        d3.select('#menuOpener').attr('isOpen', 'false')
        var el = document.getElementById('menuOpener');
        console.log(el)
        this.mc = new Hammer.Manager(el);

        var tap = new Hammer.Tap();
        var pinch = new Hammer.Pinch({'pointers':2, threshold: 50});
        var pan = new Hammer.Pan({'pointers':0, threshold: 50});

        this.mc.add(pan);
        this.mc.add(tap);
        // this.mc.add(pan);
        this.mc.add(pinch);
        pinch.recognizeWith(pan)
        pan.recognizeWith(pinch);
        // pan.requireFailure(swipe);

        this.mc.on("pinchstart", function(ev) {
            // if (ev.pointers[0].pointerType == 'touch'){
                var transform =  getTransformation(d3.select('#itemCurrentGuide').attr('transform'));
                that.lastPosition = {'x': transform.translateX, 'y':transform.translateY}
            // }
        })
        this.mc.on("pinchmove", function(ev) {
            // if (ev.pointers[0].pointerType == 'touch'){
            // console.log('PINCH')
                var X = ev.center.x - (130 * ev.scale); //- that.lastPosition.x;
                var Y = ev.center.y - 1140 - (65 * ev.scale);
                d3.select('#itemCurrentGuide').attr('transform', 'translate('+X+','+Y+')scale('+ev.scale+')')
                // that.lastPosition = {'x': ev.center.x, 'y':ev.center.y}
            // }
        })



        this.mc.on("panstart", function(ev) {
            if (ev.pointers[0].pointerType == 'touch'){
                // that.lastPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y}
            }
        })
        this.mc.on("panmove", function(ev) {
            // console.log(ev)
            // drawCircle(ev.center.x, ev.center.y, '10', 'red')
            if (ev.pointers[0].pointerType == 'touch'){
                // var transform =  getTransformation(d3.select('#itemCurrentGuide').attr('transform'));


                var X = ev.center.x - 280 -  (130 * ev.scale); //- that.lastPosition.x;
                var Y = ev.center.y - (window.innerHeight-250) - (65 * ev.scale);
                // console.log(transform)
                // var offsetX = ev.srcEvent.x - that.lastPosition.x;
                // var offsetY = ev.srcEvent.y - that.lastPosition.y;
                // var X = offsetX + transform.translateX;
                // var Y = offsetY + transform.translateY;
                // console.log(transform)
                d3.select('#itemCurrentGuide').attr('transform', 'translate('+X+','+Y+')scale('+ev.scale+')')
                // that.lastPosition = {'x': ev.srcEvent.x, 'y':ev.srcEvent.y}
            }
        })
        this.mc.on("panend", function(ev) {
            var position = {'x': ev.pointers[0]['x'], 'y': ev.pointers[0]['y']}
            // if (ev.pointers[0].pointerType == 'touch'){
                _getBBoxPromise('itemCurrentGuide').then((BBox)=>{
                    d3.select('#itemCurrentGuide').attr('transform', 'translate(0,0)scale(1)')

                    
                    // that.tempArrayStroke.push([event.x, event.y])

                    var elemnt = whereIsPointer(position['x'], position['y']);
                    console.log(elemnt)
                    if (elemnt.type == 'group'){

                        var actualGuide = that.props.groupLines.find((d)=> d.id == elemnt.id)
                        actualGuide = JSON.parse(JSON.stringify(actualGuide.model));
                        var items = JSON.parse(JSON.stringify(that.props.galleryItems.data));

                        var newGuide = JSON.parse(JSON.stringify(items[that.iteration]))
                        // console.log(newGuide)
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
                        that.props.updatePlaceHolderGroup({'idGroup':elemnt.id, 'model':newGuide})
                    }
                    if (elemnt.type == null && elemnt.id == null){
                        // console.log(items[that.iteration])
                        var items = JSON.parse(JSON.stringify(that.props.galleryItems.data));
                        var newGuide = JSON.parse(JSON.stringify(items[that.iteration % that.listItems.length]))

                        // console.log('GO')
                        // var BB = {'x': ev.center.x - (130 * ev.scale), 'y': ev.center.y - 1140 - (65 * ev.scale), 'width': }
                        // that.props.createGroup({'x':ev.pointers[0]['x'], 'y': ev.pointers[0]['y'], });
                        that.props.createGroup({'BBox':BBox, 'model':newGuide});
                        
                    }
                })
                
                // console.log(elemnt)
            // }
        })


        // console.log('HEY')
        // this.mc.on("tap", function(ev) {
        // // console.log('TAP')
        //     if (ev.pointers[0].pointerType == 'touch' || ev.pointers[0].pointerType == 'pen'){
        //         var isOpne = d3.select('#menuOpener').attr('isOpen')
        //         if (isOpne == 'false'){
        //             // console.log('GO')
        //             that.props.closeGallery({isOpen: true})
        //             d3.select('#menuOpener').attr('isOpen', 'true');
        //         } else{
        //             that.props.closeGallery({isOpen: false})
        //             d3.select('#menuOpener').attr('isOpen', 'false')
        //         }
        //     }
        // })
        this.computeGallery();
        this.setItem();
    } 
    computeGallery(){
        
        // console.log(this.props.galleryItems)

        var widthShouldHave = 130;


        // ORDER GALLERY ITEMS
        var offsetRight = 400;
        var offset = 700;
        var amountInLine = 6//(window.innerWidth)/offset;
        var ceilAmount = Math.floor(amountInLine) - 2
        // // console.log(ceilAmount, amountInLine)
        var items = JSON.parse(JSON.stringify(this.props.galleryItems.data));
        // // console.log(amountLine)
       
       /* items.forEach((element, i) => {
            var elementOuterBG = element.placeHolder[0];

            element.position[0] = - elementOuterBG['x'] + ((i%ceilAmount) * offset) + offsetRight;
            element.position[1] =  - elementOuterBG['y'] + (Math.floor(i/ceilAmount) * offset) + 70
            element.scale = widthShouldHave / elementOuterBG.width//0.7;
        });*/
        items.forEach((element, i) => {

            var elementOuterBG = element.placeHolder[0];
            element.position[0] = - elementOuterBG['x'] ;
            element.position[1] = - elementOuterBG['y']
            element.scale = widthShouldHave / elementOuterBG.width; //0.7;
        });

        this.listItems = null;
        // return <g key={i}  transform={`translate(0,`+(window.innerHeight - 600)+`)scale(`+d.scale+`)`}>
        // if (this.props.galleryItems.isOpen){style={{'pointerEvents': 'none' }}
            this.listItems = items.map((d, i) => {
                return <g key={i}  transform={`translate(50,`+60+`)scale(`+d.scale+`)`}>
                    
                    <Guide 
                        key={i} 
                        stroke={d}
                        // isGallery={true}
    
                        // onSwipe={this.swipe}
                        // holdGuide={this.props.holdGuide}
                        dragItem={this.props.dragItem}
                        setGuideTapped={this.props.setGuideTapped}
                        addGuideToSticky={this.addGuideToSticky}
    
                        // colorStroke = {this.props.colorStroke}
                        // sizeStroke = {this.props.sizeStroke}
                /></g>
            });
        // }
    }
    componentDidUpdate(prevProps, prevState){
        if (this.props.galleryItems.isOpen != prevProps.galleryItems.isOpen){
            if (this.props.galleryItems.isOpen){
                this.open();
            }
            else {
                this.close();
            }
        }
    }
    open(){
        // d3.select('#menuOpener').select('#circle2').attr('cx', '240').attr('cy', '20').attr('r', '20')
        // d3.select('#menuOpener').select('#circle2').transition().duration(1500)
        // .attr('cx', '240').attr('cy', '20').attr('r', '300')
        d3.select('#menuOpener').select('#pocket2').transition().duration(1500).attr('x', '0').attr('y', '0')
        d3.select('#menuOpener').select('#pocket2').transition().duration(1500)
        .attr('width', '800').attr('y', '-700')
        // d3.select('#menuOpener').select('circle').transition().duration(1500).attr('r', '300')
    }
    close(){
        // d3.select('#menuOpener').select('circle').transition().duration(1500).attr('r', '300')
        d3.select('#menuOpener').select('#pocket2').transition().duration(1500)
       
        .attr('y', '0')
        .attr('x', '0')
        .attr('width', '0')
        // d3.select('#menuOpener').select('circle').transition().duration(1500).attr('r', '0')
    }
    dragItem = (d) => {
        this.isItemDragged = d;
    }
    addGuideToSticky = (d) => {
        var data = JSON.parse(JSON.stringify(d));
        var st = data.guide;
        st.id = guid();
        st.placeHolder.forEach(element => {
            // console.log(element)
            element.lines.forEach((d)=>{
                d.id = guid();
            })
        });
        // data.position[0] = data.position[0] - 50;
        // data.position[1] = data.position[1] - 100;
        st.position = data.position;
        // console.log(data)
        
       this.props.addGuideToSticky(st)
    }
    addToSelection = (d) => {
    
    }
    setItem(){
        var id = this.iteration % this.listItems.length;
        this.setState({'item': this.listItems[id]})
        // console.log(id)
    }
    swipe = (d) => {

        this.iteration ++;
        this.setItem()
       
    }
    render() {

            

        // if (this.props.openGalleryModel == false) listItems = []
        
        return (     
            <g className="galleryItems"  transform={`translate(0,0)`}>
                {/* <circle id="menuOpener" cx={0} cy={window.innerHeight} r={150} fill={'#b3c6e0'} /> */}

                <g id="backPile"  transform={`translate(-20,`+(window.innerHeight-250)+`)`}> 
                    <image href={returnPocket} width={300}/> 
                </g>
                <g id="menuOpener"  transform={`translate(270,`+(window.innerHeight-250)+`)`}> 
                    <image href={pocket} width={300}/> 
                   
                    {/* <image id="pocket2" href={pocket2} width={0}/> */}

                    <g id="itemCurrentGuide" transform={`translate(0,0)`}> {this.state.item} </g> 
                    {/* <circle id="circle2" cx={0} cy={0} r={0} fill={'#b3c6e0'} /> */}
                </g>
                
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(GalleryItmes);