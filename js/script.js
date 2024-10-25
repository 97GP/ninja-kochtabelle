/**
 * Hauptklasse für die Verwaltung der Rezepte
 */
class RecipeManager {
    constructor() {
        this.recipes = [];
        this.initializeTheme();
        this.initializeEventListeners();
        this.loadData();
    }

    /**
     * Initialisiert das Theme basierend auf den Systemeinstellungen oder gespeicherten Präferenzen
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-theme', 'dark');
            this.updateThemeIcon('dark');
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const newTheme = e.matches ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            this.updateThemeIcon(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    /**
     * Aktualisiert das Theme-Icon
     * @param {string} theme - Das aktuelle Theme ('dark' oder 'light')
     */
    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle .material-symbols-rounded');
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }

    /**
     * Wechselt zwischen Hell- und Dunkel-Theme
     */
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    /**
     * Initialisiert alle Event Listener
     */
    initializeEventListeners() {
        this.searchInput = document.getElementById("search-input");
        this.recipeTable = document.getElementById("recipe-table");
        this.modal = document.getElementById("recipe-modal");
        this.form = document.getElementById("recipe-form");
        this.categorySelect = document.getElementById("category-select");
        this.newCategoryInput = document.getElementById("new-category");

        document.getElementById("theme-toggle").addEventListener("click", () => this.toggleTheme());
        this.searchInput.addEventListener("input", () => this.handleSearch());
        document.getElementById("add-recipe-btn").addEventListener("click", () => this.openModal());
        document.getElementById("export-btn").addEventListener("click", () => this.exportData());
        document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-file").click());
        document.getElementById("import-file").addEventListener("change", (e) => this.importData(e));
        this.form.addEventListener("submit", (e) => this.handleFormSubmit(e));
        this.categorySelect.addEventListener("change", () => this.handleCategoryChange());
        document.querySelector(".close").addEventListener("click", () => this.closeModal());

        document.addEventListener('touchstart', (e) => {
            if (e.target.hasAttribute('contenteditable')) {
                e.target.focus();
            }
        });

        window.addEventListener("click", (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    /**
     * Lädt die Daten aus der data.json Datei
     */
    async loadData() {
        try {
            const response = await fetch('data/data.json');
            const data = await response.json();
            this.recipes = data.recipes;
            this.renderTable(this.recipes);
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            alert('Fehler beim Laden der Daten!');
        }
    }

    /**
     * Speichert die Änderungen in der data.json Datei
     * @returns {Promise<void>}
     */
    async saveData() {
        try {
            const response = await fetch('data/data.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipes: this.recipes }, null, 2)
            });
            
            if (!response.ok) {
                throw new Error('Fehler beim Speichern');
            }
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Fehler beim Speichern der Änderungen!');
        }
    }

    /**
     * Rendert die Tabelle mit den Rezepten
     * @param {Array} recipes - Array mit den anzuzeigenden Rezepten
     */
    renderTable(recipes) {
        let tableHtml = "";

        recipes.forEach((category, categoryIndex) => {
            if (category.items.length > 0) {
                tableHtml += `
                    <table>
                        <thead>
                            <tr class="header-row">
                                <td colspan="3">
                                    <span class="material-symbols-rounded">restaurant_menu</span>
                                    ${category.category}
                                </td>
                            </tr>
                            <tr>
                                <th class="col-name">Name</th>
                                <th class="col-temp">Temperatur</th>
                                <th class="col-time">Garzeit</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                category.items.forEach((item, itemIndex) => {
                    const rowId = `row-${categoryIndex}-${itemIndex}`;
                    tableHtml += `
                        <tr class="main-row" onclick="recipeManager.toggleDetails('${rowId}')">
                            <td class="col-name">${item.name}</td>
                            <td class="col-temp">${item.temperatur}</td>
                            <td class="col-time">${item.garzeit}</td>
                        </tr>
                        <tr id="${rowId}" class="detail-row" style="display: none;">
                            <td colspan="3">
                                <div class="detail-content">
                                    <div class="detail-grid">
                                        <div class="detail-item">
                                            <strong>Menge:</strong>
                                            <span contenteditable="true" onblur="recipeManager.handleCellEdit(this, ${categoryIndex}, ${itemIndex}, 'menge')">${item.menge}</span>
                                        </div>
                                        <div class="detail-item">
                                            <strong>Vorbereitung:</strong>
                                            <span contenteditable="true" onblur="recipeManager.handleCellEdit(this, ${categoryIndex}, ${itemIndex}, 'vorbereitung')">${item.vorbereitung}</span>
                                        </div>
                                        <div class="detail-item">
                                            <strong>In Öl schwenken:</strong>
                                            <span contenteditable="true" onblur="recipeManager.handleCellEdit(this, ${categoryIndex}, ${itemIndex}, 'in_oel_schwenken')">${item.in_oel_schwenken}</span>
                                        </div>
                                    </div>
                                    <div class="action-buttons">
                                        <button class="btn edit-btn" onclick="event.stopPropagation(); recipeManager.editRecipe(${categoryIndex}, ${itemIndex})" aria-label="Bearbeiten">
                                            <span class="material-symbols-rounded">edit</span>
                                        </button>
                                        <button class="btn duplicate-btn" onclick="event.stopPropagation(); recipeManager.duplicateRecipe(${categoryIndex}, ${itemIndex})" aria-label="Duplizieren">
                                            <span class="material-symbols-rounded">content_copy</span>
                                        </button>
                                        <button class="btn delete-btn" onclick="event.stopPropagation(); recipeManager.deleteRecipe(${categoryIndex}, ${itemIndex})" aria-label="Löschen">
                                            <span class="material-symbols-rounded">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                tableHtml += "</tbody></table>";
            }
        });

        this.recipeTable.innerHTML = tableHtml || "<p>Keine Rezepte gefunden</p>";
    }

    /**
     * Klappt die Details einer Zeile aus oder ein
     * @param {string} rowId - Die ID der Detail-Zeile
     */
    toggleDetails(rowId) {
        const detailRow = document.getElementById(rowId);
        const isHidden = detailRow.style.display === 'none';
        detailRow.style.display = isHidden ? 'table-row' : 'none';
    }

    /**
     * Dupliziert ein Rezept
     * @param {number} categoryIndex - Index der Kategorie
     * @param {number} itemIndex - Index des Items
     */
    async duplicateRecipe(categoryIndex, itemIndex) {
        const originalRecipe = this.recipes[categoryIndex].items[itemIndex];
        const duplicatedRecipe = { ...originalRecipe };
        duplicatedRecipe.name = `${duplicatedRecipe.name} (Kopie)`;
        this.recipes[categoryIndex].items.push(duplicatedRecipe);
        await this.saveData();
        this.renderTable(this.recipes);
    }

    /**
     * Handhabt die direkte Bearbeitung von Zellen
     * @param {HTMLElement} cell - Die bearbeitete Zelle
     * @param {number} categoryIndex - Index der Kategorie
     * @param {number} itemIndex - Index des Items
     * @param {string} field - Name des bearbeiteten Feldes
     */
    async handleCellEdit(cell, categoryIndex, itemIndex, field) {
        const newValue = cell.textContent.trim();
        this.recipes[categoryIndex].items[itemIndex][field] = newValue;
        await this.saveData();
    }

    /**
     * Handhabt die Suche nach Rezepten
     */
    handleSearch() {
        const searchValue = this.searchInput.value.toLowerCase();
        const filteredRecipes = this.recipes.map(category => ({
            ...category,
            items: category.items.filter(item =>
                item.name.toLowerCase().includes(searchValue)
            )
        }));
        this.renderTable(filteredRecipes);
    }

    /**
     * Öffnet das Modal zum Hinzufügen/Bearbeiten eines Rezepts
     * @param {Object} recipe - Optional: Zu bearbeitendes Rezept
     * @param {number} categoryIndex - Optional: Index der Kategorie
     * @param {number} itemIndex - Optional: Index des Items
     */
    openModal(recipe = null, categoryIndex = null, itemIndex = null) {
        this.modal.style.display = "block";
        this.form.reset();
        
        if (recipe) {
            this.form.dataset.categoryIndex = categoryIndex;
            this.form.dataset.itemIndex = itemIndex;
            this.categorySelect.value = this.recipes[categoryIndex].category;
            document.getElementById("name-input").value = recipe.name;
            document.getElementById("amount-input").value = recipe.menge;
            document.getElementById("prep-input").value = recipe.vorbereitung;
            document.getElementById("oil-input").value = recipe.in_oel_schwenken;
            document.getElementById("temp-input").value = recipe.temperatur;
            document.getElementById("time-input").value = recipe.garzeit;
        } else {
            delete this.form.dataset.categoryIndex;
            delete this.form.dataset.itemIndex;
        }

        document.body.style.overflow = 'hidden';
    }

    /**
     * Schließt das Modal
     */
    closeModal() {
        this.modal.style.display = "none";
        this.form.reset();
        document.body.style.overflow = '';
    }

    /**
     * Handhabt die Änderung der Kategorie-Auswahl
     */
    handleCategoryChange() {
        this.newCategoryInput.style.display = 
            this.categorySelect.value === "new" ? "block" : "none";
    }

    /**
     * Handhabt das Absenden des Formulars
     * @param {Event} e - Das Submit-Event
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById("name-input").value,
            menge: document.getElementById("amount-input").value,
            vorbereitung: document.getElementById("prep-input").value,
            in_oel_schwenken: document.getElementById("oil-input").value,
            temperatur: document.getElementById("temp-input").value,
            garzeit: document.getElementById("time-input").value
        };

        let category = this.categorySelect.value === "new" 
            ? this.newCategoryInput.value 
            : this.categorySelect.value;

        if (this.form.dataset.categoryIndex !== undefined) {
            const categoryIndex = parseInt(this.form.dataset.categoryIndex);
            const itemIndex = parseInt(this.form.dataset.itemIndex);
            this.recipes[categoryIndex].items[itemIndex] = formData;
        } else {
            let categoryIndex = this.recipes.findIndex(c => c.category === category);
            if (categoryIndex === -1) {
                this.recipes.push({ category, items: [] });
                categoryIndex = this.recipes.length - 1;
            }
            this.recipes[categoryIndex].items.push(formData);
        }

        await this.saveData();
        this.renderTable(this.recipes);
        this.closeModal();
    }

    /**
     * Bearbeitet ein Rezept
     * @param {number} categoryIndex - Index der Kategorie
     * @param {number} itemIndex - Index des Items
     */
    editRecipe(categoryIndex, itemIndex) {
        const recipe = this.recipes[categoryIndex].items[itemIndex];
        this.openModal(recipe, categoryIndex, itemIndex);
    }

    /**
     * Löscht ein Rezept
     * @param {number} categoryIndex - Index der Kategorie
     * @param {number} itemIndex - Index des Items
     */
    async deleteRecipe(categoryIndex, itemIndex) {
        if (confirm("Möchten Sie dieses Rezept wirklich löschen?")) {
            this.recipes[categoryIndex].items.splice(itemIndex, 1);
            if (this.recipes[categoryIndex].items.length === 0) {
                this.recipes.splice(categoryIndex, 1);
            }
            await this.saveData();
            this.renderTable(this.recipes);
        }
    }

    /**
     * Exportiert die Daten als JSON-Datei
     */
    exportData() {
        const dataStr = JSON.stringify({ recipes: this.recipes }, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "airfryer_recipes.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Importiert Daten aus einer JSON-Datei
     * @param {Event} e - Das Change-Event des File-Inputs
     */
    async importData(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.recipes) {
                        this.recipes = data.recipes;
                        await this.saveData();
                        this.renderTable(this.recipes);
                        alert("Daten erfolgreich importiert!");
                    } else {
                        alert("Ungültiges Dateiformat!");
                    }
                } catch (error) {
                    console.error("Fehler beim Importieren:", error);
                    alert("Fehler beim Importieren der Datei!");
                }
            };
            reader.readAsText(file);
        }
    }
}

// Initialisierung
const recipeManager = new RecipeManager();
