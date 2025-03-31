import { ProfilePicture } from "../value-objects/ProfilePicture";
import { Advertisement } from "./Advertisement";
import { Favorite } from "./Favorite";
import { Like } from "../value-objects/Like";
import { Place } from "./Place";
import { Review } from "./Review";
import { Notification } from "./Notification";
import { Report } from "./Report";

export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public role: "viewer" | "publisher" | "admin",
    public twoFactorEnabled: boolean,
    public password?: string,
    public googleId?: string,
    public twoFactorCode?: string,
    public twoFactorExpires?: Date,
    public bio?: string,
    public location?: string,
    public website?: string,
    public language?: string[],
    public verified?: boolean,
    public createdAt?: Date,
    public profilePicture?: ProfilePicture,
    public places_count?: number,
    public review_count?: number,
    public places?: Place[],
    public reviews?: Review[],
    public favorites?: Favorite[],
    public notifications?: Notification[],
    public likes?: Like[],
    public reports?: Report[],
    public advertisements?: Advertisement[],
    public refreshToken?: string,
  ) {
    this.validate();
  }

  validate() {
    if (!this.email.includes("@")) throw new Error("Email inválido.");
    if (this?.password && this?.password?.length < 6)
      throw new Error("Contraseña demasiado corta.");
  }

  enableTwoFactorAuth(code: string) {
    this.twoFactorEnabled = true;
    this.twoFactorCode = code;
    this.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
  }
}
