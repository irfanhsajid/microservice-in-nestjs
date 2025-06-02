export abstract class Resource<T extends Record<string, any>> {
  [key: string]: any;

  constructor(properties: T) {
    Object.assign(this, properties);
  }
  abstract toJSON(): unknown;
}
