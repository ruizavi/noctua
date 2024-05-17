export class HttpError extends Error {
  public declare description: any;
  public declare status: number;
  constructor(
    { description, status = 500 }: { description: any; status: number },
    ...args: any
  ) {
    super(...args);
    this.description = description;
    this.status = status;

    Error.captureStackTrace(this, HttpError);
  }
}
