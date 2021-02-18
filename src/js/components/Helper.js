import * as d3 from 'd3';
import { ENETUNREACH } from 'constants';
import paper from 'paper';
import CalcOmbb from './../../../customModules/ombb';
import CalcConvexHull from './../../../customModules/convexhull';
import Vector from './../../../customModules/vector';

import {polygonPolygon, boxCircle, boxBox} from 'intersects';
import Polygon from 'polygon'


paper.setup([640, 480]);
// console.log(Polygon)
export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return 'b' + s4() + s4() + s4() +  s4() +s4() +  s4() + s4() + s4();
}

export function simplify(arrayPoints, tolerance){
    var pathPaper = new paper.Path(arrayPoints);
    pathPaper.simplify(tolerance);
    pathPaper = pathPaper.segments.map((d)=>{ return [d.point.x, d.point.y]})
    return pathPaper;
}
export function distance(x1, x2, y1, y2){
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt( a*a + b*b );
    return c;
}

export async function getBoundinxBoxLines(lines, prefix){
    // var BB = await _getBBoxPromise('item-'+strokeId);
    // return new Promise((resolve, reject) => {
        // console.log(lines)
    if (prefix == undefined) prefix ='item-'
    var BBox = [];
    // d3.selectAll('.BB').remove()

    var rectangle = null;
    var that = this;
        

    for (let index = 0; index < lines.length; index++) {
        // console.log(line[index])
        var strokeId = lines[index];
        var BB = await _getBBoxPromise(prefix+strokeId);
        // console.log(strokeId, BB)
        // console.log(JSON.stringify(BB))

        if (rectangle == null) rectangle = BB;
        else rectangle = unionRectangles(rectangle, BB);
        // showBboxBB(BB, 'red');
    }
       
    var transformPan = {'translateX': 0, 'translateY': 0}
    var transformDrag = {'translateX': 0, 'translateY': 0}
    var item = d3.select('#panItems').node()
    if (item != null){
        transformPan = getTransformation(d3.select('#panItems').attr('transform'));
    } 
  
    // GET apres le drag en compte sur les BBox
    // console.log(transform)
    rectangle.x = rectangle.x - transformPan.translateX - transformDrag.translateX;
    rectangle.y = rectangle.y - transformPan.translateY - transformDrag.translateY;
        
        
    return rectangle;

}
// function sqr (x) {
//     return x * x;
//   }
  
//   function dist2 (v, w) {
//     return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
//   }
  
//   // p - point
//   // v - start point of segment
//   // w - end point of segment
//   function distToSegmentSquared (p, v, w) {
//     var l2 = dist2(v, w);
//     if (l2 === 0) return dist2(p, v);
//     var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
//     t = Math.max(0, Math.min(1, t));
//     return dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]);
//   }
  
//   // p - point
//   // v - start point of segment
//   // w - end point of segment
//   export function distToSegment (p, v, w) {
//     return Math.sqrt(distToSegmentSquared(p, v, w));
//   }
// export function getNearestElement(id){
//     var arrayIn = [];
//     var arrayOut = [];
    
//     // 
//     // var allGuides = [];
//     // d3.select('#guides').selectAll('g').each(function(d){
//     //     var id2 = d3.select(this).attr('id');
//     //     allGuides.push(id2);
//     // })
//     var neighboors = [];
//     recursive(neighboors, 'item-'+id);
//     return arrayIn
// }

// export function getNearestElement(id){

//     var neighborood = ['item-'+id];
//     var itemToAvoid = [];
//     var res2 = Promise.all(neighborood.map(fn)).then((d)=>{
//         itemToAvoid.push(d);
//         getNeighboor(d)
       
//     })

//     function getNeighboor(id){
//         return new Promise((resolve, reject) => {
//             var BB = FgetBBox(id)
//             d3.select('#guides').selectAll('g').each(function(d){
//                 var id2 = d3.select(this).attr('id');
//                 var BB2 = FgetBBox(id2);
//             })
//         })
//     }
// }

export function checkIntersection(r2, r1){
        return !(r2.x              > r1.x + r1.width || 
                 r2.x + r2.width   < r1.x || 
                 r2.y              > r1.y + r1.height ||
                 r2.y + +r2.height < r1.y);
}
export function getCenterPolygon(arr){
    var x = arr.map (x => x.x);
    var y = arr.map (x => x.y);
    var cx = (Math.min (...x) + Math.max (...x)) / 2;
    var cy = (Math.min (...y) + Math.max (...y)) / 2;
    return {'x': cx, 'y': cy};

}
export function getoobb(nodeId, sketchLines){
    // var fakeid = 'fake-'+nodeId

   
    var line = sketchLines.find(x => x.id == nodeId);
    // console.log(line, nodeId)
    var points = JSON.parse(JSON.stringify(line['points']));
    var transform = getTransformation(d3.select('#item-'+nodeId).attr('transform'))
    // console.log(transform)
    points = points.map((d)=>{
        return new Vector(d[0] + transform.translateX,d[1] + transform.translateY)
    })
    var convexHull = CalcConvexHull(points);
    var oobb = new CalcOmbb(convexHull);
    

    var polygon1 = new Polygon(oobb);
    var polyCopie = polygon1.offset(5);
    
    // var center = getCenterPolygon(points);

    return {'oobb': polyCopie.points, 'points': points}
}

