var AWS = require("aws-sdk");
var os = require("os");
var crypto = require('crypto');
//zawiera funkcje pomocnicze generowania skrótów robienia z jonson obiektu ...
var helpers = require("../helpers");
//accessKeyId ... klucze do amazona 
AWS.config.loadFromPath('./config.json');
//obiekt dla instancji S3 z aws-sdk
var s3 = new AWS.S3();
//plik z linkiem do kolejki
var APP_CONFIG_FILE = "./app.json";

var linkKolejki = "https://sqs.us-west-2.amazonaws.com/983680736795/WozniakSQS";
//obiekt kolejki z aws-sdk
var sqs=new AWS.SQS();
var UPLOAD_TEMPLATE = "wyslano.ejs";

//funkcja która zostanie wykonana po wejściu na stronę 
//request dane o zapytaniu, callback funkcja zwrotna zwracająca kod html
var task =  function(request, callback){
	
	//dane otrzymane z amazona po wrzuceniu
	//$_GET['bucket'], $_GET['key'], $_GET['etag']
	var bucket =  request.query.bucket;
	var key =  request.query.key;
	var etag =  request.query.etag;
	var ipAddress = request.connection.remoteAddress;
	//tablica z parametrami do pobrania naszego wrzuconego pliku i meta danych dla getObject
	var params = {
		Bucket: bucket,
		Key: key
	};

	//pobieramy plik (obiekt) i dane o nim
	s3.getObject(params, function(err, data) {
		if (err) {
			//jeżeli nie wrzucono takiego pliku a jest próba odwołania się do niego będzie log na konsoli
			console.log(err, err.stack);
		}
		else {
										//obiekt z parametrami do wysłania wiadomości dla kolejki 
										var sendparms={
											//MessageBody: bucket+"###"+key,
											MessageBody: "{\"bucket\":\""+bucket+"\",\"key\":\""+key+"\"} ",
											QueueUrl: linkKolejki,
											MessageAttributes: {
												key: {//dowolna nazwa klucza
													DataType: 'String',
													StringValue: key
												},
												bucket: {//dowolna nazwa klucza
													DataType: 'String',
													StringValue: bucket
												}
											}	
										};
										//wysłanie wiadomości do kolejki
										sqs.sendMessage(sendparms, function(err,data2){
											if(err) {
												console.log(err,err.stack);
												callback(null,'error');
											}
											else {
												console.log("Prosba o wyliczenie sktotu dodana do kolejki");
												console.log("MessageId: "+data2.MessageId);
											}
					
											callback(null, {template: UPLOAD_TEMPLATE, params:{fileName:key.substring(10), bucket:"wozniak"}});
											//etag: +etag
											//IP: +data.Metadata.ip
											//Uploader: +data.Metadata.uploader
											});		
									
		}		
						
	});
}
exports.action = task