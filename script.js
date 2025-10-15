const DEFAULT_MAP_CENTER = { lat: 4.570868, lng: -74.297333 };
const DEFAULT_MAP_ZOOM = 5.1;

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
  googlePromise: null,
  mapReadyPromise: null,
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

function getGoogleMapsKey() {
  return (
    (typeof window !== "undefined" && window.GOOGLE_MAPS_API_KEY) ||
    (typeof window !== "undefined" &&
      window.dashboardConfig &&
      window.dashboardConfig.googleMapsApiKey) ||
    ""
  );
}

function loadGoogleMaps() {
  if (state.googlePromise) return state.googlePromise;

  const apiKey = getGoogleMapsKey();
  if (!apiKey) {
    state.googlePromise = Promise.reject(
      new Error(
        "No se encontró la clave de Google Maps. Define window.GOOGLE_MAPS_API_KEY en config.js."
      )
    );
    return state.googlePromise;
  }

  state.googlePromise = new Promise((resolve, reject) => {
    window.__dashboardInitMap = () => resolve(window.google);
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: apiKey,
      callback: "__dashboardInitMap",
      libraries: "marker",
      v: "weekly",
      language: "es",
      region: "CO",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () =>
      reject(
        new Error(
          "No se pudo cargar Google Maps. Verifica tu conexión y la clave de API."
        )
      );
    document.head.appendChild(script);
  });

  return state.googlePromise;
}

function showMapError(message) {
  const container = document.getElementById("map");
  if (!container) return;
  container.classList.add("map-error");
  container.innerHTML = `
    <div class="map-empty">
      <strong>Mapa no disponible</strong>
      <p>${message}</p>
      <p><small>Confirma tu conexión o actualiza la clave en <code>config.js</code>.</small></p>
    </div>
  `;
}

function ensureMapReady() {
  if (state.mapReadyPromise) return state.mapReadyPromise;

  state.mapReadyPromise = loadGoogleMaps()
    .then(() => {
      if (state.map) return state.map;

      const container = document.getElementById("map");
      if (!container) {
        throw new Error("No se encontró el contenedor del mapa.");
      }

      container.innerHTML = "";
      container.classList.add("google-map-ready");

      const map = new window.google.maps.Map(container, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: "greedy",
      });

      const emptyOverlay = document.createElement("div");
      emptyOverlay.className = "map-empty hidden";
      emptyOverlay.textContent = "Sin resultados para los filtros aplicados.";
      container.appendChild(emptyOverlay);

      state.map = {
        map,
        markers: [],
        infoWindow: new window.google.maps.InfoWindow(),
        emptyOverlay,
      };

      if (typeof window.__dashboardInitMap !== "undefined") {
        delete window.__dashboardInitMap;
      }

      return state.map;
    })
    .catch((error) => {
      showMapError(error.message);
      throw error;
    });

  return state.mapReadyPromise;
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

function renderMapMarkers(mapState, filteredProjects = [], filtersApplied = false) {
  if (!mapState || !window.google) return;

  mapState.markers.forEach((entry) => {
    if (entry.marker instanceof window.google.maps.marker.AdvancedMarkerElement) {
      entry.marker.map = null;
    } else if (typeof entry.marker.setMap === "function") {
      entry.marker.setMap(null);
    }
  });
  mapState.markers = [];

  const dataset = filtersApplied ? filteredProjects : projects;
  const grouped = aggregateProjectsByCity(dataset);

  if (!grouped.size) {
    mapState.emptyOverlay.classList.remove("hidden");
    mapState.map.setCenter(DEFAULT_MAP_CENTER);
    mapState.map.setZoom(DEFAULT_MAP_ZOOM);
    highlightActiveMarker();
    return;
  }

  mapState.emptyOverlay.classList.add("hidden");

  const bounds = new window.google.maps.LatLngBounds();
  const markerEntries = [];

  grouped.forEach((entry, city) => {
    const count = entry.projects.length;
    const [lat, lng] = entry.coordinates || [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const position = { lat, lng };
    bounds.extend(position);
    const line = dominantLine(entry.projects).toLowerCase();
    const markerElement = document.createElement("button");
    markerElement.type = "button";
    markerElement.className = `map-marker ${
      line.includes("inclus") ? "inclusion" : "interculturalidad"
    }`;
    markerElement.dataset.city = city;
    markerElement.title = `${city}: ${count} equipo${count === 1 ? "" : "s"}`;
    markerElement.innerHTML = `
      <span class="map-marker-count">${count}</span>
      <span class="map-marker-label">${city}</span>
    `;

    markerElement.addEventListener("click", () => {
      const current = state.filters.city;
      const nextValue = current === city ? "" : city;
      document.getElementById("city-filter").value = nextValue;
      updateFilter("city", nextValue);
    });

    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map: mapState.map,
      position,
      content: markerElement,
      title: `${city}: ${count} equipo${count === 1 ? "" : "s"}`,
    });

    markerEntries.push({ city, marker, element: markerElement });
  });

  mapState.markers = markerEntries;

  if (!bounds.isEmpty()) {
    if (grouped.size === 1) {
      mapState.map.setCenter(bounds.getCenter());
      mapState.map.setZoom(7);
    } else {
      mapState.map.fitBounds(bounds, 60);
    }
  }

  highlightActiveMarker();
}

function updateMap(filteredProjects, filtersApplied) {
  ensureMapReady()
    .then((mapState) => {
      renderMapMarkers(mapState, filteredProjects, filtersApplied);
    })
    .catch(() => {
      // El error se muestra dentro de ensureMapReady.
    });
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
