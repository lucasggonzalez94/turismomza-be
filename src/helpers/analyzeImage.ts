const Clarifai = require("clarifai");

const clarifai = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY,
});

const isImageAppropriate = (results: any[]) => {
  // Buscar el concepto "safe" y los conceptos de contenido explícito
  const safeScore = results.find(concept => concept.name === "safe")?.value || 0;
  const explicitScore = results.find(concept => concept.name === "explicit")?.value || 0;
  const suggestiveScore = results.find(concept => concept.name === "suggestive")?.value || 0;
  const drugsScore = results.find(concept => concept.name === "drug")?.value || 0;
  const goreScore = results.find(concept => concept.name === "gore")?.value || 0;
  
  // Considerar la imagen como apropiada si:
  // 1. Tiene una alta puntuación de "safe" (> 0.7)
  // 2. Y bajas puntuaciones en categorías inapropiadas
  return (
    safeScore > 0.7 && 
    explicitScore < 0.2 && 
    suggestiveScore < 0.3 &&
    drugsScore < 0.2 &&
    goreScore < 0.2
  );
};

export const analyzeImage = async (imageUrl: string) => {
  try {
    const response = await clarifai.models.predict(
      Clarifai.MODERATION_MODEL,
      imageUrl
    );
    
    const concepts = response.outputs[0].data.concepts;
    
    console.log("Resultados de moderación de Clarifai:", 
      concepts.map((c: any) => `${c.name}: ${c.value.toFixed(2)}`).join(", ")
    );
    
    const isAppropriate = isImageAppropriate(concepts);
    console.log(`Imagen ${isAppropriate ? 'apropiada' : 'inapropiada'}: ${imageUrl}`);
    
    return isAppropriate;
  } catch (error) {
    console.error("Error al analizar la imagen con Clarifai:", error);
    throw new Error("Error analizando la imagen");
  }
};
