
// ==========================================
// TIER LIST MAKER
// ==========================================

// HTML elemek
const tierContainer = document.getElementById("tierContainer");
const imagePool = document.getElementById("imagePool");
const imageInput = document.getElementById("imageInput");
const imageCount = document.getElementById("imageCount");
const listTitle = document.getElementById("listTitle");

const editorPage = document.getElementById("editorPage");
const savedPage = document.getElementById("savedPage");
const savedLists = document.getElementById("savedLists");


// Éppen húzott elem
let draggedElement = null;


// ==========================================
// ALAP TIER-EK
// ==========================================

const defaultTiers = [
    {
        name: "S",
        color: "#ff6666"
    },
    {
        name: "A",
        color: "#ffae5d"
    },
    {
        name: "B",
        color: "#ffe066"
    },
    {
        name: "C",
        color: "#8bd38b"
    },
    {
        name: "D",
        color: "#6da8ff"
    }
];


// ==========================================
// OLDAL INDÍTÁSA
// ==========================================

createDefaultTiers();

updateEmptyMessage();
updateImageCount();


// ==========================================
// TIER LÉTREHOZÁSA
// ==========================================

function createTier(name, color) {

    const tier = document.createElement("div");

    tier.className = "tier";

    tier.innerHTML = `
    
        <div
            class="tier-label"
            style="background: ${color}"
        >

            <div
                class="tier-name"
                contenteditable="true"
                spellcheck="false"
            >
                ${escapeHTML(name)}
            </div>

            <div class="tier-buttons">

                <button
                    class="small-button"
                    onclick="changeTierColor(this)"
                >
                    🎨
                </button>

                <button
                    class="small-button"
                    onclick="deleteTier(this)"
                >
                    🗑️
                </button>

            </div>

        </div>


        <div class="tier-items drop-zone"></div>

    `;


    tierContainer.appendChild(tier);


    // Drag & Drop beállítása
    setupDropZone(
        tier.querySelector(".tier-items")
    );


    // Tier név változásának figyelése
    tier
        .querySelector(".tier-name")
        .addEventListener(
            "input",
            updateCurrentTitle
        );
}


// ==========================================
// ALAP TIER-EK LÉTREHOZÁSA
// ==========================================

function createDefaultTiers() {

    tierContainer.innerHTML = "";

    defaultTiers.forEach(tier => {

        createTier(
            tier.name,
            tier.color
        );

    });
}


// ==========================================
// ÚJ TIER
// ==========================================

function addTier() {

    const number =
        tierContainer.children.length + 1;

    createTier(
        "Tier " + number,
        "#777777"
    );
}


// ==========================================
// TIER TÖRLÉSE
// ==========================================

function deleteTier(button) {

    const tier =
        button.closest(".tier");


    // A tierben lévő képeket visszatesszük
    // a képtárba
    const images =
        tier.querySelectorAll(".tier-image");


    images.forEach(img => {

        const wrapper =
            img.closest(".pool-item");


        if (wrapper) {

            imagePool.appendChild(
                wrapper
            );

        }

    });


    tier.remove();


    updateImageCount();
    updateEmptyMessage();
}


// ==========================================
// TIER SZÍNÉNEK MÓDOSÍTÁSA
// ==========================================

function changeTierColor(button) {

    const newColor =
        prompt(
            "Add meg a tier színét hex formátumban:",
            "#777777"
        );


    if (!newColor) {
        return;
    }


    const label =
        button.closest(".tier-label");


    label.style.background =
        newColor;
}


// ==========================================
// LISTA ÁTNEVEZÉSE
// ==========================================

function renameList() {

    const currentName =
        listTitle.innerText.trim();


    const newName =
        prompt(
            "Mi legyen a tier list neve?",
            currentName
        );


    if (!newName) {
        return;
    }


    const cleanName =
        newName.trim();


    if (!cleanName) {
        return;
    }


    listTitle.innerText =
        cleanName;
}


// ==========================================
// KÉPEK FELTÖLTÉSE
// ==========================================

