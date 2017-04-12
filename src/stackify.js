var fs     = require('fs');
var express = require('express');
var Docker = require('dockerode');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}

var app = express();
var docker = new Docker({ socketPath: socket });
var opts = { "filters": {"label": ["com.docker.stack.namespace"]} }; 

app.get('/', function (request, response) {
    docker.listServices(opts, function (err, services) {
        var stackServiceCount = new Array(); 
        var stackStartTime    = new Array(); 
 
        for ( i = 0; i < services.length; i++) {
            var labels = (services[i].Spec.Labels);
            for (var key in labels) {
                if ( "com.docker.stack.namespace" != key ) continue;
                var stackName= labels[key];
                if ( stackServiceCount[stackName] == undefined ){
                    stackServiceCount[stackName] = 1;
                    stackStartTime[stackName] =services[i].CreatedAt;
                } else {
                    stackServiceCount[stackName]++;
                }
            }
        }    
        
        response.writeHead(200, {"Content-Type": "json", "Access-Control-Allow-Origin" : "*"});
        var output = [];
        for (var key in stackServiceCount) {
            output.push ( { name: key, count: stackServiceCount[key], StartTime: stackStartTime[key] });
        }
        response.write( JSON.stringify( output ) );
        response.end();
    
    });
});

var server = app.listen(5000, "0.0.0.0", function () {
    var port = server.address().port;
    console.log("Example app listening at localhost", port);
});
