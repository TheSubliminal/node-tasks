'use strict';

const http = require('http');
const net = require('net');
const url = require('url');

const proxy = http.createServer((request, response) => {

    response.writeHead(200, { 'Content-Type': 'text/html' });

    if (url.parse(request.url).protocol === 'http:') {
        console.log('HTTP GET:', request.url, new Date().toLocaleTimeString());
        http.get(request.url, (resp) => {
            resp.pipe(response);
        }).on('error', err => {
            console.log('ERROR GET: ', err.message);
        });
    }

}).on('error', (err) => console.log('ERROR SERVER:', err));

proxy.on('connect', (req, cltSocket) => {
    console.log('HTTPS GET: ', req.url, new Date().toLocaleTimeString());
    const srvUrl = url.parse(`http://${req.url}`);
    const srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
        cltSocket.write('HTTP/' + req.httpVersion + ' 200 OK\r\n' +
            '\r\n', 'UTF-8', () =>{
            srvSocket.pipe(cltSocket);
            cltSocket.pipe(srvSocket);
        });

    }).on('error', (err) => {
        console.log('ERROR SOCKET: ', err);
    });
});


proxy.listen(8000, (err) => {
    if (err) {
        console.log('ERROR LISTEN: ', err);
    }
});