imageInput.addEventListener(
    "change",
    function () {

        const files =
            Array.from(this.files);


        files.forEach(file => {

            // Csak képeket engedünk
            if (
                !file.type.startsWith("image/")
            ) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    createImage(
                        event.target.result
                    );

                };


            reader.readAsDataURL(file);

        });


        // Input resetelése
        this.value = "";

    }
);


// ==========================================
// KÉP LÉTREHOZÁSA
// ==========================================

function createImage(src) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "pool-item";


    wrapper.draggable = true;


    const img =
        document.createElement("img");


    img.src = src;

    img.className =
        "tier-image";

    img.draggable = false;


    wrapper.appendChild(img);


    addDeleteButton(wrapper);


    imagePool.appendChild(wrapper);


    setupDrag(wrapper);


    updateEmptyMessage();
    updateImageCount();
}


// ==========================================
// KÉP TÖRLÉSE
// ==========================================

function addDeleteButton(wrapper) {

    const button =
        document.createElement("button");


    button.className =
        "delete-image";


    button.innerText =
        "×";


    button.title =
        "Kép törlése";


    button.onclick =
        function (event) {

            event.stopPropagation();


            wrapper.remove();


            updateEmptyMessage();
            updateImageCount();

        };


    wrapper.appendChild(button);
}


// ==========================================
// DRAG INDÍTÁSA
// ==========================================

function setupDrag(element) {

    element.addEventListener(
        "dragstart",
        function () {

            draggedElement =
                element;


            element.classList.add(
                "dragging"
            );

        }
    );


    element.addEventListener(
        "dragend",
        function () {

            element.classList.remove(
                "dragging"
            );


            draggedElement =
                null;


            updateEmptyMessage();

        }
    );

}


// ==========================================
// DROP ZÓNA
// ==========================================

function setupDropZone(zone) {

    zone.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();


            if (!draggedElement) {
                return;
            }


            const afterElement =
                getDragAfterElement(
                    zone,
                    event.clientX,
                    event.clientY
                );


            if (
                afterElement === null
            ) {

                zone.appendChild(
                    draggedElement
                );

            } else {

                zone.insertBefore(
                    draggedElement,
                    afterElement
                );

            }

        }
    );


    zone.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();


            updateEmptyMessage();

        }
    );

}


// ==========================================
// KÉPTÁR DROP
// ==========================================

imagePool.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();


        if (!draggedElement) {
            return;
        }


        const afterElement =
            getDragAfterElement(
                imagePool,
                event.clientX,
                event.clientY
            );


        if (
            afterElement === null
        ) {

            imagePool.appendChild(
                draggedElement
            );

        } else {

            imagePool.insertBefore(
                draggedElement,
                afterElement
            );

        }

    }
);


imagePool.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();


        updateEmptyMessage();

    }
);


// ==========================================
// DRAG POZÍCIÓ KISZÁMÍTÁSA
// ==========================================

function getDragAfterElement(
    container,
    x,
    y
) {

    const elements =
        [
            ...container.querySelectorAll(
                ".pool-item"
            )
        ].filter(
            element =>
                element !== draggedElement
        );


    let closest = {

        offset:
            Number.NEGATIVE_INFINITY,

        element:
            null

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

                offset:
                    offset,

                element:
                    element

            };

        }

    });


    return closest.element;
}


// ==========================================
// TIER LIST MENTÉSE
// ==========================================

function compressImage(src) {

    return new Promise((resolve, reject) => {

        const image = new Image();

        image.onload = function () {

            const maxSize = 1200;
            const scale = Math.min(
                1,
                maxSize / Math.max(image.naturalWidth, image.naturalHeight)
            );

            const canvas = document.createElement("canvas");

            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

            canvas
                .getContext("2d")
                .drawImage(image, 0, 0, canvas.width, canvas.height);

            resolve(
                canvas.toDataURL("image/jpeg", 0.8)
            );

        };

        image.onerror = reject;
        image.src = src;

    });
}

