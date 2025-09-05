export default class Cursor {
  public static encode(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  public static decode(data: string): Record<string, any> {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  }
}
