export async function getFlashcardsBySetId(id: string) {
  const response = await fetch(`/api/sets/${id}`);
  const data = await response.json();
  return data.flashcards
}