async function saveTierList() {

    let name =
        listTitle.innerText.trim();


    // Ha nincs név, kérünk egyet
    if (
        !name ||
        name === "Új Tier List"
    ) {

        const enteredName =
            prompt(
                "Mi legyen a tier list neve?"
            );


        if (!enteredName) {
            return;
        }


        name =
            enteredName.trim();


        if (!name) {
            return;
        }


        listTitle.innerText =
            name;
    }


    // ======================================
    // TIEREK ÖSSZEGYŰJTÉSE
    // ======================================

    const tiers = [];


    document
        .querySelectorAll(".tier")
        .forEach(tier => {

            const label =
                tier.querySelector(
                    ".tier-label"
                );


            const tierName =
                tier.querySelector(
                    ".tier-name"
                )
                .innerText
                .trim();


            const images = [];


            tier
                .querySelectorAll(
                    ".tier-image"
                )
                .forEach(img => {

                    images.push(
                        img.src
                    );

                });


            tiers.push({

                name:
                    tierName,

                color:
                    label.style.background,

                images:
                    images

            });

        });


    // ======================================
    // KÉPTÁR ÖSSZEGYŰJTÉSE
    // ======================================

    const pool = [];


    imagePool
        .querySelectorAll(
            ".tier-image"
        )
        .forEach(img => {

            pool.push(
                img.src
            );

        });


    // A kepeket tomoritjuk, hogy a mentett listak
    // ne lepjék túl a localStorage tárhelykorlátját.
    const allImages = [
        ...tiers.flatMap(tier => tier.images),
        ...pool
    ];

    const compressedImages =
        await Promise.all(
            allImages.map(src => compressImage(src))
        );

    let imageIndex = 0;

    tiers.forEach(tier => {

        tier.images = tier.images.map(() => {
            return compressedImages[imageIndex++];
        });

    });

    for (let index = 0; index < pool.length; index++) {
        pool[index] = compressedImages[imageIndex++];
    }


    // ======================================
    // KORÁBBI LISTA KERESÉSE
    // ======================================

    const saved =
        JSON.parse(
            localStorage.getItem(
                "savedTierLists"
            )
        ) || [];


    const existing =
        saved.find(
            list =>
                list.name === name
        );


    // ======================================
    // LISTA OBJEKTUM
    // ======================================

    const savedList = {

        id:
            existing
                ? existing.id
                : Date.now(),


        name:
            name,


        created:
            existing
                ? existing.created
                : new Date().toLocaleString(
                    "hu-HU"
                ),


        /*
            Ha a listának már volt
            borítóképe, megtartjuk.
        */

        coverImage:
            existing
                ? existing.coverImage || null
                : null,


        tiers:
            tiers,


        pool:
            pool

    };


    // ======================================
    // MENTÉS / FRISSÍTÉS
    // ======================================

    const existingIndex =
        saved.findIndex(
            list =>
                list.name === name
        );


    if (existingIndex !== -1) {

        saved[existingIndex] =
            savedList;

    } else {

        saved.push(
            savedList
        );

    }


    try {

        localStorage.setItem(
            "savedTierLists",
            JSON.stringify(saved)
        );

    } catch (error) {

        alert(
            "A képek túl sok helyet foglalnak. Tölts fel kevesebb vagy kisebb képet, majd próbáld újra."
        );

        return;
    }


    alert(
        "A tier list sikeresen el lett mentve!"
    );


    showSavedLists();
}


// ==========================================
// MENTETT LISTÁK OLDALA
// ==========================================

function showSavedLists() {

    editorPage.style.display =
        "none";


    savedPage.style.display =
        "block";


    renderSavedLists();
}


// ==========================================
// SZERKESZTŐ OLDAL
// ==========================================

function showEditor() {

    editorPage.style.display =
        "block";


    savedPage.style.display =
        "none";

}


// ==========================================
// MENTETT LISTÁK KIRAJZOLÁSA
// ==========================================

