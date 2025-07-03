interface TwilioConfig {
  twilio: {
    account_sid: string;
    account_auth_token: string;
    default_from: string;
  };
}
export default () =>
  ({
    twilio: {
      account_sid: process.env.TWILIO_ACCOUNT_SID || null,
      account_auth_token: process.env.TWILIO_AUTH_TOKEN || null,
      default_from: process.env.TWILIO_DEFAULT_FROM || null,
    },
  }) as TwilioConfig;
