
import paper from 'paper';
paper.setup([640, 480]);

export function recognizeInk(document, linesArray){

    return new Promise(function(resolve, reject) {

        var arrayLines = linesArray.map((paths)=>{
            return paths.map((path)=>{
                var line = JSON.parse(JSON.stringify(document.props.sketchLines.find(x => x.id == path)));
                var points = line.points.map((point)=> {
                    return [point[0] + line.position[0], point[1]+ line.position[1]] 
                })
                return points;
            })
        })

        var groups = arrayLines.map(pathsPoints => {
            var group = new paper.Group({insert: false})
            pathsPoints.forEach((path, index)=>{
                var pathPaper = new paper.Path(path);
                group.addChild(pathPaper) 
            })
            var factor = group.bounds.width / group.bounds.height;
            group.bounds.height = 20;
            group.bounds.width = group.bounds.height * factor;
            group.applyMatrix = true;
            return group;
        });

        var mappedData = groups.map(group => {
            var data = {"language": "en-US", "version": 1.0, "unit":"mm", "strokes":[]};
            group.children.forEach((pathCloning, index)=>{
                var array = [];
                pathCloning.segments.forEach((d, i)=>{
                    array.push(parseFloat(d.point.x).toFixed(2));
                    array.push(parseFloat(d.point.y).toFixed(2));
                })
                array = array.join();
                data.strokes.push({"id":index, "points": array, "language": "en-US"})
            })
            return data
        })

        var promised = mappedData.map((data)=> sendRequest(data))
        Promise.all(promised).then(function(values) {
            var data = values.map((ink)=>{
                console.log(ink)
                var line = ink.recognitionUnits.filter((l)=> l.category == 'line');
                if (line[0] == undefined) reject();
                else return line[0].recognizedText;
            })
            resolve(data);
        });
    })
}


export function sendRequest(data){
    return new Promise(function(resolve, reject) {
        let CII_BASE = "https://input.microsoft.com";
        let CII_STATELESS_EP = "/Ink/Analysis/?api-version=beta";
        let CII_KEY = "aeffe66ec509488599a4fc2418a844ac";
        let xhttp = new XMLHttpRequest();
        let EndPointURL = CII_BASE + CII_STATELESS_EP;
        xhttp.open("PUT", EndPointURL, false);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("Ocp-Apim-Subscription-Key", CII_KEY);
        let inkPayloadJSON = JSON.stringify(data);
        xhttp.onload = () => {
            if (xhttp.status >= 200 && xhttp.status < 300) {
                resolve(JSON.parse(xhttp.response));
            } else {
                console.log('BAD')
                reject(xhttp.statusText);
            }
        };
        xhttp.onerror = () => reject(xhttp.statusText);
        xhttp.send(inkPayloadJSON);
    })
}