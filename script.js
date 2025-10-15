const SVG_NS = "http://www.w3.org/2000/svg";

const MAP_VIEWBOX = Object.freeze({
  width: 600,
  height: 800,
});

/**
 * Contornos del croquis de Colombia dibujado directamente en SVG.
 * Ajusta los caminos si deseas redefinir la silueta o añadir detalles.
 */
const MAP_PATH_MAIN = `
  M310 40
  Q270 70 250 110
  L210 160
  Q190 210 170 260
  L140 320
  Q120 360 120 410
  Q120 460 140 510
  L170 570
  L200 620
  Q220 660 230 710
  Q240 760 290 782
  Q340 804 380 760
  L420 700
  Q440 660 440 610
  Q440 560 420 510
  L440 450
  Q460 400 440 350
  L410 290
  Q390 240 370 200
  L350 150
  Q330 110 310 40
  Z
`.trim();

const MAP_PATH_ACCENT = `
  M290 150
  Q270 210 250 260
  Q230 320 240 380
  Q250 440 270 500
  Q290 560 300 620
  Q310 680 320 720
  Q340 740 360 700
  Q370 660 360 600
  Q350 540 340 480
  Q330 420 320 360
  Q310 300 310 240
  Q310 200 300 160
  Z
`.trim();

const MAP_PATH_HIGHLIGHT = `
  M225 210
  Q210 260 205 310
  Q200 360 220 420
  Q240 480 260 540
  Q280 600 290 640
  Q300 680 315 705
  Q330 670 320 620
  Q310 560 300 500
  Q290 440 280 380
  Q270 320 265 270
  Q260 230 245 205
  Z
`.trim();

const MAP_BOUNDS = Object.freeze({
  /**
   * Límites aproximados de Colombia utilizados para convertir latitudes y
   * longitudes en posiciones relativas dentro del croquis SVG. Ajusta los
   * valores si modificas el contorno para que los pines sigan alineados con
   * el mapa.
   */
  minLat: -4.5,
  maxLat: 13.6,
  minLng: -79.5,
  maxLng: -66.5,
});

/**
 * Márgenes (en porcentaje) que reservan espacio entre la proyección y los
 * bordes del croquis, evitando que los pines queden sobre los límites.
 */
const MAP_PADDING = Object.freeze({
  top: 6,
  right: 8,
  bottom: 10,
  left: 12,
});

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

function buildMapOutline() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Croquis de Colombia");
  svg.setAttribute("focusable", "false");
  svg.classList.add("map-outline");

  const defs = document.createElementNS(SVG_NS, "defs");
  const gradient = document.createElementNS(SVG_NS, "linearGradient");
  gradient.id = "mapGradient";
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "0%");
  gradient.setAttribute("y2", "100%");

  const stopTop = document.createElementNS(SVG_NS, "stop");
  stopTop.setAttribute("offset", "0%");
  stopTop.setAttribute("stop-color", "#bfdbfe");

  const stopMid = document.createElementNS(SVG_NS, "stop");
  stopMid.setAttribute("offset", "55%");
  stopMid.setAttribute("stop-color", "#93c5fd");

  const stopBottom = document.createElementNS(SVG_NS, "stop");
  stopBottom.setAttribute("offset", "100%");
  stopBottom.setAttribute("stop-color", "#60a5fa");

  gradient.append(stopTop, stopMid, stopBottom);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  const body = document.createElementNS(SVG_NS, "path");
  body.setAttribute("d", MAP_PATH_MAIN);
  body.classList.add("map-outline-body");
  svg.appendChild(body);

  const accent = document.createElementNS(SVG_NS, "path");
  accent.setAttribute("d", MAP_PATH_ACCENT);
  accent.classList.add("map-outline-accent");
  svg.appendChild(accent);

  const highlight = document.createElementNS(SVG_NS, "path");
  highlight.setAttribute("d", MAP_PATH_HIGHLIGHT);
  highlight.classList.add("map-outline-highlight");
  svg.appendChild(highlight);

  return svg;
}

function ensureMapReady() {
  if (state.map) return state.map;

  const container = document.getElementById("map");
  if (!container) {
    console.error("No se encontró el contenedor del mapa.");
    return null;
  }

  container.innerHTML = "";
  container.classList.add("static-map-ready");

  const mapImage = document.createElement("div");
  mapImage.className = "map-image";

  const outline = buildMapOutline();

  const markerLayer = document.createElement("div");
  markerLayer.className = "map-marker-layer";

  mapImage.appendChild(outline);
  mapImage.appendChild(markerLayer);
  container.appendChild(mapImage);

  const emptyOverlay = document.createElement("div");
  emptyOverlay.className = "map-empty hidden";
  emptyOverlay.innerHTML = `
    <div>
      <strong>Sin resultados</strong>
      <p>Modifica los filtros para ver proyectos.</p>
    </div>
  `;
  container.appendChild(emptyOverlay);

  const mapState = {
    container,
    outline,
    markerLayer,
    emptyOverlay,
    markers: [],
  };

  state.map = mapState;
  return mapState;
}

