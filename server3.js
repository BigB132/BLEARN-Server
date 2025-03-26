/**
 *
 * This call sends a message to one recipient.
 *
 */
const mailjet = require ('node-mailjet')
	.connect("2f74cf55d61d7b701b4aee56a22398f5", "86321f7ce70a736e1457347e716953f9")
const request = mailjet
	.post("send", {'version': 'v3.1'})
	.request({
		"Messages":[
			{
			    "From": {
				    "Email": "hanzfranzdermaster@gmail.com",
				    "Name": "Hanz Franz"
				},
				"To": [
					{
						"Email": "cosif56928@avulos.com",
						"Name": "User"
					}
				],
				"Subject": "Your email flight plan!",
				"TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
				"HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
			}
		]
	})
request
	.then((result) => {
		console.log(result.body)
	})
	.catch((err) => {
		console.log(err.statusCode)
    })