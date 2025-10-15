const DATASET = (Array.isArray(typeof projects !== "undefined" ? projects : [])
  ? projects
  : []
).map((project) => {
  const location = project.location || {};
  const city = (location.city || project.city || "").trim();
  const department = (location.department || "").trim();
  const operators = Array.from(new Set(project.operators || [])).sort();
  const advisories = Array.isArray(project.advisories)
    ? project.advisories.map((item) => ({
        label: (item.label || "").trim(),
        attended: Boolean(item.attended),
      }))
    : [];

  return {
    ...project,
    operators,
    advisories,
    city,
    department,
    locationLabel: department ? `${city}, ${department}` : city,
    grades: Array.isArray(project.grades) ? project.grades : [],
  };
});

const state = {
  filters: {
    search: "",
    operator: "",
    line: "",
    ethics: "",
    department: "",
    city: "",
    advisory: "",
    status: "",
  },
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

const totalTeams = DATASET.length;
const activeTeams = DATASET.filter((project) => project.active).length;

const overallAverage = (() => {
  const values = DATASET.map((p) => computeAverage(p.grades)).filter((v) => v !== null);
  if (!values.length) return 0;
  return values.reduce((acc, curr) => acc + curr, 0) / values.length;
})();

const averageSessions = (() => {
  if (!DATASET.length) return 0;
  const totals = DATASET.map((p) => countAttended(p.advisories));
  return totals.reduce((acc, curr) => acc + curr, 0) / totals.length;
})();

function createSummaryCards() {
  const summaryWrapper = document.getElementById("summary-cards");
  if (!summaryWrapper) return;

  const lines = DATASET.reduce((acc, project) => {
    const key = project.specializationLine || "Sin línea";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const cards = [
    { label: "Cantidad de equipos", value: totalTeams },
    { label: "Equipos activos", value: `${activeTeams}/${totalTeams}` },
    { label: "Nota promedio", value: formatNumber(overallAverage, 2) },
    { label: "Sesiones promedio", value: formatNumber(averageSessions, 1) },
    {
      label: "Distribución por línea",
      value: Object.entries(lines)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([line, total]) => `${line}: ${total}`)
        .join(" · "),
    },
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
  if (!select) return;
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
    ...new Set(DATASET.flatMap((p) => p.operators || [])),
  ].sort();
  const lines = [...new Set(DATASET.map((p) => p.specializationLine))].sort();
  const ethics = [...new Set(DATASET.map((p) => p.ethicsApproval))].sort();

  populateSelect("operator-filter", operators);
  populateSelect("line-filter", lines);
  populateSelect("ethics-filter", ethics);

  const statusSelect = document.getElementById("status-filter");
  if (statusSelect) {
    statusSelect.innerHTML = `
      <option value="">Todos</option>
      <option value="activos">Activos</option>
      <option value="inactivos">Inactivos</option>
    `;
  }
}

function parseAdvisoryDate(label = "") {
  const compact = label.replace(/\s+/g, " ").trim();
  const explicit = compact.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (explicit) {
    const [, day, month, year] = explicit;
    return new Date(`${year}-${month}-${day}`);
  }
  const numeric = compact.match(/(20\d{2})(\d{2})(\d{2})/);
  if (numeric) {
    const [, year, month, day] = numeric;
    return new Date(`${year}-${month}-${day}`);
  }
  return null;
}

function formatAdvisoryDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) return null;
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
    return `${hours}:${minutes}`;
  }
  const explicit = label.match(/(\d{2}):(\d{2})/);
  return explicit ? `${explicit[1]}:${explicit[2]}` : null;
}

