var express = require('express')
var WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

var app = express()
app.use(express.static(__dirname+'/dist'));

var CLIENTS = [];

var avoidBroadCast = ['SET_UI_ID', 'SET_WORKSPACE']
// console.log(__dirname)
// var index = 0;
// SUR LE SERVEUR

/*
wss.on('connection', function connection(ws, req) {
   
    
    const ip = req.connection.remoteAddress;
    console.log('USER ', ip, ' is connected', wss.clients.size -1);
    
    ws.id = wss.clients.size -1;
    CLIENTS.push(ws)

    var data = {'type': 'setId', 'data':ws.id};
    ws.send(JSON.stringify(data));


    if (CLIENTS.length > 1) wss.retrieveWorkSpace(ws);

    
    // console.log(ip)
    ws.on('message', function (message) {
        var data = JSON.parse(message)

        // console.log(data)
        if (data.type == 'SETWorkspace'){
            var dataToSend = {'type':'INSTANTIATEworkspace', 'data': data.data }
            CLIENTS[CLIENTS.length - 1].send(JSON.stringify(dataToSend));
        }
        
        else if (avoidBroadCast.indexOf(data.type) == -1){
            // console.log('User said', message, );
            wss.broadcast(message, ws)
        }
        
    })


   
    // index++
});

wss.retrieveWorkSpace = function retrieveWorkSpace(ws) {
    console.log('retrieve')
    var data = {'type': 'GETworkspace'};
    CLIENTS[0].send(JSON.stringify(data));
}
wss.broadcast = function broadcast(data, ws) {
    wss.clients.forEach(function each(client) {
        // console.log(client)
        if (client !== ws) client.send(data);
        // else console.log('HEY')
    });
  };


*/



app.get('/',function(req,res) {
    res.sendFile('/dist/index.html', {root: __dirname });
  });

app.listen(3000, '10.159.2.39', function () {
    console.log('Example app listening on port 3000!')
})
