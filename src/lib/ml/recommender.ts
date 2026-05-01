export function getSimilarEvents(targetEventId: string, allEvents: any[], k = 3) {
  const targetEvent = allEvents.find((event) => event.id === targetEventId);

  if (!targetEvent) return [];

  const stopwords = new Set([
    "the", "and", "a", "an", "to", "of", "in", "for", "on", "with", "at", "is"
  ]);

  function tokenize(event: any): string[] {
    const text = [
      event.title,
      event.description,
      event.category,
      ...(event.tags || []),
      event.category,
      ...(event.tags || [])
    ].join(" ");

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word && !stopwords.has(word));
  }

  const documents = allEvents.map((event) => tokenize(event));

  const vocabulary = Array.from(new Set(documents.flat()));

  function termFrequency(tokens: string[], term: string) {
    return tokens.filter((token) => token === term).length / tokens.length;
  }

  function inverseDocumentFrequency(term: string) {
    const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;
    return Math.log(documents.length / (1 + docsWithTerm));
  }

  function vectorise(tokens: string[]) {
    return vocabulary.map((term) => termFrequency(tokens, term) * inverseDocumentFrequency(term));
  }

  function cosineSimilarity(a: number[], b: number[]) {
    const dot = a.reduce((sum, value, i) => sum + value * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
    const magB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));

    if (magA === 0 || magB === 0) return 0;

    return dot / (magA * magB);
  }

  const targetIndex = allEvents.findIndex((event) => event.id === targetEventId);
  const targetVector = vectorise(documents[targetIndex]);

  return allEvents
    .map((event, index) => ({
      ...event,
      similarity: cosineSimilarity(targetVector, vectorise(documents[index])),
    }))
    .filter((event) => event.id !== targetEventId)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}