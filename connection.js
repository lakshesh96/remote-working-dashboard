console.log("connect")
var http = require('http');
var options = {
    host: '127.0.0.1',
    port: '8888',
    path: '/holiday',
    method: 'GET'
};

var req = http.request(options, function (incoming_msg) {
	console.log("respones status " + incoming_msg.statusCode);

	// ����IncomingMessage��data�¼������յ������������������ݵ�ʱ�򣬴�������¼�
	incoming_msg.on("data", function (data) {
		if (incoming_msg.statusCode === 200) {
			console.log(data.toString());
		}
	});

});
// write the request parameters
req.end();