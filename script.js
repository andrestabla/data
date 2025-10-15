const mapBounds = {
  minLat: -2.5,
  maxLat: 13.5,
  minLng: -79.5,
  maxLng: -66,
};

const mapOutline = [
  [12.45, -71.33],
  [11.5, -74.4],
  [10.4, -75.5],
  [9.1, -76.8],
  [8.6, -77.4],
  [7.3, -77.8],
  [5.7, -76.5],
  [4.7, -77],
  [3.8, -77.5],
  [2.9, -78.5],
  [1.1, -77.9],
  [0.6, -76.9],
  [1.6, -74.6],
  [0.9, -73.2],
  [-0.2, -74.3],
  [-1.3, -72.9],
  [-2.1, -70.1],
  [-1.2, -69.4],
  [1.2, -67.2],
  [3.4, -67.9],
  [4.8, -67.4],
  [5.1, -69.9],
  [6.5, -69.9],
  [7.5, -67.2],
  [9.5, -67],
  [10.9, -71.1],
];

const mapDimensions = {
  width: 1000,
  height:
    1000 *
    ((mapBounds.maxLat - mapBounds.minLat) /
      (mapBounds.maxLng - mapBounds.minLng)),
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
  activeCity: "",
  map: null,
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

const totalTeams = projects.length;
const activeTeams = projects.filter((project) => project.active).length;

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
      label: "Cantidad de equipos",
      value: totalTeams,
    },
    {
      label: "Equipos activos",
      value: `${activeTeams}/${totalTeams}`,
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
  const operators = [
    ...new Set(projects.flatMap((p) => p.operators || [])),
  ].sort();
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
  const memberTokens = (project.members || []).flatMap((member) => [
    member.fullName,
    member.documentId,
    member.bannerCode,
    member.operator,
    member.email,
    member.contactNumber,
  ]);
  const tokens = [
    project.integratorId,
    project.groupNumber,
    project.projectTitle,
    project.observations,
    ...(project.operators || []),
    ...memberTokens,
  ]
    .filter(Boolean)
    .map((token) => token.toString().toLowerCase());

  if (search) {
    const query = search.toLowerCase();
    const hasMatch = tokens.some((token) => token.includes(query));
    if (!hasMatch) return false;
  }

  if (operator && !(project.operators || []).includes(operator)) return false;
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

const hasActiveFilters = () =>
  Object.values(state.filters).some((value) => Boolean(value));

function latLngToPercent(coordinates = []) {
  const [lat, lng] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { left: 50, top: 50 };
  }
  const left =
    ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
  const top =
    ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
  return { left, top };
}

function latLngToSvgPoint(coordinates = []) {
  const { left, top } = latLngToPercent(coordinates);
  return {
    x: (left / 100) * mapDimensions.width,
    y: (top / 100) * mapDimensions.height,
  };
}

