import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Items from './Items';

import { 
    addGuideToSticky,
    closeGallery
  } from '../../actions';
import { guid } from "../Helper";
import Guide from "../Guides/Guide";

const mapDispatchToProps = { 
    addGuideToSticky,
    closeGallery
};
const mapStateToProps = (state, ownProps) => {  
    return { 
        galleryItems: state.rootReducer.present.galleryItems
    };
  };


class GalleryItmes extends Component {
    constructor(props) {
        super(props);
        this.state = {
           
        } 
    }
    componentDidMount(){
        var that = this;
        d3.select('#menuOpener').attr('isOpen', 'false')
        var el = document.getElementById('menuOpener');
        console.log(el)
        this.mc = new Hammer.Manager(el);

        var tap = new Hammer.Tap();


        // this.mc.add(pan);
        this.mc.add(tap);

        // console.log('HEY')
        this.mc.on("tap", function(ev) {
        // console.log('TAP')
            if (ev.pointers[0].pointerType == 'touch' || ev.pointers[0].pointerType == 'pen'){
                var isOpne = d3.select('#menuOpener').attr('isOpen')
                if (isOpne == 'false'){
                    // console.log('GO')
                    that.props.closeGallery({isOpen: true})
                    d3.select('#menuOpener').attr('isOpen', 'true');
                } else{
                    that.props.closeGallery({isOpen: false})
                    d3.select('#menuOpener').attr('isOpen', 'false')
                }
            }
        })
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
        
        d3.select('#menuOpener').transition().duration(1500).attr('r', '1000')
    }
    close(){
        
        d3.select('#menuOpener').transition().duration(1500).attr('r', '150')
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
    render() {

        // console.log(this.props.galleryItems)

        var widthShouldHave = 100;


        // ORDER GALLERY ITEMS
        var offsetRight = 400;
        var offset = 700;
        var amountInLine = 6//(window.innerWidth)/offset;
        var ceilAmount = Math.floor(amountInLine) - 2
        // // console.log(ceilAmount, amountInLine)
        var items = JSON.parse(JSON.stringify(this.props.galleryItems.data));
        // // console.log(amountLine)
       
        items.forEach((element, i) => {

            var elementOuterBG = element.placeHolder[0];
            // console.log(elementOuterBG['x'])
            // element.position[0] = ((i%ceilAmount) * offset) + offsetRight ;
            // element.position[1] = (Math.floor(i/ceilAmount) * offset) + 70 ;
            element.position[0] = - elementOuterBG['x'] + ((i%ceilAmount) * offset) + offsetRight;
            element.position[1] =  - elementOuterBG['y'] + (Math.floor(i/ceilAmount) * offset) + 70
            
            // console.log()
            element.scale = widthShouldHave / elementOuterBG.width//0.7;

            // console.log((i%ceilAmount), element.position[1])
        });


        var listItems = null;

        if (this.props.galleryItems.isOpen){
            listItems = items.map((d, i) => {
                return <g key={i}  transform={`translate(0,`+(window.innerHeight - 600)+`)scale(`+d.scale+`)`}>
                    <Guide 
                        key={i} 
                        stroke={d}
                        // isGallery={true}
    
                        // holdGuide={this.props.holdGuide}
                        dragItem={this.props.dragItem}
                        setGuideTapped={this.props.setGuideTapped}
                        addGuideToSticky={this.addGuideToSticky}
    
                        // colorStroke = {this.props.colorStroke}
                        // sizeStroke = {this.props.sizeStroke}
                /></g>
            });
        }
            

        // if (this.props.openGalleryModel == false) listItems = []
        
        return (     
            <g className="galleryItems"  transform={`translate(0,0)`}>
                <circle id="menuOpener" cx={0} cy={window.innerHeight} r={150} fill={'#b3c6e0'} />
                    {listItems}  
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(GalleryItmes);