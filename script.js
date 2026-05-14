const svg = document.querySelector("#constellation-map");

const me = {
  id: "me",
  name: "Me",
  x: 400,
  y: 300,
  radius: 42
};

const people = [
  {
    id: "p1",
    name: "J",
    category: "partner",
    x: 560,
    y: 260,
    radius: 32
  },
  {
    id: "p2",
    name: "M",
    category: "family",
    x: 260,
    y: 220,
    radius: 32
  },
  {
    id: "p3",
    name: "A",
    category: "friend",
    x: 520,
    y: 420,
    radius: 32
  },
  {
    id: "p4",
    name: "H",
    category: "friend",
    x: 280,
    y: 410,
    radius: 32
  }
];

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  return element;
}

function renderLine(source, target) {
  const line = createSvgElement("line", {
    x1: source.x,
    y1: source.y,
    x2: target.x,
    y2: target.y,
    class: "connection-line"
  });

  svg.appendChild(line);
}

function renderNode(person, isMe = false) {
  const group = createSvgElement("g", {
    class: "node"
  });

  const circle = createSvgElement("circle", {
    cx: person.x,
    cy: person.y,
    r: person.radius,
    class: isMe ? "node-circle me-circle" : "node-circle"
  });

  const label = createSvgElement("text", {
    x: person.x,
    y: person.y,
    class: "node-label"
  });

  label.textContent = person.name;

  group.appendChild(circle);
  group.appendChild(label);
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

renderMap();