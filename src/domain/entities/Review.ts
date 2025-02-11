import { Like } from "./Like";
import { Report } from "./Report";

export class Review {
  constructor(
    public id: string,
    public content: string,
    public rating: number | null,
    public userId: string,
    public creationDate: Date,
    public placeId?: string,
    public likes?: Like[],
    public reports?: Report[],
  ) {
    // TODO: Agregar validaciones
  }
}
