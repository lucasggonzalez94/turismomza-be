export class Favorite {
  constructor(
    public id: string,
    public userId: string,
    public placeId?: string,
    public addedDate?: Date
  ) {}
}
