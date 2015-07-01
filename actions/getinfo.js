var AWS = require("aws-sdk");
var os = require("os");
var crypto = require('crypto');

var helpers = require("../helpers");

AWS.config.loadFromPath('./config.json');

var s3 = new AWS.S3();

var APP_CONFIG_FILE = "./app.json";

var linkKolejki = 'https://sqs.us-west-2.amazonaws.com/983680736795/WozniakSQS';

var sqs=new AWS.SQS();
var UPLOAD_TEMPLATE = "wyslano.ejs";


var simpledb = new AWS.SimpleDB();



var task =  function(request, callback){
	
	//otrzymaj od amazona adres bucketu i nazwe pliku

	var bucket =  request.query.bucket;
	var key =  request.query.key;
	

	var params = {
		Bucket: bucket,
		Key: key
	};


	s3.getObject(params, function(err, data) {
		if (err) {
	
			console.log(err, err.stack);
		}
		else {
			
		////////////////////////////////////////////////////	czesc odpowiedzialna za wrzucenie daty i nazwy pliku do simpledb
		
                                var params = {
  DomainName: 'wozniakDomain' 
};
simpledb.createDomain(params, function(err, data) {
  if (err) console.log(err, err.stack); 
  else     console.log(data);          
});


                                                 var date = new Date().toISOString();

                                                var paramsdb = {
                                                        Attributes: [
                                                                { Name: key, Value: date, Replace: true}
                                                        ],
                                                        DomainName: "wozniakDomain",
                                                        ItemName: 'ITEM001'
                                                };

                                                        simpledb.putAttributes(paramsdb, function(err, datass) {

                                                        if(err){        console.log('ERROR'+err, err.stack);}
                                                        else{
                                                        }});


                                                        var params4 = {
                                                                                                DomainName: 'wozniakDomain', //required
                                                                                                ItemName: 'ITEM001', // required
                                                                                        };
                                                                                        simpledb.getAttributes(params4, function(err, data) {
                                                                                                if (err) {
                                                                                                        console.log(err, err.stack); // an error occurred
                                                                                                }
                                                                                                else {
                                                                                                        console.log(data);           // successful response
                                                                                                }});



			
			////////////////////////////////////////// dodaj do kolejki nazwę bucketu i pliku
			
			
			
								
										var sendparms={
										
											MessageBody: "{\"bucket\":\""+bucket+"\",\"key\":\""+key+"\"} ",
											QueueUrl: linkKolejki,
									
										};
									
										sqs.sendMessage(sendparms, function(err,data2){
											if(err) {
												console.log(err,err.stack);
												callback(null,'error');
											}
											else {
												console.log("Prosba o wyliczenie skrotu dodana do kolejki");
												
											}
					
											
											
											});		
							
		}		
						
	});
		callback(null, {template: UPLOAD_TEMPLATE});	
};
exports.action = task;