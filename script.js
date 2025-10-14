const mapConfig = {
  center: [4.65, -74.1],
  zoom: 5.3,
};

const state = {
  filters: {
    search: "",
    operator: "",
    line: "",
    ethics: "",
    city: "",
    advisory: "",
  },
  activeMarker: null,
};

const formatNumber = (value, digits = 1) =>
  Number.isFinite(value) ? value.toFixed(digits) : "-";

const computeAverage = (grades) => {
  const valid = grades.filter((g) => typeof g === "number" && !Number.isNaN(g));
  if (!valid.length) return null;
  return valid.reduce((acc, curr) => acc + curr, 0) / valid.length;
};

const countAttended = (advisories = []) =>
  advisories.filter((item) => item.attended).length;

const uniqueByGroup = new Set(
  projects.map((p) => `${p.operator}-${p.groupNumber}`)
);

const overallAverage = (() => {
  const values = projects
    .map((p) => computeAverage(p.grades))
    .filter((value) => value !== null);
  return values.reduce((acc, curr) => acc + curr, 0) / values.length;
})();

const averageSessions = (() => {
  const totals = projects.map((p) => countAttended(p.advisories));
  return totals.reduce((acc, curr) => acc + curr, 0) / totals.length;
})();

function createSummaryCards() {
  const summaryWrapper = document.getElementById("summary-cards");
  const cards = [
    {
      label: "Cantidad de grupos",
      value: uniqueByGroup.size,
    },
    {
      label: "Nota promedio",
      value: formatNumber(overallAverage, 2),
    },
    {
      label: "Sesiones promedio",
      value: formatNumber(averageSessions, 1),
    },
    (() => {
      const lineCount = projects.reduce(
        (acc, project) => {
          const key = project.specializationLine;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {}
      );
      const parts = Object.entries(lineCount)
        .map(([line, total]) => `${line}: ${total}`)
        .join(" · ");
      return {
        label: "Distribución por línea",
        value: parts,
      };
    })(),
  ];

  summaryWrapper.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
        </article>
      `
    )
    .join("");
}

function populateSelect(selectId, options) {
  const select = document.getElementById(selectId);
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Todos";
  select.appendChild(defaultOption);

  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
}

function buildFilters() {
  const operators = [...new Set(projects.map((p) => p.operator))].sort();
  const lines = [...new Set(projects.map((p) => p.specializationLine))].sort();
  const ethics = [...new Set(projects.map((p) => p.ethicsApproval))].sort();
  const cities = [...new Set(projects.map((p) => p.city))].sort();

  populateSelect("operator-filter", operators);
  populateSelect("line-filter", lines);
  populateSelect("ethics-filter", ethics);
  populateSelect("city-filter", cities);
}

function matchesFilters(project) {
  const { search, operator, line, ethics, city, advisory } = state.filters;
  const tokens = [
    project.student.fullName,
    project.groupNumber,
    project.bannerCode,
    project.documentId,
    project.operator,
    project.integratorId,
  ]
    .filter(Boolean)
    .map((token) => token.toString().toLowerCase());

  if (search) {
    const query = search.toLowerCase();
    const hasMatch = tokens.some((token) => token.includes(query));
    if (!hasMatch) return false;
  }

  if (operator && project.operator !== operator) return false;
  if (line && project.specializationLine !== line) return false;
  if (ethics && project.ethicsApproval !== ethics) return false;
  if (city && project.city !== city) return false;

  if (advisory) {
    const attended = countAttended(project.advisories);
    if (advisory === "alta" && attended < 4) return false;
    if (advisory === "media" && (attended === 0 || attended > 3)) return false;
    if (advisory === "baja" && attended !== 0) return false;
  }

  return true;
}

function createBadge(text) {
  const normalized = text.toLowerCase();
  const className = normalized.includes("inclus")
    ? "badge inclusion"
    : "badge interculturalidad";
  return `<span class="${className}">${text}</span>`;
}

function renderTable() {
  const tbody = document.querySelector("#projects-table tbody");
  const filtered = projects.filter(matchesFilters);
  const rows = filtered
    .map((project) => {
      const average = computeAverage(project.grades);
      const attended = countAttended(project.advisories);
      const totalSessions = project.advisories?.length || 0;
      const sessionsLabel = totalSessions
        ? `${attended}/${totalSessions}`
        : attended;
      return `
        <tr>
          <td>${project.integratorId}</td>
          <td>${project.operator}</td>
          <td><span class="tag">${project.groupNumber}</span></td>
          <td>
            <strong>${project.student.fullName}</strong><br />
            <small>${project.documentId}</small>
          </td>
          <td>
            <a href="mailto:${project.email}">${project.email}</a><br />
            <small>${project.contactNumber || "Sin contacto"}</small>
          </td>
          <td>${createBadge(project.specializationLine)}</td>
          <td>${project.city}</td>
          <td>${project.ethicsApproval}</td>
          <td>${average !== null ? formatNumber(average, 2) : "-"}</td>
          <td>${sessionsLabel}</td>
          <td>
            <div class="project-cell">
              <span>${project.projectTitle}</span>
              ${
                project.repositoryLink
                  ? `<a class="ghost-button" href="${project.repositoryLink}" target="_blank" rel="noopener">Repositorio</a>`
                  : ""
              }
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.innerHTML = rows || `<tr><td colspan="11">No se encontraron resultados.</td></tr>`;
  document.getElementById("result-count").textContent = `${filtered.length} proyecto${
    filtered.length === 1 ? "" : "s"
  }`;
}

function updateFilter(key, value) {
  state.filters[key] = value;
  if (key !== "city") {
    state.activeMarker = null;
  }
  renderTable();
  highlightActiveMarker();
}

function highlightActiveMarker() {
  document.querySelectorAll(".map-pin").forEach((pin) => {
    pin.classList.remove("active");
  });
  if (state.activeMarker) {
    state.activeMarker.classList.add("active");
  }
}

function initFilters() {
  document.getElementById("search-input").addEventListener("input", (event) => {
    updateFilter("search", event.target.value.trim());
  });

  [
    ["operator-filter", "operator"],
    ["line-filter", "line"],
    ["ethics-filter", "ethics"],
    ["city-filter", "city"],
    ["advisory-filter", "advisory"],
  ].forEach(([id, key]) => {
    document.getElementById(id).addEventListener("change", (event) => {
      updateFilter(key, event.target.value);
    });
  });

  document
    .getElementById("reset-map-filter")
    .addEventListener("click", () => {
      document.getElementById("city-filter").value = "";
      updateFilter("city", "");
    });
}

function initMap() {
  const map = L.map("map", {
    zoomControl: false,
    scrollWheelZoom: false,
  }).setView(mapConfig.center, mapConfig.zoom);

  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);

  const markersByCity = new Map();
  projects.forEach((project) => {
    if (!markersByCity.has(project.city)) {
      markersByCity.set(project.city, {
        coordinates: project.coordinates,
        projects: [],
      });
    }
    markersByCity.get(project.city).projects.push(project);
  });

  markersByCity.forEach((entry, city) => {
    const total = entry.projects.length;
    const mainLine = entry.projects[0]?.specializationLine || "";
    const marker = L.marker(entry.coordinates, {
      icon: L.divIcon({
        className: "map-pin-wrapper",
        html: `<span class="map-pin ${
          mainLine.toLowerCase().includes("inclus")
            ? "inclusion"
            : "interculturalidad"
        }" data-city="${city}">${total}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      }),
    }).addTo(map);

    marker.on("click", () => {
      document.getElementById("city-filter").value = city;
      updateFilter("city", city);
      const pinElement = document.querySelector(`.map-pin[data-city="${city}"]`);
      state.activeMarker = pinElement;
      highlightActiveMarker();
    });

    marker.bindTooltip(
      `<strong>${city}</strong><br>${total} proyecto${total === 1 ? "" : "s"}`,
      {
        direction: "top",
        offset: [0, -12],
        sticky: true,
      }
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createSummaryCards();
  buildFilters();
  initFilters();
  initMap();
  renderTable();
});
