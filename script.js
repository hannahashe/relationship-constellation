const svg = document.querySelector("#constellation-map");
const detailsPanel = document.querySelector("#details-panel");

const addPersonForm = document.querySelector("#add-person-form");

const personNameInput = document.querySelector("#person-name");
const personCategoryInput = document.querySelector("#person-category");
const personClosenessInput = document.querySelector("#person-closeness");
const personStatusInput = document.querySelector("#person-status");
const personNotesInput = document.querySelector("#person-notes");
const personSubmitButton = addPersonForm.querySelector("button[type='submit']");
const cancelEditButton = document.querySelector("#cancel-edit-button");

const addLinkForm = document.querySelector("#add-link-form");

const linkSourceSelect = document.querySelector("#link-source");
const linkTargetSelect = document.querySelector("#link-target");
const resetLayoutButton = document.querySelector("#reset-layout-button");

let selectedPersonId = null;
let editingPersonId = null;
let draggedPersonId = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

const me = {
  id: "me",
  name: "Me",
  x: 400,
  y: 300,
  radius: 42,
};

let people = [
  {
    id: "p1",
    name: "J",
    category: "partner",
    closeness: 5,
    status: "close / intense",
    notes: "A very significant relationship in my daily life.",
    x: 560,
    y: 260,
    radius: 32,
  },
  {
    id: "p2",
    name: "M",
    category: "family",
    closeness: 4,
    status: "close / emotionally important",
    notes: "Family connection with practical and emotional significance.",
    x: 260,
    y: 220,
    radius: 32,
  },
  {
    id: "p3",
    name: "A",
    category: "friend",
    closeness: 3,
    status: "uncertain / reconnecting",
    notes: "A friendship I may want to understand more clearly.",
    x: 520,
    y: 420,
    radius: 32,
  },
  {
    id: "p4",
    name: "H",
    category: "friend",
    closeness: 3,
    status: "uncertain / reconnecting",
    notes: "A friendship with some social/emotional complexity.",
    x: 280,
    y: 410,
    radius: 32,
  },
];

let links = [];

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    tagName,
  );

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  return element;
}

function savePeople() {
  localStorage.setItem(
    "relationshipConstellationPeople",
    JSON.stringify(people),
  );
}

function loadPeople() {
  const savedPeople = localStorage.getItem("relationshipConstellationPeople");

  if (savedPeople) {
    people = JSON.parse(savedPeople);
  }
}

function saveLinks() {
  localStorage.setItem("relationshipConstellationLinks", JSON.stringify(links));
}

function loadLinks() {
  const savedLinks = localStorage.getItem("relationshipConstellationLinks");

  if (savedLinks) {
    links = JSON.parse(savedLinks);
  }
}

function getRandomOrbitPosition() {
  const angle = Math.random() * Math.PI * 2;
  const distanceFromCentre = 170 + Math.random() * 130;

  return {
    x: me.x + Math.cos(angle) * distanceFromCentre,
    y: me.y + Math.sin(angle) * distanceFromCentre,
  };
}

function resetLayout() {
  const confirmed = confirm("Reset everyone into a fresh orbit around Me?");

  if (!confirmed) {
    return;
  }

  people = people.map(function (person) {
    const position = getRandomOrbitPosition();

    return {
      ...person,
      x: position.x,
      y: position.y,
    };
  });

  selectedPersonId = null;
  savePeople();

  detailsPanel.innerHTML = `
    <h2>Selected person</h2>
    <p>Click a person on the map to see details here.</p>
  `;

  renderMap();
}

function updatePersonSelects() {
  const defaultOption = '<option value="">Choose a person</option>';

  linkSourceSelect.innerHTML = defaultOption;
  linkTargetSelect.innerHTML = defaultOption;

  people.forEach(function (person) {
    const sourceOption = new Option(person.name, person.id);
    const targetOption = new Option(person.name, person.id);

    linkSourceSelect.appendChild(sourceOption);
    linkTargetSelect.appendChild(targetOption);
  });
}

function findPersonById(id) {
  return people.find(function (person) {
    return person.id === id;
  });
}

