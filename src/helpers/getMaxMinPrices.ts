import { Place } from "../domain/entities/Place";

export const getMaxMinPrices = (places: Place[]) => {
  const prices = places
    .map((attranction) => attranction.price)
    .filter((price) => price !== null && price !== undefined);

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  return { maxPrice, minPrice };
};