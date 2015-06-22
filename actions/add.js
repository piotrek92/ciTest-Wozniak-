var util = require("util");
var AWS = require("aws-sdk");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "index.ejs";

var s3 = new AWS.S3();
AWS.config.loadFromPath('./config.json');

var task = function(request, callback){
	


var params = {
		Bucket: 'lab4-weeia',
	};




	s3.listObjects(params, function(err, data) {
		if (err) console.log(err, err.stack);
		else     console.log(data);
	var linki = [];
	var linkiprzet=[];
		//przelatujemy przez każdy plik z bucketu
		for(var i in data.Contents) {
			//jeżeli nie jest to nazwa bucketu tylko plik
	
				linki.push( {nazwa: data.Contents[i].Key.substring(13)});
		
		
		
	
				linkiprzet.push( {nazwa: data.Contents[i].Key.substring(13)});
		
		
		
		
		
		}
	//1. load configuration
	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	var policyData = helpers.readJSONFile(POLICY_FILE);
	
	//2. prepare policy
	var policy = new Policy(policyData);

	//3. generate form fields for S3 POST
	var s3Form = new S3Form(policy);
	//4. get bucket name
	var fields=s3Form.generateS3FormFields();


	
	
	fields.push( {name : 'x-amz-meta-uploader', value : 'piotr.wozniak'});



	var f2=s3Form.addS3CredientalsFields(fields,awsConfig);
	callback(null, {template: INDEX_TEMPLATE, params:{fields:fields,bucket:"lab4-weeia", links:linki, linkiprzet:linkiprzet}});

					

});


}
exports.action = task;
