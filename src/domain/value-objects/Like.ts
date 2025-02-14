export class Like {
  constructor(
    public id: string,
    public userId: string,
    public reviewId: string,
    public like: boolean,
    public creationDate?: Date
  ){}
}