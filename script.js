const MAP_IMAGE_URL = "data:image/png;base64,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"
  + "hABCKIRCCKigCgqhEAJCiBAKISCECKEQAkKIEAohIIQIoRACKogQCiEghAihEAJCiBAKISCECKEQAkKIEAohoIII4YVN2p/POSCEQug4g7ceHu/hiRAKoRAi"
  + "hAih/AihECKECCFCqIUIISqIEAohQogQIoRCiBAihAihECKECCFCqIUIISqIEAohQogQIoRCiBAihAihECKECCFCqIUIISqIEAohQogQIoRCiBAihAihECKE"
  + "CCFCqIUIISqIEAohQogQIoRCiBAihAihECKECCFCqIUIISqIEAohQogQIoRCiBAihAihECKECCFCqIUIISqIEAohQogQIoRCiBAihAihECKECCHxEGohQogK"
  + "IoRCiBAihAghCCFCSDOEWogQooIIoRAihAghQghCiBAKoRCCECKEQqiFIISooBAKIQghQiiEQghCiBAKoRaCEKKCQiiEIIQIoRAKIQghQiiEQghCiBAKoRaC"
  + "EKKCQiiEIIQIoRAKIQghQiiEWghCiAoKoRCCECKEQiiEIIQIoRBqIQihCqqgEAohCKEQIoRCCEIohAihFoIQqiBCKIQghEKIEAohCKEQIoTztHABeiOEMyZk"
  + "AVaoEOK0RQgdUgghQogQCiFCiBAihEKIECKECKEQIoQIIUIohAghQogQCiFCiBAihEKIECKEQogQIoQIoRAihAghQiiECCFCiBAKIUKIECKEQiiEPrYIIUIo"
  + "hEIIQogQCqEQghAihEIohCCECKEQCiEIIUIohEIIQogQCqEQghAihEIohCCECKEQCiEIIUIohEIIQogQCqEQghAihEIohCCECKEQCiEIIUIohEIIQogQCqEQ"
  + "ghAihEIohCCECKEQCiEIoRCqjhAKIQihECKEQghCKIQIoRCCEAohQiiEIIRCiBAKIQihECKEQghCKIQIoRCCEAohQiiEIIRCiBAKIQihECKEQogQIoQIoRAi"
  + "hAghQiiECCFCiBAKIUKIECKEQogQIoQIoRAihAghQiiECCFCiBAKIUKIECKEQogQIoQIoRAihAghQiiECCFCiBAKIUKIECKEQogQIoQIoRAihAghQiiECCFC"
  + "iBAKIUKIECKEQogQIoQIoRAihAghQiiECCFCiBAKIUKIECKEQogQIoRCKHtCiBAihEKIECKECKEQIoQIIUIohAghQogQCiFCiBAihEIohD65CCFCKIRCCEKI"
  + "EAqhEIIQIoRCKIQghAihEAohCCFCKIRCCEKIEAqhEIIQIoRCKIQghAihEAohCCFCKIRCCEKIEAqhEIIQIoRCKIQghAihEAohCCFCKIRCCEKIEAqhEIIQIoRC"
  + "KIQghEIohEIohCCEQogQCiEIoRAihEIIQiiECKEQghAKIUIohCCEQogQCiEIoRAihEIIQiiECKEQghAKIUIohCCEQogQCiFC6CUQQoRQCBFChBAhFEKEECFE"
  + "CIUQIUQIEUIhRAgRQoRQCBFChBAhFEKEECFECIUQIUQIEUIhRAgRQoRQCBFChBAhFEKEECFECIUQIUQIEUIhRAgRQoRQCBFChBAhFEKEECFECIUQIUQIEUIh"
  + "RAgRQoRQCBFChBAhFEKEECFECIUQIUQIEUIhRAgRQoRQCBFChFAIEUKEECEUQoQQIUQIhRAhRAgRQiFECBFChFAIhVAIEUKEUAiFEIQQIRRCIQQhRAiFUAhB"
  + "CBFCIRRCEEKEUAiFEIQQIRRCIQQhRAuFUAVBCNFCIVRBEEK0UAhVEIQQLRRCFQQhRAuFUAVBCNFCIVRBEEK0UAhVEIQQLRRCFQQhRAuFUAVBCNFCIVRBEEK0"
  + "UAhVEIQQLRRCFQQhRAuFUAVBCNFCIVRBEEK0UAhVEIQQLRRCFQQhRAuFUAVBCNFCIVRBEEK0UAhVEISQNy2UQyG8IIEqiBDiNCQaQglECNFCuiFUQYQQLaQb"
  + "QhVECNFCuiFUQYQQP58hGkI/jUEIcRrSDaEEIoRoId0QqiBCiBZ6TBoNocehCCE4DbshlECEELSwG0IVRAjBY9JoCD0ORQjBadgNoQQihOA0jIbQIYgQgtOw"
  + "G0IJRAjBaRgNoUMQIQSnYTeEEogQehVwGkZD6BAEIcRp2A2hBIIQ4jSMhtAhCEKIHEZDKIEghMhhNIQSCEKIHEZDKIEghMhhNIQSCEKIHEZDKIEghMhhNIQS"
  + "CEKIHEZDKIEghMhhNIQSCEKIHEZDKIEghKycw8WKuHn/JBCEEAdiLoT6B0KIA7EYQicgCCFMX0T9AyGE7Ys4URTPjZ/+gRDCUmei4w+EENJnouMPhBCOieIg"
  + "XXxTPvEDIYTDurhDHd/9E70RIIQweh234uUFIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQA"
  + "IQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQQAIQRACL0KAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAgh"
  + "AAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAghAAgh"
  + "AAghAAghAAghAAghAAghAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEII"
  + "AEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAEIIAC/+Ap/R129IB95WAAAAAElF"
  + "TkSuQmCC"
  ;

