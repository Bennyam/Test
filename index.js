import {
  state,
  addJournal,
  setCurrentId,
  deleteJournal,
  filterJournals,
  updateJournal,
} from "./modules/journalsState.js";

const journalView = document.querySelector(".journals-list");
const journalForm = document.querySelector(".journal-new");
const newpostContainer = document.querySelector(".journal-form-container");
const detailviewContainer = document.querySelector(".journal-detail-container");
const detailTitle = document.querySelector(".detail-titel");
const detailDatum = document.querySelector(".detail-datum");
const detailTags = document.querySelector(".detail-tags");
const detailContent = document.querySelector(".detail-content");
const btnNewpost = document.querySelector(".new-post");
const btnDelete = document.querySelector(".delete");
const btnEdit = document.querySelector(".edit");
const searchField = document.querySelector(".search");

const ITEMS_PER_PAGINA = 5;
let currentPage = 1;

function formatDate(date) {
  return new Intl.DateTimeFormat("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function viewNewpostForm() {
  newpostContainer.classList.remove("hidden");
  detailviewContainer.classList.add("hidden");
}

function viewPostdetails() {
  newpostContainer.classList.add("hidden");
  detailviewContainer.classList.remove("hidden");
}

function displayJournals(journals, page = 1) {
  journalView.innerHTML = "";

  const totalPages = Math.ceil(journals.length / ITEMS_PER_PAGINA);
  const start = (page - 1) * ITEMS_PER_PAGINA;
  const end = start + ITEMS_PER_PAGINA;
  const visibleJournals = journals.slice(start, end);

  if (visibleJournals.length === 0) {
    journalView.innerHTML = `<li class="journal-empty">Geen dagboekitems gevonden.</li>`;
    document.querySelector(".pagination").innerHTML = "";
    return;
  }

  visibleJournals.forEach(function ({ id, titel, datum, tags }) {
    const html = `
        <li class="journal" data-id=${id}>
          <h2 class="journal-titel">${titel}</h2>
          <p class="journal-datum">${datum}</p>
          <p class="journal-tags">${tags.join(", ")}</p>
        </li>
        `;
    journalView.insertAdjacentHTML("afterbegin", html);
  });

  viewPaginationControls(totalPages, page);
}

function viewPaginationControls(totalPages, current) {
  const paginationEl = document.querySelector(".pagination");
  paginationEl.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Vorige";
  prevBtn.disabled = currentPage === 1;
  prevBtn.classList.add("btn-pagination");
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayJournals(state.journals, currentPage);
      const total = Math.ceil(state.journals.length / ITEMS_PER_PAGINA);
      viewPaginationControls(total, currentPage);
    }
  });
  paginationEl.appendChild(prevBtn);

  const onPage = document.createElement("p");
  onPage.textContent = currentPage;
  onPage.classList.add("current-page");
  paginationEl.appendChild(onPage);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Volgende";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.classList.add("btn-pagination");
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayJournals(state.journals, currentPage);
      viewPaginationControls(totalPages, currentPage);
    }
  });
  paginationEl.appendChild(nextBtn);
}

function updateDetailsView(journal) {
  detailTitle.textContent = `${journal.titel}`;
  detailDatum.textContent = `${journal.datum}`;
  detailTags.textContent = `${journal.tags.join(", ")}`;

  marked.setOptions({ breaks: true });

  detailContent.innerHTML = "";
  detailContent.insertAdjacentHTML("afterbegin", marked.parse(journal.content));
}

function initUi() {
  displayJournals(state.journals, currentPage);

  if (state.journals.length === 0) {
    viewNewpostForm();
    detailTitle.textContent = "Geen items beschikbaar";
    detailDatum.textContent = "";
    detailTags.textContent = "";
    detailContent.innerHTML =
      "<p>Je hebt nog geen dagboekitems toegevoegd.</p>";
  } else {
    viewPostdetails();
    const laatste = state.journals[state.journals.length - 1];
    updateDetailsView(laatste);

    document
      .querySelector(`[data-id="${laatste.id}"]`)
      ?.classList.add("journal-selected");
    setCurrentId(laatste.id);
  }

  const totalPages = Math.ceil(state.journals.length / ITEMS_PER_PAGINA);
  viewPaginationControls(totalPages, currentPage);
}

function updateUi() {
  displayJournals(state.journals, currentPage);
}

initUi();

journalForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  const isEdit = state.currentId !== "";

  const updatedJournal = {
    ...data,
    id: isEdit ? state.currentId : crypto.randomUUID(),
    datum: isEdit
      ? state.journals.find((jour) => jour.id === state.currentId).datum
      : formatDate(new Date()),
    tags: data.tags.split(",").map((tag) => tag.trim()),
  };

  if (isEdit) {
    updateJournal(updatedJournal);
  } else {
    addJournal(updatedJournal);
  }

  state.currentId = "";
  journalForm.reset();
  initUi();
});

btnNewpost.addEventListener("click", (e) => {
  state.currentId = "";
  e.preventDefault();
  viewNewpostForm();
});

journalView.addEventListener("click", function (e) {
  const alljournals = document.querySelectorAll(".journal");

  alljournals.forEach((journal) =>
    journal.classList.remove("journal-selected")
  );

  const journal = e.target.closest(".journal");
  if (!journal) return;

  const currentJournal = state.journals.find(
    (jour) => jour.id === journal.dataset.id
  );
  journal.classList.add("journal-selected");

  viewPostdetails();
  updateDetailsView(currentJournal);
  setCurrentId(currentJournal.id);
});

btnEdit.addEventListener("click", function () {
  const current = state.journals.find((jour) => jour.id === state.currentId);
  if (!current) return;

  viewNewpostForm();
  journalForm.querySelector('[name="titel"]').value = current.titel;
  journalForm.querySelector('[name="content"]').value = current.content;
  journalForm.querySelector('[name="tags"]').value = current.tags.join(", ");
});

btnDelete.addEventListener("click", function () {
  deleteJournal(state.currentId);

  if (state.journals.length > 0) {
    const last = state.journals[state.journals.length - 1];
    setCurrentId(last.id);
    initUi();
  } else {
    viewNewpostForm();
    journalView.innerHTML = "";
    detailTitle.textContent = "";
    detailDatum.textContent = "";
    detailTags.textContent = "";
    detailContent.innerHTML = "<p>Geen items meer beschikbaar.</p>";
    updateUi();
  }

  console.log(state);
});

searchField.addEventListener("input", function (e) {
  const query = e.target.value;
  const filtered = filterJournals(query);
  displayJournals(filtered);
});
