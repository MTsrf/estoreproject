require('dotenv').config()
const serviceSid=process.env.TWILIO_SERVICE_SID
const accountSid=process.env.TWILIO_ACOUNT_SID
const authToken =process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)


module.exports ={
    doSms:(noData)=>{
        console.log(noData.phone_number);
        return new Promise(async(resolve,reject)=>{
            let res = {}
            client.verify.services(serviceSid).verifications.create({
                to : `+91${noData.phone_number}`,
                channel:"sms"
            }).then((res)=>{
                resolve(res)
            })
        })
    },
    otpVerify:(otpData,nuData)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${nuData.phone_number}`,
                code: otpData.otp
            }).then((response)=>{
                resolve(response)
            })
        })
    }
}