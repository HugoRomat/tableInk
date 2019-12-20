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
    getBBoxEachLine = (d) => {
        // console.log(d)
        // d.bb.forEach(element => {
        //     if (element.width > this.sizeBBox.width)  this.sizeBBox.width = element.width;
        //     if (element.height > this.sizeBBox.height)  this.sizeBBox.height = element.height;
        // });
        // // 

        // this.bufferLinesBBox++;
        // if (this.bufferLinesBBox == this.props.groupLines.length) {
        //     this.props.getBBoxEachLine( this.sizeBBox);
        //     this.bufferLinesBBox = 0;
        // }
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
                // tables = {JSON.parse(JSON.stringify(this.props.tables))}
                shouldUnselect={this.state.shouldUnselect}
                groupHolded={this.state.groupHolded}
                iteration={i}
                // showGrid={this.state.showGrid}
                isGuideHold={this.props.isGuideHold}

                setGroupTapped={this.setGroupTapped}
                tagHold={this.props.tagHold}
                holdGuide={this.holdGroup}
                addToSelection={this.addToSelection}
                // createTable={this.createTable}
                // addToTable={this.addTable}
                // computeTables={this.computeTables}
                // getBBoxEachLine={this.getBBoxEachLine}
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