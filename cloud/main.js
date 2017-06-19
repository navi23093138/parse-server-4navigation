/*

curl -X POST \
  -H "X-Parse-Application-Id: kP6KipEEmdj9w5aZLt6r" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://donate2navi.herokuapp.com/parse/functions/hello
  
  */

require("./Math.uuid.js");

Parse.Cloud.define('hello', function(req, res) {
	res.success(Math.uuid(10));
});


//user
// -user
// -user
// insert donate data
// send mail
// return 