function getSvgPoint(event) {
  const point = svg.createSVGPoint();

  point.x = event.clientX;
  point.y = event.clientY;

  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function updatePersonPosition(personId, x, y) {
  const person = findPersonById(personId);

  if (!person) {
    return;
  }

  person.x = x;
  person.y = y;
}

function renderLine(
  source,
  target,
  className = "connection-line",
  extraAttributes = {},
) {
  const line = createSvgElement("line", {
    x1: source.x,
    y1: source.y,
    x2: target.x,
    y2: target.y,
    class: className,
    ...extraAttributes,
  });

  svg.appendChild(line);
}

function deletePerson(personId) {
  const personToDelete = findPersonById(personId);

  if (!personToDelete) {
    return;
  }

  const confirmed = confirm(
    `Delete ${personToDelete.name} from your constellation?`,
  );

  if (!confirmed) {
    return;
  }

  people = people.filter(function (person) {
    return person.id !== personId;
  });

  links = links.filter(function (link) {
    return link.sourceId !== personId && link.targetId !== personId;
  });

  selectedPersonId = null;

  savePeople();
  saveLinks();

  detailsPanel.innerHTML = `
    <h2>Selected person</h2>
    <p>Click a person on the map to see details here.</p>
  `;

  renderMap();
}

function showPersonDetails(person) {
  selectedPersonId = person.id;

  detailsPanel.innerHTML = `
    <h2>${person.name}</h2>
    <dl>
      <div>
        <dt>Category</dt>
        <dd>${person.category}</dd>
      </div>

      <div>
        <dt>Closeness</dt>
        <dd>${person.closeness} / 5</dd>
      </div>

      <div>
        <dt>Status</dt>
        <dd>${person.status}</dd>
      </div>

      <div>
        <dt>Notes</dt>
        <dd>${person.notes}</dd>
      </div>
    </dl>

    <div class="details-actions">
      <button id="edit-person-button" class="secondary-button" type="button">
        Edit person
      </button>

      <button id="delete-person-button" class="danger-button" type="button">
        Delete person
      </button>
    </div>
  `;

  const deleteButton = document.querySelector("#delete-person-button");
  const editButton = document.querySelector("#edit-person-button");

  editButton.addEventListener("click", function () {
    startEditingPerson(person.id);
  });

  deleteButton.addEventListener("click", function () {
    deletePerson(person.id);
  });
}

function startEditingPerson(personId) {
  const person = findPersonById(personId);

  if (!person) {
    return;
  }

  editingPersonId = person.id;

  personNameInput.value = person.name;
  personCategoryInput.value = person.category;
  personClosenessInput.value = person.closeness;
  personStatusInput.value = person.status;
  personNotesInput.value = person.notes;

  personSubmitButton.textContent = "Save changes";
  cancelEditButton.hidden = false;

  const formToggle = addPersonForm.closest(".form-toggle");

  if (formToggle) {
    formToggle.open = true;
  }
}

function renderNode(person, isMe = false) {
  const group = createSvgElement("g", {
    class: "node",
    "data-id": person.id,
  });

  const categoryClass = person.category ? `category-${person.category}` : "";
  const selectedClass = person.id === selectedPersonId ? "selected-node" : "";

  const circle = createSvgElement("circle", {
    cx: person.x,
    cy: person.y,
    r: person.radius,
    class: isMe
      ? "node-circle me-circle"
      : `node-circle ${categoryClass} ${selectedClass}`,
  });

  const label = createSvgElement("text", {
    x: person.x,
    y: person.y,
    class: "node-label",
  });

  label.textContent = person.name;

  group.appendChild(circle);
  group.appendChild(label);

  if (!isMe) {
    group.addEventListener("pointerdown", function (event) {
      const svgPoint = getSvgPoint(event);

      draggedPersonId = person.id;
      selectedPersonId = person.id;

      dragOffsetX = svgPoint.x - person.x;
      dragOffsetY = svgPoint.y - person.y;

      group.setPointerCapture(event.pointerId);

      showPersonDetails(person);
      renderMap();
    });
  }

  svg.appendChild(group);
}

function renderMap() {
  svg.innerHTML = "";

  people.forEach(function (person) {
    renderLine(me, person);
  });

  links.forEach(function (link) {
    const source = findPersonById(link.sourceId);
    const target = findPersonById(link.targetId);

    if (source && target) {
      const strength = link.strength || 3;

      renderLine(source, target, "person-connection-line", {
        "stroke-width": strength,
        opacity: 0.25 + strength * 0.12,
      });
    }
  });

  renderNode(me, true);

  people.forEach(function (person) {
    renderNode(person);
  });

  updatePersonSelects();
}

function stopEditingPerson() {
  editingPersonId = null;

  addPersonForm.reset();
  personSubmitButton.textContent = "Add person";
  cancelEditButton.hidden = true;
}

addPersonForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(addPersonForm);

  if (editingPersonId) {
    const person = findPersonById(editingPersonId);

    if (!person) {
      return;
    }

    person.name = formData.get("name");
    person.category = formData.get("category");
    person.closeness = Number(formData.get("closeness"));
    person.status = formData.get("status") || "not specified";
    person.notes = formData.get("notes") || "No notes added yet.";

    stopEditingPerson();

    savePeople();
    showPersonDetails(person);
    renderMap();

    return;
  }

  const position = getRandomOrbitPosition();

  const newPerson = {
    id: crypto.randomUUID(),
    name: formData.get("name"),
    category: formData.get("category"),
    closeness: Number(formData.get("closeness")),
    status: formData.get("status") || "not specified",
    notes: formData.get("notes") || "No notes added yet.",
    x: position.x,
    y: position.y,
    radius: 32,
  };

  people.push(newPerson);
  savePeople();
  addPersonForm.reset();
  renderMap();
});

addLinkForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(addLinkForm);
  const sourceId = formData.get("sourceId");
  const targetId = formData.get("targetId");

  if (sourceId === targetId) {
    alert("Please choose two different people.");
    return;
  }

  const newLink = {
    id: crypto.randomUUID(),
    sourceId: sourceId,
    targetId: targetId,
    type: formData.get("type") || "connection",
    strength: Number(formData.get("strength")),
  };

  links.push(newLink);
  saveLinks();
  addLinkForm.reset();
  renderMap();
});

svg.addEventListener("pointermove", function (event) {
  if (!draggedPersonId) {
    return;
  }

  const svgPoint = getSvgPoint(event);

  updatePersonPosition(
    draggedPersonId,
    svgPoint.x - dragOffsetX,
    svgPoint.y - dragOffsetY,
  );

  renderMap();
});

svg.addEventListener("pointerup", function () {
  if (!draggedPersonId) {
    return;
  }

  draggedPersonId = null;
  savePeople();
});

svg.addEventListener("pointerleave", function () {
  if (!draggedPersonId) {
    return;
  }

  draggedPersonId = null;
  savePeople();
});

resetLayoutButton.addEventListener("click", resetLayout);
cancelEditButton.addEventListener("click", stopEditingPerson);

loadPeople();
loadLinks();
renderMap();
