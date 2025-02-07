export class RefreshToken {
  constructor(
    public id: string,
    public token: string,
    public userId: string,
    public createdAt: Date,
    public expiresAt: Date
  ) {
    this.isValid();
  }

  isValid() {
    if (new Date() >= this.expiresAt) {
      throw new Error("Refresh token expirado.");
    }
  }
}
