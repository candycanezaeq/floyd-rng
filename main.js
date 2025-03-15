let luckMultiplier = 1;
let craftingSlots = [null, null, null];
let inventory = [];
let draggedItem = null;
let isDragMode = true;
let selectedItem = null;

function closeWarning() {
    const warning = document.getElementById('gambling-warning');
    warning.style.opacity = '0';
    warning.style.transform = 'translate(-50%, -60%)';
    warning.style.transition = 'all 0.5s ease-out';
    
    setTimeout(() => {
        warning.style.display = 'none';
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    const warning = document.getElementById('gambling-warning');
    warning.style.opacity = '1';
    warning.style.display = 'flex';

    // Add mode toggle buttons
    const modeToggle = document.createElement('div');
    modeToggle.id = 'mode-toggle';
    modeToggle.innerHTML = `
        <button data-mode="drag" class="active" onclick="toggleMode('drag')">Drag Mode</button>
        <button data-mode="select" onclick="toggleMode('select')">Select Mode</button>
    `;
    document.body.appendChild(modeToggle);
});

document.getElementById('luck-code').addEventListener('input', function(e) {
    if (e.target.value === 'LUCKYFOR2025') {
        luckMultiplier = 2;
        document.getElementById('luck-multiplier').textContent = 'Luck: 2x';
        createCloverEffect();
        unlockAchievement('lucky_charm');
        e.target.value = '';
    }
});

function createCloverEffect() {
    const container = document.getElementById('clover-container');
    for (let i = 0; i < 50; i++) {
        const clover = document.createElement('div');
        clover.className = 'clover';
        clover.innerHTML = '🍀';
        clover.style.left = Math.random() * 100 + 'vw';
        clover.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(clover);
        setTimeout(() => clover.remove(), 3000);
    }
}

function spin() {
    if (inventory.length >= 25) {
        alert("Inventory is full! Max capacity is 25 items.");
        return;
    }

    const resultContainer = document.getElementById("result-container");
    const resultImage = document.getElementById("result-image");
    const resultRarity = document.getElementById("result-rarity");
    const resultName = document.getElementById("result-name");

    resultContainer.style.display = "none";

    setTimeout(() => {
        const totalOdds = rarities.reduce((sum, rarity) => sum + (rarity.odds * luckMultiplier), 0);
        const randomValue = Math.random() * totalOdds;
        let cumulativeOdds = 0;
        
        let selectedRarity;
        for (const rarity of rarities) {
            cumulativeOdds += (rarity.odds * luckMultiplier);
            if (randomValue <= cumulativeOdds) {
                selectedRarity = rarity;
                break;
            }
        }

        const itemsInRarity = floydItems.filter(item => item.rarity === selectedRarity.name);
        const randomItem = itemsInRarity[Math.floor(Math.random() * itemsInRarity.length)];

        inventory.push(randomItem);
        updateInventory();
        checkAchievements(randomItem);

        resultImage.src = randomItem.image;
        resultRarity.textContent = `${selectedRarity.name} (1 in ${Math.round(100 / selectedRarity.odds)})`;
        resultRarity.style.color = selectedRarity.color;
        resultName.textContent = randomItem.name;

        resultContainer.style.display = "block";
        resultContainer.style.opacity = 1;

        setTimeout(() => {
            resultContainer.style.opacity = 0;
            setTimeout(() => {
                resultContainer.style.display = "none";
            }, 500);
        }, 3000);
    }, 1000);
}

function updateInventory() {
    const inventoryContainer = document.getElementById("inventory");
    inventoryContainer.innerHTML = "";

    inventory.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "inventory-item";
        itemDiv.draggable = isDragMode;
        itemDiv.dataset.index = index;

        const itemImg = document.createElement("img");
        itemImg.src = item.image;
        itemImg.alt = item.name;

        const itemInfo = document.createElement("div");
        itemInfo.className = "item-info";

        const itemName = document.createElement("div");
        itemName.className = "item-name";
        itemName.textContent = item.name;

        const itemRarity = document.createElement("div");
        itemRarity.className = "item-rarity";
        itemRarity.textContent = item.rarity;
        itemRarity.style.color = rarities.find(r => r.name === item.rarity).color;

        itemInfo.appendChild(itemName);
        itemInfo.appendChild(itemRarity);
        itemDiv.appendChild(itemImg);
        itemDiv.appendChild(itemInfo);
        inventoryContainer.appendChild(itemDiv);

        // Add drag events
        if (isDragMode) {
            itemDiv.addEventListener("dragstart", (e) => {
                draggedItem = index;
                e.target.classList.add("dragging");
            });

            itemDiv.addEventListener("dragend", (e) => {
                e.target.classList.remove("dragging");
            });

            itemDiv.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            itemDiv.addEventListener("drop", (e) => {
                e.preventDefault();
                const targetIndex = parseInt(e.currentTarget.dataset.index);
                if (draggedItem !== null && targetIndex !== undefined) {
                    handleCraftingSlot(inventory[draggedItem], Math.floor(targetIndex % 3));
                }
            });
        } else {
            // Add click events for select mode
            itemDiv.addEventListener("click", () => {
                if (selectedItem === index) {
                    selectedItem = null;
                    itemDiv.classList.remove("selected");
                } else {
                    if (selectedItem !== null) {
                        document.querySelector(`[data-index="${selectedItem}"]`)?.classList.remove("selected");
                    }
                    selectedItem = index;
                    itemDiv.classList.add("selected");
                }
            });
        }
    });
}

function toggleMode(mode) {
    isDragMode = mode === 'drag';
    document.querySelectorAll('#mode-toggle button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#mode-toggle button[data-mode="${mode}"]`).classList.add('active');
    selectedItem = null;
    updateInventory();
}

function handleCraftingSlot(item, slotIndex) {
    craftingSlots[slotIndex] = item;
    updateCraftingUI();
    checkCraftingPossibility();
}

function checkCraftingPossibility() {
    const btn = document.getElementById('craft-btn');
    const filledSlots = craftingSlots.filter(slot => slot !== null);
    
    if (filledSlots.length === 3 && 
        filledSlots.every(item => item.rarity === filledSlots[0].rarity)) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

function craft() {
    if (!craftingSlots.every(slot => slot !== null)) return;
    
    const currentRarity = craftingSlots[0].rarity;
    const currentRarityIndex = rarities.findIndex(r => r.name === currentRarity);
    
    if (currentRarityIndex < rarities.length - 1) {
        const nextRarity = rarities[currentRarityIndex + 1];
        const possibleItems = floydItems.filter(item => item.rarity === nextRarity.name);
        const newItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        
        // Remove crafting materials from inventory
        craftingSlots.forEach(item => {
            const index = inventory.indexOf(item);
            if (index > -1) inventory.splice(index, 1);
        });
        
        // Add new item
        inventory.push(newItem);
        
        // Reset crafting slots
        craftingSlots = [null, null, null];
        updateInventory();
        updateCraftingUI();
        
        stats.craftsCompleted++;
        if (stats.craftsCompleted >= 5) {
            unlockAchievement('master_crafter');
        }
        
        showCraftingAnimation(newItem);
    }
}

function showCraftingAnimation(item) {
    // Add crafting animation logic here
}