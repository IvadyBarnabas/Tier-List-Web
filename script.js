
const tierContainer =
    document.getElementById("tierContainer");

const imagePool =
    document.getElementById("imagePool");

const imageInput =
    document.getElementById("imageInput");

const imageCount =
    document.getElementById("imageCount");

const listTitle =
    document.getElementById("listTitle");

const editorPage =
    document.getElementById("editorPage");

const savedPage =
    document.getElementById("savedPage");

const savedLists =
    document.getElementById("savedLists");


let draggedElement = null;


/* =========================
   ALAP TIEREK
========================= */

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


/* =========================
   INDÍTÁS
========================= */

createDefaultTiers();


/* =========================
   ÚJ TIER
========================= */

function createTier(name, color) {

    const tier =
        document.createElement("div");

    tier.className = "tier";

    tier.innerHTML = `

        <div
            class="tier-label"
            style="background:${color}"
        >

            <div
                class="tier-name"
                contenteditable="true"
                spellcheck="false"
            >
                ${name}
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


    setupDropZone(
        tier.querySelector(".tier-items")
    );


    tier.querySelector(".tier-name")
        .addEventListener(
            "input",
            updateCurrentTitle
        );
}


function createDefaultTiers() {

    tierContainer.innerHTML = "";

    defaultTiers.forEach(tier => {

        createTier(
            tier.name,
            tier.color
        );

    });

}


/* =========================
   ÚJ TIER GOMB
========================= */

function addTier() {

    const number =
        tierContainer.children.length + 1;

    createTier(
        "Tier " + number,
        "#777777"
    );

}


/* =========================
   TIER TÖRLÉSE
========================= */

function deleteTier(button) {

    const tier =
        button.closest(".tier");


    const images =
        tier.querySelectorAll(".tier-image");


    images.forEach(img => {

        const wrapper =
            img.closest(".pool-item");


        imagePool.appendChild(wrapper);

    });


    tier.remove();


    updateImageCount();
}


/* =========================
   SZÍN
========================= */

function changeTierColor(button) {

    const newColor =
        prompt(
            "Add meg a színt hex formátumban:",
            "#777777"
        );


    if (!newColor) return;


    const label =
        button.closest(".tier-label");


    label.style.background =
        newColor;

}


/* =========================
   LISTA ÁTNEVEZÉSE
========================= */

function renameList() {

    const newName =
        prompt(
            "Mi legyen a tier list neve?",
            listTitle.innerText
        );


    if (!newName) return;


    listTitle.innerText =
        newName.trim();

}


/* =========================
   KÉPEK FELTÖLTÉSE
========================= */

imageInput.addEventListener(
    "change",
    function () {

        const files =
            Array.from(this.files);


        files.forEach(file => {

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


        this.value = "";

    }
);


/* =========================
   KÉP LÉTREHOZÁSA
========================= */

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


/* =========================
   TÖRLÉS GOMB
========================= */

function addDeleteButton(wrapper) {

    const button =
        document.createElement("button");


    button.className =
        "delete-image";


    button.innerText = "×";


    button.onclick =
        function (event) {

            event.stopPropagation();

            wrapper.remove();

            updateEmptyMessage();

            updateImageCount();

        };


    wrapper.appendChild(button);

}


/* =========================
   DRAG
========================= */

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


/* =========================
   DROP ZÓNA
========================= */

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


/* =========================
   KÉPTÁR DROP
========================= */

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


        if (afterElement === null) {

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


/* =========================
   DRAG POZÍCIÓ
========================= */

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

                offset,
                element

            };

        }

    });


    return closest.element;

}


/* =========================
   MENTÉS
========================= */

function saveTierList() {

    let name =
        listTitle.innerText.trim();


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


        listTitle.innerText =
            name;

    }


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
                ).innerText.trim();


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

                images

            });

        });


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


    const savedList = {

        id:
            Date.now(),

        name,

        created:
            new Date().toLocaleString(
                "hu-HU"
            ),

        tiers,

        pool

    };


    const saved =
        JSON.parse(
            localStorage.getItem(
                "savedTierLists"
            )
        ) || [];


    /*
        Ha ugyanilyen nevű lista van,
        akkor azt frissítjük.
    */

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


    localStorage.setItem(
        "savedTierLists",
        JSON.stringify(saved)
    );


    alert(
        "A tier list sikeresen el lett mentve!"
    );


    showSavedLists();

}


/* =========================
   MENTETT LISTÁK MEGJELENÍTÉSE
========================= */

function showSavedLists() {

    editorPage.style.display =
        "none";

    savedPage.style.display =
        "block";


    renderSavedLists();

}


/* =========================
   LISTÁK KIRAJZOLÁSA
========================= */

function renderSavedLists() {

    savedLists.innerHTML = "";


    const saved =
        JSON.parse(
            localStorage.getItem(
                "savedTierLists"
            )
        ) || [];


    if (saved.length === 0) {

        savedLists.innerHTML = `

            <div class="empty-message">

                Még nincs mentett tier listád.

            </div>

        `;

        return;

    }


    saved.forEach(list => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "saved-card";


        /*
            A previewhoz összeszedjük
            az első néhány képet.
        */

        const previewImages = [];


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


        let preview = "";


        if (
            previewImages.length === 0
        ) {

            preview = `
                <div class="saved-preview-empty">
                    Nincsenek képek
                </div>
            `;

        } else {

            previewImages.forEach(img => {

                preview += `
                    <img src="${img}">
                `;

            });

        }


        card.innerHTML = `

            <div class="saved-preview">
                ${preview}
            </div>


            <div class="saved-info">

                <h3>
                    ${escapeHTML(list.name)}
                </h3>

                <div class="saved-date">
                    ${list.created}
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


/* =========================
   MENTETT LISTA MEGNYITÁSA
========================= */

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
        return;
    }


    tierContainer.innerHTML = "";

    imagePool.innerHTML = "";


    listTitle.innerText =
        list.name;


    /*
        Tier-ek visszaállítása
    */

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


        tier.images.forEach(src => {

            const wrapper =
                createImageElement(
                    src
                );


            zone.appendChild(
                wrapper
            );

        });

    });


    /*
        Képtár visszaállítása
    */

    list.pool.forEach(src => {

        const wrapper =
            createImageElement(
                src
            );


        imagePool.appendChild(
            wrapper
        );

    });


    updateImageCount();

    updateEmptyMessage();


    showEditor();

}