export function getNearestElement(id, sketchLines){
    var linkToAvoid = [];
    var iteration = 0;
    var nodeIn = [];
    

    return new Promise((resolve, reject) => {
        nodeIn.push(id)
        getNeighborood(id, sketchLines);
        // console.log()
        resolve(nodeIn);
    })
    

    
    function getNeighborood(nodeId,sketchLines){

        //  RETRIEVE MA BBOX
        var item1 = getoobb(nodeId,sketchLines);
        var arrayPolygon = [];
        item1.oobb.forEach((d)=>{
            arrayPolygon.push(d.x)
            arrayPolygon.push(d.y);
       })

        // showOmBB(item1.oobb);
        // console.log(poly1)
        // var center = center(points);

        //CHECK INTERESCTION
        d3.select('.standAloneLines').selectAll('path').each(function(d){
            var id2 = d3.select(this).attr('id');
            if (linkToAvoid.indexOf(id2+'-'+nodeId) == -1 && nodeIn.indexOf(id2) == -1){
                // var BB2 = FgetBBox(id2, 3);
                var item2 = getoobb(id2, sketchLines);
                var arrayPolygon2 = [];
                item2.oobb.forEach((d)=>{
                    arrayPolygon2.push(d.x)
                    arrayPolygon2.push(d.y);
               })
                var isIntersect = polygonPolygon(arrayPolygon, arrayPolygon2)
                // console.log(isIntersect)
                // console.log('HELLO', BB2)
                // showBboxBB(BB2, 'red')
                // var isIntersect = checkIntersection(BB, BB2);
                // linkToAvoid.push(id2);
                linkToAvoid.push(id2+'-'+nodeId);
                
                // console.log(isIntersect, iteration)
                // d3.select('svg').append('g').attr('transform', 'translate('+BB2.x+','+BB2.y+')').append('text').html(iteration)
                iteration++
                //Si Intersection je continue avec celui-la
                if(isIntersect){
                    nodeIn.push(id2)
                    // showOmBB(item2.oobb);
                    // console.log(nodeIn)
                    getNeighborood(id2, sketchLines);
                   
                }
            }
        })
        
    }
}


// export async function isSomethingAttached(neighboors, id, itemAlreadyVisited){
//     return new Promise (function(resolve, reject){
//         var BB = FgetBBox(id)
//         var newNeighboors = [];
//         console.log(id)
//         d3.select('#guides').selectAll('g').each(function(d){
//             var id2 = d3.select(this).attr('id');
//             if (neighboors.indexOf(id2) == -1 && itemAlreadyVisited.indexOf(id2) == -1){
//                 var BB2 = FgetBBox(id2);
//                 var isIntersect = checkIntersection(BB, BB2);
//                 if (isIntersect){
//                     // itemAlreadyVisited.push(id2);
//                     newNeighboors.push(id2)
//                 }
//             }
//         })
//         itemAlreadyVisited = itemAlreadyVisited.concat(neighboors);

//         resolve({'neig':neighboors, 'id': id, 'visite':itemAlreadyVisited});




//     })
    
    /*var BB = FgetBBox(id);
    d3.select('#guides').selectAll('g').each(function(d){
        var id2 = d3.select(this).attr('id');
        if (neighboors.indexOf(id2) == -1){
            var BB2 = FgetBBox(id2);
            var isIntersect = checkIntersection(BB, BB2);
            if (isIntersect){
                neighboors.push(id2)
            }
        }
    })

    console.log(neighboors)*/
// }

// export function drawBBox(){

// }
// export function recursive(arrayIn, arrayOut, id){
//     var offset = 30;
//     // console.log(id, arrayOut, arrayIn)
//     var BB = d3.select('#'+id).node().getBBox();
//     BB.x -= offset;
//     BB.y -= offset;
//     BB.width += 2*offset;
//     BB.height += 2*offset;

//     arrayIn.push(id);
//     // arrayOut.push(id);
//     // console.log('Comparing', id)
//     showBbox(BB, 'black');
//     d3.select('#guides').selectAll('g').each(function(d){
        
