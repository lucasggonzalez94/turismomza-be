import slugify from "slugify";
import prisma from "../prismaClient";
import { Attraction } from "@prisma/client";
import axios from "axios";

export const moderateText = async (content: string) => {
  const apiKey = process.env.PERSPECTIVE_API_KEY;
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;

  const response = await axios.post(url, {
    comment: { text: content },
    languages: ["es"],
    requestedAttributes: { TOXICITY: {} },
  });

  const toxicityScore =
    response.data.attributeScores.TOXICITY.summaryScore.value;
  return toxicityScore < 0.4;
};

export const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const generateUniqueSlug = async (title: string) => {
  const baseSlug = slugify(title, { lower: true, remove: /[*+~.()'"!:@]/g });
  let slug = baseSlug;
  let attractionExists = await prisma.attraction.findUnique({
    where: { slug },
  });
  let count = 1;

  while (attractionExists) {
    slug = `${baseSlug}-${count}`;
    attractionExists = await prisma.attraction.findUnique({
      where: { slug },
    });
    count++;
  }

  return slug;
};

export const getMaxPrice = (attractions: Attraction[]) => {
  const prices = attractions
    .map((attranction) => attranction.price)
    .filter((price) => price !== null && price !== undefined);

  const maxPrice = Math.max(...prices);

  return maxPrice;
};

const filterInappropriateContent = (results: any[]) => {
  return results.some(
    (concept: { name: string; value: number }) =>
      (concept.name === "explicit" ||
        concept.name === "gore" ||
        concept.name === "suggestive" ||
        concept.name === "drug") &&
      concept.value > 0.4
  );
};

const Clarifai = require("clarifai");

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY,
});

export const analyzeImage = async (imageUrl: string) => {
  try {
    const response = await clarifai.models.predict(
      Clarifai.MODERATION_MODEL,
      imageUrl
    );
    const result = filterInappropriateContent(
      response.outputs[0].data.concepts
    );
    return result;
  } catch (error) {
    throw new Error("Error analizando la imagen");
  }
};
