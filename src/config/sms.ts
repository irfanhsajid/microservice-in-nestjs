interface SMSConfig {
  sms: {
    provider: string;
  };
}
export default () =>
  ({
    sms: {
      default: process.env.SMS_DEFAULT_PRIVIDER || null,
      provider: process.env.SMS_PRIVIDER || 'twilio',
    },
  }) as SMSConfig;
