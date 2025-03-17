export class ProfilePicture {
  constructor(public id: string, public publicId: string, public url: string) {
    this.id = id;
    this.publicId = publicId;
    if (!url.includes("http")) {
      throw new Error("Invalid image URL");
    }
    this.url = url;
  }
}
