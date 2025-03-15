const achievements = {
    beginner: {
        id: 'beginner',
        name: 'Beginner Luck',
        description: 'Get your first Uncommon item',
        unlocked: false,
        icon: '🍀'
    },
    collector: {
        id: 'collector',
        name: 'Item Collector',
        description: 'Collect 10 different items',
        unlocked: false,
        icon: '📚'
    },
    legendary: {
        id: 'legendary',
        name: 'Legendary Status',
        description: 'Get your first Legendary item',
        unlocked: false,
        icon: '👑'
    },
    master_crafter: {
        id: 'master_crafter',
        name: 'Master Crafter',
        description: 'Successfully craft 5 items',
        unlocked: false,
        icon: '⚒️'
    },
    lucky_charm: {
        id: 'lucky_charm',
        name: 'Lucky Charm',
        description: 'Activate the luck multiplier',
        unlocked: false,
        icon: '🎲'
    }
};

let stats = {
    itemsCollected: 0,
    uniqueItems: new Set(),
    craftsCompleted: 0
};

function checkAchievements(item) {
    stats.itemsCollected++;
    stats.uniqueItems.add(item.name);
    
    if (!achievements.beginner.unlocked && item.rarity === 'Uncommon') {
        unlockAchievement('beginner');
    }
    
    if (!achievements.collector.unlocked && stats.uniqueItems.size >= 10) {
        unlockAchievement('collector');
    }
    
    if (!achievements.legendary.unlocked && item.rarity === 'Legendary') {
        unlockAchievement('legendary');
    }
}

function unlockAchievement(id) {
    if (!achievements[id].unlocked) {
        achievements[id].unlocked = true;
        showAchievementNotification(achievements[id]);
        updateAchievementsPanel();
    }
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <span class="achievement-icon">${achievement.icon}</span>
        <div class="achievement-text">
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

