import axios from "axios";

export class TextModerationService {
  static moderateText = async (content: string) => {
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
}
