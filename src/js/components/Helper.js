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