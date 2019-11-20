import * as d3 from 'd3';
import { ENETUNREACH } from 'constants';

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return 'b' + s4() + s4() + s4() +  s4() +s4() +  s4() + s4() + s4();
}
export function distance(x1, x2, y1, y2){
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt( a*a + b*b );
    return c;
}
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
export function center(arr){
    var x = arr.map (x => x.x);
    var y = arr.map (x => x.y);
    var cx = (Math.min (...x) + Math.max (...x)) / 2;
    var cy = (Math.min (...y) + Math.max (...y)) / 2;
    return {'x': cx, 'y': cy};

}

export function getNearestElement(id){
    var linkToAvoid = [];
    var iteration = 0;
    var nodeIn = [];
    

    return new Promise((resolve, reject) => {
        nodeIn.push('item-'+id)
        getNeighborood('item-'+id);
        // console.log()
        resolve(nodeIn);
    })
    

    
    function getNeighborood(nodeId){

        // console.log(nodeId)
        var BB = FgetBBox(nodeId, 3);
        d3.select('.standAloneLines').selectAll('g').each(function(d){
            var id2 = d3.select(this).attr('id');
            if (linkToAvoid.indexOf(id2+'-'+nodeId) == -1 && nodeIn.indexOf(id2) == -1){
                var BB2 = FgetBBox(id2, 3);

                // console.log('HELLO', BB2)
                // showBboxBB(BB2, 'red')
                var isIntersect = checkIntersection(BB, BB2);
                // linkToAvoid.push(id2);
                linkToAvoid.push(id2+'-'+nodeId);
                
                // console.log(isIntersect, iteration)
                // d3.select('svg').append('g').attr('transform', 'translate('+BB2.x+','+BB2.y+')').append('text').html(iteration)
                iteration++
                //Si Intersection je continue avec celui-la
                if(isIntersect){
                    nodeIn.push(id2)
                    // console.log(nodeIn)
                    getNeighborood(id2);
                   
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
export function drawCircle(x, y, r, color){
    // var BB2 = d3.select('#'+id).node().getBBox();
    // console.log(BB2)
    d3.select('svg').append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', r)
    .attr('fill', color)

}
export function showBboxBB(BB2, color){
    // var BB2 = d3.select('#'+id).node().getBBox();
    // console.log(BB2)
    d3.select('svg').append('rect')
    .attr('x', BB2.x)
    .attr('y', BB2.y)
    .attr('width', BB2.width)
    .attr('height', BB2.height)
    .attr('fill', 'none')
    .attr('stroke', color)
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

    // showBboxBB(BB, 'red')
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
export function showOmBB(oobb){
    for (var i = 0; i < oobb.length; i++ ){
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