function buildOutlinePath() {
  return mapOutline
    .map((coordinates, index) => {
      const { x, y } = latLngToSvgPoint(coordinates);
      const command = index === 0 ? "M" : "L";
      return `${command}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ")
    .concat(" Z");
}

function ensureMapSurface() {
  if (state.map) return state.map;

  const container = document.getElementById("map");
  container.innerHTML = "";
  container.classList.add("custom-map");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${mapDimensions.width} ${mapDimensions.height}`);
  svg.setAttribute("class", "map-svg");

  const shape = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  shape.setAttribute("d", buildOutlinePath());
  shape.setAttribute("class", "map-shape");
  svg.appendChild(shape);

  const markersLayer = document.createElement("div");
  markersLayer.className = "map-markers";

  const emptyState = document.createElement("div");
  emptyState.className = "map-empty hidden";
  emptyState.textContent = "Sin resultados para los filtros aplicados.";

  container.appendChild(svg);
  container.appendChild(markersLayer);
  container.appendChild(emptyState);

  state.map = {
    container,
    markersLayer,
    emptyState,
  };

  return state.map;
}

function aggregateProjectsByCity(dataset = []) {
  const grouped = new Map();
  dataset.forEach((project) => {
    if (!grouped.has(project.city)) {
      grouped.set(project.city, {
        coordinates: project.coordinates,
        projects: [],
      });
    }
    grouped.get(project.city).projects.push(project);
  });
  return grouped;
}

function dominantLine(projectsInCity = []) {
  const counts = projectsInCity.reduce((acc, project) => {
    const key = project.specializationLine || "";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const [line] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [
    "Interculturalidad",
  ];
  return line;
}

function renderMapMarkers(filteredProjects = [], filtersApplied = false) {
  const { markersLayer, emptyState } = ensureMapSurface();
  markersLayer.innerHTML = "";

  const dataset = filtersApplied ? filteredProjects : projects;
  const grouped = aggregateProjectsByCity(dataset);

  if (!grouped.size) {
    emptyState.classList.remove("hidden");
    highlightActiveMarker();
    return;
  }

  emptyState.classList.add("hidden");

  grouped.forEach((entry, city) => {
    const count = entry.projects.length;
    const { left, top } = latLngToPercent(entry.coordinates);
    const line = dominantLine(entry.projects).toLowerCase();
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `map-marker ${
      line.includes("inclus") ? "inclusion" : "interculturalidad"
    }`;
    marker.style.left = `${left}%`;
    marker.style.top = `${top}%`;
    marker.dataset.city = city;
    marker.title = `${city}: ${count} equipo${count === 1 ? "" : "s"}`;
    marker.innerHTML = `
      <span class="map-marker-count">${count}</span>
      <span class="map-marker-label">${city}</span>
    `;

    marker.addEventListener("click", () => {
      const current = state.filters.city;
      const nextValue = current === city ? "" : city;
      document.getElementById("city-filter").value = nextValue;
      updateFilter("city", nextValue);
    });

    markersLayer.appendChild(marker);
  });

  highlightActiveMarker();
}

function parseAdvisoryDate(label = "") {
  const compact = label.replace(/\s+/g, " ").trim();
  const explicit = compact.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (explicit) {
    const [_, day, month, year] = explicit;
    return new Date(`${year}-${month}-${day}`);
  }
  const numeric = compact.match(/(20\d{2})(\d{2})(\d{2})/);
  if (numeric) {
    const [_, year, month, day] = numeric;
    return new Date(`${year}-${month}-${day}`);
  }
  return null;
}

function formatAdvisoryDate(date, fallback = "Fecha por confirmar") {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) return fallback;
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function tidyAdvisoryNote(label = "") {
  let note = label
    .replace(/Reunión en Tutorías[-:_]*/gi, "")
    .replace(/Reservó/gi, "Reservó")
    .replace(/\b(20\d{2})(\d{2})(\d{2})\b/g, "")
    .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, "")
    .replace(/\.mp4/gi, "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!note) return "";
  return note.charAt(0).toUpperCase() + note.slice(1);
}

function renderAdvisoryList(advisories = []) {
  if (!advisories.length) {
    return '<span class="muted">Sin registros</span>';
  }
  return `
    <ul class="advisory-list">
      ${advisories
        .map((item) => {
          const parsedDate = parseAdvisoryDate(item.label);
          const dateText = formatAdvisoryDate(parsedDate, "Fecha pendiente");
          const note = tidyAdvisoryNote(item.label);
          const statusClass = item.attended ? "attended" : "missed";
          const statusLabel = item.attended ? "Asistió" : "No asistió";
          return `
            <li>
              <span class="advisory-status ${statusClass}">${statusLabel}</span>
              <div>
                <strong>${dateText}</strong>
                ${note ? `<small>${note}</small>` : ""}
              </div>
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}

function renderTable() {
  const tbody = document.querySelector("#projects-table tbody");
  const filtered = projects.filter(matchesFilters);
  const filtersApplied = hasActiveFilters();
  const rows = filtered
    .map((project) => {
      const average = computeAverage(project.grades);
      const attended = countAttended(project.advisories);
      const totalSessions = project.advisories?.length || 0;
      const sessionsLabel = totalSessions
        ? `${attended}/${totalSessions}`
        : attended;
      const statusClass = project.active
        ? "status-badge active"
        : "status-badge inactive";
      const statusLabel = project.active ? "Activo" : "Inactivo";
      const operatorChips = (project.operators || [])
        .map((op) => `<span class="chip">${op}</span>`)
        .join("");
      const membersHtml = (project.members || [])
        .map((member) => {
          const details = [
            member.documentId ? `CC: ${member.documentId}` : "",
            member.bannerCode ? `Banner: ${member.bannerCode}` : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return `
            <div class="member">
              <strong>${member.fullName}</strong>
              ${details ? `<small>${details}</small>` : ""}
            </div>
          `;
        })
        .join("");
      const contactsHtml = (project.members || [])
        .map((member) => {
          const phone = member.contactNumber
            ? `<small>${member.contactNumber}</small>`
            : "";
          return `
            <div class="contact">
              <a href="mailto:${member.email}">${member.email}</a>
              ${phone}
            </div>
          `;
        })
        .join("");
      const membersContent =
        membersHtml || '<span class="muted">Sin integrantes</span>';
      const contactsContent =
        contactsHtml || '<span class="muted">Sin contacto</span>';
      const advisoryList = renderAdvisoryList(project.advisories);
      return `
        <tr>
          <td>
            <div class="id-cell">
              <span class="integrator">${project.integratorId}</span>
              <span class="${statusClass}">${statusLabel}</span>
            </div>
          </td>
          <td><span class="tag">${project.groupNumber}</span></td>
          <td><div class="operator-list">${operatorChips}</div></td>
          <td><div class="member-list">${membersContent}</div></td>
          <td><div class="contact-list">${contactsContent}</div></td>
          <td>${createBadge(project.specializationLine)}</td>
          <td>${project.city}</td>
          <td>${project.ethicsApproval}</td>
          <td>${advisoryList}</td>
          <td>${average !== null ? formatNumber(average, 2) : "-"}</td>
          <td>${sessionsLabel}</td>
          <td>
            <div class="project-cell">
              <span>${project.projectTitle}</span>
              ${
                project.observations
                  ? `<small>${project.observations}</small>`
                  : ""
              }
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

  tbody.innerHTML =
    rows || `<tr><td colspan="12">No se encontraron resultados.</td></tr>`;
  document.getElementById("result-count").textContent = `${filtered.length} de ${totalTeams} equipos`;

  renderMapMarkers(filtered, filtersApplied);
}

function updateFilter(key, value) {
  state.filters[key] = value;
  state.activeCity = state.filters.city || "";
  renderTable();
}

function highlightActiveMarker() {
  document.querySelectorAll(".map-marker").forEach((marker) => {
    marker.classList.remove("active");
    if (state.activeCity && marker.dataset.city === state.activeCity) {
      marker.classList.add("active");
    }
  });
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

document.addEventListener("DOMContentLoaded", () => {
  createSummaryCards();
  buildFilters();
  initFilters();
  ensureMapSurface();
  renderTable();
});
