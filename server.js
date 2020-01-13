const http = require('http');
const fs = require('fs');
var url = require('url');

const mimeTypes = {
    "html": "text/html",
    "js": "text/javascript",
    "css": "text/css",
    "jpg": "image/jpg",
    "mp3": "audio/mpeg",
    "png": "image/png",
    "ico": "image/vnd.microsoft.icon",
    "json": "application/javascript"
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
http.createServer(function (req, res) {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    };  
    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }
    var parsedUrl = url.parse(req.url, true);

    if(parsedUrl.pathname === "/"){
        const index = fs.readFileSync("./public/index.html");
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(index);
        res.end(); 
    }
    else if(parsedUrl.pathname === "/upload/game" && req.method === "POST"){
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            res.writeHead(200, {'Content-Type': 'application/javascript'});
            const pseudoSimpleHash = new Date().getTime()*Math.ceil(getRandomInt(10))
            fs.writeFile( `./saved_games/${pseudoSimpleHash}.json`, body, "utf8", 
                ()=> res.end(JSON.stringify({done: true, hash: pseudoSimpleHash}))
            );

        }); 
    }
    else if(parsedUrl.pathname === "/fetch/game"){
        const hash = parsedUrl.query.hash;
        const json = fs.readFileSync(`./saved_games/${hash}.json`)
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.end(json); 
    }
    else{
        try {
            const page = fs.readFileSync(`./public${parsedUrl.pathname}`);
            const splitedUrl = parsedUrl.pathname.split(".")
            const fileExtention = splitedUrl[splitedUrl.length-1]
            res.writeHead(200, {'Content-Type': mimeTypes[fileExtention]});
            res.write(page);
            res.end()
        } catch (error) {
            console.log("error")
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.write("Error");
            res.end(); 
        }
    }      
}).listen(8088);