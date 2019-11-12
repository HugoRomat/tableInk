import React, { Component } from "react";
import * as d3 from 'd3';

import Line from './Line';

import backgroundImg from './../../../../static/realFinder.svg';



class Lines extends Component {
    constructor(props) {
        super(props);
        this.selection = null;
    }

    addFolder(){
        var that = this;
        var indexUsed = []
        this.folderArray = [];
        this.props.scope.project.importSVG(backgroundImg, {'expandShapes': true, 'onLoad':function(d){

            // d.position.x += 100;
            // d.position.y += 100;
            d.clipped = false;
            d.strokeJoin = 'miter';
            var texte = d.getItems({'class': 'PointText'});
            for (var i in texte){
                texte[i]['style']['fontFamily'] = 'Segoe UI';
            }

            var container = d.children['Container']['children']
            for (var f in container){

                if (indexUsed.indexOf(container[f]['id']) == -1){
                    var name = container[f]['name'].split('_')[0];
                    if (name == 'Folder') that.folderArray.push(container[f])

                }
                indexUsed.push(container[f]['id'])

            }

            d.sendToBack();
        }})

    }
    componentDidMount(){
        this.addFolder();
    }

    setSelection= (d) => {
        
        var that = this;
        this.props.setSelection(d);
        
        // console.log('SELECTION ', d)
    }
   
    render() {
        // console.log(this.props.scope)
        // console.log('HELLO')
        const listItems = this.props.lines.map((d, i) => {
                return <Line 
                    key={i} 
                    stroke={d} 
                    scope={this.props.scope}
                    folders={this.folderArray}
                    setSelection={this.setSelection}
                   
            />
        });
        
        return (
            <React.Fragment>
                {listItems}
            </React.Fragment>
        );
        
    }
}
export default Lines;