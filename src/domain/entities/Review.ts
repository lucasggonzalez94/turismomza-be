import { Like } from "./Like";
import { Report } from "./Report";

export class Review {
  constructor(
    public id: string,
    public content: string,
    public rating: number | null,
    public userId: string,
    public placeId: string,
    public creationDate?: Date,
    public likes?: Like[],
    public reports?: Report[],
  ) {
    // TODO: Agregar validaciones
  }
}