//         var id2 = d3.select(this).attr('id');
       
//         // console.log(id2)
//         if (arrayOut.indexOf(id2 + '-id') == -1){
//             var offset = 30;
//             var BB2 = d3.select(this).node().getBBox();
//             BB2.x -= offset;
//             BB2.y -= offset;
//             BB2.width += 2*offset;
//             BB2.height += 2*offset;
    
//             // showBbox(BB2, 'red');
    
//             var isIntersect = checkIntersection(BB, BB2);
//             arrayOut.push(id2 + '-' + id);
//             arrayOut.push(id + '-' + id2);
//             // console.log(isIntersect)
//             if (isIntersect){
//                 // console.log(isIntersect)
//                 arrayIn.push(id2);
//                 recursive(arrayIn,arrayOut, id2);
//             }
//             // else arrayOut.push(id2 + 'id');
//         }
//     })
// }
export function sqr (x) {
    return x * x;
}
export function dist2 (v, w) {
    return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
}
// p - point
// v - start point of segment
// w - end point of segment
function distToSegmentSquared (p, v, w) {
    var l2 = dist2(v, w);
    if (l2 === 0) return dist2(p, v);
    var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]);
  }
  
  // p - point
  // v - start point of segment
  // w - end point of segment
export function distToSegment (p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
}
export function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}
export function drawLine(x1, y1, x2, y2, color){
    // var BB2 = d3.select('#'+id).node().getBBox();
    // console.log(BB2)
    d3.select('svg').append('line')
    .attr('x1', x1)
    .attr('y1', y1)
    .attr('x2', x2)
    .attr('y2', y2)
    .attr('stroke', color)

}
export function drawRect(x, y, width, height, color){
    d3.select('svg').append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', color)

}
export function drawCircle(x, y, r, color){
    // var BB2 = d3.select('#'+id).node().getBBox();
    // console.log(BB2)
    d3.select('svg').append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', r)
    .attr('fill', color)

}
export function showBboxBB(BB2, color, strokeSize){
    // var BB2 = d3.select('#'+id).node().getBBox();
    // console.log(BB2)
    if (strokeSize == undefined) strokeSize = 2
    d3.select('svg').append('rect').attr('class', 'BB')
    .attr('x', BB2.x)
    .attr('y', BB2.y)
    .attr('width', BB2.width)
    .attr('height', BB2.height)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', strokeSize)
}
export function showBbox(id, color){
    var BB2 = d3.select('#'+id).node().getBBox();
    var transform = {'translateX':0, 'translateY':0}
    if (d3.select('#'+id).node().tagName == 'g'){
        transform = getTransformation(d3.select('#'+id).attr('transform'))
    }

    d3.select('svg').append('rect')
    .attr('x', BB2.x + transform.translateX)
    .attr('y', BB2.y +transform.translateY)
    .attr('width', BB2.width)
    .attr('height', BB2.height)
    .attr('fill', 'none')
    .attr('stroke', color)
}
export function getMyBBox(element){
    return new Promise(resolve => {
        var BB = element.getBBox();
        resolve(BB);
    })
}

