const Clarifai = require("clarifai");

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY,
});

const filterInappropriateContent = (results: any[]) => {
  return results.some((concept: { name: string; value: number }) => {
    // return concept.name === "safe" && concept.value > 0.6;
    return true;
  });
};

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
