const svg = document.querySelector("#constellation-map");

const me = {
  id: "me",
  name: "Me",
  x: 400,
  y: 300,
  radius: 42
};

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  return element;
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
  renderNode(me, true);
}

renderMap();