export async function retrieveStyle(idLine){
    // console.log(d3.select('#'+ idLine))
    var element = d3.select('#'+ idLine).select('.realStroke')
    var strokeSize = element.attr('stroke-width')
    var color = element.attr('stroke')

    return {'color': color, 'size': strokeSize}
}
export function whereIsPointer(x, y){
    
    
    // drawCircle(lastPoint[0], lastPoint[1], 10, 'red')
    
    
    var id = null
    var type = null;

    d3.selectAll('.postit').style('pointer-events', 'auto');
    d3.selectAll('.path1').style('pointer-events', 'auto');
    d3.selectAll('.path1').attr('fill', 'red');
    var element = document.elementFromPoint(x, y);
    // console.log(element)
    if (element.tagName == 'path' && element.className.baseVal == "path1"){
        id = element.id.split('-')[1];
        type = 'group';
    }
    d3.selectAll('.postit').style('pointer-events', 'none')
    d3.selectAll('.path1').style('pointer-events', 'none');
    d3.selectAll('.path1').attr('fill', 'none');

    
    d3.selectAll('.fakeStroke').style('pointer-events', 'auto');
    var element = document.elementFromPoint(x, y);
    if (element.tagName == 'path' && element.className.baseVal == "fakeStroke"){
        id = element.id.split('-')[1];
        type = 'path';
    }
    d3.selectAll('.fakeStroke').style('pointer-events', 'none');

    return {'id': id, 'type': type}
    
}
export async function checkIfSomething(x, y){
    
    var id = null

    d3.selectAll('.postit').style('pointer-events', 'auto');
    d3.selectAll('.path1').style('pointer-events', 'auto');
    d3.selectAll('.path1').attr('fill', 'red');
    var element = document.elementFromPoint(x, y);
    // console.log(element)
    if (element.tagName == 'path' && element.className.baseVal == "path1"){
        id = element.id;
    }
    d3.selectAll('.postit').style('pointer-events', 'none')
    d3.selectAll('.path1').style('pointer-events', 'none');
    d3.selectAll('.path1').attr('fill', 'none');
    
    d3.selectAll('.fakeStroke').style('pointer-events', 'auto');
    var element = document.elementFromPoint(x, y);
    if (element.tagName == 'path' && element.className.baseVal == "fakeStroke"){
        id = element.id;
    }
    d3.selectAll('.fakeStroke').style('pointer-events', 'none');


    d3.selectAll('.imagesColor').style('pointer-events', 'auto');
    var element = document.elementFromPoint(x, y);
    // console.log(element.className, element.tagName)
    if (element.tagName == 'image' && element.className.baseVal == "imageColor"){
        // console.log('GOOO IMAGE')
        id = 'image-' + element.id;
    }
    d3.selectAll('.imagesColor').style('pointer-events', 'none');



    // d3.select('.standAloneImages').selectAll('g').each(function(){
    //     BBid.push(d3.select(this).attr('id'))
    // })
    // d3.select('.linesPalette').selectAll('g').each(function(){
    //     BBid.push(d3.select(this).attr('id'))
    // })

    // // console.log(BBid)
    // for (var i in BBid){
    //     var BB = await _getBBoxPromise(BBid[i]);
    //     // showBboxBB(BB, 'red')
    //     var isInside = boxCircle(BB.x, BB.y, BB.width, BB.height, x, y, 30);
    //     if (isInside) whichElement = BBid[i]
    // }
    return id
}


 export function _getBBoxPromiseREal(id, offset){

    return new Promise(resolve => {
        if (offset == undefined) offset = 0;
        // console.log('Id', id)
        var BB = d3.select('#'+id).node().getBBox();
        // console.log(d3.select('#'+id).node())
        // console.log(d3.select('#'+id).node().tagName)
        var transform = {'translateX':0, 'translateY':0}
        if (d3.select('#'+id).node().tagName == 'g'){
            transform = getTransformation(d3.select('#'+id).attr('transform'))
        }
        // console.log(transform, d3.select('#'+id).node().tagName)
        // var selection = [
        // BB.x = BB.x+transform.translateX, BB.y+transform.translateY],
        // BBBB.x+transform.translateX+BB.width, BB.y+transform.translateY],
        //     [BB.x+transform.translateX+BB.width, BB.y+transform.translateY+BB.height],
        //     [BB.x+transform.translateX, BB.y+transform.translateY+BB.height],
        // ]
        BB.x = BB.x+transform.translateX - offset;
        BB.y = BB.y+transform.translateY - offset;
        BB.width += 2*offset;
        BB.height += 2*offset;
        // console.log('GOOO', id)
        resolve(BB);
    })
}
export function findMinMax(arr) {
    let minX = arr[0][0];
    let maxX = arr[0][0];

    let minY = arr[0][1];
    let maxY = arr[0][1];
  
    for (let i = 1, len=arr.length; i < len; i++) {
      let v = arr[i][0];
      minX = (v < minX) ? v : minX;
      maxX = (v > maxX) ? v : maxX;

      let w = arr[i][1];
      minY = (w < minY) ? w : minY;
      maxY = (w > maxY) ? w : maxY;
    }
  
    return {'x': minX, 'y':minY, 'width': maxX - minX, 'height': maxY - minY};
  }
export function _getBBoxPromise(id, offset){
    // console.log('id')
    return new Promise(resolve => {
        if (offset == undefined) offset = 0;
        // console.log('Id', id)
        var BB = d3.select('#'+id).node().getBoundingClientRect();

        var transformPan = {'translateX': 0, 'translateY': 0}

        BB.x = BB.x- offset - transformPan.translateX ;
        BB.y = BB.y- offset - transformPan.translateY ;
        BB.width += 2*offset;
        BB.height += 2*offset;

        resolve(BB); 
    })
}


export function _getBBoxPromiseNode(node, offset){

    return new Promise(resolve => {
        if (offset == undefined) offset = 0;
        // console.log('Id', id)
        var BB = node.getBoundingClientRect();

        var transformPan = {'translateX': 0, 'translateY': 0}

        BB.x = BB.x- offset - transformPan.translateX ;
        BB.y = BB.y- offset - transformPan.translateY ;
        BB.width += 2*offset;
        BB.height += 2*offset;

        resolve(BB); 
    })
}


