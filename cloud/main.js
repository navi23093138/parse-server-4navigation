/*

curl -X POST \
  -H "X-Parse-Application-Id: kP6KipEEmdj9w5aZLt6r" \
  -H "Content-Type: application/json" \
  -d '{
  	"donateType": "monthly",
  	"donateMoney": "1130",
  	"receiptTitle" : "金城武",
  	"receiptAddress" : "新竹縣竹北光明一路100",
  	"email" : "avery.hou@gmail.com",
  	"cardNo" : "0001122334401238",
  	"cardNoYY" : "04",
  	"cardNoMM" : "20",
  	"cardNoCVC" : "987",
  	"cellPhone" : "0919188224",
  	"homePhone" : "02-23093138"
  
  }' \
  https://donate2navi.herokuapp.com/parse/functions/submitDonateForm
  
  
  curl -X POST \
  -H "X-Parse-Application-Id: kP6KipEEmdj9w5aZLt6r" \
  -H "Content-Type: application/json" \
  -d '{
  	"applyId": "DzekmDgcT8",
  	"status": "contacted"
  }' \
  https://donate2navi.herokuapp.com/parse/functions/updateDonateStatus
  
  */

require("./Math.uuid.js");
var logger = require("./mail_service.js");
var prop = require("./app_properties.js");

Parse.Cloud.define('hello', function(req, res) {
	res.success(Math.uuid(20));
});


//
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
	donateApply.set("receiptAddress", request.params.receiptAddress);	
	donateApply.set("cellPhone", request.params.cellPhone);
	donateApply.set("email", request.params.email);
	donateApply.set("cardNo", request.params.cardNo);
	donateApply.set("cardNoYY", request.params.cardNoYY);
	donateApply.set("cardNoMM", request.params.cardNoMM);
	donateApply.set("cardNoCVC", request.params.cardNoCVC);
	if (request.params.homePhone != null) {
		donateApply.set("homePhone", request.params.homePhone);
	}
	
	//var acl = new Parse.ACL();
	//acl.setPublicReadAccess(true);
	//donateApply.setACL(acl);
	donateApply.save(null,{
		success: function(donateApplyCreated){
			response.success(donateApplyCreated.id);
			
		},
		error: function(err) {
			response.error("submitDonateForm failed." + err);
		}		
	});
});

// 查詢捐款申請
Parse.Cloud.define("findApplicationByPhone", function(request, response) {
	var query  = new Parse.Query("NV_DonationApply");
	if (request.params.queryType == "phone") {
		query.equalTo("cellPhone", request.params.cellPhone);
	} else {
		query.equalTo("email", request.params.email);	
	}
	query.ascending("createdAt");
	query.find({
		success: function(results) {
			response.success(results);
    	},
    	error: function(err) {
			console.error("findApplicationByPhone failed" + err.code + "," + err.message);
      	  	response.error(err);      	  	
    	}	
	});
});


/* ########### trigger ############# */

