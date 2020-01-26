import { guid, mergeRectangles, calculateBB, getTransformation, drawCircle, _getBBoxPromise } from "../Helper";
import * as d3 from 'd3';
// import flip from './../../../../static/turn2.jpg'
import flipSVG from './../../../../static/page-curl-basic.svg'
import parser from 'svg-path-parser'

export class postIt { 
    constructor(group) { 
        this.group = group;
        this.groupId = this.group.props.group.id
        this.init();
        
        this.offsetX = 80;
        this.allBoundingBox = null;
        this.BBOxPathMain = null;
        // console.log(flipSVG)
    } 
    update(){
        this.init();
    }
    initEvent(){
        var idGroup = this.group.props.group.id
        var that = this;
        var el = document.getElementById('postIt-'+idGroup);
        var mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':0, threshold: 1});

        mc.add(pan);
        
        mc.on("panstart", function(event) {
            if (event.pointers[0].pointerType == 'touch'){
                that.startPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y,  'time': Date.now()};
                that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}

                var getPan = getTransformation(d3.select('#panItems').attr('transform'));
                // if (this.props.group.lines.length > 0){
                    that.group.getAllBoundingBox(that.groupId).then((BB)=> {
                        // console.log('HEY', BB);
                        that.allBoundingBox = BB;

                        that.allBoundingBox.x += getPan.translateX - 20;
                        that.allBoundingBox.y += getPan.translateY - 20;
                        that.allBoundingBox.width += 40;
                        that.allBoundingBox.height += 40;
                    })
                _getBBoxPromise('item-' + that.groupId).then((d)=>{
                    that.BBOxPathMain = d;
                })
                // that.getAllIntersectsForGroup();
            }  
            if (event.pointers[0].pointerType == 'pen' ){
                element.dispatchEvent(event);
            }
        })
        mc.on("panmove", function(ev) {
           
                
            /** Si c'est pen sur stroke */
            if (ev.pointers[0].pointerType == 'pen' ){

            }
            if (ev.pointers[0].pointerType == 'touch' ){
                // that.group.findIntersectionRecursive(that.allBoundingBox, ev);
                that.dragged(ev);
            }
        })
        mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){
            }
        })

        /****** FOR SMALL RECTANGLE  *****/


        var el =  d3.select('#postItImage-' + that.group.props.group.id).select('.path2').node();

        console.log(el)
        var el = document.getElementById('postIt-'+idGroup);
        var mc = new Hammer.Manager(el);
        var pan = new Hammer.Pan({'pointers':0, threshold: 1});

        mc.add(pan);
        
        mc.on("panstart", function(event) {
            if (event.pointers[0].pointerType == 'touch'){
                
            }  
            if (event.pointers[0].pointerType == 'pen' ){
               
            }
        })
        mc.on("panmove", function(ev) {
            if (ev.pointers[0].pointerType == 'pen' ){

            }
            if (ev.pointers[0].pointerType == 'touch' ){
                console.log('HELLO')
            }
        })
        mc.on("panend", function(ev) {
            if (ev.pointers[0].pointerType == 'touch' ){

            }
        })
    }
    dragged(event) {  
        var idGroup = this.groupId
        var that = this;       
        var transform = getTransformation(d3.select('#group-'+idGroup).attr('transform'));
        // console.log(event)
        var offsetX = event.srcEvent.x - that.lastPosition.x;
        var offsetY = event.srcEvent.y - that.lastPosition.y;
        var X = offsetX + transform.translateX;
        var Y = offsetY + transform.translateY;
        d3.select('#group-'+idGroup).attr('transform', 'translate('+X+','+Y+')')

        var linesAttached = that.group.props.group['lines'];

        // console.log(linesAttached)
        linesAttached.forEach((groupLine)=>{
            groupLine.forEach((lineId)=>{
                var id = 'item-'+lineId;

                
                var transform = getTransformation(d3.select('#'+id).attr('transform'));
                var X = offsetX + transform.translateX;
                var Y = offsetY + transform.translateY;
                d3.select('#'+id).attr('transform', 'translate('+X+','+Y+')')
            })
        })

        that.lastPosition = {'x': event.srcEvent.x, 'y':event.srcEvent.y}

    }
    init() { 
        var that = this;
        this.group.getAllBoundingBox(this.group.props.group.id).then((BB)=> {
            // d3.select('#rectAllBB-' + that.group.props.group.id)
            //         .attr('width', BB.width + that.offsetX)
            //         .attr('height', BB.height)
            //         .attr('x', BB.x)
            //         .attr('y', BB.y)
            //         .attr('fill', 'rgba(0,0,255,0.1)')

            // d3.select('#postIt-' + that.group.props.group.id).select('image')
            //     .attr('x', BB.x +  BB.width +80 - 100)
            //     .attr('y', BB.y +  BB.height - 100)
            //     .attr('width', 100)
            //     .attr('height', 100)
            //     .attr("xlink:href", flip)
                

            // this.colors.forEach((d)=>{
            BB.y -= 50;
            BB.x -= 90;
            BB.width += 150;
            BB.height += 100;

            this.createFlipPage(BB);
            // this.initEvent();
            // newNode.select('.rectangle').attr('width', BB.width + 80)
            // .attr('height', BB.height)
            // .attr('x', BB.x)
            // .attr('y', BB.y)
            // })

        })
    }
    createFlipPage(BB){
        var that = this;
        var td = this.htmlToElement(flipSVG);

        // console.log(BB)
        
        /** FOR THE FIRST PATH */
        var path1 = 'M3,6.467266L3,981.758179L695.960938,981.758179L695.960938,641.902222C695.960938,583.916321,668.720765,533.932312,626.664795,471.0292360000001C595.968018,426.9080810000001,512.920593,374.6421210000001,203.35609400000004,306.1323240000001C252.67269900000005,175.6595460000001,290.78421000000003,80.1866610000001,268.94403000000005,30.91789200000011C264.68603400000006,21.312362000000107,255.20831200000006,6.467266000000109,239.41647300000005,6.467266000000109L3.000000000000057,6.467266000000109Z';

        var dataPath1 = parser(path1)
        dataPath1.splice(5, 1);
        dataPath1.splice(6, 1);

        dataPath1[0] = {...dataPath1[0], 'x': BB.x, 'y': BB.y}
        dataPath1[1] = {...dataPath1[1], 'x': BB.x, 'y': BB.y + BB.height}
        dataPath1[2] = {...dataPath1[2], 'x': BB.x + BB.width + 80, 'y': BB.y + BB.height}
        dataPath1[3] = {...dataPath1[3], 'x': BB.x + BB.width + 80, 'y': BB.y + 100}

        // data[4] = {...data[4], 'x': BB.x + BB.width - 50, 'y': BB.y + 300}
        dataPath1[4] = {...dataPath1[4], 
            'x': BB.x + BB.width - 90 + 80, 'y': BB.y + 70,
            'x1': BB.x + BB.width - 25 + 80, 'y1': BB.y + 70,
            'x2': BB.x + BB.width - 90 + 80, 'y2': BB.y + 75,
        }
        
        dataPath1[5] = {...dataPath1[4], 
            'x': BB.x + BB.width - 90 + 80, 'y': BB.y,
            'x1': BB.x + BB.width - 80 + 80, 'y1': BB.y + 50,
            'x2': BB.x + BB.width - 80 + 80, 'y2': BB.y
        }
        dataPath1[6] = {...dataPath1[6], 'x': BB.x, 'y': BB.y}


        var path = dataPath1.map((d)=> {
            // console.log(d.code)
            if (d.code == 'Z') return d.code 
            if (d.code == 'C') return d.code + d.x1 + ',' + d.y1 + ' ' + d.x2 + ',' + d.y2 + ' ' + d.x + ',' + d.y;
            else return d.code + d.x + ',' + d.y;
        })

        path = path.join('')

        
        var newNode = d3.select('#postItImage-' + that.group.props.group.id)
        var pathTache = newNode.node().append(td.childNodes[0])
        d3.select('#postItImage-' + that.group.props.group.id).select('.path1')
            .attr('id', 'path1-'+ that.group.props.group.id)
            .attr('d',path )
            .attr('fill', 'white')



        /** FOR THE SECOND PATH */
        var path2 = 'M268.931488,30.863834L626.6552730000001,470.995269C595.958557,426.874114,512.944458,374.689849,203.37998900000008,306.18008299999997C252.6965940000001,175.70728899999997,290.6645810000001,80.18060899999998,268.93148700000006,30.863832999999943Z';
        
        var data = parser(path2)

        console.log(data)
        data.splice(3, 0, data.splice(1, 1)[0]);

        

        data[0] = {...data[0], 'x': BB.x + BB.width + 80, 'y': BB.y + 100}
        data[1] = {...data[1], 
            'x': BB.x + BB.width - 90 + 80, 'y': BB.y + 70,
            'x1': BB.x + BB.width - 25 + 80, 'y1': BB.y + 70,
            'x2': BB.x + BB.width - 90 + 80, 'y2': BB.y + 75,
        }
        data[2] = {...data[2], 
            'x': BB.x + BB.width - 90 + 80, 'y': BB.y,
            'x1': BB.x + BB.width - 80 + 80, 'y1': BB.y + 50,
            'x2': BB.x + BB.width - 80 + 80, 'y2': BB.y
        }
        data[3] = {...data[3], 'x': BB.x + BB.width + 80, 'y': BB.y + 100}
     
        var path = data.map((d)=> {
            // console.log(d.code)
            if (d.code == 'Z') return d.code 
            if (d.code == 'C') return d.code + d.x1 + ',' + d.y1 + ' ' + d.x2 + ',' + d.y2 + ' ' + d.x + ',' + d.y;
            else return d.code + d.x + ',' + d.y;
        })

        path = path.join('')
        d3.select('#postItImage-' + that.group.props.group.id).select('.path2')
            .attr('d',path)
            
        // console.log(d3.select('#postItImage-' + that.group.props.group.id).select('.path2').node())
        d3.select('#postItImage-' + that.group.props.group.id).select('.rectangle')
            .attr('x',BB.x )
            .attr('y',BB.y )
            .attr('width',BB.width + that.offsetX)
            .attr('height',BB.height )

        // d3.select('#postItImage-' + that.group.props.group.id).select('.path2')

    //    this.transition(data, dataPath1, BB)

        this.data =data;
        this.dataPath1 = dataPath1;
        this.BB = BB;

    }
    reverseTransition(){
        var data = this.data;
        var dataPath1 = this.dataPath1
        var BB = this.BB;


        var that = this;
        var newData = JSON.parse(JSON.stringify(data));
        data[0] = {...data[0], 'x': BB.x + BB.width + 80, 'y': BB.y + 100}
        data[1] = {...data[1], 
            'x': BB.x + BB.width - 90 + 80, 'y': BB.y + 70,
            'x1': BB.x + BB.width - 25 + 80, 'y1': BB.y + 70,
            'x2': BB.x + BB.width - 90 + 80, 'y2': BB.y + 75,
        }
        data[2] = {...data[2], 
            'x': BB.x + BB.width - 90 + 80, 'y': BB.y,
            'x1': BB.x + BB.width - 80 + 80, 'y1': BB.y + 50,
            'x2': BB.x + BB.width - 80 + 80, 'y2': BB.y
        }
        data[3] = {...data[3], 'x': BB.x + BB.width + 80, 'y': BB.y + 100}
     
        var path = data.map((d)=> {
            // console.log(d.code)
            if (d.code == 'Z') return d.code 
            if (d.code == 'C') return d.code + d.x1 + ',' + d.y1 + ' ' + d.x2 + ',' + d.y2 + ' ' + d.x + ',' + d.y;
            else return d.code + d.x + ',' + d.y;
        })

        path = path.join('')

        d3.select('#postIt-' + that.group.props.group.id).select('.path2').transition().ease(d3.easeCubic).duration(1000).delay(0).attr('d',path )





        dataPath1[0] = {...dataPath1[0], 'x': BB.x, 'y': BB.y}
        dataPath1[1] = {...dataPath1[1], 'x': BB.x, 'y': BB.y + BB.height}
        dataPath1[2] = {...dataPath1[2], 'x': BB.x + BB.width + 80, 'y': BB.y + BB.height}
        dataPath1[3] = {...dataPath1[3], 'x': BB.x + BB.width + 80, 'y': BB.y + 100}

        // data[4] = {...data[4], 'x': BB.x + BB.width - 50, 'y': BB.y + 300}
        dataPath1[4] = {...dataPath1[4], 
            'x': BB.x + BB.width - 90 + 80, 'y': BB.y + 70,
            'x1': BB.x + BB.width - 25 + 80, 'y1': BB.y + 70,
            'x2': BB.x + BB.width - 90 + 80, 'y2': BB.y + 75,
        }
        
        dataPath1[5] = {...dataPath1[4], 
            'x': BB.x + BB.width - 90 + 80, 'y': BB.y,
            'x1': BB.x + BB.width - 80 + 80, 'y1': BB.y + 50,
            'x2': BB.x + BB.width - 80 + 80, 'y2': BB.y
        }
        dataPath1[6] = {...dataPath1[6], 'x': BB.x, 'y': BB.y}


        var path = dataPath1.map((d)=> {
            // console.log(d.code)
            if (d.code == 'Z') return d.code 
            if (d.code == 'C') return d.code + d.x1 + ',' + d.y1 + ' ' + d.x2 + ',' + d.y2 + ' ' + d.x + ',' + d.y;
            else return d.code + d.x + ',' + d.y;
        })


        path = path.join('')
        d3.select('#postIt-' + that.group.props.group.id).select('.path1').transition().ease(d3.easeCubic).duration(1000).delay(0).attr('d',path )

    }
    transition(){

        var data = this.data;
        var dataPath1 = this.dataPath1
        var BB = this.BB;


        var that = this;
        var newData = JSON.parse(JSON.stringify(data));
        newData[0] = {...newData[0], 'x': BB.x + BB.width + 80, 'y': BB.y + 300}
        newData[1] = {...newData[1], 
            'x': BB.x + BB.width - 250 + 80, 'y': BB.y + 200,
            'x1': BB.x + BB.width - 25 + 80, 'y1': BB.y + 280,
            'x2': BB.x + BB.width - 90 + 80, 'y2': BB.y + 250,
        }
        newData[2] = {...newData[2], 
            'x': BB.x + BB.width - 300 + 80, 'y': BB.y,
            'x1': BB.x + BB.width - 260 + 80, 'y1': BB.y + 50,
            'x2': BB.x + BB.width - 300 + 80, 'y2': BB.y
        }
        newData[3] = {...newData[3], 'x': BB.x + BB.width + 80, 'y': BB.y + 300}
        var path = newData.map((d)=> {
            // console.log(d.code)
            if (d.code == 'Z') return d.code 
            if (d.code == 'C') return d.code + d.x1 + ',' + d.y1 + ' ' + d.x2 + ',' + d.y2 + ' ' + d.x + ',' + d.y;
            else return d.code + d.x + ',' + d.y;
        })

        path = path.join('')

        d3.select('#postIt-' + that.group.props.group.id).select('.path2').transition().ease(d3.easeCubic).duration(1000).delay(0).attr('d',path )





        dataPath1[0] = {...dataPath1[0], 'x': BB.x, 'y': BB.y}
        dataPath1[1] = {...dataPath1[1], 'x': BB.x, 'y': BB.y + BB.height}
        dataPath1[2] = {...dataPath1[2], 'x': BB.x + BB.width + 80, 'y': BB.y + BB.height}
        dataPath1[3] = {...dataPath1[3], 'x': BB.x + BB.width + 80, 'y': BB.y + 300}

        // data[4] = {...data[4], 'x': BB.x + BB.width - 50, 'y': BB.y + 300}
        dataPath1[4] = {...dataPath1[4], 
            'x': BB.x + BB.width - 250 + 80, 'y': BB.y + 200,
            'x1': BB.x + BB.width - 25 + 80, 'y1': BB.y + 280,
            'x2': BB.x + BB.width - 90 + 80, 'y2': BB.y + 250,
        }
        dataPath1[5] = {...dataPath1[5], 
            'x': BB.x + BB.width - 300 + 80, 'y': BB.y,
            'x1': BB.x + BB.width - 260 + 80, 'y1': BB.y + 50,
            'x2': BB.x + BB.width - 300 + 80, 'y2': BB.y
        }
        dataPath1[6] = {...dataPath1[6], 'x': BB.x, 'y': BB.y}


        var path = dataPath1.map((d)=> {
            // console.log(d.code)
            if (d.code == 'Z') return d.code 
            if (d.code == 'C') return d.code + d.x1 + ',' + d.y1 + ' ' + d.x2 + ',' + d.y2 + ' ' + d.x + ',' + d.y;
            else return d.code + d.x + ',' + d.y;
        })

        path = path.join('')
        d3.select('#postIt-' + that.group.props.group.id).select('.path1').transition().ease(d3.easeCubic).duration(1000).delay(0).attr('d',path )


    }
    
    htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }
    pathToPoints(d){
           
                var pointsArray = d.slice(1, d.length).split(',');
                var pairsArray = [];
                for(var i = 0; i < pointsArray.length; i += 2){
                    pairsArray.push([+pointsArray[i], +pointsArray[i+1]]);
                }
                return pairsArray;
      
    }
    
 } 


