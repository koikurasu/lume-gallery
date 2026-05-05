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
  let minYear = Infinity;
  let maxYear = -Infinity;

  for (const item of items) {
    if (item.dataset.year) {
      const y = parseInt(item.dataset.year, 10);
      if (!isNaN(y)) {
        if (y < minYear) minYear = y;
        if (y > maxYear) maxYear = y;
      }
    }

    for (const [key, val] of Object.entries(item.dataset)) {
      // Skip internal Macy.js attribute, year, and empty values
      if (key === "macyComplete" || key === "year" || !val) continue;

      if (!categoryMap.has(key)) categoryMap.set(key, new Map());
      const counts = categoryMap.get(key);

      for (const v of val.trim().split(/\s+/).filter(Boolean)) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
  }

  const hasYears = minYear !== Infinity && maxYear !== -Infinity;

  if (categoryMap.size === 0 && !hasYears) return;

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const state = {
    globalLogic: "and",
    yearRange: hasYears ? { min: minYear, max: maxYear } : null,
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
      let shouldShow = true;

      if (hasYears) {
        const itemYear = parseInt(item.dataset.year, 10);
        const isFullRange = state.yearRange.min === minYear &&
          state.yearRange.max === maxYear;
        const yearPasses = isFullRange
          ? true
          : (!isNaN(itemYear) && itemYear >= state.yearRange.min &&
            itemYear <= state.yearRange.max);
        shouldShow = yearPasses;
      }

      if (shouldShow && activeCategories.length > 0) {
        const results = activeCategories.map(([cat, { logic, selected }]) => {
          const raw = item.dataset[cat] ?? "";
          const vals = new Set(raw.trim().split(/\s+/).filter(Boolean));
          return logic === "and"
            ? [...selected].every((v) => vals.has(v))
            : [...selected].some((v) => vals.has(v));
        });

        const catShouldShow = state.globalLogic === "and"
          ? results.every(Boolean)
          : results.some(Boolean);

        shouldShow = catShouldShow;
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

    const isYearModified = hasYears &&
      (state.yearRange.min !== minYear || state.yearRange.max !== maxYear);
    const shouldShowEmpty = visibleCount === 0 &&
      (activeCategories.length > 0 || isYearModified);

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

  function positionDropdown(area, dropdown) {
    const rect = area.getBoundingClientRect();
    const vv = globalThis.visualViewport;
    const vh = vv ? vv.height : globalThis.innerHeight;
    const offsetTop = vv ? vv.offsetTop : 0;
    const offsetLeft = vv ? vv.offsetLeft : 0;

    const naturalHeight = dropdown.scrollHeight || 250;
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;

    dropdown.style.position = "fixed";
    dropdown.style.left = (rect.left + offsetLeft) + "px";
    dropdown.style.width = rect.width + "px";
    dropdown.style.transform = "none";
    dropdown.style.margin = "0";
    dropdown.style.zIndex = "9999";

    // Bias towards dropping down, only drop up if significantly more space above
    let isDropUp = false;
    if (spaceBelow < naturalHeight + 16 && spaceAbove > spaceBelow + 40) {
      isDropUp = true;
    }

    if (isDropUp) {
      const maxH = Math.min(naturalHeight, Math.max(0, spaceAbove - 16));
      dropdown.style.maxHeight = maxH + "px";
      dropdown.style.top = (rect.top + offsetTop - maxH - 8) + "px";
      dropdown.style.bottom = "auto";
    } else {
      const maxH = Math.min(naturalHeight, Math.max(0, spaceBelow - 16));
      dropdown.style.maxHeight = maxH + "px";
      dropdown.style.top = (rect.bottom + offsetTop + 8) + "px";
      dropdown.style.bottom = "auto";
    }
  }

  function updateDropdownPositions() {
    if (isAnchorSupported) return;
    const openArea = panel.querySelector(".filter-field-input-area.is-open");
    if (openArea) {
      const cat = openArea.dataset.fieldArea;
      const dropdown = panel.querySelector(`[data-field-dropdown="${cat}"]`);
      if (dropdown && dropdown.classList.contains("is-open")) {
        positionDropdown(openArea, dropdown);
      }
    }
  }

  function openDropdown(cat) {
    const area = panel.querySelector(`[data-field-area="${cat}"]`);
    if (area) area.classList.add("is-open");
    const dropdown = panel.querySelector(`[data-field-dropdown="${cat}"]`);

    if (dropdown && !dropdown.classList.contains("is-open")) {
      if (dropdown.showPopover) {
        dropdown.showPopover();
      }

      if (!isAnchorSupported) {
        positionDropdown(area, dropdown);
      }

      dropdown.classList.add("is-open");
    }
  }

  function closeDropdown(cat) {
    panel.querySelector(`[data-field-area="${cat}"]`)?.classList.remove(
      "is-open",
    );
    const dropdown = panel.querySelector(`[data-field-dropdown="${cat}"]`);
    if (dropdown && dropdown.classList.contains("is-open")) {
      if (dropdown.hidePopover) {
        dropdown.hidePopover();
      }
      if (!isAnchorSupported) {
        // Clear manually-set positioning styles
        dropdown.style.cssText = "";
      }
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
    updateDropdownPositions();
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
    if (hasYears) {
      state.yearRange.min = minYear;
      state.yearRange.max = maxYear;
    }
    buildUI();
    runFilter();
  }

  // -------------------------------------------------------------------------
  // Build UI
  // -------------------------------------------------------------------------

  const isAnchorSupported = CSS.supports("anchor-name: --foo");

  function buildUI() {
    panel.innerHTML = "";

    // --- Header ---
    const header = document.createElement("div");
    header.className = "filter-panel-header";
    header.innerHTML = `
      <span class="filter-result-count">${items.length} / ${items.length}</span>
      <div class="filter-global-logic">
        <span class="filter-logic-label">Across categories:</span>
        <button class="filter-btn is-active" data-global-logic="and">ALL</button>
        <button class="filter-btn" data-global-logic="or">ANY</button>
        <button class="filter-btn filter-btn-reset" data-global-reset>Reset</button>
      </div>
    `;
    panel.appendChild(header);

    // --- Year Filter ---
    if (hasYears) {
      const yearSection = document.createElement("div");
      yearSection.className = "filter-category filter-year-section";
      yearSection.innerHTML = `
        <div class="filter-category-header">
          <span class="filter-category-label">Year</span>
          <div class="filter-category-controls">
            <button class="filter-btn filter-btn-reset" data-year-reset>Reset</button>
          </div>
        </div>
        <div class="filter-year-slider">
          <div class="range-slider-track"></div>
          <div class="range-slider-fill" id="year-slider-fill"></div>
          <input type="range" id="year-min-range" class="year-range" min="${minYear}" max="${maxYear}" value="${state.yearRange.min}" step="1">
          <input type="range" id="year-max-range" class="year-range" min="${minYear}" max="${maxYear}" value="${state.yearRange.max}" step="1">
        </div>
        <div class="filter-year-inputs">
          <input type="number" id="year-min-input" class="year-input" min="${minYear}" max="${maxYear}" value="${state.yearRange.min}">
          <input type="number" id="year-max-input" class="year-input" min="${minYear}" max="${maxYear}" value="${state.yearRange.max}">
        </div>
      `;
      panel.appendChild(yearSection);
    }

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
            <button class="filter-btn" data-cat="${cat}" data-cat-logic="and">ALL</button>
            <button class="filter-btn is-active" data-cat="${cat}" data-cat-logic="or">ANY</button>
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
            ${
        isAnchorSupported ? `style="position-anchor: --anchor-${cat}"` : ""
      }
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
    if (hasYears) updateYearSliderFill();
  }

  function updateYearSliderFill() {
    const minRange = document.getElementById("year-min-range");
    const maxRange = document.getElementById("year-max-range");
    const fill = document.getElementById("year-slider-fill");
    if (!minRange || !maxRange || !fill) return;

    const min = parseInt(minRange.min, 10);
    const max = parseInt(maxRange.max, 10);
    const range = max - min || 1;

    let currMin = parseInt(minRange.value, 10);
    let currMax = parseInt(maxRange.value, 10);

    if (currMin > currMax) {
      if (document.activeElement === minRange) {
        minRange.value = currMax;
        currMin = currMax;
      } else {
        maxRange.value = currMin;
        currMax = currMin;
      }
    }

    state.yearRange.min = currMin;
    state.yearRange.max = currMax;

    const minInput = document.getElementById("year-min-input");
    const maxInput = document.getElementById("year-max-input");
    if (minInput && document.activeElement !== minInput) {
      minInput.value = currMin;
    }
    if (maxInput && document.activeElement !== maxInput) {
      maxInput.value = currMax;
    }

    const percentMin = ((currMin - min) / range) * 100;
    const percentMax = ((currMax - min) / range) * 100;

    fill.style.left = `${percentMin}%`;
    fill.style.width = `${percentMax - percentMin}%`;
  }

  function handleYearInputChange() {
    const minInput = document.getElementById("year-min-input");
    const maxInput = document.getElementById("year-max-input");
    const minRange = document.getElementById("year-min-range");
    const maxRange = document.getElementById("year-max-range");

    let currMin = parseInt(minInput.value, 10) || minYear;
    let currMax = parseInt(maxInput.value, 10) || maxYear;

    currMin = Math.max(minYear, Math.min(currMin, maxYear));
    currMax = Math.max(minYear, Math.min(currMax, maxYear));

    if (currMin > currMax) {
      if (document.activeElement === minInput) {
        currMin = currMax;
        minInput.value = currMin;
      } else {
        currMax = currMin;
        maxInput.value = currMax;
      }
    }

    minRange.value = currMin;
    maxRange.value = currMax;

    updateYearSliderFill();
    runFilter();
  }

  // -------------------------------------------------------------------------
  // Event listeners
  // -------------------------------------------------------------------------

  function attachListeners() {
    // --- Position updates for fallback ---
    if (!isAnchorSupported) {
      panel.addEventListener("scroll", updateDropdownPositions);
      globalThis.visualViewport?.addEventListener(
        "resize",
        updateDropdownPositions,
      );
      globalThis.visualViewport?.addEventListener(
        "scroll",
        updateDropdownPositions,
      );
    }

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

      // Reset Year
      const resetYearBtn = e.target.closest("[data-year-reset]");
      if (resetYearBtn && hasYears) {
        state.yearRange.min = minYear;
        state.yearRange.max = maxYear;
        const minRange = document.getElementById("year-min-range");
        const maxRange = document.getElementById("year-max-range");
        if (minRange) minRange.value = minYear;
        if (maxRange) maxRange.value = maxYear;
        updateYearSliderFill();
        runFilter();
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

    // --- Year Filter interactions ---
    if (hasYears) {
      panel.addEventListener("input", (e) => {
        if (e.target.classList.contains("year-range")) {
          updateYearSliderFill();
        }
      });

      panel.addEventListener("change", (e) => {
        if (e.target.classList.contains("year-range")) {
          runFilter();
        } else if (e.target.classList.contains("year-input")) {
          handleYearInputChange();
        }
      });
    }

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
