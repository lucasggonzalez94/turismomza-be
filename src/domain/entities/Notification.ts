export class Notification {
  constructor(
    public id: string,
    public userId: string,
    public type: "review" | "like",
    public message: string,
    public read: boolean,
    public creationDate: Date
  ) {}
}