function renderSavedLists() {

    savedLists.innerHTML = "";


    const saved =
        JSON.parse(
            localStorage.getItem(
                "savedTierLists"
            )
        ) || [];


    // Nincs még lista
    if (saved.length === 0) {

        savedLists.innerHTML = `

            <div class="no-saved-lists">

                <div class="no-saved-icon">
                    📋
                </div>

                <h2>
                    Még nincs mentett tier listád
                </h2>

                <p>
                    Készíts egy tier listát,
                    majd mentsd el!
                </p>

                <button
                    class="primary-button"
                    onclick="showEditor()"
                >
                    ➕ Első Tier List létrehozása
                </button>

            </div>

        `;

        return;
    }


    // ======================================
    // LISTÁK
    // ======================================

    saved.forEach(list => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "saved-card";


        // ==================================
        // BORÍTÓ
        // ==================================

        let coverHTML = "";


        // Ha van saját borítókép
        if (list.coverImage) {

            coverHTML = `

                <img
                    class="saved-cover"
                    src="${list.coverImage}"
                    alt="${escapeHTML(list.name)}"
                >

            `;

        } else {

            // Ha nincs saját borító,
            // az első képekből készítünk preview-t

            const previewImages = [];


            // Tier képek
            list.tiers.forEach(tier => {

                tier.images.forEach(img => {

                    if (
                        previewImages.length < 4
                    ) {

                        previewImages.push(
                            img
                        );

                    }

                });

            });


            // Képtár képei
            list.pool.forEach(img => {

                if (
                    previewImages.length < 4
                ) {

                    previewImages.push(
                        img
                    );

                }

            });


            if (
                previewImages.length > 0
            ) {

                coverHTML = `

                    <div class="saved-auto-preview">

                `;


                previewImages.forEach(img => {

                    coverHTML += `

                        <img
                            src="${img}"
                            alt=""
                        >

                    `;

                });


                coverHTML += `

                    </div>

                `;

            } else {

                // Ha tényleg nincs kép
                coverHTML = `

                    <div class="saved-no-cover">

                        <div>
                            🎨
                        </div>

                        <span>
                            Tier List
                        </span>

                    </div>

                `;

            }

        }


        // ==================================
        // KÁRTYA
        // ==================================

        card.innerHTML = `

            <div class="saved-preview">

                ${coverHTML}


                <div class="cover-overlay">

                    <button
                        onclick="setCoverImage(${list.id})"
                    >
                        🖼️ Borító
                    </button>


                    ${
                        list.coverImage
                        ? `
                            <button
                                onclick="removeCoverImage(${list.id})"
                            >
                                🗑️
                            </button>
                        `
                        : ""
                    }

                </div>

            </div>


            <div class="saved-info">

                <h3>
                    ${escapeHTML(list.name)}
                </h3>


                <div class="saved-date">

                    Mentve:
                    ${escapeHTML(list.created)}

                </div>


                <div class="saved-actions">

                    <button
                        class="primary-button"
                        onclick="openSavedList(${list.id})"
                    >
                        Megnyitás
                    </button>


                    <button
                        class="delete-saved"
                        onclick="deleteSavedList(${list.id})"
                    >
                        🗑️
                    </button>

                </div>

            </div>

        `;


        savedLists.appendChild(card);

    });

}


// ==========================================
// BORÍTÓKÉP KIVÁLASZTÁSA
// ==========================================

function setCoverImage(id) {

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";


    input.accept =
        "image/*";


    input.onchange =
        function () {

            const file =
                input.files[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Csak képfájlt választhatsz!"
                );

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const saved =
                        JSON.parse(
                            localStorage.getItem(
                                "savedTierLists"
                            )
                        ) || [];


                    const list =
                        saved.find(
                            item =>
                                item.id === id
                        );


                    if (!list) {
                        return;
                    }


                    // Borító elmentése
                    list.coverImage =
                        event.target.result;


                    localStorage.setItem(
                        "savedTierLists",
                        JSON.stringify(saved)
                    );


                    renderSavedLists();

                };


            reader.readAsDataURL(file);

        };


    input.click();

}


// ==========================================
// BORÍTÓKÉP TÖRLÉSE
// ==========================================