Parse.Cloud.afterSave("NV_DonationApply", function(request) {
	/*
	if (request.object.get("email") != null) {
		if( request.object.get("status") == "applying") {
		
			var donateType = request.object.get("donateType");
			if (donateType == "once") 
			
			var mailSubj = "已收到您的捐款單，我們會儘速與您聯絡，謝謝";
			var body = request.object.get("receiptTitle") + " 您好,<BR><BR>";
			
			body += "感謝您對領航協會的支持，您的捐款申請單已收到，我們的專員會儘速與您聯絡。<BR><BR>";
			
			body += "以下是您的捐款申請資料 -<BR>";
			
			body += "捐款方式: <font color='red'>" + ((donateType == "once")? "單次捐款" : "每月定期") + "</font><BR>";
			body += "捐款金額: <font color='red'>$" + request.object.get("donateMoney") + "</font><BR>";
			
			body += "手機: " + request.object.get("cellPhone") + "<BR>";
			body += "市話: " + request.object.get("homePhone") + "<BR>";
			body += "收據寄送地址: " + request.object.get("receiptAddress") + "<BR>";
			
			body += "信用卡: " + "************" + request.object.get("cardNo").substr(12,16) + "<BR><BR>";
			
			
			body += "領航協會全體人員感謝您的愛心，祝您順心!<BR><BR>";
			body += "領航協會聯絡方式:<BR>";
			body += "電話:02-23093138<BR>";
			
			logger.send_notify(request.object.get("email"), "", "已收到您的捐款單，我們會儘速與您聯絡，謝謝", body);
			
			
			var applicationInfo = "您可以透過下面的連結查看申請資料處理狀態 :<BR><BR>";
			//applicationInfo += "http://donate.navi.love/application.html?accessToken=" + request.object.id + request.object.get("accessToken");
			applicationInfo += "http://donate.navi.love/application.html";
			
			logger.send_notify(prop.admin_mail(), "", "有一筆新的捐款單，捐款人:" + request.object.get("receiptTitle") + "(" + request.object.get("cellPhone") + ")" , applicationInfo);
			return true;
			
		} else if( request.object.get("status") == "contacted") {
			var body = request.object.get("receiptTitle") + " 您好,<BR><BR>";
			
			body += "感謝您撥空與我們做資料確認，捐款金額確定扣款後會再通知您<BR><BR>";
			
			body += "以下是您的捐款申請資料 -<BR>";
			
			body += "捐款方式: <font color='red'>" + ((donateType == "once")? "單次捐款" : "每月定期") + "</font><BR>";
			body += "捐款金額: <font color='red'>$" + request.object.get("donateMoney") + "</font><BR>";
			body += "信用卡: " + "************" + request.object.get("cardNo").substr(12,16) + "<BR><BR>";
			
			
			body += "領航協會全體人員感謝您的愛心，祝您順心!<BR><BR>";
			body += "領航協會聯絡方式:<BR>";
			body += "電話:02-23093138<BR>";
			
			logger.send_notify(request.object.get("email"), "", "感謝您撥空與我們做資料確認", body);
			
			
			var applicationInfo = "您可以透過下面的連結查看申請資料<BR><BR>";
			applicationInfo += "http://donate.navi.love/application.html?accessToken=" + request.object.id + request.object.get("accessToken");
			
			return true;
		
		} else if( request.object.get("status") == "paid") {
			var body = request.object.get("receiptTitle") + " 您好,<BR><BR>";
			
			body += "感謝您，捐款金額已確定扣款<BR><BR>";
			
			body += "以下是您的捐款申請資料 -<BR>";
			
			body += "捐款方式: <font color='red'>" + ((donateType == "once")? "單次捐款" : "每月定期") + "</font><BR>";
			body += "捐款金額: <font color='red'>$" + request.object.get("donateMoney") + "</font><BR>";
			body += "信用卡: " + "************" + request.object.get("cardNo").substr(12,16) + "<BR><BR>";
			
			
			body += "領航協會全體人員感謝您的愛心，祝您順心!<BR><BR>";
			body += "領航協會聯絡方式:<BR>";
			body += "電話:02-23093138<BR>";
			
			logger.send_notify(request.object.get("email"), "", "感謝您，捐款金額已確定扣款", body);
			
			
			var applicationInfo = "您可以透過下面的連結查看申請資料<BR><BR>";
			applicationInfo += "http://donate.navi.love/application.html?accessToken=" + request.object.id + request.object.get("accessToken");
				
		}
	}
	*/
});



Parse.Cloud.define("updateDonateStatus", function(request, response) {
	Parse.Cloud.useMasterKey();
	
	var query = new Parse.Query("NV_DonationApply");
    query.get(request.params.applyId, {
	  	success: function(applyFound) {
	  		applyFound.set("status", request.params.status);
	  		applyFound.save(null,{
				success: function(applySaved){
					response.success(true);
			    },
				error: function(err) {
					logger.send_error(logger.subject("updateDonateStatus", "save NV_DonationApply"), err); 
					response.error(err);
				}		
			});
	 	},
	  	error: function(object, err) {
			logger.send_error(logger.subject("updateDonateStatus", "query NV_DonationApply error."), err);
			response.error(err);
	  	}
	});
});