export function _getBBoxPan(id, offset){

    if (offset == undefined) offset = 0;
        // console.log('Id', id)
        var BB = d3.select('#'+id).node().getBBox();
        // console.log(d3.select('#'+id).node())
        // console.log(d3.select('#'+id).node().tagName)
        var transformPan = {'translateX': 0, 'translateY': 0}
        var transformDrag = {'translateX': 0, 'translateY': 0}
        var item = d3.select('#panItems').node()
        if (item != null){
            transformPan = getTransformation(d3.select('#panItems').attr('transform'));
        } 
        if (d3.select('#'+id).node().tagName == 'g'){
            transformDrag = getTransformation(d3.select('#'+id).attr('transform'))
        }
        // console.log(transform, d3.select('#'+id).node().tagName)
        // var selection = [
        // BB.x = BB.x+transform.translateX, BB.y+transform.translateY],
        // BBBB.x+transform.translateX+BB.width, BB.y+transform.translateY],
        //     [BB.x+transform.translateX+BB.width, BB.y+transform.translateY+BB.height],
        //     [BB.x+transform.translateX, BB.y+transform.translateY+BB.height],
        // ]
        BB.x = BB.x+transformPan.translateX +transformDrag.translateX - offset;
        BB.y = BB.y+transformPan.translateY +transformDrag.translateY - offset;
        BB.width += 2*offset;
        BB.height += 2*offset;
        // console.log('GOOO', id)
        return BB;
    }
export function _getBBox(id, offset){

        if (offset == undefined) offset = 0;
        // console.log('Id', id)
        var BB = d3.select('#'+id).node().getBBox();
        // console.log(d3.select('#'+id).node())
        // console.log(d3.select('#'+id).node().tagName)
        var transform = {'translateX':0, 'translateY':0}
        if (d3.select('#'+id).node().tagName == 'g'){
            transform = getTransformation(d3.select('#'+id).attr('transform'))
        }
        // console.log(transform, d3.select('#'+id).node().tagName)
        // var selection = [
        // BB.x = BB.x+transform.translateX, BB.y+transform.translateY],
        // BBBB.x+transform.translateX+BB.width, BB.y+transform.translateY],
        //     [BB.x+transform.translateX+BB.width, BB.y+transform.translateY+BB.height],
        //     [BB.x+transform.translateX, BB.y+transform.translateY+BB.height],
        // ]
        BB.x = BB.x+transform.translateX - offset;
        BB.y = BB.y+transform.translateY - offset;
        BB.width += 2*offset;
        BB.height += 2*offset;
        // console.log('GOOO', id)
        return BB;
    
}
// REtourn un point donne pas sur la ligne
export function getPerpendicularPoint(A, B, d){
    var C = {
        x:B.x+d*(A.y-B.y)/Math.sqrt(Math.pow(A.x-B.x,2)+Math.pow(A.y-B.y,2)),
        y:B.y-d*(A.x-B.x)/Math.sqrt(Math.pow(A.x-B.x,2)+Math.pow(A.y-B.y,2))
    }
    return C;
}
export function LeastSquares(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;


    return {'b': b, 'm': m};
}

//            |C
//            |
//            |
//            |
//            |D
//______________________
//A                     B
//retourne un point sur la ligne
export function getSpPoint(A,B,C){
    var x1=A.x, y1=A.y, x2=B.x, y2=B.y, x3=C.x, y3=C.y;
    var px = x2-x1, py = y2-y1, dAB = px*px + py*py;
    var u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
    var x = x1 + u * px, y = y1 + u * py;
    return {x:x, y:y}; //this is D
}

