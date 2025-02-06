export class Advertisement {
  constructor(
    public id: string,
    public placeId: string,
    public userId: string,
    public createdAt: Date,
    public startDate: Date,
    public endDate: Date,
    public amountPaid: number,
    public isActive: boolean,
    public impressions: number,
    public clicks: number,
  ) {}
}