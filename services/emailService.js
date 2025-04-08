const mailjet = require('node-mailjet');
const { mailjetPublicKey, mailjetPrivateKey, emailFrom } = require('../config/auth');

const mailjetClient = mailjet.connect(mailjetPublicKey, mailjetPrivateKey);

const sendVerificationEmail = async (email, mailToken) => {
    try {
        const request = mailjetClient
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages":[
                    {
                        "From": emailFrom,
                        "To": [
                            {
                                "Email": email,
                                "Name": "User"
                            }
                        ],
                        "Subject": "Blearn Email Verification",
                        "HTMLPart": 
                            `<div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #333;">Blearn Email verification</div>
                                <p style="font-size: 18px; color: #555; margin-top: 20px;">Danke fürs registrieren bei Blearn!!!</p>
                                <p style="font-size: 18px; color: #555; margin-top: 20px;">Dein verification code ist:</p>
                                <p style="display: inline-block; padding: 24px 48px; background-color: #007bff; color: #ffffff; font-size: 32px; border-radius: 6px; margin-top: 20px; font-weight: bold;">${mailToken}</p>
                                <p style="font-size: 12px; color: #777; margin-top: 20px;">Wenn du dich nicht registriert hast, kannst du diese E-Mail ignorieren</p>
                            </div>`
                    }
                ]
            });
        
        const result = await request;
        console.log("Email sent successfully");
        return result;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail
};