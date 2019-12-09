import React, { Component } from "react";
import * as d3 from 'd3';
import shallowCompare from 'react-addons-shallow-compare';
import { getNearestElement, _getBBox, getTransformation, guid, simplify } from "../Helper";
import LinePlaceHolder from "./LinePlaceHolder";
import PlaceHolderText from "./PlaceHolderText";


class PlaceHolder extends Component {
    constructor(props) {
        super(props);
        this.down = false;
        this.tempArrayStroke = [];
    }
    // componentDidMount(){
    //     console.log(this.props.data)
    // }
    
    componentDidMount(){

        this.drawPlaceHolder();
        // console.log(this.props.data)
        var that = this;
        // console.log('placeHolder-' + this.props.data.id)
        d3.select('#placeHolder-' + this.props.data.id + '-' + this.props.parent.id)
            .on('pointerdown', function(d){

                /**
                * TO FADEOUT
                */
               if (d3.event.pointerType == 'pen'){
                    var idItem = d3.select(this).attr('id').split('-');
                    if (idItem[1] == 'background' || idItem[1] == 'right' || idItem[1] == 'middle'){
                        d3.select('#placeHolder-' + 'left' + '-' + that.props.parent.id).style('opacity', 0.1);
                        d3.select('#placeHolder-' + 'right' + '-' + that.props.parent.id).style('opacity', 0.1)
                        d3.select('#placeHolder-' + 'middle' + '-' + that.props.parent.id).style('opacity', 0.1);
                        d3.select('#placeHolderText' + '-' + that.props.parent.id).style('opacity', 0.1);
                        
                    }
                }
                // console.log(d3.select(this).attr('id'))
                if (d3.event.pointerType == 'pen' || d3.event.pointerType == 'mouse'){

                    that.down = true;
                }
                
                // console.log('Hello')
            })
            .on('pointermove', function(d){
                if (d3.event.pointerType == 'pen' || d3.event.pointerType == 'mouse'){
                    if (that.down){

                        // console.log('#item-' + that.props.parent.id)
                        var transform = getTransformation(d3.select('#item-' + that.props.parent.id).attr('transform'))
                        that.tempArrayStroke.push([d3.event.x - transform.translateX, d3.event.y - transform.translateY])
                        that.drawLine();
                    }
                }
                // console.log('Hello')
            })
            .on('pointerup', function(d){
                if (d3.event.pointerType == 'pen' || d3.event.pointerType == 'mouse'){

                    /**
                     * TO FADEOUT
                     */
                    var idItem = d3.select(this).attr('id').split('-');
                    if (idItem[1] == 'background' || idItem[1] == 'right' || idItem[1] == 'middle'){
                        d3.select('#placeHolder-' + 'left' + '-' + that.props.parent.id).style('opacity', 1)
                        d3.select('#placeHolder-' + 'right' + '-' + that.props.parent.id).style('opacity', 1)
                        d3.select('#placeHolder-' + 'middle' + '-' + that.props.parent.id).style('opacity', 1);
                        d3.select('#placeHolderText' + '-' + that.props.parent.id).style('opacity', 1);
                    }

                    console.log('ADD')
                    // var firstPoint = JSON.parse(JSON.stringify(that.tempArrayStroke[0]))
                    // var arrayPoints = JSON.parse(JSON.stringify(that.tempArrayStroke))
                    // arrayPoints.forEach((d)=>{
                    //     d[0] = d[0] - firstPoint[0];
                    //     d[1] = d[1] - firstPoint[1]
                    // })
                    // console.log(arrayPoints[0])

                    // that.tempArrayStroke = simplify( that.tempArrayStroke, 0)

                    var data = {
                        'idGuide':that.props.parent.id,
                        'where':that.props.data.id,
                        'data':[{
                            'id': guid(),
                            'data': that.tempArrayStroke,
                            'colorStroke': that.props.colorStroke,
                            'sizeStroke': that.props.sizeStroke
                            // 'position': [firstPoint[0],firstPoint[1]]
                        }]
                    }
                    that.props.addLine(data);
                    that.tempArrayStroke = [];
                    that.down = false;
                    that.removeTempLine();
                    
                }

                // console.log('Hello')
            })
        
    }
    removeTempLine(){
        var that = this;
        var line = d3.line()
        d3.select('#tempStroke-' + that.props.data.id + '-' + this.props.parent.id).attr("d", null)
    }
    drawLine(){
        var that = this;
        var line = d3.line()
        d3.select('#tempStroke-' + this.props.data.id  + '-' + this.props.parent.id)
            .attr("d", line(that.tempArrayStroke))
            .attr('fill', 'none')
            .attr('stroke', that.props.colorStroke)
            .attr('stroke-width', that.props.sizeStroke)
            .attr("stroke-dasharray", 'none');

        
    }
    componentDidUpdate(prevProps, prevState){
    }
    drawPlaceHolder(){

    
        var that = this;
        //Si j'udpate la BBox
        // if (this.props.BBoxParent != prevProps.BBoxParent){
            // console.log('UPDATE BOX', that.props.data.id);
        var height = 70;//this.props.BBoxParent.height;
        var size = 50;
        var width = 5//this.props.BBoxParent.width;
        var element = d3.select('#placeHolder-' + that.props.data.id + '-' + that.props.parent.id).select('rect');
        var rect = null;
        var opacity = 0.2;
        if (this.props.data.id == 'left'){
            rect = element
                .attr('width', 30)
                .attr('height', 30)
                .attr('x', -45)
                .attr('y',20)
                .attr('fill', 'rgba(166, 166, 166, 1)')
        }
        else if (this.props.data.id == 'right'){
            rect = element
                .attr('width', 50)
                .attr('height', 50)
                .attr('x', 15)
                .attr('y',10)
                .attr('fill', 'rgba(166, 166, 166, 1)')
        }
        else if (this.props.data.id == 'middle'){
            rect = element
                .attr('width', width*2)
                .attr('height', height)
                .attr('x', -width)
                .attr('y',0)
                .attr('fill', 'rgba(166, 166, 166, 1)')
        }



        // {'id':'topLeftCorner', 'data': {}, 'lines':[]}, 
        // {'id':'topRightCorner', 'data': {}, 'lines':[]}, 
        // {'id':'bottomLeftCorner', 'data': {}, 'lines':[]}, 
        // {'id':'bottomRightCorner', 'data': {}, 'lines':[]}, 


       else if (this.props.data.id == 'topLeftCorner'){
            rect = element
                .attr('width', 25)
                .attr('height', 25)
                .attr('x', -80)
                .attr('y',-25)
                .attr('fill', 'rgba(166, 166, 166, 0.2)')
        }
        else if (this.props.data.id == 'topRightCorner'){
            rect = element
                .attr('width', 25)
                .attr('height', 25)
                .attr('x',  85)
                .attr('y',-25)
                .attr('fill', 'rgba(166, 166, 166, 0.2)')
        }
        else if (this.props.data.id == 'bottomLeftCorner'){
            rect = element
                .attr('width', 25)
                .attr('height', 25)
                .attr('x', -80)
                .attr('y',height)
                .attr('fill', 'rgba(166, 166, 166, 0.2)')
        }
        else if (this.props.data.id == 'bottomRightCorner'){
            rect = element
                .attr('width', 25)
                .attr('height', 25)
                .attr('x', 85)
                .attr('y',height)
                .attr('fill', 'rgba(166, 166, 166, 0.2)')
        }


        else if (this.props.data.id == 'topbackground'){
            rect = element
                .attr('width',140 )
                .attr('height', 25)
                .attr('x',-55)
                .attr('y',-25)
                .attr('fill', 'rgba(166, 166, 166, 0.2)')
        }
        else if (this.props.data.id == 'bottombackground'){
            rect = element
            .attr('width', 140 )
                .attr('height', 25)
                .attr('x', -55)
                .attr('y', height)
                .attr('fill', 'rgba(166, 166, 166, 0.2)')
        }
        else if (this.props.data.id == 'leftbackground'){
            rect = element
                .attr('width', 25)
                .attr('height', height)
                .attr('x', -80)
                .attr('y',0)
                .attr('fill', 'rgba(166, 166, 166, 0.2)')
        }
        else if (this.props.data.id == 'rightbackground'){
            rect = element
                .attr('width', 25)
                .attr('height', height)
                .attr('x', 85)
                .attr('y',0)
                .attr('fill', 'rgba(166, 166, 166, 0.2)')
        }
        
        else if (this.props.data.id == 'background'){
            rect = element
                .attr('width', 140)
                .attr('height', height)
                .attr('x', -55)
                .attr('y',0)
                .attr('fill', 'rgba(94, 130, 237, 0.4)')
        }
        if (rect != null){
            rect.attr('stroke', 'grey')
            //     // .attr('fill', 'rgba(0,0,0,0)')
                // .attr('stroke-dasharray', 80)
            rect.attr('opacity', 0.0)
                // .attr('stroke-width', '4')

            if (this.props.data.id == 'bottomRightCorner') rect.attr('opacity', 0.4).attr('fill', 'rgba(0,0,0,0)').attr('stroke-dasharray', "3 19 6 19 6 19 6 19 6")//.attr('stroke-dashoffset', "16")
            if (this.props.data.id == 'bottomLeftCorner') rect.attr('opacity', 0.4).attr('fill', 'rgba(0,0,0,0)').attr('stroke-dasharray', "3 19 6 19 6 19 6 19 6")
            if (this.props.data.id == 'topRightCorner') rect.attr('opacity', 0.4).attr('fill', 'rgba(0,0,0,0)').attr('stroke-dasharray', "3 19 6 19 6 19 6 19 6")
            if (this.props.data.id == 'topLeftCorner') rect.attr('opacity', 0.4).attr('fill', 'rgba(0,0,0,0)').attr('stroke-dasharray', "3 19 6 19 6 19 6 19 6")
            
            if (this.props.data.id == 'left') rect.attr('opacity', 0.4).attr('fill', 'rgba(0,0,0,0)').attr('stroke-dasharray', "3 24 6 24 6 24 6 24 6")
            if (this.props.data.id == 'right') rect.attr('opacity', 0.4).attr('fill', 'rgba(0,0,0,0)').attr('stroke-dasharray', "3 44 6 44 6 44 6 44 6")
        }
        // }
    }
   
    render() {
        // console.log('placeHolder-' + this.props.data.id + '-' + this.props.parent.id)
        const listItems = this.props.lines.map((d, i) => {
            return <LinePlaceHolder 
                key={i} 
                stroke={d}

                colorStroke = {this.props.colorStroke}
                sizeStroke = {this.props.sizeStroke}
            />
        });


        return (
            <g id={'placeHolder-' + this.props.data.id + '-' + this.props.parent.id}>
                <rect id={'rect-' + this.props.data.id} />
                <path id={'tempStroke-'+this.props.data.id  + '-' + this.props.parent.id} />

                <g className='paths'>
                    {listItems}
                </g>

               
            </g>
        );
        
    }
}
export default PlaceHolder;