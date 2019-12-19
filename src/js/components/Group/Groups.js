import React, { Component } from "react";
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Group from './Group';

import { 
    moveSketchLines,
    createTables,
    addToTable,
    updateGroupPosition
  } from '../../actions';
import { guid, _getBBoxPan, showBboxBB, _getBBoxPromise } from "../Helper";

const mapDispatchToProps = { 
    moveSketchLines,
    createTables,
    addToTable,
    updateGroupPosition
};
const mapStateToProps = (state, ownProps) => {  
    // console.log(state)
    return { 
        groupLines: state.rootReducer.present.groupLines,
        tables: state.rootReducer.present.tables,
        sketchLines: state.rootReducer.present.sketchLines,
        grid: state.rootReducer.present.grid
    };
  };


class Groups extends Component {
    constructor(props) {
        super(props);
        this.state = {
            'shouldUnselect': guid(),
            'groupHolded': false,
            'showGrid': false//[200, 75]
        }
        this.selection = [];
        this.bufferLinesBBox = 0;
        this.sizeBBox = {'width':0, 'height': 0};
        
    }
    componentDidMount(){
        // console.log(this.props.tables)
        // this.setState({'showGrid': this.props.grid})
        // for (var i in this.props.tables){
        //     var myTable = this.props.tables[i];
        //     console.log(myTable['id'])
        //     var bb = _getBBoxPan('group-'+myTable['id']);
        //     console.log(bb)
        // }
    } 
    componentDidUpdate(prevProps, prevState){
        if (this.props.tables != prevProps.tables){
            // console.log('GO')
            this.computeTables();
        }
        if (this.props.grid != prevProps.grid){
            if (this.props.grid != false){
                this.setState({'showGrid': this.props.grid})
                console.log('ShowGrid',this.props.grid)
            } else {
                console.log('GO')
                this.setState({'showGrid': false})
            }
            
            // this.computeTables();
        }
    }
    orderTables = async () => {
        var indexElement = {};
        for (var i in this.props.tables){

            var myTableElement = this.props.tables[i]['data']; 
            //GET ALL BBOX
            for (var j in myTableElement){
                var element = myTableElement[j];
                var bb = await _getBBoxPromise('group-'+element['id']);
                indexElement[element['id']] = {'bb':bb, 'offsetX': 0, 'offsetY': 0, 'offsetXTable':0, 'offsetYTable': 0}
                // showBboxBB(bb, 'red');
            }
            for (var j in myTableElement){
                var element = myTableElement[j];

                var offsetX = 0;
                for (var k in element['children']){
                    
                    var child = element['children'][k];
                    
                    // console.log(child)
                    if (child['direction'] == 'left') {
                        var position = indexElement[child['id']]['bb'];
                        var positionParent = indexElement[element['id']]['bb'];
                        var offsetX = position['x'] - (positionParent['x'] - positionParent['width']) + indexElement[element['id']]['offsetXTable'];
                        var offsetY = position['y'] - (positionParent['y']) //- indexElement[element['id']]['offsetYTable']

                        // console.log(indexElement[element['id']]['offsetXTable'])
                        indexElement[element['id']]['offsetXTable'] += position['width'];
                        // indexElement[element['id']]['offsetYTable'] -= - offsetY;

                        indexElement[child['id']]['offsetX'] = - offsetX;
                        indexElement[child['id']]['offsetY'] = - offsetY;
                    }

                    // console.log(indexElement)
                }
            }
        }
        return indexElement;
    }
    computeTables = (d) => {
        if (this.props.tables.length > 0){
            var length = this.props.tables[this.props.tables.length - 1]['data'];
            var lastId = length[length.length - 1]['id'];
            // console.log(lastId)
            if (d == undefined || lastId == d.id){
                console.log('UPDATE TABLES', this.props.tables)
                this.orderTables().then((d)=>{
                    // console.log(d)
                    for (var i in d){
                        var group = this.props.groupLines.find(x => x.id == i);
                        var position = JSON.parse(JSON.stringify(group.position));
                        position[0] += d[i]['offsetX'];
                        position[1] += d[i]['offsetY'];
    
                        this.props.updateGroupPosition({'id':i, 'position': position})
    
                        var changePositionArraySketchLines = [];
                        for (var j in group['lines']){
                            for (var k in group['lines'][j]){
                                var idLine = group['lines'][j][k]
                                var stroke = JSON.parse(JSON.stringify(this.props.sketchLines.find(x => x.id == idLine)));
                                changePositionArraySketchLines.push({'id': stroke.id,'position': [stroke.position[0]+d[i]['offsetX'], stroke.position[1] + d[i]['offsetY']]})
                            }
                        }
                        this.props.moveSketchLines(changePositionArraySketchLines);
                    }
                })
            }
        }
        
    }
    getBBoxEachLine = (d) => {
        // console.log(d)
        d.bb.forEach(element => {
            if (element.width > this.sizeBBox.width)  this.sizeBBox.width = element.width;
            if (element.height > this.sizeBBox.height)  this.sizeBBox.height = element.height;
        });
        // 

        this.bufferLinesBBox++;
        if (this.bufferLinesBBox == this.props.groupLines.length) {
            this.props.getBBoxEachLine( this.sizeBBox);
            this.bufferLinesBBox = 0;
        }
        // console.log(this.sizeBBox)
    }
    addToSelection = (d) => {
        var that = this;
        this.selection.push(d.id);
        
        that.props.setSelection({'elements':this.selection})
        clearTimeout(that.timeSelection);
        that.timeSelection = setTimeout(function(){
            that.selection = [];
            that.setState({'shouldUnselect': guid()});

            that.props.setSelection({'elements':[]})

            // console.log('GO')
        }, 2000)
    }
    holdGroup = (d) => {
        this.setState({'groupHolded': d})
    }
    createTable = (d) => {
        // console.log('ADD')
        this.props.createTables(d);
    }
    addTable = (d) => {
        this.props.addToTable(d);
    }
    setGroupTapped = (d) => {
        this.props.setGroupTapped(d)
    }
    render() {

        // console.log(this.state.showGrid)
        // if (this.props.group.tables != 0){
            // var bb = _getBBoxPan('group-'+this.props.groupLines[0].tables[0]);
            // console.log(bb)
        // }
        // console.log(this.props.groupLines)
        const listItems = this.props.groupLines.map((d, i) => {
            // console.log(i)
            return <Group 
                key={i} 
                group={d}
                allGroups={JSON.parse(JSON.stringify(this.props.groupLines))}
                tables = {JSON.parse(JSON.stringify(this.props.tables))}
                shouldUnselect={this.state.shouldUnselect}
                groupHolded={this.state.groupHolded}
                iteration={i}
                showGrid={this.state.showGrid}
                isGuideHold={this.props.isGuideHold}

                setGroupTapped={this.setGroupTapped}
                tagHold={this.props.tagHold}
                holdGuide={this.holdGroup}
                addToSelection={this.addToSelection}
                createTable={this.createTable}
                addToTable={this.addTable}
                computeTables={this.computeTables}
                getBBoxEachLine={this.getBBoxEachLine}
            />
        });
        // console.log(this.props.groupLines)
        // const groupItems = this.props.groupLines.map((d, i) => {
        //     // console.log(d)
        //     return <g className="group" id={d.id} key={i} transform={`translate(${d.position[0]},${d.position[1]})`} > 
        //         {d.data.map((e, j) => { return <g key={j} transform={`translate(${e.position[0]},${e.position[1]})`}>
        //             <Line key={j} stroke={e}/>
        //             </g> })}
        //     </g>
        // });

        // console.log(groupItems)
        
        return (

            <g className="groups">
                {listItems}
            </g>
            

        );
        
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Groups);