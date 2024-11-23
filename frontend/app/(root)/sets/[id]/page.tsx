// app/sets/[setId]/page.tsx

import { Flashcard } from './Flashcard'; // Separate component for cycling and flip logic

interface FlashcardSetProps {
  params: {
    id: string;
  };
}

const FlashcardSet = async ({ params }: FlashcardSetProps) => {
  const { id } = await params;

  // Fetch flashcards data from the server based on setId
  const flashcards = await getFlashcardsBySetId(id);

  if (!flashcards || flashcards.length === 0) {
    return <div>No flashcards found for this set.</div>;
  }

  return (
    <div className="min-h-screen-nonav bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Flashcards for Set {id}</h1>
      <Flashcard cards={flashcards} />
    </div>
  );
};

// Simulating a fetch function for flashcards (you can replace this with a real API call or database query)
async function getFlashcardsBySetId(id: string) {
  // Example fetch (you can replace it with a real database or API request)
  const response = await fetch(`http://localhost:3333/sets/${id}`);
  const data = await response.json();
  return data.flashcards; // Assuming the API response has a `flashcards` field
}

export default FlashcardSet;
