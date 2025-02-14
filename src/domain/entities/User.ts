import { ProfilePicture } from "../value-objects/ProfilePicture";
import { Advertisement } from "./Advertisement";
import { Favorite } from "./Favorite";
import { Like } from "../value-objects/Like";
import { Place } from "./Place";
import { RefreshToken } from "./RefreshToken";
import { Review } from "./Review";
import { Notification } from "./Notification";
import { Report } from "./Report";

export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: "viewer" | "publisher" | "admin",
    public twoFactorEnabled: boolean,
    public twoFactorCode?: string,
    public twoFactorExpires?: Date,
    public createdAt?: Date,
    public profilePicture?: ProfilePicture,
    public places?: Place[],
    public reviews?: Review[],
    public favorites?: Favorite[],
    public notifications?: Notification[],
    public likes?: Like[],
    public reports?: Report[],
    public advertisements?: Advertisement[],
    public refreshToken?: RefreshToken
  ) {
    this.validate();
  }

  validate() {
    if (!this.email.includes("@")) throw new Error("Email inválido.");
    if (this.password.length < 6)
      throw new Error("Contraseña demasiado corta.");
  }

  enableTwoFactorAuth(code: string) {
    this.twoFactorEnabled = true;
    this.twoFactorCode = code;
    this.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
  }
}