export function FgetBBox(id, offset){
    // console.log(id)

    d3.select('#'+id).node().getBBox();
    var transform = getTransformation(d3.select('#'+id).attr('transform'))
    var BB = d3.select('#'+id).node().getBBox();
    // BB.x = BB.x+transform.translateX - offset;
    // BB.y = BB.x+transform.translateY - offset;
    BB.x = BB.x+transform.translateX - offset;
    BB.y = BB.y+transform.translateY - offset;
    BB.width += 2*offset;
    BB.height += 3*offset;

    return BB;

}
export function lineIntersectsPolygone(begin, end, arrayVector){
    var isIntersectSquare = false

    //all face of my object
    // var line1 = [{'x': BB.x, 'y': BB.y}, {'x': BB.x + BB.width, 'y': BB.y }]
    // var line2 = [{'x': BB.x + BB.width, 'y': BB.y}, {'x': BB.x + BB.width, 'y': BB.y + BB.height}]
    // var line3 = [{'x': BB.x + BB.width, 'y': BB.y + BB.height}, {'x': BB.x, 'y': BB.y + BB.height }]
    // var line4 = [{'x': BB.x, 'y': BB.y + BB.height }, {'x': BB.x , 'y': BB.y }]

    var arrayLine = []
    for (var i = 0; i < arrayVector.length; i++ ){
        if (i == arrayVector.length -1){
            arrayLine.push( [{'x': arrayVector[i]['x'], 'y':  arrayVector[i]['y']}, {'x':  arrayVector[0]['x'], 'y': arrayVector[0]['y'] }])
        }
        else{
            arrayLine.push( [{'x': arrayVector[i]['x'], 'y':  arrayVector[i]['y']}, {'x':  arrayVector[i+1]['x'], 'y': arrayVector[i+1]['y'] }])
        }
    }
    // console.log(arrayLine)


    // var arrayLine = [line1, line2, line3, line4];
    var arrayIntersection = [];
    arrayLine.forEach((line)=>{
        var isIntersect = line_intersect(line[0].x, line[0].y, line[1].x, line[1].y, begin.x, begin.y, end.x, end.y);
        if (isIntersect != false) {
            isIntersectSquare = true;
        }
    })
    return isIntersectSquare;
}
export function calculateBB(points) {
    var minX = Math.min.apply(null, points.map(function(a){return a[0];}))
    var maxX = Math.max.apply(null, points.map(function(a){return a[0];}))

    var minY = Math.min.apply(null, points.map(function(a){return a[1];}))
    var maxY = Math.max.apply(null, points.map(function(a){return a[1];}))

    var width = maxX - minX;
    var height = maxY - minY;

    return {'x': minX, 'y': minY, 'width': width, 'height': height};
 }
 
export function mergeRectangles(r1, r2) {
   return { x: Math.min(r1.x, r2.x),
            y: Math.min(r1.y, r2.y),
            width: Math.max(r1.width, r2.width),
            height: Math.max(r1.height, r2.height)
          }
}

export function unionRectangles(r1, r2) {
    return { x: Math.min(r1.x, r2.x),
             y: Math.min(r1.y, r2.y),
             width: Math.max(r1.x+r1.width, r2.x+r2.width) -  Math.min(r1.x, r2.x),
             height: Math.max(r1.y+r1.height, r2.y+r2.height) -  Math.min(r1.y, r2.y)
           }
 }
