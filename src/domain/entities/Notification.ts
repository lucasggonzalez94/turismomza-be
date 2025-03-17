import { ProfilePicture } from "../value-objects/ProfilePicture";

export class Notification {
  constructor(
    public id: string,
    public userId: string,
    public type: "review" | "like",
    public message: string,
    public read: boolean,
    public triggeredBy?: {
      id: string;
      name: string;
      profilePicture: ProfilePicture | null;
    },
    public creationDate?: Date
  ) {}
}
