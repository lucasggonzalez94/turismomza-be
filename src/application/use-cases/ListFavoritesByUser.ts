import { FavoriteRepository } from "../../domain/ports/FavoriteRepository";

export class ListFavoritesByUser {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(
    userId: string,
    pagination: { page: number; pageSize: number }
  ): Promise<{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    data: any[];
  }> {
    const { total, places } = await this.favoriteRepository.getByUser(userId, pagination);

    const page = pagination.page;
    const pageSize = pagination.pageSize;
    const totalPages = Math.ceil(total / pageSize);

    return {
      total,
      page,
      pageSize,
      totalPages,
      data: places,
    };
  }
}

export default ListFavoritesByUser;
