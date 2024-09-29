const Clarifai = require('clarifai');

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
});

const filterInappropriateContent = (results: any[]) => {
  return results.some((concept: { name: string, value: number }) => 
    (concept.name === 'explicit' || concept.name === 'gore' || concept.name === 'suggestive' || concept.name === 'drug') && concept.value > 0.9
  );
}

export const analyzeImage = async (imageUrl: string) => {
  try {
    const response = await clarifai.models.predict(Clarifai.MODERATION_MODEL, imageUrl);
    return filterInappropriateContent(response.outputs[0].data.concepts);
  } catch (error) {
    throw new Error('Error analizando la imagen');
  }
}