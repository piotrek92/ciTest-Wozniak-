var AWS = require("aws-sdk");
var helpers = require("../helpers");
AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();
//sqsQueueUrl='https://sqs.us-west-2.amazonaws.com/983680736795/WozniakSQS';
var sqs=new AWS.SQS();

var task =  function(request, callback){

	var bucket =  request.query.bucket;
	var key =  request.query.key;
	

	var params = {
	  Bucket: bucket,
	  Key: key
	};



	s3.getObject(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else   {
		console.log(data);           // successful response
		var algorithms = ['sha1', 'md5', 'sha256', 'sha512']
		
		var doc = data.Body;
		 var sendparms={
        MessageBody: "{\"bucket\":\""+bucket+"\",\"key\":\""+key+"\"} ",
        QueueUrl: 'https://sqs.us-west-2.amazonaws.com/983680736795/WozniakSQS'

        };
	 sqs.sendMessage(sendparms, function(err,data){
                if(err) console.log(err,err.stack);
                else console.log(data);
                });





		helpers.calculateMultiDigest(doc, algorithms, 
		function(err, digests) {
			
			
			
		callback(null,'<br>bucket: '+bucket
			+"<br>key: "+key
			+"<br>IP: "+data.Metadata.ip
			+"<br>Uploader: "+data.Metadata.uploader
			+"<br><a href='http://"+bucket+".s3.amazonaws.com/"+key+"'>Download</a>"
+"<br>"+digests.join("<br>")
//	+"<br><pre>"+JSON.stringify(data, null, 4)+"</pre>"	
			);	
		

		}, 
		1);
		  
			


	  }  
	});


}

exports.action = task
