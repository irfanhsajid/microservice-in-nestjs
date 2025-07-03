export interface ISmsProvider {
  to(phone: string | string[]): ISmsProvider;
  message(message: string): ISmsProvider;
  setMedia(url: string | string[]): ISmsProvider;
  setFrom(from: string): ISmsProvider;
  setStatusCallback(callbackUrl: string): ISmsProvider;
  send(): Promise<void>;
}

export abstract class SMSProvider implements ISmsProvider {
  protected body: string | null = null;
  protected receiver: string | string[] | null = null;
  protected from: string | null = null;
  protected mediaUrl: string | string[] | null = null;
  protected statusCallback: string | null = null;

  public to(phone: string | string[]): ISmsProvider {
    this.receiver = phone;
    return this;
  }

  public message(message: string): ISmsProvider {
    this.body = message;
    return this;
  }

  public setMedia(url: string | string[]): ISmsProvider {
    this.mediaUrl = url;
    return this;
  }

  public abstract send(): Promise<void>;

  public setFrom(from: string): ISmsProvider {
    this.from = from;
    return this;
  }

  public setStatusCallback(callbackUrl: string): ISmsProvider {
    this.statusCallback = callbackUrl;
    return this;
  }
}
