import { Place } from "../domain/entities/Place";

export const getMaxMinPrices = (places: Place[]) => {
  const prices = places
    .map((attranction) => attranction.price)
    .filter((price) => price !== null && price !== undefined);

  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;

  return { maxPrice, minPrice };
};