export function drawPath(oobb){
    var line = d3.line()
    // oobb.push(oobb[0]);
    oobb = oobb.map((d)=> [d.x, d.y])
    // console.log(oobb)
    d3.select('svg')
        .append('path')
        .attr("d", line(oobb))
        .attr('fill', 'red')
        // .attr('stroke', 'black')
        // .attr('stroke-width', '2')
        .attr('opacity', 0.2)
}
export function showOmBB(oobb){
    for (var i = 0; i < oobb.length; i++ ){
        // console.log(oobb[i])
        if (i == oobb.length -1){
            drawLine(oobb[i].x, oobb[i].y, oobb[0].x, oobb[0].y, 'black')
        }
        else{
            drawLine(oobb[i].x, oobb[i].y, oobb[i+1].x, oobb[i+1].y, 'black')
        }
    }
}
export function midPosition(x1, y1, x2, y2){
    return {'x': (x1 + x2) / 2, 'y': (y1 + y2) / 2}
}
export function interpolate(a, b, frac) // points A and B, frac between 0 and 1
{
    var nx = a.x+(b.x-a.x)*frac;
    var ny = a.y+(b.y-a.y)*frac;
    return {x:nx,  y:ny};
}
export function createPositionAtLengthAngle(a, angle, distance) // points A and B, frac between 0 and 1
{
    var x2 = a.x + Math.cos(angle) * distance
    var y2 = a.y + Math.sin(angle) * distance
    return {x:x2,  y:y2};
}
export function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
{
    // Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}

	var denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
	if (denominator === 0) {
		return false
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}

  // Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return {x, y}
}
export async function findIntersectionRecursive(BBTemp, ev, lastPosition, id, allGroups){
    // console.log(BBTemp)
    // var alreadyAdded = []
    var that = this;
    
    var transformPan = getTransformation(d3.select('#panItems').attr('transform'));
    

    var offsetX = ev.srcEvent.x - lastPosition.x;
    var offsetY = ev.srcEvent.y - lastPosition.y;
    BBTemp.x += offsetX//+ transformPan.translateX;
    BBTemp.y += offsetY//+ transformPan.translateY;

    var isItAGroup = allGroups.find(group => group.id == id)
    var arrayLineAttached = (isItAGroup) ? isItAGroup.lines.join().split(',') : []
    // console.log(offsetY, offsetX)
    var BBidID = [];
    // var arrayLineAttached = this.props.group.lines.join().split(',')
    // console.log(arrayLineAttached)
    /** Push all the lines */
    d3.select('.standAloneLines').selectAll('.parentLine').each(function(){
        var idSImple = d3.select(this).attr('id').split('-')[1]
        // console.log(d3.select(this).attr('id'))
        if (arrayLineAttached.indexOf(idSImple) == -1 && idSImple != id) BBidID.push(d3.select(this).attr('id'))
    })
     /** Push all the groups */
    // d3.selectAll('.groupPath').each(function(){
    //     var idSImple = d3.select(this).attr('id').split('-')[1]
    //     if (idSImple != id) BBidID.push('group-'+idSImple)
    // })

    var BBid = []
    for (var i =0; i < BBidID.length; i ++){
        var BB = await _getBBoxPromise(BBidID[i]);
        // BB.x -= 40;
        // BB.y -= 40;
        // BB.width += 50;
        // BB.height += 50;

        // LEFT CORNER
        var dist = distance(BBTemp.x, BB.x, BBTemp.y , BB.y+ BB.height)
        // middle CORNER
        var distMiddle = distance(BBTemp.x + (BBTemp.width/2), BB.x + (BB.width/2), BBTemp.y + (BBTemp.height/2) , BB.y+ (BB.height/2))
        // console.log(dist)
        if (dist < 300 || distMiddle < 300){
            // showBboxBB(BB, 'red');
            BBid.push({'id': BBidID[i], 'BB': BB});
        }
        
    }
    // console.log(BBid)
    // console.log(BBid)
    findIntersects(BBTemp, offsetX, offsetY, BBid, BBTemp, allGroups)
}
async function findIntersects (BBTemp, offsetX, offsetY, BBid, BBinitial, allGroups) {
       
    // showBboxBB(BBTemp, 'red');
    // console.log(BBid)
    //Put my lines in an array
    // console.log(BBid)
    // Check for all these lines
    for (var i in BBid){
        var id = BBid[i]['id'];
        var BB = BBid[i]['BB']
        var idSImple = id.split('-')[1];
        var type = id.split('-')[0]
        // showBboxBB(BBTemp, 'red');
        // showBboxBB(BB, 'blue');
        var intersected = boxBox(BB.x -10, BB.y-10, BB.width+10, BB.height+10, BBTemp.x, BBTemp.y, BBTemp.width, BBTemp.height);
        if (intersected) {
            
            // console.log()
            var insideandWhichGroup = allGroups.find(group => group.lines.find((arrayEntry)=> arrayEntry.indexOf(idSImple) > -1))//.indexOf(idSImple) > -1);//x.id == this.guideTapped.item)
            // console.log(insideandWhichGroup)
            var isItAGroup = allGroups.find(group => group.id == idSImple)//.indexOf(idSImple) > -1);//x.id == this.guideTapped.item)
            // console.log(isItAGroup, insideandWhichGroup)
            // if not attached to a group

            /** It's a group que je tappe */
            if (isItAGroup != undefined){
                // console.log(BBinitial)
                // showBboxBB(BB, 'blue');
                /* Cas horizontal vertial JE BOUGE VERTICAL */
                
                    if (isItAGroup.lines.length > 0){
                        var arrayLineAttached = isItAGroup.lines.join().split(',')
                        // console.log('je bpouge mon groupe', isItAGroup.lines)
                        arrayLineAttached.forEach((d)=>{
                            var transform = getTransformation(d3.select('#item-'+ d).attr('transform'));
                            var X = offsetX + transform.translateX;
                            var Y = offsetY + transform.translateY;
                            d3.select('#item-'+ d).attr('transform', 'translate('+X+','+Y+')')
                        })
                    }
                    var transform = getTransformation(d3.select('#'+id).attr('transform'));
                    var X = (offsetX + transform.translateX) ;
                    var Y = (offsetY + transform.translateY) ;
                    d3.select('#'+ id).attr('transform', 'translate('+X+','+Y+')')

                    if (isItAGroup.lines.length > 0){
                        var arraywihoutItem = arrayLineAttached.map((k)=>'item-'+k)
                        var newBB = JSON.parse(JSON.stringify(BBid))
                        for (var i = arraywihoutItem.length - 1; i >= 0; i--) {
                            var index = BBid.indexOf(BBid.find(x => x.id == arraywihoutItem[i]));
                            newBB.splice(index,1)
                        }
                    } else var newBB = JSON.parse(JSON.stringify(BBid))
                    var index = newBB.indexOf(newBB.find(x => x.id == id));
                    newBB.splice(index,1)
                    // findIntersects(BB, offsetX, offsetY, newBB, BBinitial, allGroups);
                
            }
            /** Not stroke inside a group */
            else if (insideandWhichGroup == undefined){
                if ((BB.x < BBinitial.x && BB.x + BB.width > BBinitial.x + BBinitial.width) && (BB.y > BBinitial.y && BB.y + BB.height < BBinitial.y + BBinitial.height)){
                    // console.log('CAS 1')
                }
                /* Cas horizontal vertial JE BOUGE HORIZONTAL */
                else if ((BB.x > BBinitial.x && BB.x + BB.width < BBinitial.x + BBinitial.width) && (BB.y < BBinitial.y && BB.y + BB.height > BBinitial.y + BBinitial.height)){
                    // console.log('CAS 1')
                }
                else {
                    var transform = getTransformation(d3.select('#'+id).attr('transform'));

                    // console.log('je tape une ligne', transform, offsetX, offsetY)
                    var X = offsetX + transform.translateX;
                    var Y = offsetY + transform.translateY;
                    // console.log(offsetX, offsetY)
                    d3.select('#'+ id).attr('transform', 'translate('+X+','+Y+')')

                    var index = BBid.indexOf(BBid.find(x => x.id == id));
                    // console.log(index)
                    var newBB = JSON.parse(JSON.stringify(BBid))
                    newBB.splice(index,1)
                    findIntersects(BB, offsetX, offsetY, newBB, BBinitial, allGroups);
                }
               
            } 
            /*** It's a line inside a group que je tape If already in a group */
            else {
                // console.log('GO')
                // console.log(insideandWhichGroup)
                var arrayLineAttached = insideandWhichGroup.lines.join().split(',')
                arrayLineAttached.forEach((d)=>{
                    var transform = getTransformation(d3.select('#item-'+ d).attr('transform'));
                    var X = offsetX + transform.translateX;
                    var Y = offsetY + transform.translateY;
                    d3.select('#item-'+ d).attr('transform', 'translate('+X+','+Y+')')
                })
                // console.log(insideandWhichGroup)
                var transform = getTransformation(d3.select('#group-'+insideandWhichGroup.id).attr('transform'));
                var X = offsetX + transform.translateX;
                var Y = offsetY + transform.translateY;
                d3.select('#group-'+ insideandWhichGroup.id).attr('transform', 'translate('+X+','+Y+')')

                /** Erase from array */
                var arraywihoutItem = arrayLineAttached.map((k)=>'item-'+k)
                var newBB = JSON.parse(JSON.stringify(BBid))
                for (var i = arraywihoutItem.length - 1; i >= 0; i--) {
                    var index = BBid.indexOf(BBid.find(x => x.id == arraywihoutItem[i]));
                    // console.log(index)
                    newBB.splice(index,1)
                }
                /** REMOVING THE GROUP */
                var index = newBB.indexOf(newBB.find(x => x.id == 'group-'+insideandWhichGroup.id));
                newBB.splice(index,1)
                // findIntersects(BB, offsetX, offsetY, newBB, BBinitial, allGroups);
            }
        }
    }
}