function matchesFilters(project, { ignoreLocation = false } = {}) {
  const { search, operator, line, ethics, department, city, advisory, status } =
    state.filters;

  const tokens = [
    project.integratorId,
    project.groupNumber,
    project.projectTitle,
    project.observations,
    project.locationLabel,
    project.ethicsApproval,
    project.specializationLine,
    ...(project.operators || []),
    ...(project.members || []).flatMap((member) => [
      member.fullName,
      member.documentId,
      member.bannerCode,
      member.operator,
      member.email,
      member.contactNumber,
    ]),
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

  if (status) {
    if (status === "activos" && !project.active) return false;
    if (status === "inactivos" && project.active) return false;
  }

  if (!ignoreLocation) {
    if (department && project.department !== department) return false;
    if (city && project.city !== city) return false;
  }

  if (advisory) {
    const attended = countAttended(project.advisories);
    if (advisory === "alta" && attended < 4) return false;
    if (advisory === "media" && (attended === 0 || attended > 3)) return false;
    if (advisory === "baja" && attended !== 0) return false;
  }

  return true;
}

function createBadge(text) {
  if (!text) return "";
  const normalized = text.toLowerCase();
  const className = normalized.includes("inclus")
    ? "badge inclusion"
    : "badge interculturalidad";
  return `<span class="${className}">${text}</span>`;
}

function renderAdvisoryList(advisories = []) {
  if (!advisories.length) return '<span class="muted">Sin registros</span>';

  return `
    <ol class="advisory-list">
      ${advisories
        .map((item) => {
          const date = parseAdvisoryDate(item.label);
          const formattedDate = formatAdvisoryDate(date);
          const time = parseAdvisoryTime(item.label);
          const baseLabel = item.label || "Registro";
          const label = formattedDate || baseLabel;
          const status = item.attended ? "Asistió" : "No asistió";
          const statusClass = item.attended ? "attended" : "missed";
          const timeLabel = time ? ` · ${time}` : "";
          return `
            <li class="${statusClass}">
              <span class="advisory-label" title="${baseLabel}">${label}${timeLabel}</span>
              <span class="advisory-status">${status}</span>
            </li>
          `;
        })
        .join("")}
    </ol>
  `;
}

function renderLocationCards(projectsForLocations = []) {
  const grid = document.getElementById("locations-grid");
  if (!grid) return;

  const departmentMap = new Map();

  projectsForLocations.forEach((project) => {
    const department = project.department || "Sin departamento";
    const city = project.city || "Sin municipio";

    if (!departmentMap.has(department)) {
      departmentMap.set(department, {
        total: 0,
        active: 0,
        cityCounts: new Map(),
      });
    }

    const bucket = departmentMap.get(department);
    bucket.total += 1;
    if (project.active) bucket.active += 1;

    const cityEntry = bucket.cityCounts.get(city) || { total: 0, active: 0 };
    cityEntry.total += 1;
    if (project.active) cityEntry.active += 1;
    bucket.cityCounts.set(city, cityEntry);
  });

  if (!departmentMap.size) {
    grid.innerHTML = `
      <p class="empty-state">
        No hay ubicaciones disponibles con los filtros actuales.
      </p>
    `;
    return;
  }

  const departmentSelected = state.filters.department;
  const citySelected = state.filters.city;

  const cards = Array.from(departmentMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([department, info]) => {
      const isActive = departmentSelected === department;
      const departmentCount = `${info.total} equipo${info.total === 1 ? "" : "s"}`;
      const activeNote = info.active && info.active !== info.total
        ? ` · ${info.active} activo${info.active === 1 ? "" : "s"}`
        : "";

      const cityList = Array.from(info.cityCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([city, totals]) => {
          const cityActive = isActive && citySelected === city;
          const cityCount = `${totals.total}`;
          const cityActiveNote = totals.active && totals.active !== totals.total
            ? ` · ${totals.active}`
            : "";
          return `
            <li>
              <button
                type="button"
                class="location-chip ${cityActive ? "is-active" : ""}"
                data-filter-type="city"
                data-filter-value="${city}"
                data-department="${department}"
              >
                <span>${city}</span>
                <span class="count">${cityCount}${cityActiveNote}</span>
              </button>
            </li>
          `;
        })
        .join("");

      return `
        <article class="location-card ${isActive ? "is-active" : ""}">
          <button
            type="button"
            class="location-card__header"
            data-filter-type="department"
            data-filter-value="${department}"
          >
            <div>
              <h3>${department}</h3>
              <small>${departmentCount}${activeNote}</small>
            </div>
          </button>
          <ul class="location-card__cities">
            ${cityList}
          </ul>
        </article>
      `;
    })
    .join("");

  grid.innerHTML = cards;
  updateLocationResetState();
}

function renderTable() {
  const projectsWithoutLocation = DATASET.filter((project) =>
    matchesFilters(project, { ignoreLocation: true })
  );

  renderLocationCards(projectsWithoutLocation);

  const filtered = projectsWithoutLocation.filter((project) =>
    matchesFilters(project)
  );

  const tbody = document.querySelector("#projects-table tbody");
  if (!tbody) return;

  const rows = filtered
    .map((project) => {
      const average = computeAverage(project.grades);
      const attended = countAttended(project.advisories);
      const sessionsLabel = `${attended}/${project.advisories.length}`;
      const statusClass = project.active ? "status active" : "status inactive";
      const statusLabel = project.active ? "Activo" : "Inactivo";
      const operatorChips = (project.operators || [])
        .map((op) => `<span class="chip">${op}</span>`)
        .join("");
      const membersContent = (project.members || [])
        .map((member) => {
          const details = [
            member.operator,
            member.documentId ? `ID: ${member.documentId}` : "",
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
        .join("") || '<span class="muted">Sin integrantes</span>';

      const contactsContent = (project.members || [])
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
        .join("") || '<span class="muted">Sin contacto</span>';

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
          <td>${project.locationLabel}</td>
          <td>${project.ethicsApproval || "-"}</td>
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

  const counter = document.getElementById("result-count");
  if (counter) {
    counter.textContent = `${filtered.length} de ${totalTeams} equipos`;
  }
}

function updateFilter(key, value) {
  state.filters[key] = value;
  renderTable();
}

function resetLocationFilters() {
  state.filters.department = "";
  state.filters.city = "";
  renderTable();
}

function updateLocationResetState() {
  const button = document.getElementById("reset-location-filters");
  if (!button) return;
  const hasSelection = Boolean(state.filters.department || state.filters.city);
  button.disabled = !hasSelection;
}

function initFilters() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      updateFilter("search", event.target.value.trim());
    });
  }

  [
    ["operator-filter", "operator"],
    ["line-filter", "line"],
    ["ethics-filter", "ethics"],
    ["advisory-filter", "advisory"],
    ["status-filter", "status"],
  ].forEach(([id, key]) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("change", (event) => {
      updateFilter(key, event.target.value);
    });
  });

  const resetButton = document.getElementById("reset-location-filters");
  if (resetButton) {
    resetButton.addEventListener("click", resetLocationFilters);
  }

  const grid = document.getElementById("locations-grid");
  if (grid) {
    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter-type]");
      if (!button) return;

      const type = button.getAttribute("data-filter-type");
      const value = button.getAttribute("data-filter-value") || "";

      if (type === "department") {
        const nextValue = state.filters.department === value ? "" : value;
        state.filters.department = nextValue;
        if (state.filters.department !== value) {
          state.filters.city = "";
        }
        if (!nextValue) state.filters.city = "";
        renderTable();
        return;
      }

      if (type === "city") {
        const department = button.getAttribute("data-department") || "";
        const sameDepartment = state.filters.department === department;
        const sameCity = state.filters.city === value;
        state.filters.department = department;
        state.filters.city = sameDepartment && sameCity ? "" : value;
        renderTable();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  createSummaryCards();
  buildFilters();
  initFilters();
  renderTable();
});
