export class ProfilePicture {
  constructor(public id: string, public public_id: string, public url: string) {
    this.id = id;
    this.public_id = public_id;
    if (!url.includes("http")) {
      throw new Error("Invalid image URL");
    }
    this.url = url;
  }
}
