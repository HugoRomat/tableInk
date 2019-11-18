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


export function getNearestElement(id){
    var linkToAvoid = [];
    var iteration = 0;
    var nodeIn = [];

    return new Promise((resolve, reject) => {
        nodeIn.push('item-'+id)
        getNeighborood('item-'+id);
        resolve(nodeIn);
    })
    

    
    function getNeighborood(nodeId){
        var BB = FgetBBox(nodeId)
        d3.select('#guides').selectAll('g').each(function(d){
            var id2 = d3.select(this).attr('id');
            if (linkToAvoid.indexOf(id2+'-'+nodeId) == -1 && nodeIn.indexOf(id2) == -1){
                var BB2 = FgetBBox(id2);

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
    var transform = getTransformation(d3.select('#'+id).attr('transform'))
    // console.log(BB2)
    d3.select('svg').append('rect')
    .attr('x', BB2.x + transform.translateX)
    .attr('y', BB2.y +transform.translateY)
    .attr('width', BB2.width)
    .attr('height', BB2.height)
    .attr('fill', 'none')
    .attr('stroke', color)
}

export function _getBBox(id){
    // console.log('Id', id)
    var BB = d3.select('#'+id).node().getBBox();
    // console.log(d3.select('#'+id).node())
    // console.log(d3.select('#'+id).node().tagName)
    var transform = {'translateX':0, 'translateY':0}
    if (d3.select('#'+id).node().tagName == 'g'){
        transform = getTransformation(d3.select('#'+id).attr('transform'))
    }
    
    // var selection = [
    // BB.x = BB.x+transform.translateX, BB.y+transform.translateY],
    // BBBB.x+transform.translateX+BB.width, BB.y+transform.translateY],
    //     [BB.x+transform.translateX+BB.width, BB.y+transform.translateY+BB.height],
    //     [BB.x+transform.translateX, BB.y+transform.translateY+BB.height],
    // ]
    BB.x = BB.x+transform.translateX;
    BB.y = BB.y+transform.translateY;
    return BB;
}
export function FgetBBox(id){
    // console.log(id)
    var offset = 10;
    d3.select('#'+id).node().getBBox();
    var transform = getTransformation(d3.select('#'+id).attr('transform'))
    var BB = d3.select('#'+id).node().getBBox();
    // BB.x = BB.x+transform.translateX - offset;
    // BB.y = BB.x+transform.translateY - offset;
    BB.x = BB.x+transform.translateX - offset;
    BB.y = BB.y+transform.translateY - offset;
    BB.width += 2*offset;
    BB.height += 2*offset;

    // showBboxBB(BB, 'red')
    return BB;

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