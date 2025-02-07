import { Advertisement } from "./Advertisement";
import { Favorite } from "./Favorite";
import { Review } from "./Review";
import { Image } from "./Image";

export class Place {
  constructor(
    public id: string,
    public title: string,
    public slug: string,
    public description: string,
    public location: string,
    public category: string,
    public creatorId: string,
    public createdAt: Date,
    public services: string[],
    public schedule: string,
    public images: Image[],
    public reviews: Review[],
    public favorites: Favorite[],
    public advertisements: Advertisement[],
    public contactNumber?: string,
    public email?: string,
    public website?: string,
    public instagram?: string,
    public facebook?: string,
    public price?: number,
    public currencyPrice?: "ars" | "usd"
  ) {}
}