const MAP_BOUNDS = Object.freeze({
  /**
   * Estos límites corresponden al mapa político incluido en MAP_IMAGE_URL.
   * Ajusta los valores si sustituyes la ilustración base para mantener la
   * alineación de los pines con las ciudades colombianas.
   *
   * Los límites actuales se calibraron analizando la imagen local para que
   * ciudades costeras como Buenaventura y Riohacha se ubiquen sobre las
   * regiones coloreadas del mapa.
   */
  minLat: -4.3,
  maxLat: 13.4,
  minLng: -79.1,
  maxLng: -66.85,
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

  const baseImage = document.createElement("img");
  baseImage.src = MAP_IMAGE_URL;
  baseImage.alt = "Mapa político de Colombia";
  baseImage.loading = "lazy";
  baseImage.decoding = "async";
  baseImage.className = "map-base";

  const markerLayer = document.createElement("div");
  markerLayer.className = "map-marker-layer";

  mapImage.appendChild(baseImage);
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
    baseImage,
    markerLayer,
    emptyOverlay,
    markers: [],
  };

  baseImage.addEventListener("error", () => {
    container.classList.add("map-error");
    container.innerHTML = `
      <div class="map-empty">
        <strong>Mapa no disponible</strong>
        <p>No se pudo decodificar el recurso incrustado. Verifica el valor de <code>MAP_IMAGE_URL</code> en <code>script.js</code> o reemplázalo por otra imagen codificada en base64.</p>
      </div>
    `;
    state.map = null;
  });

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

  const coordinates = entry.coordinates || [];
  const [lat, lng] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const clampedLat = clamp(lat, MAP_BOUNDS.minLat, MAP_BOUNDS.maxLat);
  const clampedLng = clamp(lng, MAP_BOUNDS.minLng, MAP_BOUNDS.maxLng);

  const x =
    ((clampedLng - MAP_BOUNDS.minLng) /
      (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) *
    100;
  const y =
    ((MAP_BOUNDS.maxLat - clampedLat) /
      (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) *
    100;
  return { x, y };
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
