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
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
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
        arrayPath.push(sketchLines[index])
    }

    return arrayPath;
    // console.log(paths, arraySelection)

}