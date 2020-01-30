import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Tag from './Tag';

import { 
  } from '../../actions';
import { _getBBoxPromise, showBboxBB } from "../Helper";
import { boxBox } from "intersects";

const mapDispatchToProps = { 
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        tags: state.rootReducer.present.tags,
        groupLines: state.rootReducer.present.groupLines
    };
  };


class Tags extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    }  
    setGuideTapped = (d) => {
        this.props.setGuideTapped(d)
    }
    highlightAllSameTag = async(d) => {
        var idUniqTag = d.tag.idUniqTag;
        var sameTagUniqId = [];
        /** Look for the same tag */
        for (var i= 0; i < this.props.tags.length; i++){
            var tag = this.props.tags[i];
            if (tag.idUniqTag == idUniqTag && tag.id != d.tag.id) sameTagUniqId.push({'tag':tag});
        }
        for (var i= 0; i < sameTagUniqId.length; i++){
            var BB = await _getBBoxPromise('item-' + sameTagUniqId[i]['tag']['id'])
            BB.x -= 40;
            BB.y -= 40;
            BB.width += 80;
            BB.height += 80;
            // showBboxBB(BB, 'red')
            sameTagUniqId[i]['BB'] = BB;
        }

        this.findIntersectionRecursive(sameTagUniqId);
    }
    findIntersectionRecursive = async(BBinitial) => {
        var BBidID = []
        d3.select('.standAloneLines').selectAll('.parentLine').each(function(){
            // var idSImple = d3.select(this).attr('id').split('-')[1]
            BBidID.push(d3.select(this).attr('id'))
        })
        d3.selectAll('.groupPath').each(function(){
            var idSImple = d3.select(this).attr('id').split('-')[1]
            BBidID.push('group-'+idSImple)
        })
        var BBid = []
        for (var i =0; i < BBidID.length; i ++){
            var BB = await _getBBoxPromise(BBidID[i]);
            BBid.push({'id': BBidID[i], 'BB': BB});
        }


        var itemInside = []
        for (var i= 0; i < BBinitial.length; i++){
           
            this.findIntersects(BBid, BBinitial[i], itemInside);
            // console.log('GO', item)
            // itemInside.push(item)
        }
        this.fadeInItems(itemInside)
    }
    findIntersects = async(BBid, BBinitial, itemInside) => {
        // console.log('GO')
        // var itemInside = []
        
        var BBTemp = JSON.parse(JSON.stringify(BBinitial['BB']));

        // console.log(BBid)
        

        BBTemp.x -= 40;
        BBTemp.y -= 40;
        BBTemp.width += 80;
        BBTemp.height += 80;
        // showBboxBB(BBTemp, 'red');
        for (var i in BBid){
            var id = BBid[i]['id'];

            if (itemInside.indexOf(id) ==-1){
                var BB = JSON.parse(JSON.stringify(BBid[i]['BB']))
                // var idSImple = id.split('-')[1];
                var type = id.split('-')[0]
                BB.x -= 40;
                BB.y -= 40;
                BB.width += 80;
                BB.height += 80;
                // showBboxBB(BBTemp, 'red');
                // showBboxBB(BB, 'blue');
                var intersected = boxBox(BB.x, BB.y, BB.width, BB.height, BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
                if (intersected) {
                    if (type == 'item'){
                        itemInside.push(id)
                        var index = BBid.indexOf(BBid.find(x => x.id == id));
                        var newBB = JSON.parse(JSON.stringify(BBid))
                        newBB.splice(index,1)
                        this.findIntersects(newBB, BBid[i], itemInside);
    
                    } else if (type == 'group'){
                        itemInside.push(id)
                    }
                }
            }
            
        }
        // return itemInside;
    }
    fadeInItems(items){

        
        d3.select('.groups').selectAll('.groupLine').style('opacity', 0.1)
        d3.select('.standAloneLines').selectAll('.realStroke').style('opacity', 0.1)
        for (var i= 0; i < items.length; i++){
            var item = items[i];
            var type = item.split('-')[0];
            var onlyId = item.split('-')[1];
            if (type == 'item') d3.select('#'+ item).select('.realStroke').style('opacity', 1)
            if (type == 'group') {
                d3.select('#'+ item).style('opacity', 1)
                var group = this.props.groupLines.find((d)=> d.id == onlyId)
                var lines = [].concat(...group.lines)
                for (var j in  lines){
                    d3.select('#'+ lines[j]).style('opacity', 1)
                }
            }
        }
    }
    render() {
        // console.log(this.props.tags)
        const listItems = this.props.tags.map((d, i) => {
                return <Tag 
                    key={i} 
                    stroke={d}
                    // allTags={this.props.tags}
                    highlightAllSameTag={this.highlightAllSameTag}

                    holdTag={this.props.holdTag}
                    // dragItem={this.props.dragItem}
                    // setGuideTapped={this.setGuideTapped}

                    colorStroke = {this.props.colorStroke}
                    sizeStroke = {this.props.sizeStroke}
            />
        });
        
        return (
      
                <g id="tags">{listItems}</g>
         
        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Tags);