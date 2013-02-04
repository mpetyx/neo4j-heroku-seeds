var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.DATABASE_URL);

function createIndexedNode(instanceId) {
  var node = db.createNode({instanceId: instanceId, createdOn: new Date(), createdBy: 'scheduled task'});
  node.save(function (err, node) {
    if (err) { console.log('Error saving new node to database:', err); }
    node.index('instances', 'id', instanceId);
  });
}

// fetch http://version1.api.memegenerator.net/Instances_Select_ByNew?languageCode=en
// store as nodes + rels

// hack for now
for (var i=0; i<Math.random()*10; i++) {
  createIndexedNode(Math.round(Math.random()*1000000000));
}