function removeCoverImage(id) {

    const saved =
        JSON.parse(
            localStorage.getItem(
                "savedTierLists"
            )
        ) || [];


    const list =
        saved.find(
            item =>
                item.id === id
        );


    if (!list) {
        return;
    }


    const confirmed =
        confirm(
            "Biztosan törölni szeretnéd a borítóképet?"
        );


    if (!confirmed) {
        return;
    }


    list.coverImage =
        null;


    localStorage.setItem(
        "savedTierLists",
        JSON.stringify(saved)
    );


    renderSavedLists();

}


// ==========================================
// MENTETT LISTA MEGNYITÁSA
// ==========================================

function openSavedList(id) {

    const saved =
        JSON.parse(
            localStorage.getItem(
                "savedTierLists"
            )
        ) || [];


    const list =
        saved.find(
            item =>
                item.id === id
        );


    if (!list) {

        alert(
            "A tier list nem található."
        );

        return;
    }


    // Editor ürítése
    tierContainer.innerHTML = "";

    imagePool.innerHTML = "";


    // Cím visszaállítása
    listTitle.innerText =
        list.name;


    // ======================================
    // TIEREK VISSZAÁLLÍTÁSA
    // ======================================

    list.tiers.forEach(tier => {

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


        // Tier képei
        tier.images.forEach(src => {

            const wrapper =
                createImageElement(src);


            zone.appendChild(
                wrapper
            );

        });

    });


    // ======================================
    // KÉPTÁR VISSZAÁLLÍTÁSA
    // ======================================

    list.pool.forEach(src => {

        const wrapper =
            createImageElement(src);


        imagePool.appendChild(
            wrapper
        );

    });


    updateImageCount();
    updateEmptyMessage();


    // Editor megjelenítése
    showEditor();

}


// ==========================================
// KÉP ELEMENT LÉTREHOZÁSA
// ==========================================

function createImageElement(src) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "pool-item";


    wrapper.draggable =
        true;


    const img =
        document.createElement(
            "img"
        );


    img.src =
        src;


    img.className =
        "tier-image";


    img.draggable =
        false;


    wrapper.appendChild(
        img
    );


    addDeleteButton(
        wrapper
    );


    setupDrag(
        wrapper
    );


    return wrapper;

}


// ==========================================
// MENTETT LISTA TÖRLÉSE
// ==========================================

function deleteSavedList(id) {

    const confirmed =
        confirm(
            "Biztosan törölni szeretnéd ezt a tier listát?"
        );


    if (!confirmed) {
        return;
    }


    let saved =
        JSON.parse(
            localStorage.getItem(
                "savedTierLists"
            )
        ) || [];


    saved =
        saved.filter(
            list =>
                list.id !== id
        );


    localStorage.setItem(
        "savedTierLists",
        JSON.stringify(saved)
    );


    renderSavedLists();

}


// ==========================================
// SZERKESZTŐ ÜRÍTÉSE
// ==========================================

function resetEditor() {

    const confirmed =
        confirm(
            "Biztosan törlöd a jelenlegi szerkesztést?"
        );


    if (!confirmed) {
        return;
    }


    listTitle.innerText =
        "Új Tier List";


    tierContainer.innerHTML =
        "";


    imagePool.innerHTML =
        "";


    createDefaultTiers();


    updateEmptyMessage();
    updateImageCount();

}


// ==========================================
// ÜRES KÉPTÁR
// ==========================================

function updateEmptyMessage() {

    const hasImages =
        imagePool.querySelector(
            ".pool-item"
        );


    const message =
        imagePool.querySelector(
            ".empty-message"
        );


    if (
        hasImages &&
        message
    ) {

        message.remove();

    }


    if (
        !hasImages &&
        !message
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "empty-message";


        div.innerText =
            "Még nincsenek feltöltött képek.";


        imagePool.appendChild(
            div
        );

    }

}


// ==========================================
// KÉPSZÁMLÁLÓ
// ==========================================

function updateImageCount() {

    const count =
        document.querySelectorAll(
            ".tier-image"
        ).length;


    imageCount.innerText =
        `${count} kép`;

}


// ==========================================
// CÍM VÁLTOZÁS
// ==========================================

function updateCurrentTitle() {

    // Később autosave-hoz használható

}


// ==========================================
// HTML BIZTONSÁG
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}