function aggregateProjectsByCity(dataset = []) {
  const grouped = new Map();
  dataset.forEach((project) => {
    if (!grouped.has(project.city)) {
      grouped.set(project.city, {
        coordinates: project.coordinates,
        mapPosition: project.mapPosition,
        projects: [],
      });
    }
    const bucket = grouped.get(project.city);
    if (!bucket.mapPosition && project.mapPosition) {
      bucket.mapPosition = project.mapPosition;
    }
    if (!bucket.coordinates && project.coordinates) {
      bucket.coordinates = project.coordinates;
    }
    bucket.projects.push(project);
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function projectToPoint(entry = {}) {
  const coordinates = entry.coordinates || [];
  const [lat, lng] = coordinates;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const clampedLat = clamp(lat, MAP_BOUNDS.minLat, MAP_BOUNDS.maxLat);
    const clampedLng = clamp(lng, MAP_BOUNDS.minLng, MAP_BOUNDS.maxLng);

    const normalizedX =
      (clampedLng - MAP_BOUNDS.minLng) /
      (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    const normalizedY =
      (MAP_BOUNDS.maxLat - clampedLat) /
      (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);

    const usableWidth = 100 - MAP_PADDING.left - MAP_PADDING.right;
    const usableHeight = 100 - MAP_PADDING.top - MAP_PADDING.bottom;

    const x = MAP_PADDING.left + normalizedX * usableWidth;
    const y = MAP_PADDING.top + normalizedY * usableHeight;
    return { x, y };
  }

  if (
    entry.mapPosition &&
    Number.isFinite(entry.mapPosition.xPercent) &&
    Number.isFinite(entry.mapPosition.yPercent)
  ) {
    return {
      x: entry.mapPosition.xPercent,
      y: entry.mapPosition.yPercent,
    };
  }

  return null;
}

function renderMapMarkers(mapState, filteredProjects = [], filtersApplied = false) {
  if (!mapState) return;

  mapState.markerLayer.innerHTML = "";
  mapState.markers = [];

  const dataset = filtersApplied ? filteredProjects : projects;
  const grouped = aggregateProjectsByCity(dataset);

  if (!grouped.size) {
    mapState.emptyOverlay.classList.remove("hidden");
    highlightActiveMarker();
    return;
  }

  mapState.emptyOverlay.classList.add("hidden");

  const markerEntries = [];

  grouped.forEach((entry, city) => {
    const count = entry.projects.length;
    const position = projectToPoint(entry);
    if (!position) return;

    const line = dominantLine(entry.projects).toLowerCase();
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `map-marker ${
      line.includes("inclus") ? "inclusion" : "interculturalidad"
    }`;
    marker.dataset.city = city;
    marker.title = `${city}: ${count} equipo${count === 1 ? "" : "s"}`;
    marker.style.left = `${position.x}%`;
    marker.style.top = `${position.y}%`;
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

    mapState.markerLayer.appendChild(marker);
    markerEntries.push({ city, element: marker });
  });

  mapState.markers = markerEntries;
  highlightActiveMarker();
}

function updateMap(filteredProjects, filtersApplied) {
  const mapState = ensureMapReady();
  if (!mapState) return;
  renderMapMarkers(mapState, filteredProjects, filtersApplied);
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

function parseAdvisoryTime(label = "") {
  const match = label.match(/_(\d{6})/);
  if (match) {
    const [, hhmmss] = match;
    const hours = hhmmss.slice(0, 2);
    const minutes = hhmmss.slice(2, 4);
    if (Number.isFinite(Number(hours)) && Number.isFinite(Number(minutes))) {
      return `${hours}:${minutes}`;
    }
  }

  const explicit = label.match(/\b(\d{2}):(\d{2})\b/);
  if (explicit) {
    const [, hours, minutes] = explicit;
    return `${hours}:${minutes}`;
  }

  return "";
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
          const timeText = parseAdvisoryTime(item.label);
          const note = tidyAdvisoryNote(item.label);
          const statusClass = item.attended ? "attended" : "missed";
          const statusLabel = item.attended ? "Asistió" : "No asistió";
          return `
            <li>
              <span class="advisory-status ${statusClass}">${statusLabel}</span>
              <div>
                <strong>${dateText}</strong>
                ${timeText ? `<span class="advisory-time">${timeText} h</span>` : ""}
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

  updateMap(filtered, filtersApplied);
}

function updateFilter(key, value) {
  state.filters[key] = value;
  state.activeCity = state.filters.city || "";
  renderTable();
}

function highlightActiveMarker() {
  if (!state.map || !Array.isArray(state.map.markers)) return;

  state.map.markers.forEach(({ city, element }) => {
    if (!element) return;
    element.classList.remove("active");
    if (state.activeCity && city === state.activeCity) {
      element.classList.add("active");
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
  renderTable();
});
