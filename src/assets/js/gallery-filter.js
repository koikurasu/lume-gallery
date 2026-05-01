document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("gallery");
  const panel = document.getElementById("gallery-filter-popover");

  if (!gallery || !panel) return;

  const trigger = document.getElementById("gallery-filter-trigger");
  if (trigger) trigger.hidden = false;
  panel.hidden = false;

  const items = [...gallery.querySelectorAll(".gallery-item")];
  if (items.length === 0) return;

  // -------------------------------------------------------------------------
  // Global Empty State (inserted after gallery)
  // -------------------------------------------------------------------------

  const emptyStateEl = document.createElement("div");
  emptyStateEl.className = "gallery-empty-state";
  emptyStateEl.textContent = "No images match";
  emptyStateEl.hidden = true;
  gallery.parentNode.insertBefore(emptyStateEl, gallery.nextSibling);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  // dataset keys are camelCase; convert back to kebab for display
  const toKebab = (camel) =>
    camel.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);

  // Convert slug to Display Label (Title Case)
  const toLabel = (slug) => {
    return toKebab(slug)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // -------------------------------------------------------------------------
  // Discover categories + value counts from DOM
  // categoryMap: Map<camelCaseKey, Map<valueSlug, count>>
  // -------------------------------------------------------------------------

  const categoryMap = new Map();

  for (const item of items) {
    for (const [key, val] of Object.entries(item.dataset)) {
      // Skip internal Macy.js attribute and empty values
      if (key === "macyComplete" || !val) continue;

      if (!categoryMap.has(key)) categoryMap.set(key, new Map());
      const counts = categoryMap.get(key);

      for (const v of val.trim().split(/\s+/).filter(Boolean)) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
  }

  if (categoryMap.size === 0) return;

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const state = {
    globalLogic: "and",
    categories: Object.fromEntries(
      [...categoryMap.keys()].map((
        k,
      ) => [k, { logic: "or", selected: new Set() }]),
    ),
  };

  // -------------------------------------------------------------------------
  // Filter logic
  // -------------------------------------------------------------------------

  function runFilter() {
    const activeCategories = Object.entries(state.categories).filter(
      ([, { selected }]) => selected.size > 0,
    );

    const toShow = [];
    const toHide = [];

    for (const item of items) {
      let shouldShow;

      if (activeCategories.length === 0) {
        shouldShow = true;
      } else {
        const results = activeCategories.map(([cat, { logic, selected }]) => {
          const raw = item.dataset[cat] ?? "";
          const vals = new Set(raw.trim().split(/\s+/).filter(Boolean));
          return logic === "and"
            ? [...selected].every((v) => vals.has(v))
            : [...selected].some((v) => vals.has(v));
        });

        shouldShow = state.globalLogic === "and"
          ? results.every(Boolean)
          : results.some(Boolean);
      }

      if (shouldShow && item.hidden) toShow.push(item);
      else if (!shouldShow && !item.hidden) toHide.push(item);
    }

    const visibleCount = items.filter(
      (item) => !toHide.includes(item) && !item.hidden || toShow.includes(item),
    ).length;

    updateResultCount(visibleCount);

    // FLIP — snapshot "first" positions of items staying visible
    const stayers = items.filter(
      (item) =>
        !item.hidden && !toHide.includes(item) && !toShow.includes(item),
    );
    const firstPositions = new Map(
      stayers.map((item) => [item, item.getBoundingClientRect()]),
    );

    const shouldShowEmpty = visibleCount === 0 && activeCategories.length > 0;

    // Step 1: fade out items being hidden
    toHide.forEach((item) => item.classList.add("is-filter-hiding"));

    if (!shouldShowEmpty && emptyStateEl.classList.contains("is-visible")) {
      emptyStateEl.classList.remove("is-visible");
    }

    const DURATION = 220;

    setTimeout(() => {
      // Step 2: actually hide them & remove animation class
      toHide.forEach((item) => {
        item.hidden = true;
        item.classList.remove("is-filter-hiding");
      });

      if (!shouldShowEmpty) {
        emptyStateEl.hidden = true;
      }

      // Step 3: show items, initially invisible
      toShow.forEach((item) => {
        item.hidden = false;
        item.classList.add("is-filter-showing");
      });

      if (shouldShowEmpty) {
        emptyStateEl.hidden = false;
      }

      // Step 4: recalculate layout — Macy sets new top/left on all visible items
      globalThis.macyInstance?.recalculate(true);

      // FLIP — compute deltas and apply inverted transforms instantly (no transition)
      stayers.forEach((item) => {
        const first = firstPositions.get(item);
        const last = item.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          item.style.transition = "none";
          item.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      });

      // Step 5: play — release transforms & fade-in new items simultaneously
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          stayers.forEach((item) => {
            if (item.style.transform) {
              item.style.transition = "";
              item.style.transform = "";
            }
          });
          toShow.forEach((item) => item.classList.remove("is-filter-showing"));

          if (shouldShowEmpty) {
            emptyStateEl.classList.add("is-visible");
          }
        });
      });
    }, DURATION);
  }

  // -------------------------------------------------------------------------
  // UI helpers
  // -------------------------------------------------------------------------

  function updateResultCount(visible) {
    const el = panel.querySelector(".filter-result-count");
    if (el) el.textContent = `${visible} / ${items.length}`;
  }

  function syncGlobalLogicButtons() {
    panel.querySelectorAll("[data-global-logic]").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        btn.dataset.globalLogic === state.globalLogic,
      );
    });
  }

  function syncCatLogicButtons(cat) {
    panel.querySelectorAll(`[data-cat="${cat}"][data-cat-logic]`).forEach(
      (btn) => {
        btn.classList.toggle(
          "is-active",
          btn.dataset.catLogic === state.categories[cat].logic,
        );
      },
    );
  }

  function openDropdown(cat) {
    panel.querySelector(`[data-field-area="${cat}"]`)?.classList.add("is-open");
    const dropdown = panel.querySelector(`[data-field-dropdown="${cat}"]`);
    if (dropdown && !dropdown.matches(":popover-open")) {
      dropdown.showPopover();
      dropdown.classList.add("is-open");
    }
  }

  function closeDropdown(cat) {
    panel.querySelector(`[data-field-area="${cat}"]`)?.classList.remove(
      "is-open",
    );
    const dropdown = panel.querySelector(`[data-field-dropdown="${cat}"]`);
    if (dropdown && dropdown.matches(":popover-open")) {
      dropdown.hidePopover();
      dropdown.classList.remove("is-open");
    }
  }

  function closeAllDropdowns() {
    for (const cat of categoryMap.keys()) closeDropdown(cat);
  }

  function applyDropdownTextFilter(cat, query) {
    const q = query.toLowerCase();
    panel.querySelectorAll(`[data-field-dropdown="${cat}"] li`).forEach(
      (li) => {
        li.hidden = q.length > 0 &&
          !toLabel(li.dataset.value).toLowerCase().includes(q);
      },
    );
  }

  // -------------------------------------------------------------------------
  // Tag management
  // -------------------------------------------------------------------------

  function addTag(cat, value) {
    state.categories[cat].selected.add(value);

    const area = panel.querySelector(`[data-field-area="${cat}"]`);
    const input = panel.querySelector(`[data-field-input="${cat}"]`);
    const dropdown = panel.querySelector(`[data-field-dropdown="${cat}"]`);

    // Remove option from dropdown
    dropdown.querySelector(`li[data-value="${CSS.escape(value)}"]`)?.remove();

    // Insert tag before the text input
    const tag = document.createElement("span");
    tag.className = "filter-tag";
    tag.dataset.value = value;
    tag.innerHTML = `${toLabel(value)} <button class="filter-tag-remove" ` +
      `data-tag-cat="${cat}" data-tag-value="${value}" ` +
      `aria-label="Remove ${toLabel(value)}">×</button>`;
    area.insertBefore(tag, input);

    input.value = "";
    applyDropdownTextFilter(cat, "");
    runFilter();
  }

  function removeTag(cat, value) {
    state.categories[cat].selected.delete(value);

    // Remove tag element
    panel
      .querySelector(
        `[data-field-area="${cat}"] .filter-tag[data-value="${
          CSS.escape(value)
        }"]`,
      )
      ?.remove();

    // Re-insert option into dropdown in sorted-by-count order
    const dropdown = panel.querySelector(`[data-field-dropdown="${cat}"]`);
    const counts = categoryMap.get(cat);
    const count = counts.get(value) ?? 0;

    const newLi = document.createElement("li");
    newLi.dataset.value = value;
    newLi.dataset.cat = cat;
    newLi.innerHTML = `<span>${
      toLabel(value)
    }</span> <span class="val-count">${count}</span>`;

    const lis = [...dropdown.querySelectorAll("li")];
    const insertBefore = lis.find((li) =>
      (counts.get(li.dataset.value) ?? 0) < count
    );
    insertBefore
      ? dropdown.insertBefore(newLi, insertBefore)
      : dropdown.appendChild(newLi);

    // Re-apply text filter
    const input = panel.querySelector(`[data-field-input="${cat}"]`);
    applyDropdownTextFilter(cat, input?.value ?? "");

    runFilter();
  }

  function resetAll() {
    state.globalLogic = "and";
    for (const cat of Object.keys(state.categories)) {
      state.categories[cat].selected.clear();
      state.categories[cat].logic = "or";
    }
    buildUI();
    runFilter();
  }

  // -------------------------------------------------------------------------
  // Build UI
  // -------------------------------------------------------------------------

  function buildUI() {
    panel.innerHTML = "";

    // --- Header ---
    const header = document.createElement("div");
    header.className = "filter-panel-header";
    header.innerHTML = `
      <span class="filter-result-count">${items.length} / ${items.length}</span>
      <div class="filter-global-logic">
        <span class="filter-logic-label">Across categories:</span>
        <button class="filter-btn is-active" data-global-logic="and">AND</button>
        <button class="filter-btn" data-global-logic="or">OR</button>
        <button class="filter-btn filter-btn-reset" data-global-reset>Reset</button>
      </div>
    `;
    panel.appendChild(header);

    // --- Categories ---
    const categoriesEl = document.createElement("div");
    categoriesEl.className = "filter-categories";

    for (const [cat, counts] of categoryMap) {
      const sortedValues = [...counts.entries()].sort((a, b) => b[1] - a[1]);

      const section = document.createElement("div");
      section.className = "filter-category";

      section.innerHTML = `
        <div class="filter-category-header">
          <span class="filter-category-label">${toLabel(cat)}</span>
          <div class="filter-category-controls">
            <button class="filter-btn" data-cat="${cat}" data-cat-logic="and">AND</button>
            <button class="filter-btn is-active" data-cat="${cat}" data-cat-logic="or">OR</button>
            <button class="filter-btn filter-btn-reset" data-cat="${cat}" data-cat-reset>Reset</button>
          </div>
        </div>
        <div class="filter-field">
          <div 
            class="filter-field-input-area" 
            data-field-area="${cat}" 
            style="anchor-name: --anchor-${cat}"
          >
            <input
              type="text"
              class="filter-type-input"
              placeholder="Filter…"
              data-field-input="${cat}"
              autocomplete="off"
            >
          </div>
          <ul 
            class="filter-dropdown" 
            data-field-dropdown="${cat}" 
            popover="manual"
            style="position-anchor: --anchor-${cat}"
          >
            ${
        sortedValues
          .map(
            ([v, n]) =>
              `<li data-value="${v}" data-cat="${cat}"><span>${
                toLabel(v)
              }</span> <span class="val-count">${n}</span></li>`,
          )
          .join("")
      }
          </ul>
        </div>
      `;

      categoriesEl.appendChild(section);
    }

    panel.appendChild(categoriesEl);
  }

  // -------------------------------------------------------------------------
  // Event listeners
  // -------------------------------------------------------------------------

  function attachListeners() {
    // --- Panel click delegation ---
    panel.addEventListener("click", (e) => {
      // Global AND / OR
      const globalBtn = e.target.closest("[data-global-logic]");
      if (globalBtn) {
        state.globalLogic = globalBtn.dataset.globalLogic;
        syncGlobalLogicButtons();
        runFilter();
        return;
      }

      // Global Reset button
      const globalResetBtn = e.target.closest("[data-global-reset]");
      if (globalResetBtn) {
        resetAll();
        return;
      }

      // Per-category AND / OR
      const catLogicBtn = e.target.closest("[data-cat-logic]");
      if (catLogicBtn) {
        const cat = catLogicBtn.dataset.cat;
        state.categories[cat].logic = catLogicBtn.dataset.catLogic;
        syncCatLogicButtons(cat);
        runFilter();
        return;
      }

      // Reset button
      const resetBtn = e.target.closest("[data-cat-reset]");
      if (resetBtn) {
        const cat = resetBtn.dataset.cat;
        [...state.categories[cat].selected].forEach((v) => removeTag(cat, v));
        return;
      }

      // Remove tag ×
      const tagRemove = e.target.closest("[data-tag-cat]");
      if (tagRemove) {
        removeTag(tagRemove.dataset.tagCat, tagRemove.dataset.tagValue);
        return;
      }

      // Select dropdown option
      const li = e.target.closest("[data-field-dropdown] li");
      if (li && !li.hidden) {
        addTag(li.dataset.cat, li.dataset.value);
        return;
      }

      // Click on field area → open dropdown (unless clicking the text input itself)
      const fieldArea = e.target.closest("[data-field-area]");
      if (
        fieldArea && !e.target.closest(".filter-type-input") &&
        !e.target.closest(".filter-tag")
      ) {
        const cat = fieldArea.dataset.fieldArea;
        const dropdown = panel.querySelector(`[data-field-dropdown="${cat}"]`);
        if (dropdown.classList.contains("is-open")) {
          closeDropdown(cat);
        } else {
          closeAllDropdowns();
          openDropdown(cat);
          panel.querySelector(`[data-field-input="${cat}"]`)?.focus();
        }
      }
    });

    // --- Text input filtering ---
    panel.addEventListener("input", (e) => {
      const input = e.target.closest("[data-field-input]");
      if (!input) return;
      const cat = input.dataset.fieldInput;
      openDropdown(cat);
      applyDropdownTextFilter(cat, input.value);
    });

    // --- Click on input opens dropdown ---
    panel.addEventListener("focusin", (e) => {
      const input = e.target.closest("[data-field-input]");
      if (!input) return;
      const cat = input.dataset.fieldInput;
      closeAllDropdowns();
      openDropdown(cat);
    });

    // --- Close dropdowns when clicking outside ---
    document.addEventListener("click", (e) => {
      const isInsidePanel = e.target.closest(".gallery-filter-panel");
      const isInsideDropdown = e.target.closest(".filter-dropdown");
      const isFieldTrigger = e.target.closest("[data-field-area]");

      // Clicked completely outside the filter UI
      if (!isInsidePanel && !isInsideDropdown) {
        closeAllDropdowns();
        return;
      }

      // Clicked inside the panel but not on a field area
      if (isInsidePanel && !isFieldTrigger && !isInsideDropdown) {
        closeAllDropdowns();
      }
    });
  }

  buildUI();
  attachListeners();
});