/* =========================
   KÉP ELEMENT LÉTREHOZÁSA
========================= */

function createImageElement(src) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "pool-item";


    wrapper.draggable = true;


    const img =
        document.createElement(
            "img"
        );


    img.src = src;

    img.className =
        "tier-image";

    img.draggable = false;


    wrapper.appendChild(img);


    addDeleteButton(
        wrapper
    );


    setupDrag(
        wrapper
    );


    return wrapper;

}


/* =========================
   MENTETT LISTA TÖRLÉSE
========================= */

function deleteSavedList(id) {

    const confirmDelete =
        confirm(
            "Biztosan törölni szeretnéd ezt a tier listát?"
        );


    if (!confirmDelete) {
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


/* =========================
   ÚJ TIER LIST
========================= */

function showEditor() {

    editorPage.style.display =
        "block";

    savedPage.style.display =
        "none";

}


/* =========================
   SZERKESZTŐ ÜRÍTÉSE
========================= */

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


    tierContainer.innerHTML = "";

    imagePool.innerHTML = "";


    createDefaultTiers();


    updateEmptyMessage();

    updateImageCount();

}


/* =========================
   ÜRES KÉPTÁR
========================= */

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

        imagePool.innerHTML = `

            <div class="empty-message">
                Még nincsenek feltöltött képek.
            </div>

        `;

    }

}


/* =========================
   KÉPSZÁMLÁLÓ
========================= */

function updateImageCount() {

    const count =
        document.querySelectorAll(
            ".tier-image"
        ).length;


    imageCount.innerText =
        `${count} kép`;

}


/* =========================
   HTML BIZTONSÁG
========================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================
   CÍM FRISSÍTÉSE
========================= */

function updateCurrentTitle() {

    /*
        Ez azért van külön,
        hogy később könnyen lehessen
        autosave rendszert hozzáadni.
    */

}


/* =========================
   OLDAL BETÖLTÉS
========================= */

updateEmptyMessage();

updateImageCount();
