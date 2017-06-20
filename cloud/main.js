/*

curl -X POST \
  -H "X-Parse-Application-Id: kP6KipEEmdj9w5aZLt6r" \
  -H "Content-Type: application/json" \
  -d '{
  	"donateType": "monthly",
  	"donateMoney": "1000",
  	"receiptTitle" : "Ha Ha",
  	"userPhone" : "0919000000",
  	"email" : "avery@gmail.com",
  	"cardNo" : "0001122334400000",
  	"cardNoYY" : "04",
  	"cardNoMM" : "20",
  	"cardNoCVC" : "987",
  	"homePhone" : "02-23093138"
  
  }' \
  https://donate2navi.herokuapp.com/parse/functions/submitDonateForm
  
  */

require("./Math.uuid.js");
require("./db_trigger.js");
var logger = require("./mail_service.js");
var prop = require("./app_properties.js");

Parse.Cloud.define('hello', function(req, res) {
	res.success(Math.uuid(20));
});


//user
// -user
// -user
// insert donate data
// send mail
// return 

//
Parse.Cloud.define("submitDonateForm", function(request, response) {
	Parse.Cloud.useMasterKey();
	
	//create new record
    var NV_DonationApply = Parse.Object.extend("NV_DonationApply");
	var donateApply = new NV_DonationApply();
	donateApply.set("accessToken", Math.uuid(32));
	donateApply.set("status", "applying");
	donateApply.set("donateType", request.params.donateType);
	donateApply.set("donateMoney", request.params.donateMoney);
	donateApply.set("receiptTitle", request.params.receiptTitle);	
	donateApply.set("userPhone", request.params.cellPhone);
	donateApply.set("email", request.params.email);
	donateApply.set("cardNo", request.params.cardNo);
	donateApply.set("cardNoYY", request.params.cardNoYY);
	donateApply.set("cardNoMM", request.params.cardNoMM);
	donateApply.set("cardNoCVC", request.params.cardNoCVC);
	if (request.params.homePhone != null) {
		donateApply.set("homePhone", request.params.homePhone);
	}
	
	var acl = new Parse.ACL();
	acl.setPublicReadAccess(true);
	donateApply.setACL(acl);
	donateApply.save(null,{
		success: function(donateApplyCreated){
			response.success(donateApplyCreated.id);
			
			//send mail to 
			
			
		},
		error: function(err) {
			response.error("submitDonateForm failed." + err);
		}		
	});
	
	
	
});


Parse.Cloud.afterSave("NV_DonationApply", function(request) {
	
	if (request.object.get("email") != null) {
		
		var donateType = request.object.get("donateType");
		if (donateType == "once") 
		
		var subject = "";
		
		var body = request.object.get("receiptTitle") + " ,<BR><BR>";
		body += "<BR>";
		body += " -<BR>";
		
		body += ": " + ((donateType == "once")? "" : "" + "<BR>";
		body += ": <font color='red'>$" + request.object.get("donateMoney") + "</font><BR>";
		
		body += ": $" + request.object.get("cellPhone") + "<BR>";
		body += ": $" + request.object.get("homePhone") + "<BR>";
		body += ": $" + request.object.get("receiptAddress") + "<BR>";
		
		body += ": $" + "************" + request.object.get("cardNo").substr(0,16) + "<BR><BR>";
		
		body += ": <BR>";
		body += "url here: <BR>";
		
		
		body += "!<BR><BR>";
		body += ":<BR>";
		body += ":02-23093138<BR>";
		logger.send_notify(request.object.get("email"), prop.mail_cc(), subject, body);	
	}
});