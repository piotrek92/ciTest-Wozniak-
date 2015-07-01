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
		Prefix:'piotrwozniak'
	};
	
	
var params1 = {
		Bucket: 'lab4-weeia',
		Prefix:'processed'
	};

	
///////////////////////////	wylistuj przetworzone pliki
		var linkiprzet=[];

s3.listObjects(params1, function(err, data){
	
		for(var i in data.Contents) {
				linkiprzet.push( {nazwa: data.Contents[i].Key.substring(10)});
		}
		
		
	
	
});


///////////////////////// wylistuj wszystkie pozostałe pliki



	s3.listObjects(params, function(err, data) {
		if (err) console.log(err, err.stack);
		else     console.log(data);
	var linki = [];


		for(var i in data.Contents) {
	

				linki.push( {nazwa: data.Contents[i].Key.substring(13)});
	
		
		
		
		
		
		}

	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	var policyData = helpers.readJSONFile(POLICY_FILE);

	var policy = new Policy(policyData);


	var s3Form = new S3Form(policy);

	var fields=s3Form.generateS3FormFields();


	
	
	fields.push( {name : 'x-amz-meta-uploader', value : 'piotr.wozniak'});



	var f2=s3Form.addS3CredientalsFields(fields,awsConfig);
	callback(null, {template: INDEX_TEMPLATE, params:{fields:fields,bucket:"lab4-weeia", links:linki, linkiprzet:linkiprzet}});

					

});


}
exports.action = task;
