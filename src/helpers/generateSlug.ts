import slugify from "slugify";
import prisma from "../infrastructure/database/prismaClient";

export const generateSlug = async (title: string) => {
  const baseSlug = slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g });
  let slug = baseSlug;
  let placeExists = await prisma.place.findUnique({
    where: { slug },
  });
  let count = 1;

  while (placeExists) {
    slug = `${baseSlug}-${count}`;
    placeExists = await prisma.place.findUnique({
      where: { slug },
    });
    count++;
  }

  return slug;
};
