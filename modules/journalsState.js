const data = [
  {
    id: "23254687612",
    datum: "",
    titel: "Test titel",
    content: "Dit is een test om te zien of het object en de state werken.",
    tags: ["#titel", "#test", "#content"],
  },
  {
    id: "87345623451",
    datum: "",
    titel: "Tittel 2",
    content: "Het laatste nieuws in de buurt van kakkegem.",
    tags: ["#buurt", "#apekool", "#testikkel"],
  },
  {
    id: "6753568964",
    datum: "",
    titel: "Titel van de eeuw",
    content: "Gewoon wat zeveren om de boel op te vullen.",
    tags: ["#aap", "#lul", "#testikkel", "#bananenshil"],
  },
];

const STORAGE_KEY = "journal_items";

const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

const state = {
  journals: saved || [],
  currentId: "",
};

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.journals));
}

function addJournal(journal) {
  state.journals.push(journal);
  saveToStorage();
}

function deleteJournal(id) {
  const index = state.journals.findIndex((jour) => jour.id === id);
  if (index !== -1) {
    state.journals.splice(index, 1);
    saveToStorage();
  }

  if (state.currentId === id) {
    state.currentId = "";
  }
}

function setCurrentId(id) {
  state.currentId = id;
}

function filterJournals(query) {
  if (!query) return state.journals;

  const cleanQuery = query.trim().toLowerCase();
  const terms = cleanQuery.split(/\s+/);

  const tagTerms = terms
    .filter((t) => t.startsWith("#"))
    .map((t) => t.slice(1));
  const keywordTerms = terms.filter((t) => !t.startsWith("#"));

  return state.journals.filter((journal) => {
    const hasAllTags = tagTerms.every((tagQuery) =>
      journal.tags.some((tag) => tag.toLowerCase().includes(tagQuery))
    );

    const matchesKeyword = keywordTerms.some((kw) => {
      return (
        journal.titel.toLowerCase().includes(kw) ||
        journal.content.toLowerCase().includes(kw)
      );
    });

    const tagsOk = tagTerms.length === 0 || hasAllTags;
    const keywordsOk = keywordTerms.length === 0 || matchesKeyword;

    return tagsOk && keywordsOk;
  });
}

function updateJournal(updated) {
  const index = state.journals.findIndex((j) => j.id === updated.id);
  if (index !== -1) {
    state.journals[index] = updated;
    saveToStorage();
  }
}

export {
  addJournal,
  deleteJournal,
  setCurrentId,
  filterJournals,
  updateJournal,
  state,
};
