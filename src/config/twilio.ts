interface TwilioConfig {
  twilio: {
    account_sid: string;
    account_auth_token: string;
  };
}
export default () =>
  ({
    twilio: {
      account_sid: process.env.TWILIO_ACCOUNT_SID || null,
      account_auth_token: process.env.TWILIO_AUTH_TOKEN || null,
    },
  }) as TwilioConfig;
