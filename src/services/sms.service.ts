import { ExternalEntity } from "../utils/constant";
import { getExternalCred } from "./credentialService";

const axios = require("axios");

export class SmsService {
  static async sendSmsUsingNimbus(to: string, message: string) {
    console.log("to = " + to);
    console.log("message = " + message);

    let creObj: any = {
      type: ExternalEntity.SMS,
    };

    let credentialsData: any = await getExternalCred(creObj);

    const username = credentialsData.username;
    const password = credentialsData.password;
    const sender = credentialsData.sender_id;
    const entityID = credentialsData.entity_id;
    const templateID = credentialsData.template_id;

    // Construct the URL for the API request
    //const apiUrl = `http://nimbusit.co.in/api/swsendSingle.asp?username=${username}&password=${password}&sender=${sender}&sendto=${to}&entityID=${entityID}&templateID=${templateID}&message=${encodeURIComponent(message)}`;
    // const apiUrl = `${
    //   credentialsData.api_base_url
    // }username=${username}&password=${password}&sender=${sender}&sendto=${to}&entityID=${entityID}&templateID=${templateID}&message=${encodeURIComponent(
    //   message
    // )}`;

    console.log("username-", username);
    console.log("password-", password);

   // UserID=#USSERID#&Password=#Password#&SenderID=#SENDERID#&Phno=#PHONE#&Msg=#MSG#&EntityID=#EntityID#&TemplateID=#TEMPLATEID#


    const apiUrl = `${
      credentialsData.api_base_url
    }UserID=${username}&Password=${password}&SenderID=${sender}&Phno=${to}&EntityID=${entityID}&TemplateID=${templateID}&Msg=${encodeURIComponent(
     message
    )}`;
   
    //username=${username}&password=${password}&sender=${sender}&sendto=${to}&entityID=${entityID}&templateID=${templateID}&message=${encodeURIComponent(
    //  message
    // )}`;
    console.log(apiUrl);

    

    // const username = process.env.NIMBUS_UID;
    // const password = process.env.NUMBUS_PWD;
    // const sender = process.env.NIMBUS_SENDERID;
    // const entityID = process.env.NIMBUS_ENTITYID;
    // const templateID = process.env.NIMBUS_TEMPLATEID;

    // Construct the URL for the API request
    //const apiUrl = `http://nimbusit.co.in/api/swsendSingle.asp?username=${username}&password=${password}&sender=${sender}&sendto=${to}&entityID=${entityID}&templateID=${templateID}&message=${encodeURIComponent(message)}`;
    // const apiUrl=`${process.env.NIMBUS_URL}username=${username}&password=${password}&sender=${sender}&sendto=${to}&entityID=${entityID}&templateID=${templateID}&message=${encodeURIComponent(message)}`
    // console.log(apiUrl)

    //http://nimbusit.co.in/api/swsendSingle.asp?username=t1vedant&password=LalitVDNPA007&sender=VDNPAY&sendto=919xxxx&entityID=170134xxxxxxxxx&templateID=1207168612639973529&message=hello
    try {
      const response = await axios.get(apiUrl);
      console.log(response.data, "response.data");
      return response.data; // The response from the SMS API
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      throw new Error("Failed to send SMS");
    }
  }
}
