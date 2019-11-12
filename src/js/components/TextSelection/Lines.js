import React, { Component } from "react";
import * as d3 from 'd3';

import Line from './Line';
class Lines extends Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount(){
   
    }
    text(){

        var textContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eu fermentum dui. Cras 
venenatis felis id odio posuere, nec  mollis justo mattis. Donec auctor sed nunc mollis 
vulputate. Aenean vitae facilisis ipsum. Donec non hendrerit sem. Quisque pharetra  quam 
pulvinar egestas scelerisque. Nunc venenatis, odio tincidunt sollicitudin semper, nunc dui 
imperdiet nisl, nec pharetra augue sem id velit. Nam suscipit magna id felis lobortis feugiat. 
Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. 
Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Orci 
varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. 

Aenean posuere venenatis arcu, ut facilisis lectus. Integer vestibulum tincidunt 
condimentum. Cras dictum tincidunt magna sed tempus. Duis semper urna mi, nec vestibulum 
lacus imperdiet nec. Integer egestas imperdiet pellentesque. Integer ullamcorper, justo 
et sodales sodales, metus lorem fringilla nisi, sit amet consectetur metus eros eu velit. Donec 
a ex pulvinar neque rhoncus laoreet quis sit amet tortor. 

Aenean posuere venenatis arcu, ut facilisis lectus. Integer vestibulum tincidunt 
condimentum. Cras dictum tincidunt magna sed tempus. Duis semper urna mi, nec vestibulum 
lacus imperdiet nec. Integer egestas imperdiet pellentesque. Integer ullamcorper, justo 
et sodales sodales, metus lorem fringilla nisi, sit amet consectetur metus eros eu velit. 
Donec a ex pulvinar neque rhoncus laoreet quis sit amet tortor. 

Aenean posuere venenatis arcu, ut facilisis lectus. Integer vestibulum tincidunt 
condimentum. Cras dictum tincidunt magna sed tempus. Duis semper urna mi, nec vestibulum 
lacus imperdiet nec. Integer egestas imperdiet pellentesque. Integer ullamcorper, justo 
et sodales sodales, metus lorem fringilla nisi, sit amet consectetur metus eros eu velit. 
Donec a ex pulvinar neque rhoncus laoreet quis sit amet tortor.`

textContent = textContent.replace(/\n/ig, '/');
        var content = textContent.split(' ')
        var arrayText = [];
        // console.log(content)
        var line = 20;
        var k = 0;
        for (var i = 0; i < content.length; i++){
            
            if (content[i][0] == "/") {
                line += 23.5;
                content[i] = content[i].substr(1);
                if (content[i][0] == "/") content[i] = content[i].substr(1);
                k = 0;
                // console.log('GO', line)
            }
            // console.log(content[i][0])
            var text = new this.props.scope.PointText({
                point: [k + 50, line+50],
                content: content[i] + ' ',
                fillColor: 'black',
                fontFamily: 'Arial',
                fontWeight: 'normal',
                fontSize: 16,
                data: {'name': 'texte'}
            });
            var rectangle = new this.props.scope.Path.Rectangle(text.bounds)
            rectangle.strokeColor = '#c6c6c6';
            rectangle.fillColor = '#c6c6c6';
            rectangle.opacity = 0;
            rectangle.strokeWidth = 2;
            rectangle.sendToBack();

            text.data.bounds = rectangle;

            k+= text.bounds.width + 2;

            arrayText.push(text)
        }
        
        this.props.setTextBounds(arrayText)
        
        // var rectangle = new this.props.scope.Path.Rectangle(text.bounds)
        // rectangle.strokeColor = 'red';
        // rectangle.strokeWidth = 2;
        // console.log(rectangle)
    }
    
    componentDidMount(){
        this.text();
    }
   
    render() {
        // console.log(this.props.scope)
        // console.log('HELLO')
        const listItems = this.props.lines.map((d, i) => {
                return <Line 
                    key={i} 
                    stroke={d} 
                    scope={this.props.scope}
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