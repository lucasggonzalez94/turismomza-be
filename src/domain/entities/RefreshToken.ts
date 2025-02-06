export class RefreshToken {
  constructor(
    public id: string,
    public token: string,
    public userId: string,
    public createdAt: Date,
    public expiresAt: Date
  ) {}

  isValid(): boolean {
    return new Date() < this.expiresAt;
  }
}
