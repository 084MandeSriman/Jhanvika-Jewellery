// Pluggable SMS provider. Dev default just logs the OTP to console so the
// flow is fully testable without a real SMS gateway account. To go live,
// set SMS_PROVIDER=twilio (or msg91) and the matching credentials in .env —
// swap the dev branch below for a real API call, no other code changes needed.
export async function sendSMS(to, message) {
  if (process.env.SMS_PROVIDER === "twilio" && process.env.TWILIO_SID) {
    // Example real integration (uncomment once you have a Twilio account):
    //
    // import twilio from "twilio";
    // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // return client.messages.create({ body: message, from: process.env.TWILIO_FROM, to });
    console.warn("SMS_PROVIDER=twilio is set but the Twilio SDK call is commented out — add credentials and uncomment to go live.");
  }

  console.log(`\n📱 [DEV SMS] To: ${to} | ${message}`);
  console.log(`   (No SMS provider configured — message logged, not sent. Set SMS_PROVIDER + credentials in .env to send for real.)`);
  return { dev: true };
}
