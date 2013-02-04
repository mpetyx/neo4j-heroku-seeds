import os
from flask import Flask
from py2neo import neo4j, cypher

# this is how Heroku tells your app where to find the database.
NEO4J_URL= os.environ.get('NEO4J_URL', "http://localhost:7474") + "/db/data/"

def create_graph(graph_db):
    print("Creating graph on: " + NEO4J_URL)

    # Do we have a node that has a 'name' property, which is set to the value 'Neo'?
    # We've probably been here before.
    data, metadata = cypher.execute(graph_db, "START n=node(*) where n.name?='Neo' return n")
    if (len(data) != 0):
        # Create two nodes, one for us and one for you.
        # Make sure they both have 'name' properties with values.
        from_node, to_node = graph_db.create({"name": "neo4j"}, {"name": "you"})

        # create a 'loves' relationship from the 'from' node to the 'to' node
        from_node.create_relationship_to(to_node, "loves")

    # To learn more, read the excellent Neo4j Manual at http://docs.neo4j.org


def find_lovers(graph_db):
    query = "START n=node(*) MATCH (n)-[r:loves]->(m) return n, r, m"
    # This is our awesome Cypher query language.
    # STARTing with all the nodes in the graph
    # MATCH the ones that have a LOVES relationship
    # and RETURN the starting node, the relationship, and the end node.
    data, metadata = cypher.execute(graph_db, query)
    return data[0]
    
app = Flask(__name__)
app.debug = True

@app.route('/')
def hello():
    # Query the database
    result = find_lovers(graph_db)
    # Pull out the data we want from the single row of results
    return "%s %s %s" % (result[0]['name'], result[1].type,  result[2]['name'] )

if __name__ == '__main__':
    # Connect to the database
    graph_db = neo4j.GraphDatabaseService(NEO4J_URL)
    # Make sure our reference data is there
    create_graph(graph_db)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

