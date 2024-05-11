const http = require('http');
const url = require('url');
const MongoClient = require('mongodb').MongoClient;

const handlers = {};
const database = {};
let db;

database.create = (newbie, callback) => {
    db.collection('newbies').insertOne(newbie, (err, result)=> {
        if(!err && result) {
            callback(null, result);
        } else {
            callback(err);
        }
    })
};
database.read = () => {

};
database.update = () => {

};
database.delete = () => {

};

handlers.newbies = (parsedReq, res) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.includes(parsedReq.method)){
        handlers._newbies[parsedReq.method](parsedReq, res);
    } else {
        res.writeHead(400);
        res.end("Not an accepted method.");
    }
};

handlers._newbies = {};

handlers._newbies.get = (parsedReq, res) => {
    res.end('GET');
};
handlers._newbies.post = (parsedReq, res) => {

    const newbie = JSON.parse(parsedReq.body);

    database.create(newbie, (error, result) => {
        if(!error && result){
            res.end(JSON.stringify(result));
        } else {
            res.end(error);
        }
    });
};
handlers._newbies.put = (parsedReq, res) => {
    res.end('PUT');
};
handlers._newbies.delete = (parsedReq, res) => {
    res.end('DELETE');
};


handlers.notFound = (parsedReq, res) => {
    res.writeHead(404);
    res.end('Route Not Found');
}

const router = {
    'newbies': handlers.newbies
}

const server = http.createServer((req, res) => {

    const parsedReq = {}

    parsedReq.parsedUrl = url.parse(req.url, true);
    parsedReq.path = parsedReq.parsedUrl.pathname;
    parsedReq.trimmedPath = parsedReq.path.replace(/^\/+|\/+$/g, '');
    parsedReq.method = req.method.toLowerCase();
    parsedReq.headers = req.headers;
    parsedReq.queryStringObject = parsedReq.parsedUrl.query;

    let body = [];

    req.on('data', (chunk) => {
        body.push(chunk);
    });

    req.on('end', () => {
        body = Buffer.concat(body).toString();
        parsedReq.body = body;

        const routedHandler = typeof(router[parsedReq.trimmedPath]) !== 'undefined' ? router[parsedReq.trimmedPath] : handlers.notFound;

        routedHandler(parsedReq, res);
    })

    
});

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if(err){
        return console.log('Could not connect to mongodb Server\n', err.message);
    }
    console.log('Connected to mongodb Server');
    db = client.db('node_newbies');
});

server.listen(3000, () => console.log("listening on port 3000"));

