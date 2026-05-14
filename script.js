const svg = document.querySelector("#constellation-map");
const detailsPanel = document.querySelector("#details-panel");
const addPersonForm = document.querySelector("#add-person-form");

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

function getRandomOrbitPosition() {
  const angle = Math.random() * Math.PI * 2;
  const distanceFromCentre = 170 + Math.random() * 130;

  return {
    x: me.x + Math.cos(angle) * distanceFromCentre,
    y: me.y + Math.sin(angle) * distanceFromCentre,
  };
}

function renderLine(source, target) {
  const line = createSvgElement("line", {
    x1: source.x,
    y1: source.y,
    x2: target.x,
    y2: target.y,
    class: "connection-line",
  });

  svg.appendChild(line);
}

function showPersonDetails(person) {
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
  `;
}

function renderNode(person, isMe = false) {
  const group = createSvgElement("g", {
    class: "node",
  });

  const categoryClass = person.category ? `category-${person.category}` : "";

  const circle = createSvgElement("circle", {
    cx: person.x,
    cy: person.y,
    r: person.radius,
    class: isMe ? "node-circle me-circle" : `node-circle ${categoryClass}`,
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
    group.addEventListener("click", function () {
      showPersonDetails(person);
    });
  }

  svg.appendChild(group);
}

function renderMap() {
  svg.innerHTML = "";

  people.forEach(function (person) {
    renderLine(me, person);
  });

  renderNode(me, true);

  people.forEach(function (person) {
    renderNode(person);
  });
}

addPersonForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(addPersonForm);
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

loadPeople();
renderMap();
