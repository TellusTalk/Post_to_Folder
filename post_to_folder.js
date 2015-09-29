var
    PASSPHRASE = 'Some Secret!',
    HTTP_PORT = 7201,
    WORK_DIRECTORY_PATH = '/path/work/',
    FILE_EXTENSION = 'txt',
    ALLOWED_IP_LIST = ['::1', '::ffff:127.0.0.1'];  //allowed from localhost

var
    http = require('http'),
    fs = require('fs');

function app_log(text_in) {
    'use strict';
    console.log('**' + (new Date()).toISOString() + '**');
    console.log(text_in);
}

function app_server(request, response) {
    'use strict';
    var
        allowed_by_ip = (ALLOWED_IP_LIST.indexOf(request.connection.remoteAddress) >= 0),
        passphrase_matched = (request.headers.passphrase !== PASSPHRASE),
        unique_id = new Date().toISOString() + '_' + Math.floor(Math.random() * 1000),
        source_file = WORK_DIRECTORY_PATH + unique_id + '.' + FILE_EXTENSION,
        write_stream;

    if (!allowed_by_ip || !passphrase_matched) {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end();
        app_log('[Unauthorized]\n' + 'ip_address: ' + request.connection.remoteAddress + '\n' + 'passprase: ' + request.headers.passphrase);
        return;
    }

    if (request.url === '/favicon.ico') {
        response.writeHead(200, {'Content-Type': 'image/x-icon', 'Cache-Control': 'max-age=360000, must-revalidate'});
        response.end();
        app_log('[favicon requested]\n' + 'unique_id: ' + unique_id);
        return;
    }

    if (request.method === 'GET') {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Hello');
        app_log('[GET request]\n' + 'unique_id: ' + unique_id);
        return;
    }

    if (request.method === 'POST') {
        write_stream = fs.createWriteStream(source_file);

        request.pipe(write_stream);

        write_stream.on("close", function () {
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end('OK: ' + source_file + ' saved');
        });

        write_stream.on("error", function (err) {
            response.writeHead(400, {'Content-Type': 'text/plain'});
            response.end('Error: ' + err.message);
        });
    }
}

http.createServer(app_server).listen(HTTP_PORT);

app_log('[main] Post -> Folder, running');