export function is_point_inside_selection(point, array_selection) {
    var vs = array_selection;
    var x = point[0], y = point[1];

    var inside = false;

    // console.log(x,y)
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
export function getTransformation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function 
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);
    
    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix. 
    var matrix = g.transform.baseVal.consolidate().matrix;
    
    // Below calculations are taken and adapted from the private function
    // transform/decompose.js of D3's module d3-interpolate.
    var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
    // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * 180 / Math.PI,
      skewX: Math.atan(skewX) * 180 / Math.PI,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }
export function getType(type, classData){
    var data = classData.split(' ');
    var arrayType = [];
    for (var i in data){
        var item = data[i];
        // console.log(item)
        if (item.split('-')[0] == type) arrayType.push(item.split('-')[1])
    }
    return arrayType;
}
export function whoIsInside(sketchLines, arraySelection){


    var paths = JSON.parse(JSON.stringify(sketchLines));
    var pathInside = [];

    // pour tout mes paths
    for (var i in paths){
        var path = paths[i];
        var dataPoints = path['points'];
        var translate = path['position'];

        var isIn = true;
        var j = 0;

        while (isIn && j < dataPoints.length){

            var point = dataPoints[j];
            point[0] += translate[0];
            point[1] += translate[1];
            isIn = is_point_inside_selection(point,  arraySelection)
            j++
            // console.log(isIn)
        }
        if (isIn == true){
            //Je push l'index du path
            pathInside.push(i)
        }

        
        //pour tout mes points
        // for (var j in dataPoints){
        //     var point = dataPoints[j];
        // }
    }

    var arrayPath = []
    for (var i in pathInside){
        var index = pathInside[i];
        arrayPath.push(sketchLines[index]['id'])
    }

    return arrayPath;
    // console.log(paths, arraySelection)

}