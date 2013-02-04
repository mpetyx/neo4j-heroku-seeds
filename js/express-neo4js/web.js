var express = require('express');
var neo4j = require('neo4j');

var app = express();
var db = new neo4j.GraphDatabase(process.env.DATABASE_URL);

function createIndexedNode(instanceId) {
  var node = db.createNode({instanceId: instanceId, createdOn: new Date()});
  node.save(function (err, node) {
    if (err) { console.log('Error saving new node to database:', err); }
    node.index('instances', 'id', instanceId);
  });
}

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/status', function(request, response) {
  var node = db.createNode({hello: 'world'});     // instantaneous, but...
  node.save(function (err, node) {    // ...this is what actually persists.
    if (err) {
        console.log('Error saving new node to database:', err);
        response.status(500);
        response.send('Not OK.')
    } else {
        console.log('Node saved to database with id:', node.id);
        response.send('OK.');
    }
  });
});

app.post('/fetch', function(request, response) {
  // fetch http://version1.api.memegenerator.net/Instances_Select_ByNew?languageCode=en
  // store as nodes + rels
  // redirect to /latest

  for (var i=0; i<Math.random()*10; i++) {
    createIndexedNode(Math.round(Math.random()*1000000000));
  }

  response.redirect('/latest');
});

app.get('/latest', function(request, response) {
  // fetch latest 20
  // display

  // hack
  db.queryNodeIndex('instances', 'id:*', function(err, nodes) {
    response.send(nodes.map(function(node) {
      return node.data;
    }));
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
