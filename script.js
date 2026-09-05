const tierContainer = document.getElementById("tierContainer");
    const imagePool = document.getElementById("imagePool");
    const imageInput = document.getElementById("imageInput");
    const imageCount = document.getElementById("imageCount");

    let imageID = 0;

    const defaultTiers = [
        {
            name: "S",
            color: "#ff6666"
        },
        {
            name: "A",
            color: "#ffb347"
        },
        {
            name: "B",
            color: "#ffe066"
        },
        {
            name: "C",
            color: "#8fd694"
        },
        {
            name: "D",
            color: "#6ca6ff"
        }
    ];

    // -------------------------
    // TIER LÉTREHOZÁSA
    // -------------------------

    function createTier(name, color) {

        const tier = document.createElement("div");

        tier.className = "tier";

        tier.innerHTML = `
            <div class="tier-label" style="background:${color}">

                <div
                    class="tier-name"
                    contenteditable="true"
                    spellcheck="false"
                >${name}</div>

                <div class="tier-buttons">

                    <button
                        class="small-button"
                        onclick="changeColor(this)"
                    >🎨</button>

                    <button
                        class="small-button"
                        onclick="removeTier(this)"
                    >🗑️</button>

                </div>

            </div>

            <div
                class="tier-items drop-zone"
            ></div>
        `;

        tierContainer.appendChild(tier);

        setupDropZone(tier.querySelector(".tier-items"));

        saveState();
    }


    // -------------------------
    // ALAP TIER-EK
    // -------------------------

    function createDefaultTiers() {

        tierContainer.innerHTML = "";

        defaultTiers.forEach(tier => {
            createTier(tier.name, tier.color);
        });

    }


    // -------------------------
    // ÚJ TIER
    // -------------------------

    function addTier() {

        const number = tierContainer.children.length + 1;

        createTier(
            "Tier " + number,
            "#777777"
        );

    }


    // -------------------------
    // TIER TÖRLÉSE
    // -------------------------

    function removeTier(button) {

        const tier = button.closest(".tier");

        const items = tier.querySelectorAll(".tier-image");

        items.forEach(img => {

            const wrapper = document.createElement("div");

            wrapper.className = "pool-item";

            wrapper.draggable = true;

            wrapper.appendChild(img);

            addDeleteButton(wrapper);

            imagePool.appendChild(wrapper);

            setupDrag(wrapper);

        });

        tier.remove();

        updateImageCount();

        saveState();
    }


    // -------------------------
    // SZÍN MÓDOSÍTÁSA
    // -------------------------

    function changeColor(button) {

        const color = prompt(
            "Add meg a tier színét hex formátumban:",
            "#ff6666"
        );

        if (!color) return;

        button
            .closest(".tier-label")
            .style.background = color;

        saveState();
    }


    // -------------------------
    // KÉPEK FELTÖLTÉSE
    // -------------------------

    imageInput.addEventListener("change", function() {

        const files = Array.from(this.files);

        files.forEach(file => {

            if (!file.type.startsWith("image/")) return;

            const reader = new FileReader();

            reader.onload = function(event) {

                createImage(event.target.result);

            };

            reader.readAsDataURL(file);

        });

        this.value = "";

    });


    // -------------------------
    // KÉP LÉTREHOZÁSA
    // -------------------------

    function createImage(src) {

        const wrapper = document.createElement("div");

        wrapper.className = "pool-item";

        wrapper.draggable = true;

        wrapper.dataset.id = "image-" + imageID++;

        const img = document.createElement("img");

        img.src = src;
        img.className = "tier-image";
        img.draggable = false;

        wrapper.appendChild(img);

        addDeleteButton(wrapper);

        imagePool.appendChild(wrapper);

        setupDrag(wrapper);

        updateEmptyMessage();
        updateImageCount();

        saveState();
    }


    // -------------------------
    // KÉP TÖRLÉSE
    // -------------------------

    function addDeleteButton(wrapper) {

        const button = document.createElement("button");

        button.className = "delete-image";
        button.innerHTML = "×";

        button.onclick = function(event) {

            event.stopPropagation();

            wrapper.remove();

            updateEmptyMessage();
            updateImageCount();

            saveState();

        };

        wrapper.appendChild(button);

    }


    // -------------------------
    // DRAG & DROP
    // -------------------------

    function setupDrag(element) {

        element.addEventListener("dragstart", function(event) {

            element.classList.add("dragging");

            event.dataTransfer.setData(
                "text/plain",
                "dragging"
            );

            window.draggedElement = element;

        });

        element.addEventListener("dragend", function() {

            element.classList.remove("dragging");

            window.draggedElement = null;

            saveState();

        });

    }


    function setupDropZone(zone) {

        zone.addEventListener("dragover", function(event) {

            event.preventDefault();

            const dragging = document.querySelector(".dragging");

            if (!dragging) return;

            const afterElement = getDragAfterElement(
                zone,
                event.clientX,
                event.clientY
            );

            if (afterElement == null) {

                zone.appendChild(dragging);

            } else {

                zone.insertBefore(
                    dragging,
                    afterElement
                );

            }

        });

        zone.addEventListener("drop", function(event) {

            event.preventDefault();

            updateEmptyMessage();

            saveState();

        });

    }


    // -------------------------
    // KÉPEK VISSZAHÚZÁSA
    // -------------------------

    imagePool.addEventListener("dragover", function(event) {

        event.preventDefault();

        const dragging =
            document.querySelector(".dragging");

        if (!dragging) return;

        const afterElement =
            getDragAfterElement(
                imagePool,
                event.clientX,
                event.clientY
            );

        if (afterElement == null) {

            imagePool.appendChild(dragging);

        } else {

            imagePool.insertBefore(
                dragging,
                afterElement
            );

        }

    });


    imagePool.addEventListener("drop", function(event) {

        event.preventDefault();

        updateEmptyMessage();
        saveState();

    });


    // -------------------------
    // DRAG POZÍCIÓ
    // -------------------------

    function getDragAfterElement(container, x, y) {

        const elements = [
            ...container.querySelectorAll(
                ".tier-image, .pool-item"
            )
        ].filter(
            element =>
                !element.classList.contains("dragging")
        );

        let closest = {
            offset: Number.NEGATIVE_INFINITY,
            element: null
        };

        elements.forEach(element => {

            const box =
                element.getBoundingClientRect();

            const offset =
                x -
                box.left -
                box.width / 2;

            if (
                offset < 0 &&
                offset > closest.offset
            ) {

                closest = {
                    offset: offset,
                    element: element
                };

            }

        });

        return closest.element;
    }


    // -------------------------
    // ÜRES ÁLLAPOT
    // -------------------------

    function updateEmptyMessage() {

        const message =
            imagePool.querySelector(".empty-message");

        const hasImages =
            imagePool.querySelector(".pool-item");

        if (hasImages && message) {

            message.remove();

        }

        if (!hasImages && !message) {

            const div =
                document.createElement("div");

            div.className = "empty-message";

            div.textContent =
                "Tölts fel képeket, majd húzd őket a tier-ekbe!";

            imagePool.appendChild(div);

        }

    }


    // -------------------------
    // KÉPSZÁMLÁLÓ
    // -------------------------

    function updateImageCount() {

        const total =
            document.querySelectorAll(".tier-image").length;

        imageCount.textContent =
            total + (total === 1 ? " kép" : " kép");

    }


    // -------------------------
    // MENTÉS
    // -------------------------

    function saveState() {

        const tiers = [];

        document
            .querySelectorAll(".tier")
            .forEach(tier => {

                const label =
                    tier.querySelector(".tier-label");

                const name =
                    tier.querySelector(".tier-name")
                    .innerText;

                const color =
                    label.style.background;

                const images = [];

                tier
                    .querySelectorAll(".tier-image")
                    .forEach(img => {

                        images.push(img.src);

                    });

                tiers.push({
                    name,
                    color,
                    images
                });

            });

        const pool = [];

        imagePool
            .querySelectorAll(".tier-image")
            .forEach(img => {

                pool.push(img.src);

            });

        localStorage.setItem(
            "tierList",
            JSON.stringify({
                tiers,
                pool
            })
        );

    }


    // -------------------------
    // BETÖLTÉS
    // -------------------------

    function loadState() {

        const saved =
            localStorage.getItem("tierList");

        if (!saved) {

            createDefaultTiers();

            return;

        }

        try {

            const data =
                JSON.parse(saved);

            tierContainer.innerHTML = "";

            data.tiers.forEach(tier => {

                createTier(
                    tier.name,
                    tier.color
                );

                const createdTier =
                    tierContainer.lastElementChild;

                const zone =
                    createdTier.querySelector(
                        ".tier-items"
                    );

                tier.images.forEach(src => {

                    const wrapper =
                        document.createElement("div");

                    wrapper.className = "pool-item";
                    wrapper.draggable = true;

                    const img =
                        document.createElement("img");

                    img.src = src;
                    img.className = "tier-image";
                    img.draggable = false;

                    wrapper.appendChild(img);

                    zone.appendChild(wrapper);

                    setupDrag(wrapper);

                });

            });


            data.pool.forEach(src => {

                const wrapper =
                    document.createElement("div");

                wrapper.className = "pool-item";
                wrapper.draggable = true;

                const img =
                    document.createElement("img");

                img.src = src;
                img.className = "tier-image";
                img.draggable = false;

                wrapper.appendChild(img);

                addDeleteButton(wrapper);

                imagePool.appendChild(wrapper);

                setupDrag(wrapper);

            });

            updateEmptyMessage();
            updateImageCount();

        } catch {

            createDefaultTiers();

        }

    }


    // -------------------------
    // RESET
    // -------------------------

    function resetList() {

        const confirmReset =
            confirm(
                "Biztosan törölni szeretnéd az egész tier listát?"
            );

        if (!confirmReset) return;

        localStorage.removeItem("tierList");

        location.reload();

    }


    // -------------------------
    // INDÍTÁS
    // -------------------------

    loadState();