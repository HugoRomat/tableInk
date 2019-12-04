import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Items from './Items';

import { 
    addGuideToSticky
  } from '../../actions';
import { guid } from "../Helper";
import Guide from "../Guides/Guide";

const mapDispatchToProps = { 
    addGuideToSticky
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
        // d3.select('#canvasGallery').attr("viewBox", "0,0,2000,900")
        // .style('width', '2000px') 
        // .style('height', '900px')
            
        // .attr('preserveAspectRatio', 'xMinYMin');

        console.log('HELLO');


        

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
        // ORDER GALLERY ITEMS
        var offsetRight = 800;
        var offset = 350;
        var amountLine = (window.innerWidth-offsetRight)/offset;
        var ceilAmount = Math.ceil(amountLine) - 1
        var items = JSON.parse(JSON.stringify(this.props.galleryItems));
        items.forEach((element, i) => {
            element.position[0] = ((i%ceilAmount) * offset) + offsetRight;
            element.position[1] = (Math.floor(i/ceilAmount) * offset) + 70;
        });


        var listItems = items.map((d, i) => {
            return <Guide 
                    key={i} 
                    stroke={d}
                    isGallery={true}

                    holdGuide={this.holdGuide}
                    dragItem={this.dragItem}
                    setGuideTapped={this.setGuideTapped}
                    addGuideToSticky={this.addGuideToSticky}
            />
        });

        if (this.props.openGalleryModel == false) listItems = []
        
        return (     
            <g className="galleryItems"  transform={`translate(0,0)`}>
                    {listItems}  
            </g>
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(GalleryItmes);