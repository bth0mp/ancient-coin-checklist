// Ancient Coin Checklist - App v4.1 - Collection Tracking

document.addEventListener('DOMContentLoaded', function() {
    // Register service worker for offline capability
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[App] Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('[App] Service Worker registration failed:', error);
            });
    }
    
    // Initialize tabs FIRST
    initTabs();
    
    // Check if first load - offer to import collection
    checkFirstLoad();
    
    // Welcome back message for returning visitors
    showWelcomeBack();
    
    // Auto-check coins from invoice parsing
    applyAutoChecks();
    
    // Load saved states
    loadCheckboxStates();
    loadFavorites();
    loadWishlist();
    
    // Restore focus mode if previously enabled
    if (localStorage.getItem('focusMode') === 'true') {
        document.body.classList.add('focus-mode');
    }
    
    // Restore hide images mode if previously enabled
    if (localStorage.getItem('hideImages') === 'true') {
        document.body.classList.add('hide-images');
    }
    loadNotes();
    loadAcquisitionIndicators();
    loadQuantityIndicators();
    loadTheme();
    
    // Set up accessibility
    setupAccessibility();
    
    // Set up theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Set up random coin button
    const randomBtn = document.getElementById('random-coin-btn');
    if (randomBtn) {
        randomBtn.addEventListener('click', showRandomCoin);
    }
    
    // Rarity breakdown toggle
    const rarityToggle = document.getElementById('rarity-toggle');
    const rarityStats = document.getElementById('rarity-stats');
    if (rarityToggle && rarityStats) {
        rarityToggle.addEventListener('click', () => {
            rarityToggle.classList.toggle('active');
            rarityStats.style.display = rarityStats.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Set up scroll to top button
    setupScrollToTop();
    
    // Set up compact header on scroll
    setupScrollHeader();
    
    // Set up scroll progress indicator
    setupScrollProgress();
    
    // Set up floating action button
    setupFAB();
    
    // Set up tab progress badges
    setupTabProgressBadges();
    
    // Initialize Coin of the Day
    initCoinOfTheDay();
    
    // Update home page stats dynamically
    updateHomeStats();
    
    // Add coin counts to category cards
    updateCategoryCardCounts();
    
    // Initialize collapsible periods
    initCollapsiblePeriods();
    
    // Enable smooth scrolling for nav links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Set up event listeners for checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveCheckboxStates();
            updateProgress();
            updateGlobalStats();
            
            // Add celebration effect when checking a coin
            if (this.checked) {
                const coinItem = this.closest('.coin-item');
                if (coinItem) {
                    coinItem.classList.add('just-collected');
                    setTimeout(() => coinItem.classList.remove('just-collected'), 600);
                }
            }
        });
    });
    
    // Set up search functionality
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndSortCoins();
            // Show/hide clear button
            if (clearSearchBtn) {
                clearSearchBtn.classList.toggle('visible', searchInput.value.length > 0);
            }
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                filterAndSortCoins();
                clearSearchBtn.classList.remove('visible');
            }
        });
    }
    
    // Set up filter functionality
    const rarityFilter = document.getElementById('rarity-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortBy = document.getElementById('sort-by');
    
    if (rarityFilter) rarityFilter.addEventListener('change', filterAndSortCoins);
    if (statusFilter) statusFilter.addEventListener('change', filterAndSortCoins);
    if (sortBy) sortBy.addEventListener('change', filterAndSortCoins);
    
    // Set up category jump
    const categoryJump = document.getElementById('category-jump');
    if (categoryJump) {
        categoryJump.addEventListener('change', function() {
            const category = this.value;
            if (category) {
                // Find and click the corresponding tab
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${category}"]`);
                if (tabBtn) tabBtn.click();
                // Reset the dropdown
                this.value = '';
            }
        });
    }
    
    // Set up export/import
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    
    if (exportBtn) exportBtn.addEventListener('click', exportCollection);
    if (importBtn) importBtn.addEventListener('click', () => importFile.click());
    if (importFile) importFile.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            importCollection(e.target.files[0]);
        }
    });
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Set up favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(this.getAttribute('data-coin'));
        });
    });
    
    // Set up wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(this.getAttribute('data-coin'));
        });
    });
    
    // Set up notes buttons
    document.querySelectorAll('.notes-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openNotesModal(this.getAttribute('data-coin'));
        });
    });
    
    // Double-click coin name to toggle favorite (UX shortcut)
    document.querySelectorAll('.coin-item').forEach(item => {
        item.addEventListener('dblclick', function(e) {
            // Don't trigger on buttons or checkbox
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            const coinId = this.querySelector('input[type="checkbox"]')?.getAttribute('data-coin');
            if (coinId) {
                toggleFavorite(coinId);
                showToast('⭐ Double-click: favorite toggled!', 'info');
            }
        });
    });
    
    // Set up modal
    setupNotesModal();
    
    // Update timestamps
    updateTimestamps();
    
    // Initial updates
    updateProgress();
    updateGlobalStats();
});

// ========== Checkbox State Management ==========

function loadCheckboxStates() {
    const saved = localStorage.getItem('coinChecklist');
    if (saved) {
        const states = JSON.parse(saved);
        Object.keys(states).forEach(key => {
            const checkbox = document.querySelector(`input[data-coin="${key}"]`);
            if (checkbox) {
                checkbox.checked = states[key];
            }
        });
    }
}

function saveCheckboxStates() {
    const states = {};
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const coinId = checkbox.getAttribute('data-coin');
        if (coinId) {
            states[coinId] = checkbox.checked;
        }
    });
    localStorage.setItem('coinChecklist', JSON.stringify(states));
    updateSaveIndicator();
}

// ========== Favorites Management ==========

function loadFavorites() {
    const saved = localStorage.getItem('coinFavorites');
    if (saved) {
        const favorites = JSON.parse(saved);
        favorites.forEach(coinId => {
            const btn = document.querySelector(`.favorite-btn[data-coin="${coinId}"]`);
            const item = btn?.closest('.coin-item');
            if (btn) {
                btn.classList.add('active');
                btn.textContent = '★';
            }
            if (item) {
                item.classList.add('is-favorite');
            }
        });
    }
}

function saveFavorites() {
    const favorites = [];
    document.querySelectorAll('.favorite-btn.active').forEach(btn => {
        favorites.push(btn.getAttribute('data-coin'));
    });
    localStorage.setItem('coinFavorites', JSON.stringify(favorites));
}

function toggleFavorite(coinId) {
    const btn = document.querySelector(`.favorite-btn[data-coin="${coinId}"]`);
    const item = btn?.closest('.coin-item');
    
    if (btn) {
        btn.classList.toggle('active');
        const isActive = btn.classList.contains('active');
        btn.textContent = isActive ? '★' : '☆';
        
        if (item) {
            item.classList.toggle('is-favorite', isActive);
        }
        
        saveFavorites();
        updateGlobalStats();
    }
}

// ========== Wishlist Management ==========

function loadWishlist() {
    const saved = localStorage.getItem('coinWishlist');
    if (saved) {
        const wishlist = JSON.parse(saved);
        wishlist.forEach(coinId => {
            const btn = document.querySelector(`.wishlist-btn[data-coin="${coinId}"]`);
            const item = btn?.closest('.coin-item');
            if (btn) {
                btn.classList.add('active');
                btn.textContent = '🎯';
            }
            if (item) {
                item.classList.add('is-wishlist');
            }
        });
    }
}

function saveWishlist() {
    const wishlist = [];
    document.querySelectorAll('.wishlist-btn.active').forEach(btn => {
        wishlist.push(btn.getAttribute('data-coin'));
    });
    localStorage.setItem('coinWishlist', JSON.stringify(wishlist));
}

function toggleWishlist(coinId) {
    const btn = document.querySelector(`.wishlist-btn[data-coin="${coinId}"]`);
    const item = btn?.closest('.coin-item');
    
    if (btn) {
        btn.classList.toggle('active');
        const isActive = btn.classList.contains('active');
        btn.textContent = isActive ? '🎯' : '○';
        
        if (item) {
            item.classList.toggle('is-wishlist', isActive);
        }
        
        saveWishlist();
        updateGlobalStats();
    }
}

// ========== Save Indicator ==========

function updateSaveIndicator() {
    const indicator = document.getElementById('last-saved');
    if (indicator) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        indicator.querySelector('.save-text').textContent = `Auto-saved at ${timeStr}`;
        indicator.classList.remove('saving');
    }
}

// ========== Notes Management ==========

let currentNotesCoin = null;

function loadNotes() {
    const saved = localStorage.getItem('coinNotes');
    if (saved) {
        const notes = JSON.parse(saved);
        Object.keys(notes).forEach(coinId => {
            if (notes[coinId] && notes[coinId].trim()) {
                const btn = document.querySelector(`.notes-btn[data-coin="${coinId}"]`);
                if (btn) {
                    btn.classList.add('has-notes');
                }
            }
        });
    }
}

function saveNotes(coinId, text) {
    const saved = localStorage.getItem('coinNotes');
    const notes = saved ? JSON.parse(saved) : {};
    notes[coinId] = text;
    localStorage.setItem('coinNotes', JSON.stringify(notes));
    updateSaveIndicator();
    
    // Update button state
    const btn = document.querySelector(`.notes-btn[data-coin="${coinId}"]`);
    if (btn) {
        btn.classList.toggle('has-notes', text && text.trim());
    }
}

function getNotes(coinId) {
    const saved = localStorage.getItem('coinNotes');
    if (saved) {
        const notes = JSON.parse(saved);
        return notes[coinId] || '';
    }
    return '';
}

// ========== Acquisition Data Management ==========

function getAcquisitionData(coinId) {
    const saved = localStorage.getItem('coinAcquisitions');
    if (saved) {
        const data = JSON.parse(saved);
        return data[coinId] || { date: '', price: '' };
    }
    return { date: '', price: '' };
}

function saveAcquisitionData(coinId, date, price) {
    const saved = localStorage.getItem('coinAcquisitions');
    const data = saved ? JSON.parse(saved) : {};
    data[coinId] = { date: date || '', price: price || '' };
    localStorage.setItem('coinAcquisitions', JSON.stringify(data));
    
    // Update coin item to show it has acquisition data
    const item = document.querySelector(`input[data-coin="${coinId}"]`)?.closest('.coin-item');
    if (item) {
        item.classList.toggle('has-date', !!(date || price));
    }
}

function loadAcquisitionIndicators() {
    const saved = localStorage.getItem('coinAcquisitions');
    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(coinId => {
            if (data[coinId].date || data[coinId].price) {
                const item = document.querySelector(`input[data-coin="${coinId}"]`)?.closest('.coin-item');
                if (item) {
                    item.classList.add('has-date');
                }
            }
        });
    }
}

// ========== Quantity (Duplicate) Tracking ==========

function getQuantity(coinId) {
    const saved = localStorage.getItem('coinQuantities');
    if (saved) {
        const data = JSON.parse(saved);
        return data[coinId] || 1;
    }
    return 1;
}

function saveQuantity(coinId, qty) {
    const saved = localStorage.getItem('coinQuantities');
    const data = saved ? JSON.parse(saved) : {};
    const quantity = parseInt(qty) || 1;
    data[coinId] = quantity;
    localStorage.setItem('coinQuantities', JSON.stringify(data));
    
    // Update coin item to show quantity badge
    const item = document.querySelector(`input[data-coin="${coinId}"]`)?.closest('.coin-item');
    if (item) {
        let badge = item.querySelector('.quantity-badge');
        if (quantity > 1) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'quantity-badge';
                const nameSpan = item.querySelector('.coin-name');
                if (nameSpan) nameSpan.after(badge);
            }
            badge.textContent = `×${quantity}`;
        } else if (badge) {
            badge.remove();
        }
    }
}

function loadQuantityIndicators() {
    const saved = localStorage.getItem('coinQuantities');
    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(coinId => {
            if (data[coinId] > 1) {
                saveQuantity(coinId, data[coinId]); // This will create the badge
            }
        });
    }
}

function openNotesModal(coinId) {
    currentNotesCoin = coinId;
    const modal = document.getElementById('notes-modal');
    const textarea = document.getElementById('notes-textarea');
    const dateInput = document.getElementById('acquisition-date');
    const priceInput = document.getElementById('purchase-price');
    const coinNameEl = document.getElementById('modal-coin-name');
    const acsearchLink = document.getElementById('acsearch-link');
    
    // Get coin name from data attribute
    const coinItem = document.querySelector(`.coin-item[data-name]`)?.closest('.coin-item');
    const item = document.querySelector(`input[data-coin="${coinId}"]`)?.closest('.coin-item');
    const coinName = item?.getAttribute('data-name') || coinId;
    
    if (coinNameEl) coinNameEl.textContent = coinName;
    if (textarea) textarea.value = getNotes(coinId);
    
    // Set price research links
    const searchQuery = encodeURIComponent(coinName.replace(/\s*\[.*?\]\s*/g, '').trim());
    
    if (acsearchLink) {
        acsearchLink.href = `https://www.acsearch.info/search.html?term=${searchQuery}&category=1-2&lot=&thession=&order=1&currency=usd&company=`;
    }
    
    const coinarchivesLink = document.getElementById('coinarchives-link');
    if (coinarchivesLink) {
        coinarchivesLink.href = `https://www.coinarchives.com/a/results.php?search=${searchQuery}&s=0&upcoming=0&results=100`;
    }
    
    const sixbidLink = document.getElementById('sixbid-link');
    if (sixbidLink) {
        sixbidLink.href = `https://www.sixbid-coin-archive.com/#/en/search?text=${searchQuery}`;
    }
    
    const numisbidsLink = document.getElementById('numisbids-link');
    if (numisbidsLink) {
        numisbidsLink.href = `https://www.numisbids.com/search.php?search=${searchQuery}&category=0&view=1&sort=lot`;
    }
    
    // Load acquisition data
    const acqData = getAcquisitionData(coinId);
    if (dateInput) dateInput.value = acqData.date || '';
    if (priceInput) priceInput.value = acqData.price || '';
    
    // Load quantity
    const quantityInput = document.getElementById('coin-quantity');
    if (quantityInput) quantityInput.value = getQuantity(coinId);
    
    if (modal) modal.classList.add('active');
    
    // Focus date field if empty, otherwise notes
    setTimeout(() => {
        if (dateInput && !dateInput.value) {
            dateInput.focus();
        } else {
            textarea?.focus();
        }
    }, 100);
}

function setupNotesModal() {
    const modal = document.getElementById('notes-modal');
    const closeBtn = modal?.querySelector('.close-modal');
    const saveBtn = document.getElementById('save-notes-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const textarea = document.getElementById('notes-textarea');
            const dateInput = document.getElementById('acquisition-date');
            const priceInput = document.getElementById('purchase-price');
            const quantityInput = document.getElementById('coin-quantity');
            
            if (currentNotesCoin) {
                // Save notes
                if (textarea) saveNotes(currentNotesCoin, textarea.value);
                
                // Save acquisition data
                saveAcquisitionData(
                    currentNotesCoin,
                    dateInput?.value || '',
                    priceInput?.value || ''
                );
                
                // Save quantity
                if (quantityInput) saveQuantity(currentNotesCoin, quantityInput.value);
                
                modal.classList.remove('active');
            }
        });
    }
    
    // Copy coin details to clipboard
    const copyBtn = document.getElementById('copy-coin-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!currentNotesCoin) return;
            
            const item = document.querySelector(`input[data-coin="${currentNotesCoin}"]`)?.closest('.coin-item');
            const coinName = item?.getAttribute('data-name') || currentNotesCoin;
            const rarity = item?.getAttribute('data-rarity') || '';
            
            // Get reference number from coin-ref span
            const refSpan = item?.querySelector('.coin-ref');
            const reference = refSpan ? refSpan.textContent.trim() : '';
            
            // Get user data
            const acqData = getAcquisitionData(currentNotesCoin);
            const notes = getNotes(currentNotesCoin);
            const quantity = getQuantity(currentNotesCoin);
            const isOwned = item?.querySelector('input[type="checkbox"]')?.checked;
            
            // Build formatted string
            let text = `🪙 ${coinName}`;
            if (reference) text += `\n📖 ${reference}`;
            if (rarity) text += `\n💎 Rarity: ${rarity.replace('-', ' ')}`;
            if (isOwned) {
                text += `\n✅ In collection`;
                if (quantity > 1) text += ` (×${quantity})`;
            }
            if (acqData.date) text += `\n📅 Acquired: ${acqData.date}`;
            if (acqData.price) text += `\n💰 Paid: ${acqData.price}`;
            if (notes) text += `\n📝 Notes: ${notes}`;
            
            navigator.clipboard.writeText(text).then(() => {
                showToast('📋 Copied to clipboard!', 'success');
            }).catch(() => {
                showToast('Failed to copy', 'error');
            });
        });
    }
    
    // Close on click outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// ========== Progress & Stats ==========

function updateProgress() {
    // Calculate and display progress for each section
    document.querySelectorAll('.collection-section').forEach(section => {
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const checked = section.querySelectorAll('input[type="checkbox"]:checked');
        
        const total = checkboxes.length;
        const complete = checked.length;
        const percentage = total > 0 ? Math.round((complete / total) * 100) : 0;
        
        // Add or update progress bar
        let progressBar = section.querySelector('.progress-bar');
        if (!progressBar) {
            const h2 = section.querySelector('h2');
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = '<div class="progress-fill"></div>';
            h2.insertAdjacentElement('afterend', progressBar);
        }
        
        progressBar.querySelector('.progress-fill').style.width = percentage + '%';
        
        // Update h2 to show count
        const h2 = section.querySelector('h2');
        const originalText = h2.getAttribute('data-original') || h2.textContent;
        h2.setAttribute('data-original', originalText);
        h2.textContent = `${originalText} (${complete}/${total})`;
    });
    
    // Update tab progress badges
    if (typeof updateTabProgressBadges === 'function') {
        updateTabProgressBadges();
    }
}

function updateGlobalStats() {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    
    const total = allCheckboxes.length;
    const collected = checkedBoxes.length;
    const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
    
    // Count rare+ coins collected
    let rareCount = 0;
    checkedBoxes.forEach(checkbox => {
        const item = checkbox.closest('.coin-item');
        if (item) {
            const rarity = item.getAttribute('data-rarity');
            if (rarity === 'rare' || rarity === 'very-rare' || rarity === 'extremely-rare') {
                rareCount++;
            }
        }
    });
    
    // Count favorites and wishlist
    const favoritesCount = document.querySelectorAll('.favorite-btn.active').length;
    const wishlistCount = document.querySelectorAll('.wishlist-btn.active').length;
    
    // Calculate estimated collection value
    let valueLow = 0;
    let valueHigh = 0;
    let valueCoinsCount = 0;
    checkedBoxes.forEach(checkbox => {
        const item = checkbox.closest('.coin-item');
        if (item) {
            const priceLow = parseFloat(item.getAttribute('data-price-low'));
            const priceHigh = parseFloat(item.getAttribute('data-price-high'));
            if (!isNaN(priceLow) && !isNaN(priceHigh)) {
                valueLow += priceLow;
                valueHigh += priceHigh;
                valueCoinsCount++;
            }
        }
    });
    const valueMid = Math.round((valueLow + valueHigh) / 2);
    
    // Update value estimates display
    const valueCoinsEl = document.getElementById('value-coins-counted');
    const valueLowEl = document.getElementById('value-low');
    const valueHighEl = document.getElementById('value-high');
    const valueMidEl = document.getElementById('value-mid');
    
    if (valueCoinsEl) valueCoinsEl.textContent = valueCoinsCount;
    if (valueLowEl) valueLowEl.textContent = '$' + valueLow.toLocaleString();
    if (valueHighEl) valueHighEl.textContent = '$' + valueHigh.toLocaleString();
    if (valueMidEl) valueMidEl.textContent = '$' + valueMid.toLocaleString();
    
    // Update stats display
    const totalEl = document.getElementById('total-coins');
    const collectedEl = document.getElementById('collected-coins');
    const percentEl = document.getElementById('completion-percent');
    const rareEl = document.getElementById('rarest-collected');
    const favEl = document.getElementById('favorites-count');
    
    if (totalEl) totalEl.textContent = total;
    if (collectedEl) collectedEl.textContent = collected;
    if (percentEl) percentEl.textContent = percentage + '%';
    if (rareEl) rareEl.textContent = rareCount;
    if (favEl) favEl.textContent = favoritesCount;
    
    const wishEl = document.getElementById('wishlist-count');
    if (wishEl) wishEl.textContent = wishlistCount;
    
    // Update rarity breakdown
    ['common', 'scarce', 'rare', 'very-rare', 'extremely-rare'].forEach(rarity => {
        const all = document.querySelectorAll(`.coin-item[data-rarity="${rarity}"]`);
        const owned = document.querySelectorAll(`.coin-item[data-rarity="${rarity}"] input:checked`);
        const pct = all.length > 0 ? (owned.length / all.length) * 100 : 0;
        const bar = document.getElementById(`${rarity}-bar`);
        const count = document.getElementById(`${rarity}-count`);
        if (bar) bar.style.width = `${pct}%`;
        if (count) count.textContent = `${owned.length}/${all.length}`;
    });
    
    // Update home page stats
    if (typeof updateHomeStats === 'function') {
        updateHomeStats();
    }
}

// ========== Filtering & Sorting ==========

function resetFilters() {
    // Reset all filter controls to default
    const searchInput = document.getElementById('search-input');
    const rarityFilter = document.getElementById('rarity-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortBy = document.getElementById('sort-by');
    
    if (searchInput) searchInput.value = '';
    if (rarityFilter) rarityFilter.value = 'all';
    if (statusFilter) statusFilter.value = 'all';
    if (sortBy) sortBy.value = 'default';
    
    // Re-apply filtering (which will now show all)
    filterAndSortCoins();
}

const rarityOrder = {
    'common': 1,
    'scarce': 2,
    'rare': 3,
    'very-rare': 4,
    'extremely-rare': 5
};

function filterAndSortCoins() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const rarityFilter = document.getElementById('rarity-filter')?.value || 'all';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';
    const sortBy = document.getElementById('sort-by')?.value || 'default';
    
    // Load user notes once for search (searching notes too!)
    const coinNotes = JSON.parse(localStorage.getItem('coinNotes') || '{}');
    
    // Process each section
    document.querySelectorAll('.checklist').forEach(checklist => {
        const items = Array.from(checklist.querySelectorAll('.coin-item'));
        
        // Filter items
        items.forEach(item => {
            const coinName = item.querySelector('.coin-name')?.textContent.toLowerCase() || '';
            const checkbox = item.querySelector('input[type="checkbox"]');
            const isOwned = checkbox?.checked || false;
            const isFavorite = item.classList.contains('is-favorite');
            const coinId = checkbox?.dataset?.coin || '';
            
            // Determine rarity from CSS class
            let rarity = 'common';
            if (item.classList.contains('very-rare')) rarity = 'very-rare';
            else if (item.classList.contains('rare')) rarity = 'rare';
            else if (item.classList.contains('scarce')) rarity = 'scarce';
            else if (item.classList.contains('special')) rarity = 'special';
            
            // Check search match (searches coin name AND user notes!)
            const noteText = (coinNotes[coinId] || '').toLowerCase();
            const matchesName = searchTerm === '' || coinName.includes(searchTerm);
            const matchesNotes = searchTerm !== '' && noteText.includes(searchTerm);
            const matchesSearch = matchesName || matchesNotes;
            
            // Check rarity filter
            const matchesRarity = rarityFilter === 'all' || rarity === rarityFilter;
            
            // Check status filter
            let matchesStatus = true;
            if (statusFilter === 'owned') matchesStatus = isOwned;
            if (statusFilter === 'needed') matchesStatus = !isOwned;
            if (statusFilter === 'favorites') matchesStatus = isFavorite;
            
            // Show/hide item and mark note matches
            if (matchesSearch && matchesRarity && matchesStatus) {
                item.classList.remove('hidden');
                // Add visual indicator if matched via notes (not name)
                if (matchesNotes && !matchesName) {
                    item.classList.add('note-match');
                } else {
                    item.classList.remove('note-match');
                }
            } else {
                item.classList.add('hidden');
                item.classList.remove('note-match');
            }
        });
        
        // Sort items (only if not default)
        if (sortBy !== 'default') {
            const visibleItems = items.filter(item => !item.classList.contains('hidden'));
            
            visibleItems.sort((a, b) => {
                const nameA = a.getAttribute('data-name') || '';
                const nameB = b.getAttribute('data-name') || '';
                const rarityA = rarityOrder[a.getAttribute('data-rarity')] || 0;
                const rarityB = rarityOrder[b.getAttribute('data-rarity')] || 0;
                
                switch (sortBy) {
                    case 'name-asc':
                        return nameA.localeCompare(nameB);
                    case 'name-desc':
                        return nameB.localeCompare(nameA);
                    case 'rarity-asc':
                        return rarityA - rarityB;
                    case 'rarity-desc':
                        return rarityB - rarityA;
                    default:
                        return 0;
                }
            });
            
            // Re-append sorted items
            visibleItems.forEach(item => checklist.appendChild(item));
        }
    });
    
    // Update section visibility - hide empty periods (but not in resources section)
    document.querySelectorAll('.period').forEach(period => {
        // Skip periods in the resources section - they have resource-cards, not coin-items
        if (period.closest('#resources')) {
            period.style.display = 'block';
            return;
        }
        const visibleItems = period.querySelectorAll('.coin-item:not(.hidden)');
        period.style.display = visibleItems.length > 0 ? 'block' : 'none';
    });
    
    // Also check legion grid (not in a period)
    document.querySelectorAll('.legion-grid').forEach(grid => {
        const visibleItems = grid.querySelectorAll('.coin-item:not(.hidden)');
        grid.style.display = visibleItems.length > 0 ? 'grid' : 'none';
    });
    
    // Update search results counter
    updateSearchResultsCount(searchTerm, statusFilter);
}

function updateSearchResultsCount(searchTerm, statusFilter) {
    const countEl = document.getElementById('search-results-count');
    if (!countEl) return;
    
    // Only show if there's an active search or filter
    const hasActiveSearch = searchTerm && searchTerm.length > 0;
    const hasActiveFilter = statusFilter && statusFilter !== 'all';
    
    if (!hasActiveSearch && !hasActiveFilter) {
        countEl.classList.remove('visible', 'has-results', 'no-results');
        countEl.textContent = '';
        hideSearchDropdown();
        return;
    }
    
    // Count visible coins
    const visibleCoins = document.querySelectorAll('.coin-item:not(.hidden)').length;
    const totalCoins = document.querySelectorAll('.coin-item').length;
    
    countEl.classList.add('visible');
    countEl.classList.remove('has-results', 'no-results');
    
    if (visibleCoins === 0) {
        countEl.textContent = 'No matches found';
        countEl.classList.add('no-results');
        hideSearchDropdown();
    } else {
        countEl.textContent = `${visibleCoins} of ${totalCoins} coins`;
        countEl.classList.add('has-results');
        // Show dropdown with results
        if (hasActiveSearch && searchTerm.length >= 2) {
            showSearchDropdown(searchTerm);
        }
    }
}

// Search results dropdown
function showSearchDropdown(searchTerm) {
    let dropdown = document.getElementById('search-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'search-dropdown';
        dropdown.className = 'search-dropdown';
        const searchBox = document.querySelector('.search-box');
        if (searchBox) searchBox.appendChild(dropdown);
    }
    
    // Get matching coins (limit to 20)
    const matchingCoins = [];
    document.querySelectorAll('.coin-item:not(.hidden)').forEach(coin => {
        if (matchingCoins.length >= 20) return;
        const name = coin.querySelector('.coin-name')?.textContent || '';
        const section = coin.closest('.tab-content');
        const sectionId = section?.id || '';
        const sectionName = section?.querySelector('h2')?.textContent?.replace(/[🏛️⚔️🗡️🪙☦️🏰⚓🏜️🐘✡️🦅🦁✝️🦉]/g, '').trim() || sectionId;
        matchingCoins.push({ name, sectionId, sectionName, element: coin });
    });
    
    if (matchingCoins.length === 0) {
        hideSearchDropdown();
        return;
    }
    
    dropdown.innerHTML = matchingCoins.map((coin, i) => `
        <div class="search-result" data-index="${i}" data-section="${coin.sectionId}">
            <span class="result-name">${highlightMatch(coin.name, searchTerm)}</span>
            <span class="result-section">${coin.sectionName}</span>
        </div>
    `).join('');
    
    // Store references for click handling
    dropdown._coins = matchingCoins;
    
    dropdown.style.display = 'block';
    
    // Add click handlers
    dropdown.querySelectorAll('.search-result').forEach(result => {
        result.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const coin = dropdown._coins[index];
            if (coin) {
                // Switch to the section
                if (window.switchToTab) {
                    window.switchToTab(coin.sectionId);
                }
                // Expand the period if collapsed
                const period = coin.element.closest('.period');
                if (period && !period.classList.contains('expanded')) {
                    period.classList.add('expanded');
                }
                // Scroll to the coin
                setTimeout(() => {
                    coin.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    coin.element.classList.add('highlight-coin');
                    setTimeout(() => coin.element.classList.remove('highlight-coin'), 2000);
                }, 100);
                hideSearchDropdown();
            }
        });
    });
}

function hideSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

function highlightMatch(text, term) {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-box')) {
        hideSearchDropdown();
    }
});

// ========== Timestamps ==========

function updateTimestamps() {
    const now = new Date();
    const timeString = now.toLocaleString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const updateTime = document.getElementById('update-time');
    const versionTime = document.getElementById('version-time');
    
    if (updateTime) updateTime.textContent = timeString;
    if (versionTime) versionTime.textContent = timeString;
}

// ========== Export/Import ==========

function exportCollection() {
    // Show format choice dialog
    const format = prompt('Export format:\n1 = JSON (full backup)\n2 = CSV (spreadsheet)\n\nEnter 1 or 2:', '1');
    
    if (format === '2') {
        exportCollectionCSV();
    } else if (format === '1') {
        exportCollectionJSON();
    }
}

function exportCollectionJSON() {
    const checkboxStates = localStorage.getItem('coinChecklist');
    const favorites = localStorage.getItem('coinFavorites');
    const notes = localStorage.getItem('coinNotes');
    
    const exportData = {
        version: '3.6',
        exportDate: new Date().toISOString(),
        coins: checkboxStates ? JSON.parse(checkboxStates) : {},
        favorites: favorites ? JSON.parse(favorites) : [],
        notes: notes ? JSON.parse(notes) : {}
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `coin-collection-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('📥 Exported as JSON');
}

function exportCollectionCSV() {
    const checkboxStates = JSON.parse(localStorage.getItem('coinChecklist') || '{}');
    const favorites = JSON.parse(localStorage.getItem('coinFavorites') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('coinWishlist') || '[]');
    const notes = JSON.parse(localStorage.getItem('coinNotes') || '{}');
    
    // CSV header
    const headers = ['Coin ID', 'Name', 'Section', 'Reference', 'Owned', 'Favorite', 'Wishlist', 'Quantity', 'Date Acquired', 'Price Paid', 'Notes'];
    
    // Build rows from all coins in DOM
    const rows = [];
    document.querySelectorAll('.coin-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (!checkbox) return;
        
        const coinId = checkbox.getAttribute('data-coin');
        const coinName = item.getAttribute('data-name') || item.querySelector('.coin-name')?.textContent || coinId;
        const section = item.closest('.tab-content')?.id || 'unknown';
        const reference = item.querySelector('.rarity')?.textContent || '';
        const owned = checkboxStates[coinId] ? 'Yes' : 'No';
        const isFavorite = favorites.includes(coinId) ? 'Yes' : 'No';
        const isWishlist = wishlist.includes(coinId) ? 'Yes' : 'No';
        
        // Get notes data
        const noteData = notes[coinId] || {};
        const quantity = noteData.quantity || (checkboxStates[coinId] ? 1 : 0);
        const dateAcquired = noteData.acquisitionDate || '';
        const pricePaid = noteData.pricePaid || '';
        const noteText = (noteData.text || '').replace(/"/g, '""'); // Escape quotes for CSV
        
        rows.push([
            coinId,
            `"${coinName.replace(/"/g, '""')}"`,
            section,
            reference,
            owned,
            isFavorite,
            isWishlist,
            quantity,
            dateAcquired,
            pricePaid,
            `"${noteText}"`
        ].join(','));
    });
    
    // Combine header and rows
    const csv = [headers.join(','), ...rows].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `coin-collection-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast(`📊 Exported ${rows.length} coins as CSV`);
}

function importCollection(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Handle both old format (direct coins) and new format (with metadata)
            const coins = data.coins || data;
            const favorites = data.favorites || [];
            const notes = data.notes || {};
            
            // Save to localStorage
            localStorage.setItem('coinChecklist', JSON.stringify(coins));
            localStorage.setItem('coinFavorites', JSON.stringify(favorites));
            localStorage.setItem('coinNotes', JSON.stringify(notes));
            
            // Reload states
            loadCheckboxStates();
            loadFavorites();
            loadNotes();
            loadAcquisitionIndicators();
            updateProgress();
            updateGlobalStats();
            
            alert('Collection imported successfully!');
        } catch (err) {
            alert('Error importing collection: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// ========== Theme Management ==========

function loadTheme() {
    const savedTheme = localStorage.getItem('coinTheme') || 'dark';
    document.body.classList.toggle('light-theme', savedTheme === 'light');
    updateThemeButton();
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('coinTheme', isLight ? 'light' : 'dark');
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        const isLight = document.body.classList.contains('light-theme');
        btn.textContent = isLight ? '☀️' : '🌙';
        btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
}

// ========== Keyboard Shortcuts ==========

function handleKeyboardShortcuts(e) {
    // Don't trigger in input fields unless it's Escape
    const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    
    // Escape - clear filters or close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('notes-modal');
        if (modal?.classList.contains('active')) {
            modal.classList.remove('active');
        } else if (inInput) {
            document.activeElement.blur();
        } else {
            resetFilters();
        }
        return;
    }
    
    // Don't process other shortcuts when in input fields
    if (inInput) return;
    
    // Ctrl+F or / - Focus search
    if ((e.ctrlKey && e.key === 'f') || e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
        return;
    }
    
    // T - Toggle theme
    if (e.key === 't' || e.key === 'T') {
        toggleTheme();
        return;
    }
    
    // P - Print view
    if (e.key === 'p' || e.key === 'P') {
        if (!e.ctrlKey) {
            window.print();
        }
        return;
    }
    
    // Arrow keys - Navigate between tabs
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        navigateTabs(e.key === 'ArrowRight' ? 1 : -1);
        return;
    }
    
    // Number keys 1-9 - Quick jump to tab, 0 = last tab
    if (e.key >= '0' && e.key <= '9') {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const index = e.key === '0' ? tabBtns.length - 1 : parseInt(e.key) - 1;
        if (index >= 0 && index < tabBtns.length) {
            const tabId = tabBtns[index].getAttribute('data-tab');
            if (window.switchToTab) window.switchToTab(tabId);
        }
        return;
    }
    
    // H - Go home
    if (e.key === 'h' || e.key === 'H') {
        if (window.switchToTab) window.switchToTab('home');
        return;
    }
    
    // M - Go to My Collection
    if (e.key === 'm' || e.key === 'M') {
        if (window.switchToTab) window.switchToTab('my-collection');
        return;
    }
    
    // B - Go back to previous tab
    if (e.key === 'b' || e.key === 'B') {
        goBackTab();
        return;
    }
    
    // R - Random coin
    if (e.key === 'r' || e.key === 'R') {
        showRandomCoin();
        return;
    }
    
    // S - Quick stats
    if (e.key === 's' || e.key === 'S') {
        showQuickStats();
        return;
    }
    
    // A - Show achievements
    if (e.key === 'a' || e.key === 'A') {
        showAchievements();
        return;
    }
    
    // I - Collection insights dashboard
    if (e.key === 'i' || e.key === 'I') {
        showCollectionInsights();
        return;
    }
    
    // C - Copy collection summary to clipboard (for sharing)
    if (e.key === 'c' || e.key === 'C') {
        copyCollectionSummary();
        return;
    }
    
    // V - Generate visual share card
    if (e.key === 'v' || e.key === 'V') {
        generateVisualShareCard();
        return;
    }
    
    // F - Focus mode (dim uncollected coins)
    if (e.key === 'f' || e.key === 'F') {
        toggleFocusMode();
        return;
    }
    
    // U - Jump to random uncollected coin (what to hunt next)
    if (e.key === 'u' || e.key === 'U') {
        showRandomUncollected();
        return;
    }
    
    // E - Export collection
    if (e.key === 'e' || e.key === 'E') {
        exportCollection();
        return;
    }
    
    // W - Toggle wishlist filter (show only wishlisted coins)
    if (e.key === 'w' || e.key === 'W') {
        toggleWishlistFilter();
        return;
    }
    
    // G - Toggle favorites filter (show only favorited coins)
    if (e.key === 'g' || e.key === 'G') {
        toggleFavoritesFilter();
        return;
    }
    
    // O - Toggle owned filter (show only coins you own)
    if (e.key === 'o' || e.key === 'O') {
        toggleOwnedFilter();
        return;
    }
    
    // L - Clear all filters (reset view)
    if (e.key === 'l' || e.key === 'L') {
        clearAllFilters();
        return;
    }
    
    // J - Jump to first uncollected coin (systematic hunting)
    if (e.key === 'j' || e.key === 'J') {
        jumpToFirstUncollected();
        return;
    }
    
    // D - Collection timeline (date range of acquisitions)
    if (e.key === 'd' || e.key === 'D') {
        showCollectionTimeline();
        return;
    }
    
    // X - Toggle images (compact mode for faster scrolling)
    if (e.key === 'x' || e.key === 'X') {
        toggleImagesMode();
        return;
    }
    
    // Escape - Clear search
    if (e.key === 'Escape') {
        const searchBox = document.getElementById('search-box');
        if (searchBox && searchBox.value) {
            searchBox.value = '';
            filterAndSortCoins();
            showToast('🔍 Search cleared', 'info');
        }
        return;
    }
    
    // ? - Show keyboard shortcuts help
    if (e.key === '?') {
        showKeyboardHelp();
        return;
    }
}

// Track first visit for "days collecting" feature
function getCollectingDays() {
    let firstVisit = localStorage.getItem('firstVisit');
    if (!firstVisit) {
        firstVisit = Date.now().toString();
        localStorage.setItem('firstVisit', firstVisit);
    }
    const days = Math.floor((Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24));
    return days;
}

// Achievement badges system
function getAchievements() {
    const owned = document.querySelectorAll('.coin-item input:checked').length;
    const favorites = document.querySelectorAll('.favorite-btn.active').length;
    const days = getCollectingDays();
    const categories = new Set();
    document.querySelectorAll('.coin-item input:checked').forEach(cb => {
        const section = cb.closest('.collection-section');
        if (section) categories.add(section.id);
    });
    
    const badges = [];
    
    // Collection milestones
    if (owned >= 1) badges.push('🥉 First Coin');
    if (owned >= 10) badges.push('🥈 Budding Collector (10+)');
    if (owned >= 50) badges.push('🥇 Serious Collector (50+)');
    if (owned >= 100) badges.push('🏆 Centurion (100+)');
    if (owned >= 250) badges.push('👑 Numismatic Royalty (250+)');
    
    // Category diversity
    if (categories.size >= 3) badges.push('🌍 Explorer (3+ categories)');
    if (categories.size >= 10) badges.push('🗺️ World Traveler (10+ categories)');
    
    // Favorites
    if (favorites >= 5) badges.push('⭐ Curator (5+ favorites)');
    
    // Time-based
    if (days >= 7) badges.push('📅 Week Warrior');
    if (days >= 30) badges.push('📆 Monthly Maven');
    
    return badges;
}

// Show quick collection stats
function showQuickStats() {
    const total = document.querySelectorAll('.coin-item input[type="checkbox"]').length;
    const owned = document.querySelectorAll('.coin-item input:checked').length;
    const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
    const favorites = document.querySelectorAll('.favorite-btn.active').length;
    const wishlist = document.querySelectorAll('.wishlist-btn.active').length;
    const days = getCollectingDays();
    
    // Count by rarity
    let rare = 0, veryRare = 0, extremelyRare = 0;
    document.querySelectorAll('.coin-item input:checked').forEach(cb => {
        const item = cb.closest('.coin-item');
        const rarity = item?.getAttribute('data-rarity');
        if (rarity === 'rare') rare++;
        if (rarity === 'very-rare') veryRare++;
        if (rarity === 'extremely-rare') extremelyRare++;
    });
    
    const daysText = days === 0 ? 'Started today!' : days === 1 ? '1 day' : `${days} days`;
    const achievements = getAchievements();
    
    const statsMsg = `📊 Collection Stats
━━━━━━━━━━━━━━━━
🪙 ${owned}/${total} coins (${pct}%)
⭐ ${favorites} favorites
🎯 ${wishlist} wishlist
📅 Collecting: ${daysText}
🏅 Achievements: ${achievements.length}

💎 Rare: ${rare}
💠 Very Rare: ${veryRare}
👑 Extremely Rare: ${extremelyRare}`;
    
    showToast(statsMsg, 'info');
}

// Show collection insights dashboard (I key)
function showCollectionInsights() {
    // Gather per-category stats
    const categories = [];
    document.querySelectorAll('.collection-section').forEach(section => {
        const id = section.id;
        if (id === 'home' || id === 'my-collection' || id === 'resources') return;
        
        const coins = section.querySelectorAll('.coin-item');
        const total = coins.length;
        if (total === 0) return;
        
        const owned = Array.from(coins).filter(c => c.querySelector('input:checked')).length;
        const pct = Math.round((owned / total) * 100);
        
        // Get section name from tab button
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${id}"]`);
        const name = tabBtn ? tabBtn.textContent.trim() : id;
        
        categories.push({ id, name, owned, total, pct });
    });
    
    if (categories.length === 0) {
        showToast('📊 No collection data yet!', 'info');
        return;
    }
    
    // Sort by completion percentage
    const sorted = [...categories].sort((a, b) => b.pct - a.pct);
    const mostComplete = sorted[0];
    const leastComplete = sorted.filter(c => c.owned > 0).slice(-1)[0] || sorted[sorted.length - 1];
    
    // Find rarest coin owned
    let rarestCoin = null;
    let rarestLevel = 0;
    const rarityOrder = { 'common': 1, 'uncommon': 2, 'scarce': 3, 'rare': 4, 'very-rare': 5, 'extremely-rare': 6 };
    
    document.querySelectorAll('.coin-item input:checked').forEach(cb => {
        const item = cb.closest('.coin-item');
        const rarity = item?.getAttribute('data-rarity');
        const level = rarityOrder[rarity] || 0;
        if (level > rarestLevel) {
            rarestLevel = level;
            rarestCoin = item.getAttribute('data-name') || item.querySelector('.coin-name')?.textContent;
        }
    });
    
    // Calculate total owned coins
    const totalOwned = categories.reduce((sum, c) => sum + c.owned, 0);
    const totalCoins = categories.reduce((sum, c) => sum + c.total, 0);
    
    // Top 5 categories by completion
    const top5 = sorted.slice(0, 5).map((c, i) => {
        const bar = '█'.repeat(Math.round(c.pct / 10)) + '░'.repeat(10 - Math.round(c.pct / 10));
        return `${i + 1}. ${c.name.substring(0, 12).padEnd(12)} ${bar} ${c.pct}%`;
    }).join('\n');
    
    // Categories with any progress
    const activeCategories = categories.filter(c => c.owned > 0).length;
    
    const rarestText = rarestCoin ? `\n👑 Rarest: ${rarestCoin.substring(0, 25)}` : '';
    
    const insightsMsg = `📊 Collection Insights
━━━━━━━━━━━━━━━━━━━━
📈 Overall: ${totalOwned}/${totalCoins} (${Math.round(totalOwned/totalCoins*100)}%)
📂 Active: ${activeCategories}/${categories.length} categories${rarestText}

🏆 Most Complete:
   ${mostComplete.name} (${mostComplete.pct}%)

🎯 Focus Area:
   ${leastComplete.name} (${leastComplete.pct}%)

📊 Top 5 Categories:
${top5}

Press S for quick stats, A for achievements`;
    
    showToast(insightsMsg, 'info');
}

// Collection Timeline (D key) - shows date range of acquisitions
function showCollectionTimeline() {
    const saved = localStorage.getItem('coinAcquisitions');
    if (!saved) {
        showToast('📅 No acquisition dates recorded yet!\nAdd dates in coin notes to track your timeline', 'info');
        return;
    }
    
    const data = JSON.parse(saved);
    const dates = [];
    const coinsByYear = {};
    
    // Parse all dates
    Object.entries(data).forEach(([coinId, acq]) => {
        if (acq.date) {
            const parsed = new Date(acq.date);
            if (!isNaN(parsed.getTime())) {
                dates.push({ date: parsed, coinId });
                const year = parsed.getFullYear();
                coinsByYear[year] = (coinsByYear[year] || 0) + 1;
            }
        }
    });
    
    if (dates.length === 0) {
        showToast('📅 No valid dates found\nUse YYYY-MM-DD format in coin notes', 'info');
        return;
    }
    
    // Sort by date
    dates.sort((a, b) => a.date - b.date);
    const first = dates[0];
    const last = dates[dates.length - 1];
    
    // Calculate span
    const daySpan = Math.ceil((last.date - first.date) / (1000 * 60 * 60 * 24));
    
    // Get coin names
    const getNameById = (id) => {
        const el = document.querySelector(`input[data-coin="${id}"]`)?.closest('.coin-item');
        return el?.getAttribute('data-name') || el?.querySelector('.coin-name')?.textContent?.trim() || id;
    };
    
    // Format date nicely
    const formatDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    // Build year breakdown (top 3 most active years)
    const sortedYears = Object.entries(coinsByYear).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const yearText = sortedYears.map(([y, c]) => `${y}: ${c}`).join(' | ');
    
    const spanText = daySpan === 0 ? 'Same day' : 
                     daySpan === 1 ? '1 day' : 
                     daySpan < 30 ? `${daySpan} days` :
                     daySpan < 365 ? `${Math.round(daySpan / 30)} months` :
                     `${(daySpan / 365).toFixed(1)} years`;
    
    const timelineMsg = `📅 Collection Timeline
━━━━━━━━━━━━━━━━
🏁 First: ${formatDate(first.date)}
   "${getNameById(first.coinId)}"

🆕 Latest: ${formatDate(last.date)}
   "${getNameById(last.coinId)}"

⏱️ Span: ${spanText}
📊 ${dates.length} dated acquisitions

📆 Most Active Years:
   ${yearText}`;
    
    showToast(timelineMsg, 'info');
}

// Jump to random uncollected coin (U key) - "what should I hunt next?"
// Jump to first uncollected coin (J key) - for systematic collecting
function jumpToFirstUncollected() {
    // Get all uncollected coins
    const uncollected = Array.from(document.querySelectorAll('.coin-item'))
        .filter(item => !item.querySelector('input[type="checkbox"]')?.checked);
    
    if (uncollected.length === 0) {
        showToast('🎉 Amazing! You\'ve collected everything!', 'success');
        return;
    }
    
    // Get the first one
    const firstCoin = uncollected[0];
    const coinName = firstCoin.getAttribute('data-name') || 
                     firstCoin.querySelector('.coin-name')?.textContent?.trim() || 
                     'Unknown coin';
    
    // Find which section it's in
    const section = firstCoin.closest('.collection-section');
    const sectionId = section?.id;
    
    // Switch to that tab if needed
    if (sectionId && window.switchToTab) {
        window.switchToTab(sectionId);
    }
    
    // Scroll to and highlight the coin
    setTimeout(() => {
        firstCoin.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstCoin.classList.add('highlight-pulse');
        setTimeout(() => firstCoin.classList.remove('highlight-pulse'), 2000);
    }, 100);
    
    // Show toast
    showToast(`🎯 First Uncollected:\n${coinName.substring(0, 40)}...`, 'info');
}

function showRandomUncollected() {
    // Get all uncollected coins
    const uncollected = Array.from(document.querySelectorAll('.coin-item'))
        .filter(item => !item.querySelector('input[type="checkbox"]')?.checked);
    
    if (uncollected.length === 0) {
        showToast('🎉 Amazing! You\'ve collected everything!', 'success');
        return;
    }
    
    // Pick a random one
    const randomCoin = uncollected[Math.floor(Math.random() * uncollected.length)];
    const coinName = randomCoin.getAttribute('data-name') || 
                     randomCoin.querySelector('.coin-name')?.textContent?.trim() || 
                     'Unknown coin';
    
    // Find which section it's in
    const section = randomCoin.closest('.collection-section');
    const sectionId = section?.id;
    
    // Switch to that tab if needed
    if (sectionId && window.switchToTab) {
        window.switchToTab(sectionId);
    }
    
    // Scroll to and highlight the coin
    setTimeout(() => {
        randomCoin.scrollIntoView({ behavior: 'smooth', block: 'center' });
        randomCoin.classList.add('highlight-pulse');
        setTimeout(() => randomCoin.classList.remove('highlight-pulse'), 2000);
    }, 100);
    
    // Show toast with coin name
    const rarity = randomCoin.getAttribute('data-rarity') || '';
    const rarityEmoji = rarity === 'rare' ? '💎 ' : rarity === 'very-rare' ? '👑 ' : '';
    showToast(`🎯 Hunt suggestion:\n${rarityEmoji}${coinName.substring(0, 40)}`, 'info');
}

// Go back to previous tab (B key)
function goBackTab() {
    if (tabHistory.length <= 1) {
        showToast('📍 No previous tab', 'info');
        return;
    }
    
    const previousTab = tabHistory.pop();
    if (window.switchToTab) {
        // Don't track this navigation in history (we're going back)
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${previousTab}"]`);
        if (tabBtn) tabBtn.classList.add('active');
        
        const targetContent = document.getElementById(previousTab);
        if (targetContent) targetContent.classList.add('active');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const tabName = tabBtn?.textContent?.trim() || previousTab;
        showToast(`⬅️ Back to ${tabName}`, 1000);
    }
}

// Toggle focus mode - dim uncollected coins (F key)
function toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
    const isActive = document.body.classList.contains('focus-mode');
    
    if (isActive) {
        showToast('🔍 Focus Mode ON\nUncollected coins dimmed', 'info');
        localStorage.setItem('focusMode', 'true');
    } else {
        showToast('🔍 Focus Mode OFF\nAll coins visible', 'info');
        localStorage.setItem('focusMode', 'false');
    }
}

// Toggle images mode - hide coin thumbnails for faster scrolling (X key)
function toggleImagesMode() {
    document.body.classList.toggle('hide-images');
    const isHidden = document.body.classList.contains('hide-images');
    
    if (isHidden) {
        showToast('🖼️ Images HIDDEN\nFaster scrolling mode', 'info');
        localStorage.setItem('hideImages', 'true');
    } else {
        showToast('🖼️ Images VISIBLE\nThumbnails restored', 'info');
        localStorage.setItem('hideImages', 'false');
    }
}

// Toggle wishlist filter - show only wishlisted coins (W key)
function toggleWishlistFilter() {
    document.body.classList.toggle('wishlist-filter');
    const isActive = document.body.classList.contains('wishlist-filter');
    const wishlistCount = document.querySelectorAll('.wishlist-btn.active').length;
    
    if (isActive) {
        if (wishlistCount === 0) {
            showToast('🎯 No coins in wishlist!\nAdd coins with the 🎯 button', 'warning');
            document.body.classList.remove('wishlist-filter');
            return;
        }
        showToast(`🎯 Wishlist Filter ON\nShowing ${wishlistCount} wishlisted coins`, 'info');
    } else {
        showToast('🎯 Wishlist Filter OFF\nAll coins visible', 'info');
    }
}

// Toggle favorites filter - show only favorited coins (G key)
function toggleFavoritesFilter() {
    document.body.classList.toggle('favorites-filter');
    const isActive = document.body.classList.contains('favorites-filter');
    const favoritesCount = document.querySelectorAll('.favorite-btn.active').length;
    
    if (isActive) {
        if (favoritesCount === 0) {
            showToast('⭐ No favorites yet!\nStar coins with the ☆ button', 'warning');
            document.body.classList.remove('favorites-filter');
            return;
        }
        showToast(`⭐ Favorites Filter ON\nShowing ${favoritesCount} starred coins`, 'info');
    } else {
        showToast('⭐ Favorites Filter OFF\nAll coins visible', 'info');
    }
}

// Toggle owned filter - show only coins you own (O key)
function toggleOwnedFilter() {
    document.body.classList.toggle('owned-filter');
    const isActive = document.body.classList.contains('owned-filter');
    const ownedCount = document.querySelectorAll('.coin-item input:checked').length;
    
    if (isActive) {
        if (ownedCount === 0) {
            showToast('📦 No coins owned yet!\nCheck coins as you acquire them', 'warning');
            document.body.classList.remove('owned-filter');
            return;
        }
        showToast(`📦 Owned Filter ON\nShowing ${ownedCount} coins in collection`, 'info');
    } else {
        showToast('📦 Owned Filter OFF\nAll coins visible', 'info');
    }
}

// Clear all filter modes (L key)
function clearAllFilters() {
    const filters = ['focus-mode', 'favorites-filter', 'wishlist-filter', 'owned-filter'];
    let hadActive = false;
    
    filters.forEach(filter => {
        if (document.body.classList.contains(filter)) {
            document.body.classList.remove(filter);
            hadActive = true;
        }
    });
    
    // Also reset the dropdown filters
    const rarityFilter = document.getElementById('rarity-filter');
    const statusFilter = document.getElementById('status-filter');
    if (rarityFilter) rarityFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    
    filterAndSortCoins();
    
    if (hadActive) {
        showToast('🔄 All Filters Cleared\nShowing all coins', 'info');
    } else {
        showToast('🔄 No filters active\nAlready showing all coins', 'info');
    }
}

// Copy collection summary to clipboard for sharing (C key)
function copyCollectionSummary() {
    const total = document.querySelectorAll('.coin-item input[type="checkbox"]').length;
    const owned = document.querySelectorAll('.coin-item input:checked').length;
    const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
    const favorites = document.querySelectorAll('.favorite-btn.active').length;
    const wishlist = document.querySelectorAll('.wishlist-btn.active').length;
    const days = getCollectingDays();
    
    // Count by rarity
    let rare = 0, veryRare = 0, extremelyRare = 0;
    document.querySelectorAll('.coin-item input:checked').forEach(cb => {
        const item = cb.closest('.coin-item');
        const rarity = item?.getAttribute('data-rarity');
        if (rarity === 'rare') rare++;
        if (rarity === 'very-rare') veryRare++;
        if (rarity === 'extremely-rare') extremelyRare++;
    });
    
    // Count categories with owned coins
    const categoriesOwned = new Set();
    document.querySelectorAll('.coin-item input:checked').forEach(cb => {
        const section = cb.closest('.collection-section');
        if (section) categoriesOwned.add(section.id);
    });
    
    const daysText = days === 0 ? 'just started!' : days === 1 ? '1 day' : `${days} days`;
    const achievements = getAchievements();
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const summary = `🏛️ My Ancient Coin Collection
━━━━━━━━━━━━━━━━━━━━━━━━
🪙 ${owned} of ${total} coins (${pct}%)
📂 ${categoriesOwned.size} categories explored
⭐ ${favorites} favorites | 🎯 ${wishlist} wishlist
📅 Collecting for ${daysText}

💎 Rare coins: ${rare}
💠 Very rare: ${veryRare}
👑 Extremely rare: ${extremelyRare}

🏅 ${achievements.length} achievements earned!

Generated ${date}
🌐 janet.tailb11806.ts.net`;

    navigator.clipboard.writeText(summary).then(() => {
        showToast('📋 Collection summary copied!\nPaste anywhere to share.', 'success');
    }).catch(() => {
        showToast('❌ Could not copy to clipboard', 'error');
    });
}

// Generate visual share card (V key)
function generateVisualShareCard() {
    const total = document.querySelectorAll('.coin-item input[type="checkbox"]').length;
    const owned = document.querySelectorAll('.coin-item input:checked').length;
    const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
    const favorites = document.querySelectorAll('.favorite-btn.active').length;
    const wishlist = document.querySelectorAll('.wishlist-btn.active').length;
    const days = getCollectingDays();
    
    // Count by rarity
    let rare = 0, veryRare = 0, extremelyRare = 0;
    document.querySelectorAll('.coin-item input:checked').forEach(cb => {
        const item = cb.closest('.coin-item');
        const rarity = item?.getAttribute('data-rarity');
        if (rarity === 'rare') rare++;
        if (rarity === 'very-rare') veryRare++;
        if (rarity === 'extremely-rare') extremelyRare++;
    });
    
    // Count categories
    const categoriesOwned = new Set();
    document.querySelectorAll('.coin-item input:checked').forEach(cb => {
        const section = cb.closest('.collection-section');
        if (section) categoriesOwned.add(section.id);
    });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Title
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️ Ancient Coin Collection', canvas.width / 2, 70);
    
    // Main stats
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`${owned} of ${total} coins (${pct}%)`, canvas.width / 2, 130);
    
    // Progress bar
    const barWidth = 400;
    const barHeight = 20;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 150;
    
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    const progressWidth = (owned / total) * barWidth;
    const progressGradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
    progressGradient.addColorStop(0, '#d4af37');
    progressGradient.addColorStop(1, '#ffd700');
    ctx.fillStyle = progressGradient;
    ctx.fillRect(barX, barY, progressWidth, barHeight);
    
    // Categories and other stats
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'left';
    
    const leftX = 80;
    const rightX = 420;
    let y = 220;
    
    ctx.fillText(`📂 ${categoriesOwned.size} categories explored`, leftX, y);
    ctx.fillText(`⭐ ${favorites} favorites`, rightX, y);
    y += 40;
    
    const daysText = days === 0 ? 'just started!' : days === 1 ? '1 day' : `${days} days`;
    ctx.fillText(`📅 Collecting for ${daysText}`, leftX, y);
    ctx.fillText(`🎯 ${wishlist} wishlist`, rightX, y);
    y += 60;
    
    // Rare coins section
    if (rare > 0 || veryRare > 0 || extremelyRare > 0) {
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💎 Rare Coins Collected', canvas.width / 2, y);
        y += 40;
        
        ctx.fillStyle = '#ffcc99';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'left';
        
        if (rare > 0) {
            ctx.fillText(`💎 Rare: ${rare}`, leftX, y);
        }
        if (veryRare > 0) {
            ctx.fillText(`💠 Very Rare: ${veryRare}`, rightX, y);
        }
        y += 30;
        
        if (extremelyRare > 0) {
            ctx.fillText(`👑 Extremely Rare: ${extremelyRare}`, leftX, y);
        }
        y += 40;
    }
    
    // Achievements count
    const achievements = getAchievements();
    ctx.fillStyle = '#87ceeb';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏅 ${achievements.length} achievements earned!`, canvas.width / 2, y);
    
    // Footer
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    ctx.fillStyle = '#888';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Generated ${date} • janet.tailb11806.ts.net`, canvas.width / 2, canvas.height - 30);
    
    // Convert to blob and download
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ancient-coins-collection-${date.replace(/\s/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('🖼️ Visual share card generated!\nCheck your downloads folder.', 'success');
    }, 'image/png');
}

// Show achievements (A key)
function showAchievements() {
    const badges = getAchievements();
    if (badges.length === 0) {
        showToast('🏅 No achievements yet!\n\nStart collecting to earn badges.', 'info');
        return;
    }
    const msg = `🏅 Your Achievements (${badges.length})\n━━━━━━━━━━━━━━━━\n${badges.join('\n')}`;
    showToast(msg, 'info');
}

// Navigate tabs with arrow keys
function navigateTabs(direction) {
    const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
    const activeBtn = document.querySelector('.tab-btn.active');
    if (!activeBtn || tabBtns.length === 0) return;
    
    const currentIndex = tabBtns.indexOf(activeBtn);
    let newIndex = currentIndex + direction;
    
    // Wrap around
    if (newIndex < 0) newIndex = tabBtns.length - 1;
    if (newIndex >= tabBtns.length) newIndex = 0;
    
    const newTabId = tabBtns[newIndex].getAttribute('data-tab');
    if (window.switchToTab) window.switchToTab(newTabId);
    
    // Show toast with tab name
    const tabName = tabBtns[newIndex].textContent.trim();
    showToast(`📑 ${tabName}`, 1000);
}

// Show keyboard shortcuts help
function showKeyboardHelp() {
    // Remove existing modal if any
    const existing = document.getElementById('keyboard-help-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'keyboard-help-modal';
    modal.className = 'keyboard-help-modal';
    modal.innerHTML = `
        <div class="keyboard-help-content">
            <h3>⌨️ Keyboard Shortcuts</h3>
            <div class="shortcut-categories">
                <div class="shortcut-category">
                    <h4>🧭 Navigation</h4>
                    <div class="shortcut"><kbd>←</kbd> <kbd>→</kbd> <span>Navigate tabs</span></div>
                    <div class="shortcut"><kbd>1</kbd>-<kbd>9</kbd>, <kbd>0</kbd> <span>Jump to tab</span></div>
                    <div class="shortcut"><kbd>H</kbd> <span>Home</span></div>
                    <div class="shortcut"><kbd>M</kbd> <span>My Collection</span></div>
                    <div class="shortcut"><kbd>B</kbd> <span>Go back</span></div>
                </div>
                <div class="shortcut-category">
                    <h4>🔍 Discovery</h4>
                    <div class="shortcut"><kbd>R</kbd> <span>Random coin</span></div>
                    <div class="shortcut"><kbd>U</kbd> <span>Random uncollected</span></div>
                    <div class="shortcut"><kbd>J</kbd> <span>First uncollected</span></div>
                    <div class="shortcut"><kbd>/</kbd> <span>Focus search</span></div>
                    <div class="shortcut-tip">💡 Search also searches your notes! 📝 = matched via notes</div>
                </div>
                <div class="shortcut-category">
                    <h4>🎯 Filters</h4>
                    <div class="shortcut"><kbd>F</kbd> <span>Focus mode</span></div>
                    <div class="shortcut"><kbd>G</kbd> <span>Favorites</span></div>
                    <div class="shortcut"><kbd>O</kbd> <span>Owned</span></div>
                    <div class="shortcut"><kbd>W</kbd> <span>Wishlist</span></div>
                    <div class="shortcut"><kbd>L</kbd> <span>Clear all</span></div>
                </div>
                <div class="shortcut-category">
                    <h4>📊 Information</h4>
                    <div class="shortcut"><kbd>S</kbd> <span>Quick stats</span></div>
                    <div class="shortcut"><kbd>I</kbd> <span>Insights</span></div>
                    <div class="shortcut"><kbd>A</kbd> <span>Achievements</span></div>
                    <div class="shortcut"><kbd>D</kbd> <span>Date timeline</span></div>
                    <div class="shortcut"><kbd>C</kbd> <span>Copy & share</span></div>
                    <div class="shortcut"><kbd>V</kbd> <span>Visual share card</span></div>
                </div>
                <div class="shortcut-category">
                    <h4>🔧 Tools</h4>
                    <div class="shortcut"><kbd>T</kbd> <span>Toggle theme</span></div>
                    <div class="shortcut"><kbd>X</kbd> <span>Hide images</span></div>
                    <div class="shortcut"><kbd>P</kbd> <span>Print view</span></div>
                    <div class="shortcut"><kbd>E</kbd> <span>Export</span></div>
                    <div class="shortcut"><kbd>Esc</kbd> <span>Close/Reset</span></div>
                    <div class="shortcut"><kbd>?</kbd> <span>This help</span></div>
                </div>
            </div>
            <button class="close-help-btn" onclick="document.getElementById('keyboard-help-modal').remove()">Got it!</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Close on Escape
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
}

// ========== Compact Header on Scroll ==========

function setupScrollHeader() {
    const header = document.querySelector('header');
    const tabs = document.querySelector('.tabs');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        // Add scrolled class when scrolled down more than 50px
        if (currentScroll > 50) {
            header.classList.add('scrolled');
            if (tabs) tabs.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            if (tabs) tabs.classList.remove('scrolled');
        }
    }, { passive: true });
}

// ========== Scroll to Top ==========

function setupScrollToTop() {
    const scrollBtn = document.getElementById('scroll-top-btn');
    if (!scrollBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Update scroll progress ring
    window.addEventListener('scroll', () => {
        const progress = scrollBtn.querySelector('.scroll-top-progress');
        if (progress) {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            const rotation = (scrollPercent / 100) * 360;
            progress.style.transform = `rotate(${rotation}deg)`;
        }
    });
}

// ========== Floating Action Button ==========

function setupFAB() {
    const fabMain = document.getElementById('fab-main');
    const fabMenu = document.getElementById('fab-menu');
    
    if (!fabMain || !fabMenu) return;
    
    // Toggle menu
    fabMain.addEventListener('click', () => {
        fabMain.classList.toggle('active');
        fabMenu.classList.toggle('visible');
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.fab-container')) {
            fabMain.classList.remove('active');
            fabMenu.classList.remove('visible');
        }
    });
    
    // Handle action buttons
    fabMenu.querySelectorAll('.fab-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.dataset.action;
            
            switch(action) {
                case 'random':
                    showRandomCoin();
                    break;
                case 'export':
                    exportCollection();
                    break;
                case 'search':
                    document.getElementById('search-input')?.focus();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                case 'home':
                    const homeTab = document.querySelector('[data-tab="home"]') || 
                                   document.querySelector('.tab-btn');
                    if (homeTab) homeTab.click();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
            }
            
            // Close menu after action
            fabMain.classList.remove('active');
            fabMenu.classList.remove('visible');
        });
    });
}

// ========== Tab Progress Badges ==========

function setupTabProgressBadges() {
    // Add badge elements to each tab
    document.querySelectorAll('.tab-btn[data-tab]').forEach(tab => {
        const tabId = tab.dataset.tab;
        
        // Skip non-collection tabs
        if (['my-collection', 'invoice-parser', 'resources', 'home'].includes(tabId)) return;
        
        // Create badge element
        const badge = document.createElement('span');
        badge.className = 'tab-progress-badge';
        tab.appendChild(badge);
    });
    
    // Initial update
    updateTabProgressBadges();
}

function updateTabProgressBadges() {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(tab => {
        const tabId = tab.dataset.tab;
        const badge = tab.querySelector('.tab-progress-badge');
        
        if (!badge) return;
        
        // Count owned coins in this section
        const section = document.getElementById(tabId);
        if (!section) return;
        
        const totalCoins = section.querySelectorAll('.coin-item input[type="checkbox"]').length;
        const ownedCoins = section.querySelectorAll('.coin-item input[type="checkbox"]:checked').length;
        
        if (ownedCoins > 0) {
            badge.textContent = ownedCoins;
            tab.classList.add('has-owned');
            
            if (ownedCoins === totalCoins && totalCoins > 0) {
                tab.classList.add('complete');
                badge.textContent = '✓';
            } else {
                tab.classList.remove('complete');
            }
        } else {
            tab.classList.remove('has-owned', 'complete');
        }
    });
}

// ========== Random Coin Feature ==========

function showRandomCoin() {
    const allCoins = document.querySelectorAll('.coin-item:not(.hidden)');
    if (allCoins.length === 0) {
        showToast('No coins to choose from!', 'warning');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * allCoins.length);
    const randomCoin = allCoins[randomIndex];
    
    // Get coin details
    const coinName = randomCoin.getAttribute('data-name') || 'Unknown Coin';
    const rarity = randomCoin.getAttribute('data-rarity') || 'unknown';
    const isOwned = randomCoin.querySelector('input[type="checkbox"]')?.checked || false;
    const isFavorite = randomCoin.classList.contains('is-favorite');
    
    // Scroll to coin
    randomCoin.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight effect
    randomCoin.classList.add('random-highlight');
    setTimeout(() => randomCoin.classList.remove('random-highlight'), 2000);
    
    // Show toast with coin info
    const status = isOwned ? '✓ Owned' : '○ Needed';
    const favStar = isFavorite ? ' ⭐' : '';
    showToast(`🎲 ${coinName}${favStar}\n${formatRarity(rarity)} • ${status}`, 'info');
}

function formatRarity(rarity) {
    const rarityMap = {
        'common': 'Common',
        'scarce': 'Scarce',
        'rare': 'Rare',
        'very-rare': 'Very Rare',
        'extremely-rare': 'Extremely Rare 🌟'
    };
    return rarityMap[rarity] || rarity;
}

// ========== Scroll Progress Indicator ==========

function setupScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
    });
}

// ========== Category Card Counts ==========

function updateCategoryCardCounts() {
    document.querySelectorAll('.category-card[data-tab]').forEach(card => {
        const tabId = card.dataset.tab;
        const section = document.getElementById(tabId);
        if (!section) return;
        
        const coins = section.querySelectorAll('.coin-item');
        const coinCount = coins.length;
        if (coinCount === 0) return;
        
        // Count owned coins
        const ownedCount = Array.from(coins).filter(item => 
            item.querySelector('input[type="checkbox"]')?.checked
        ).length;
        
        // Add or update count badge
        let countEl = card.querySelector('.category-count');
        if (!countEl) {
            countEl = document.createElement('span');
            countEl.className = 'category-count';
            card.appendChild(countEl);
        }
        
        // Show owned/total if any owned, otherwise just total
        if (ownedCount > 0) {
            countEl.textContent = `${ownedCount}/${coinCount} owned`;
            countEl.classList.add('has-owned');
        } else {
            countEl.textContent = `${coinCount} coins`;
            countEl.classList.remove('has-owned');
        }
    });
}

// ========== Coin of the Day ==========

function initCoinOfTheDay() {
    const cotdCard = document.getElementById('cotd-card');
    if (!cotdCard) return;
    
    // Get today's date as seed
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const seed = hashCode(dateString);
    
    // Get interesting coins (special, rare, or very-rare)
    const interestingCoins = Array.from(document.querySelectorAll('.coin-item'))
        .filter(coin => {
            const rarity = coin.getAttribute('data-rarity');
            return coin.classList.contains('special') || 
                   rarity === 'rare' || 
                   rarity === 'very-rare' || 
                   rarity === 'extremely-rare';
        });
    
    // Fallback to all coins if no interesting ones found
    const coinPool = interestingCoins.length > 50 ? interestingCoins : 
                     Array.from(document.querySelectorAll('.coin-item'));
    
    if (coinPool.length === 0) return;
    
    // Pick coin deterministically based on date
    const coinIndex = Math.abs(seed) % coinPool.length;
    const selectedCoin = coinPool[coinIndex];
    
    // Get coin info
    const coinName = selectedCoin.getAttribute('data-name') || 'Mystery Coin';
    const rarity = selectedCoin.getAttribute('data-rarity') || 'unknown';
    const coinLabel = selectedCoin.closest('.tab-content');
    const category = coinLabel ? (document.querySelector(`[data-tab="${coinLabel.id}"]`)?.textContent.trim() || 'Ancient') : 'Ancient';
    
    // Get description from coin's data or generate one
    const description = getCoinDescription(selectedCoin, coinName, rarity);
    
    // Update the display
    document.getElementById('cotd-date').textContent = today.toLocaleDateString('en-GB', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    document.getElementById('cotd-name').textContent = coinName;
    document.getElementById('cotd-description').textContent = description;
    document.getElementById('cotd-category').textContent = category.replace(/[0-9]/g, '').trim();
    
    // Set up go to button
    const gotoBtn = document.getElementById('cotd-goto');
    if (gotoBtn) {
        gotoBtn.addEventListener('click', () => {
            // Switch to the coin's tab
            if (coinLabel) {
                const tabBtn = document.querySelector(`[data-tab="${coinLabel.id}"]`);
                if (tabBtn) tabBtn.click();
            }
            // Scroll to and highlight the coin
            setTimeout(() => {
                selectedCoin.scrollIntoView({ behavior: 'smooth', block: 'center' });
                selectedCoin.classList.add('random-highlight');
                setTimeout(() => selectedCoin.classList.remove('random-highlight'), 3000);
            }, 300);
        });
    }
}

function getCoinDescription(coinEl, name, rarity) {
    // Generate a brief description based on available info
    const rarityText = formatRarity(rarity);
    const isOwned = coinEl.querySelector('input:checked') ? 'You own this one!' : 'Not yet in your collection.';
    
    // Try to extract period info from parent
    const period = coinEl.closest('.period');
    const periodTitle = period?.querySelector('.period-header h3')?.textContent || '';
    
    let desc = '';
    if (rarity === 'extremely-rare' || rarity === 'very-rare') {
        desc = `A ${rarityText.toLowerCase()} specimen that few collectors ever acquire. `;
    } else if (rarity === 'rare') {
        desc = `An elusive piece that commands attention in any collection. `;
    } else {
        desc = `A fascinating piece of ancient history. `;
    }
    
    if (periodTitle && periodTitle !== name) {
        desc += `From the ${periodTitle} period. `;
    }
    
    desc += isOwned;
    return desc;
}

// Simple hash function for date seeding
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

// ========== Dynamic Home Stats ==========

function updateHomeStats() {
    // Count categories (tabs that are actual coin collections)
    const excludeTabs = ['home', 'my-collection', 'invoice-parser', 'resources'];
    const categoryTabs = document.querySelectorAll('.tab-btn[data-tab]');
    let categoryCount = 0;
    categoryTabs.forEach(tab => {
        if (!excludeTabs.includes(tab.dataset.tab)) {
            categoryCount++;
        }
    });
    
    // Count total coins
    const totalCoins = document.querySelectorAll('.coin-item').length;
    
    // Update display
    const catEl = document.getElementById('stat-categories');
    const coinEl = document.getElementById('stat-coins');
    
    if (catEl) catEl.textContent = categoryCount;
    if (coinEl) coinEl.textContent = totalCoins;
}

// ========== Toast Notifications ==========

function showToast(message, type = 'info') {
    // Get or create toast container
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    const iconMap = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
        <span class="toast-message">${message.replace(/\n/g, '<br>')}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove
    setTimeout(() => {
        toast.remove();
        // Remove container if empty
        if (container.children.length === 0) {
            container.remove();
        }
    }, 3000);
}

// ========== Tabbed Navigation ==========

// Tab history for back navigation
let tabHistory = ['home'];

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Function to switch tabs (exposed globally for keyboard nav)
    function switchTab(tabId) {
        // Track tab history for back navigation
        const currentTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || 'home';
        if (currentTab !== tabId) {
            tabHistory.push(currentTab);
            if (tabHistory.length > 20) tabHistory.shift(); // Keep last 20
        }
        
        // Remove active from all tabs and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active to corresponding tab button and content
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (tabBtn) tabBtn.classList.add('active');
        
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Re-apply filters to the new tab
        if (typeof filterAndSortCoins === 'function') {
            filterAndSortCoins();
        }
        
        // Scroll to top of main content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Tab button clicks
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Home page category cards and CTA buttons
    document.querySelectorAll('.category-card[data-tab], .home-cta-buttons .btn[data-tab]').forEach(el => {
        el.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Make header clickable to go home
    const siteHeader = document.getElementById('site-header');
    if (siteHeader) {
        siteHeader.addEventListener('click', function() {
            switchTab('home');
        });
    }
    
    // Make rarity rows clickable to filter
    document.querySelectorAll('.rarity-row.clickable').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function() {
            const rarity = this.getAttribute('data-rarity');
            if (rarity) {
                // Set the rarity filter dropdown
                const rarityFilter = document.getElementById('rarity-filter');
                if (rarityFilter) {
                    rarityFilter.value = rarity;
                }
                // Set status to owned only
                const statusFilter = document.getElementById('status-filter');
                if (statusFilter) {
                    statusFilter.value = 'owned';
                }
                // Apply filters
                if (typeof filterAndSortCoins === 'function') {
                    filterAndSortCoins();
                }
                // Switch to Greek tab to show results (or any tab with coins)
                switchTab('greek');
                // Show toast
                showToast(`Showing owned ${rarity.replace('-', ' ')} coins`);
            }
        });
    });
    
    // Update home page stats
    updateHomeStats();
    
    // Expose switchTab globally for keyboard navigation
    window.switchToTab = switchTab;
}

function updateHomeStats() {
    const totalEl = document.getElementById('home-total');
    const ownedEl = document.getElementById('home-owned');
    const percentEl = document.getElementById('home-percent');
    const favoritesEl = document.getElementById('home-favorites');
    const wishlistEl = document.getElementById('home-wishlist');
    
    const allCheckboxes = document.querySelectorAll('.coin-item input[type="checkbox"]');
    const total = allCheckboxes.length;
    let owned = 0;
    allCheckboxes.forEach(cb => { if (cb.checked) owned++; });
    
    const favorites = document.querySelectorAll('.favorite-btn.active').length;
    const wishlist = document.querySelectorAll('.wishlist-btn.active').length;
    const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
    
    if (totalEl) totalEl.textContent = total;
    if (ownedEl) ownedEl.textContent = owned;
    if (percentEl) percentEl.textContent = percent + '%';
    if (favoritesEl) favoritesEl.textContent = favorites;
    if (wishlistEl) wishlistEl.textContent = wishlist;
    
    // Update progress bar
    const progressFill = document.getElementById('home-progress-fill');
    const progressLabel = document.getElementById('home-progress-label');
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressLabel) progressLabel.textContent = `${owned} of ${total} coins collected`;
    
    // Update browser tab title with progress
    document.title = owned > 0 
        ? `(${owned}/${total}) Ancient Coin Checklist`
        : 'Ancient Coin Checklist';
    
    // Update footer stats
    const footerCoins = document.getElementById('footer-coins');
    const footerCats = document.getElementById('footer-categories');
    const footerImages = document.getElementById('footer-images');
    if (footerCoins) footerCoins.textContent = total;
    if (footerCats) {
        const excludeTabs = ['home', 'my-collection', 'invoice-parser', 'resources'];
        const catCount = Array.from(document.querySelectorAll('.tab-btn[data-tab]'))
            .filter(t => !excludeTabs.includes(t.dataset.tab)).length;
        footerCats.textContent = catCount;
    }
    if (footerImages) {
        const imgCount = document.querySelectorAll('.coin-img').length;
        footerImages.textContent = imgCount;
    }
}

// ========== Accessibility Improvements ==========

function setupAccessibility() {
    // Add ARIA labels to interactive elements
    document.querySelectorAll('.coin-item').forEach((item, index) => {
        const coinName = item.getAttribute('data-name') || `Coin ${index + 1}`;
        const checkbox = item.querySelector('input[type="checkbox"]');
        const favoriteBtn = item.querySelector('.favorite-btn');
        const notesBtn = item.querySelector('.notes-btn');
        
        if (checkbox) {
            checkbox.setAttribute('aria-label', `Mark ${coinName} as owned`);
        }
        if (favoriteBtn) {
            favoriteBtn.setAttribute('aria-label', `Toggle favorite for ${coinName}`);
            favoriteBtn.setAttribute('role', 'button');
        }
        if (notesBtn) {
            notesBtn.setAttribute('aria-label', `Add notes for ${coinName}`);
            notesBtn.setAttribute('role', 'button');
        }
    });
    
    // Add ARIA labels to filter controls
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.setAttribute('aria-label', 'Search coins by name');
    }
    
    const rarityFilter = document.getElementById('rarity-filter');
    if (rarityFilter) {
        rarityFilter.setAttribute('aria-label', 'Filter by rarity');
    }
    
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.setAttribute('aria-label', 'Filter by collection status');
    }
    
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.setAttribute('aria-label', 'Sort coins');
    }
    
    // Add skip link for keyboard users
    const skipLink = document.createElement('a');
    skipLink.href = '#greek';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Make sections navigable
    document.querySelectorAll('.collection-section').forEach(section => {
        section.setAttribute('role', 'region');
        const h2 = section.querySelector('h2');
        if (h2) {
            const sectionId = section.id;
            h2.setAttribute('id', `${sectionId}-heading`);
            section.setAttribute('aria-labelledby', `${sectionId}-heading`);
        }
    });
    
    // Add live region for stats updates
    const statsContainer = document.querySelector('.stats-dashboard');
    if (statsContainer) {
        statsContainer.setAttribute('aria-live', 'polite');
        statsContainer.setAttribute('aria-atomic', 'false');
    }
}

// ========== Welcome Back ==========

function showWelcomeBack() {
    const lastVisit = localStorage.getItem('lastVisit');
    const now = new Date();
    
    if (lastVisit) {
        const lastDate = new Date(parseInt(lastVisit));
        const hoursSince = (now - lastDate) / (1000 * 60 * 60);
        
        // Only show if more than 1 hour since last visit
        if (hoursSince > 1) {
            const daysAgo = Math.floor(hoursSince / 24);
            let timeMsg;
            if (daysAgo > 0) {
                timeMsg = daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;
            } else {
                const hoursAgo = Math.floor(hoursSince);
                timeMsg = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
            }
            showToast(`Welcome back! Last visit: ${timeMsg}`, 'info');
        }
    }
    
    // Update last visit
    localStorage.setItem('lastVisit', now.getTime().toString());
}

// ========== Collection Import/Export ==========

function checkFirstLoad() {
    const hasImported = localStorage.getItem('collectionImported');
    if (!hasImported) {
        // Auto-load collection from server
        loadCollectionFromServer();
    }
}

async function loadCollectionFromServer() {
    try {
        const response = await fetch('collection.json');
        if (response.ok) {
            const collection = await response.json();
            importCollectionData(collection);
            localStorage.setItem('collectionImported', 'true');
            showToast(`?? Loaded ${Object.keys(collection.coins).length} owned coins from collection!`, 'success');
        }
    } catch (err) {
        console.log('No collection.json found or error loading:', err);
    }
}

async function applyAutoChecks() {
    try {
        const response = await fetch('auto_check.json');
        if (!response.ok) return;
        
        const data = await response.json();
        const ids = data.checklist_ids || [];
        
        if (ids.length === 0) return;
        
        const currentChecked = JSON.parse(localStorage.getItem('coinChecklist') || '{}');
        let newCount = 0;
        
        for (const coinId of ids) {
            if (!currentChecked[coinId]) {
                currentChecked[coinId] = true;
                newCount++;
            }
            
            const checkbox = document.querySelector(`input[data-coin="${coinId}"]`);
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
            }
        }
        
        localStorage.setItem('coinChecklist', JSON.stringify(currentChecked));
        
        if (newCount > 0) {
            console.log(`Auto-checked ${newCount} coins from invoice parsing`);
        }
    } catch (err) {
        console.log('No auto_check.json found:', err);
    }
}

function importCollectionData(collection) {
    // Load owned coins
    const currentChecked = JSON.parse(localStorage.getItem('coinChecklist') || '{}');
    const currentNotes = JSON.parse(localStorage.getItem('coinNotes') || '{}');
    
    for (const [coinId, data] of Object.entries(collection.coins)) {
        if (data.owned) {
            currentChecked[coinId] = true;
            
            // Check the checkbox in DOM
            const checkbox = document.querySelector(`input[data-coin="${coinId}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
        
        if (data.notes) {
            let note = data.notes;
            if (data.quantity && data.quantity > 1) {
                note = `[QTY: ${data.quantity}] ${note}`;
            }
            currentNotes[coinId] = note;
            
            // Update notes button in DOM
            const notesBtn = document.querySelector(`.notes-btn[data-coin="${coinId}"]`);
            if (notesBtn) {
                notesBtn.textContent = '???';
                notesBtn.classList.add('has-note');
            }
        }
    }
    
    localStorage.setItem('coinChecklist', JSON.stringify(currentChecked));
    localStorage.setItem('coinNotes', JSON.stringify(currentNotes));
    
    // Update stats
    updateProgress();
    updateGlobalStats();
}

function reloadCollection() {
    localStorage.removeItem('collectionImported');
    loadCollectionFromServer();
}

// ========== My Collection Tab ==========

// Store collection data globally for sub-tab switching
let collectionData = null;

async function loadMyCollection() {
    try {
        const response = await fetch('my-collection.json');
        if (!response.ok) {
            console.log('my-collection.json not found');
            return;
        }
        
        const data = await response.json();
        collectionData = data;
        
        renderCollectionSummary(data.summary);
        renderIdentifiedCoins(data.invoices);
        renderUnidentifiedCoins(data.invoices);
        renderInvoicesNew(data.invoices);
        updateOverviewBreakdown(data.invoices, data.summary);
        initSubTabs();
    } catch (err) {
        console.error('Error loading collection:', err);
    }
}

// ========== Sub-Tab Navigation ==========

function initSubTabs() {
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const subtab = this.getAttribute('data-subtab');
            switchSubTab(subtab);
        });
    });
}

function switchSubTab(subtab) {
    // Remove active from all sub-tab buttons
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active to clicked button
    const activeBtn = document.querySelector(`.sub-tab-btn[data-subtab="${subtab}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Hide all sub-tab contents
    document.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show the selected sub-tab content
    const targetContent = document.getElementById(`subtab-${subtab}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// Make switchSubTab globally accessible for onclick handlers
window.switchSubTab = switchSubTab;

// ========== Identified vs Unidentified Coins ==========

function getCheckedCoinIds() {
    // Get all checked coin IDs from localStorage
    const saved = localStorage.getItem('coinChecklist');
    if (saved) {
        const states = JSON.parse(saved);
        return Object.keys(states).filter(id => states[id] === true);
    }
    return [];
}

function isItemLinkedToChecklist(item) {
    // Check if this invoice item has a checklist_id that's checked
    if (item.checklist_id) {
        const saved = localStorage.getItem('coinChecklist');
        if (saved) {
            const states = JSON.parse(saved);
            return states[item.checklist_id] === true;
        }
    }
    return false;
}

function renderIdentifiedCoins(invoices) {
    const container = document.getElementById('identified-coins-list');
    if (!container) return;
    container.innerHTML = '';
    
    // Get ALL checked coins from the checklist (this is what "Identified" means)
    const checkedCoinIds = getCheckedCoinIds();
    const identifiedCoins = [];
    
    // Build a map of invoice items by checklist_id for price lookup
    const invoiceItemMap = {};
    if (invoices) {
        for (const inv of invoices) {
            for (const item of inv.items) {
                if (item.checklist_id) {
                    invoiceItemMap[item.checklist_id] = {
                        ...item,
                        house: inv.house,
                        auction: inv.auction,
                        date: inv.date,
                        currency: item.currency || inv.currency
                    };
                }
            }
        }
    }
    
    // For each checked coin in the checklist, create an identified coin entry
    for (const coinId of checkedCoinIds) {
        const coinItem = document.querySelector(`input[data-coin="${coinId}"]`)?.closest('.coin-item');
        const coinName = coinItem?.getAttribute('data-name') || coinId;
        const rarity = coinItem?.getAttribute('data-rarity') || 'unknown';
        
        // Try to get invoice data if available
        const invoiceData = invoiceItemMap[coinId];
        
        identifiedCoins.push({
            checklist_id: coinId,
            name: coinName,
            rarity: rarity,
            // Invoice data (may be undefined)
            hasInvoice: !!invoiceData,
            lot: invoiceData?.lot,
            description: invoiceData?.description,
            house: invoiceData?.house,
            auction: invoiceData?.auction,
            date: invoiceData?.date,
            currency: invoiceData?.currency,
            hammer: invoiceData?.hammer
        });
    }
    
    // Update count badge
    const countBadge = document.getElementById('identified-count');
    if (countBadge) countBadge.textContent = identifiedCoins.length;
    
    if (identifiedCoins.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No identified coins yet.</p>
                <p class="empty-hint">Check coins in the checklist tabs to mark them as owned. They will appear here.</p>
            </div>
        `;
        return;
    }
    
    // Category mapping based on checklist_id prefixes
    const categoryMap = {
        'greek': { name: '🏛️ Greek World', order: 1 },
        'lydia': { name: '🏛️ Greek World', order: 1 },
        'ephesus': { name: '🏛️ Greek World', order: 1 },
        'miletus': { name: '🏛️ Greek World', order: 1 },
        'cyzicus': { name: '🏛️ Greek World', order: 1 },
        'aegina': { name: '🏛️ Greek World', order: 1 },
        'thebes': { name: '🏛️ Greek World', order: 1 },
        'rhodes': { name: '🏛️ Greek World', order: 1 },
        'philip': { name: '🏛️ Greek World', order: 1 },
        'alexander': { name: '🏛️ Greek World', order: 1 },
        'lysimachos': { name: '🏛️ Greek World', order: 1 },
        'thasos': { name: '🏛️ Greek World', order: 1 },
        'rr': { name: '🗡️ Roman Republic', order: 2 },
        'roman-republic': { name: '🗡️ Roman Republic', order: 2 },
        'londinium': { name: '🏰 Londinium Mint', order: 3 },
        'london': { name: '🏰 Londinium Mint', order: 3 },
        'carausius': { name: '🏰 Londinium Mint', order: 3 },
        'allectus': { name: '🏰 Londinium Mint', order: 3 },
        'marc-antony': { name: '⚔️ Marc Antony Legionary', order: 4 },
        'legionary': { name: '⚔️ Marc Antony Legionary', order: 4 },
        'bactrian': { name: '🐘 Bactrian Kings', order: 5 },
        'byzantine': { name: '☦️ Byzantine Empire', order: 6 },
        'celtic': { name: '🌀 Celtic Britain', order: 7 },
        'parthian': { name: '🏹 Parthian Empire', order: 8 },
        'sasanian': { name: '🔥 Sasanian Empire', order: 9 },
        'owl': { name: '🦉 Athens Owls', order: 10 },
        'athens': { name: '🦉 Athens Owls', order: 10 }
    };
    
    // Group coins by category
    const categoryGroups = {};
    
    for (const coin of identifiedCoins) {
        const checklistId = coin.checklist_id || '';
        let category = '📦 Other';
        let order = 99;
        
        // Try to match category from checklist_id
        for (const [prefix, cat] of Object.entries(categoryMap)) {
            if (checklistId.toLowerCase().includes(prefix)) {
                category = cat.name;
                order = cat.order;
                break;
            }
        }
        
        if (!categoryGroups[category]) {
            categoryGroups[category] = { coins: [], order: order };
        }
        categoryGroups[category].coins.push(coin);
    }
    
    // Sort categories by order
    const sortedCategories = Object.entries(categoryGroups)
        .sort((a, b) => a[1].order - b[1].order);
    
    // Render grouped coins
    for (const [categoryName, group] of sortedCategories) {
        const section = document.createElement('div');
        section.className = 'coin-group-section';
        
        // Sort coins within group alphabetically by name
        group.coins.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        const header = document.createElement('div');
        header.className = 'coin-group-header expanded';
        header.innerHTML = `
            <span class="coin-group-title">${categoryName}</span>
            <span class="coin-group-count">${group.coins.length} coin${group.coins.length !== 1 ? 's' : ''}</span>
            <span class="coin-group-toggle">▼</span>
        `;
        header.onclick = () => toggleCoinGroup(header);
        
        const content = document.createElement('div');
        content.className = 'coin-group-content';
        
        for (const coin of group.coins) {
            const card = document.createElement('div');
            card.className = 'collection-coin-card identified';
            
            // Show different info depending on whether we have invoice data
            if (coin.hasInvoice) {
                card.innerHTML = `
                    <div class="coin-card-info">
                        <span class="coin-card-linked-name">✓ ${coin.name}</span>
                        <span class="coin-card-name">Lot ${coin.lot}: ${coin.description}</span>
                        <span class="coin-card-details">${coin.house || 'Unknown'} - ${coin.auction || ''} (${coin.date || ''})</span>
                    </div>
                    <div class="coin-card-cost">
                        <span class="coin-card-price">${coin.currency} ${coin.hammer.toFixed(2)}</span>
                        <span class="coin-card-currency">hammer</span>
                    </div>
                `;
            } else {
                // No invoice data - just show the coin name
                const rarityLabel = coin.rarity ? coin.rarity.replace('-', ' ') : '';
                card.innerHTML = `
                    <div class="coin-card-info">
                        <span class="coin-card-linked-name">✓ ${coin.name}</span>
                        <span class="coin-card-details">${rarityLabel}</span>
                    </div>
                    <div class="coin-card-cost">
                        <span class="coin-card-price">—</span>
                        <span class="coin-card-currency">no invoice</span>
                    </div>
                `;
            }
            content.appendChild(card);
        }
        
        section.appendChild(header);
        section.appendChild(content);
        container.appendChild(section);
    }
}

function renderUnidentifiedCoins(invoices) {
    const container = document.getElementById('unidentified-coins-list');
    if (!container) return;
    container.innerHTML = '';
    
    const unidentifiedCoins = [];
    const unidentifiedAntiq = [];
    
    // Collect all coins from invoices that DON'T have a checklist link
    for (const inv of invoices) {
        for (const item of inv.items) {
            const isLinked = item.checklist_id && isItemLinkedToChecklist(item);
            
            if (!isLinked) {
                const obj = {
                    ...item,
                    house: inv.house,
                    auction: inv.auction,
                    date: inv.date,
                    currency: item.currency || inv.currency
                };
                
                if (item.is_antiquity) {
                    unidentifiedAntiq.push(obj);
                } else {
                    unidentifiedCoins.push(obj);
                }
            }
        }
    }
    
    // Update count badge (coins only, not antiquities)
    const countBadge = document.getElementById('unidentified-count');
    if (countBadge) countBadge.textContent = unidentifiedCoins.length;
    
    if (unidentifiedCoins.length === 0 && unidentifiedAntiq.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🎉 All coins identified!</p>
                <p class="empty-hint">Every coin from your invoices has been matched to a checklist entry.</p>
            </div>
        `;
        return;
    }
    
    // Extract ruler/category from coin descriptions
    const rulerPatterns = [
        { pattern: /Constantine\s*I(?:I)?(?:\s|,|\.|\(|the|$)/i, name: '👑 Constantine I', order: 1 },
        { pattern: /Constantine\s*II/i, name: '👑 Constantine II', order: 2 },
        { pattern: /Constantius\s*II/i, name: '👑 Constantius II', order: 3 },
        { pattern: /Constantius\s*Gallus/i, name: '👑 Constantius Gallus', order: 4 },
        { pattern: /Probus/i, name: '👑 Probus', order: 5 },
        { pattern: /Carausius/i, name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Carausius', order: 6 },
        { pattern: /Allectus/i, name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Allectus', order: 7 },
        { pattern: /Maximianus/i, name: '👑 Maximianus', order: 8 },
        { pattern: /Maximinus\s*II/i, name: '👑 Maximinus II', order: 9 },
        { pattern: /Diocletian/i, name: '👑 Diocletian', order: 10 },
        { pattern: /Licinius/i, name: '👑 Licinius', order: 11 },
        { pattern: /Galerius/i, name: '👑 Galerius', order: 12 },
        { pattern: /Maxentius/i, name: '👑 Maxentius', order: 13 },
        { pattern: /Crispus/i, name: '👑 Crispus', order: 14 },
        { pattern: /Hadrian/i, name: '🏛️ Hadrian', order: 15 },
        { pattern: /Trajan/i, name: '🏛️ Trajan', order: 16 },
        { pattern: /Marcus\s*Aurelius/i, name: '🏛️ Marcus Aurelius', order: 17 },
        { pattern: /Commodus/i, name: '🏛️ Commodus', order: 18 },
        { pattern: /Septimius\s*Severus/i, name: '🏛️ Septimius Severus', order: 19 },
        { pattern: /Caracalla/i, name: '🏛️ Caracalla', order: 20 },
        { pattern: /Elagabalus/i, name: '🏛️ Elagabalus', order: 21 },
        { pattern: /Severus\s*Alexander/i, name: '🏛️ Severus Alexander', order: 22 },
        { pattern: /Augustus/i, name: '🏛️ Augustus', order: 23 },
        { pattern: /Nero\b/i, name: '🏛️ Nero', order: 24 },
        { pattern: /Antoninus\s*Pius/i, name: '🏛️ Antoninus Pius', order: 25 },
        { pattern: /Geta/i, name: '🏛️ Geta', order: 26 },
        { pattern: /Alexander\s*(III|the\s*Great)?.*Macedon/i, name: '🦅 Alexander the Great', order: 27 },
        { pattern: /KINGS?\s*(of\s*)?MACEDON.*Alexander/i, name: '🦅 Alexander the Great', order: 27 },
        { pattern: /Philip\s*(II|III)/i, name: '🦅 Macedon Kings', order: 28 },
        { pattern: /Macedon/i, name: '🦅 Macedon', order: 29 },
        { pattern: /Athens|Attic/i, name: '🦉 Athens', order: 30 },
        { pattern: /City\s*Commemorative/i, name: '🏙️ City Commemoratives', order: 31 },
        { pattern: /Crusader|Bohemund|Antioch.*Crusader/i, name: '⚔️ Crusaders', order: 32 },
        { pattern: /Cilician\s*Armenia|Levon|Hetoum/i, name: '🦁 Cilician Armenia', order: 33 },
        { pattern: /Byzantine|Anastasius|Phocas|Romanus/i, name: '☦️ Byzantine', order: 34 },
        { pattern: /Seleuk/i, name: '🏺 Seleucid', order: 35 },
        { pattern: /Greek|Lucania|Sicily|Syracuse|Ionia|Kolophon|Miletos|Boeotia|Tanagra|Illyria|Apollonia|Thrace|Thasos/i, name: '🏛️ Greek Cities', order: 36 },
        { pattern: /Pontos|Amisos|Paphlagonia/i, name: '🏺 Pontos & Paphlagonia', order: 37 },
        { pattern: /Rhodes/i, name: '🌹 Rhodes', order: 38 },
        { pattern: /^Lot\s+of\s+\d+|unclassified/i, name: '📦 Bulk Lots', order: 90 }
    ];
    
    // Group coins by ruler/category
    const rulerGroups = {};
    
    for (const coin of unidentifiedCoins) {
        let ruler = '❓ Unidentified';
        let order = 99;
        
        // Try to match ruler from description
        for (const r of rulerPatterns) {
            if (r.pattern.test(coin.description)) {
                ruler = r.name;
                order = r.order;
                break;
            }
        }
        
        if (!rulerGroups[ruler]) {
            rulerGroups[ruler] = { coins: [], order: order };
        }
        rulerGroups[ruler].coins.push(coin);
    }
    
    // Sort groups by order (then by count)
    const sortedGroups = Object.entries(rulerGroups)
        .sort((a, b) => {
            if (a[1].order !== b[1].order) return a[1].order - b[1].order;
            return b[1].coins.length - a[1].coins.length;
        });
    
    // Render summary header
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'unidentified-summary';
    summaryHeader.innerHTML = `
        <div class="summary-title">📊 ${unidentifiedCoins.length} Unidentified Coins</div>
        <div class="summary-breakdown">
            ${sortedGroups.slice(0, 5).map(([name, g]) => `<span class="summary-tag">${name}: ${g.coins.length}</span>`).join('')}
            ${sortedGroups.length > 5 ? `<span class="summary-more">+${sortedGroups.length - 5} more groups</span>` : ''}
        </div>
    `;
    container.appendChild(summaryHeader);
    
    // Render grouped coins
    for (const [rulerName, group] of sortedGroups) {
        const section = document.createElement('div');
        section.className = 'coin-group-section';
        
        // Sort coins within group by date (newest first)
        group.coins.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        
        const header = document.createElement('div');
        header.className = 'coin-group-header';
        header.innerHTML = `
            <span class="coin-group-title">${rulerName}</span>
            <span class="coin-group-count">${group.coins.length} coin${group.coins.length !== 1 ? 's' : ''}</span>
            <span class="coin-group-toggle">▶</span>
        `;
        header.onclick = () => toggleCoinGroup(header);
        
        const content = document.createElement('div');
        content.className = 'coin-group-content collapsed';
        
        for (const coin of group.coins) {
            const card = document.createElement('div');
            card.className = 'collection-coin-card unidentified';
            
            card.innerHTML = `
                <div class="coin-card-info">
                    <span class="coin-card-name">Lot ${coin.lot}: ${coin.description}</span>
                    <span class="coin-card-details">${coin.house || 'Unknown'} - ${coin.auction || ''} (${coin.date || ''})</span>
                </div>
                <div class="coin-card-cost">
                    <span class="coin-card-price">${coin.currency} ${coin.hammer.toFixed(2)}</span>
                    <span class="coin-card-currency">hammer</span>
                </div>
            `;
            content.appendChild(card);
        }
        
        section.appendChild(header);
        section.appendChild(content);
        container.appendChild(section);
    }
    
    // Antiquities section
    if (unidentifiedAntiq.length > 0) {
        const antiqSection = document.createElement('div');
        antiqSection.className = 'coin-group-section antiquities-section';
        antiqSection.style.marginTop = '2rem';
        
        const antiqHeader = document.createElement('div');
        antiqHeader.className = 'coin-group-header';
        antiqHeader.innerHTML = `
            <span class="coin-group-title">🏺 Antiquities (non-coin)</span>
            <span class="coin-group-count">${unidentifiedAntiq.length} item${unidentifiedAntiq.length !== 1 ? 's' : ''}</span>
            <span class="coin-group-toggle">▶</span>
        `;
        antiqHeader.onclick = () => toggleCoinGroup(antiqHeader);
        
        const antiqContent = document.createElement('div');
        antiqContent.className = 'coin-group-content collapsed';
        
        for (const item of unidentifiedAntiq) {
            const card = document.createElement('div');
            card.className = 'collection-coin-card antiquity';
            
            card.innerHTML = `
                <div class="coin-card-info">
                    <span class="coin-card-name">Lot ${item.lot}: ${item.description}</span>
                    <span class="coin-card-details">${item.house || 'Unknown'} - ${item.auction || ''} (${item.date || ''})</span>
                </div>
                <div class="coin-card-cost">
                    <span class="coin-card-price">${item.currency} ${item.hammer.toFixed(2)}</span>
                    <span class="coin-card-currency">hammer</span>
                </div>
            `;
            antiqContent.appendChild(card);
        }
        
        antiqSection.appendChild(antiqHeader);
        antiqSection.appendChild(antiqContent);
        container.appendChild(antiqSection);
    }
}

// Toggle coin group collapse/expand
function toggleCoinGroup(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.coin-group-toggle');
    
    if (header.classList.contains('expanded')) {
        header.classList.remove('expanded');
        content.classList.add('collapsed');
        toggle.textContent = '▶';
    } else {
        header.classList.add('expanded');
        content.classList.remove('collapsed');
        toggle.textContent = '▼';
    }
}

function updateOverviewBreakdown(invoices, summary) {
    // Identified = all checked coins in checklist
    const checkedCoinIds = getCheckedCoinIds();
    const identifiedCount = checkedCoinIds.length;
    
    // Unidentified = invoice items that don't have a matching checked checkbox
    let unidentifiedCount = 0;
    if (invoices) {
        for (const inv of invoices) {
            for (const item of inv.items) {
                if (item.is_antiquity) continue;
                
                // Only unidentified if no checklist_id OR the checklist_id isn't checked
                if (!item.checklist_id || !isItemLinkedToChecklist(item)) {
                    unidentifiedCount++;
                }
            }
        }
    }
    
    // Update overview cards
    const identifiedEl = document.getElementById('overview-identified');
    const unidentifiedEl = document.getElementById('overview-unidentified');
    const invoicesEl = document.getElementById('overview-invoices');
    
    if (identifiedEl) identifiedEl.textContent = identifiedCount;
    if (unidentifiedEl) unidentifiedEl.textContent = unidentifiedCount;
    if (invoicesEl) invoicesEl.textContent = invoices ? invoices.length : 0;
}

function renderCollectionSummary(summary) {
    const totalOwned = document.getElementById('total-owned');
    if (totalOwned) totalOwned.textContent = summary.coins || 0;
    
    // Get USD totals if available (check both 'breakdown' and 'totals' for compatibility)
    const usd = summary.breakdown?.USD || summary.totals?.USD || {};
    const eur = summary.breakdown?.EUR || summary.totals?.EUR || {};
    const gbp = summary.breakdown?.GBP || summary.totals?.GBP || {};
    
    // Update stat cards with USD values
    const hammerEl = document.getElementById('total-hammer');
    const bpEl = document.getElementById('total-bp');
    const feesEl = document.getElementById('total-fees');
    const shipEl = document.getElementById('total-shipping');
    const grandTotal = document.getElementById('grand-total');
    
    if (hammerEl) hammerEl.textContent = '$' + (usd.hammer || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
    if (bpEl) bpEl.textContent = '$' + (usd.buyersPremium || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
    if (feesEl) feesEl.textContent = '$' + (usd.paymentFees || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
    if (shipEl) shipEl.textContent = '$' + (usd.shipping || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
    if (grandTotal) grandTotal.textContent = '$' + (usd.total || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
}

// Removed: renderOwnedCoinsNew - replaced by renderIdentifiedCoins and renderUnidentifiedCoins

function renderInvoicesNew(invoices) {
    const container = document.getElementById('invoices-list');
    if (!container) return;
    container.innerHTML = '';
    
    const sorted = [...invoices].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    
    for (const inv of sorted) {
        const coins = inv.items.filter(i => !i.is_antiquity).length;
        const antiq = inv.items.filter(i => i.is_antiquity).length;
        
        const card = document.createElement('div');
        card.className = 'invoice-card';
        
        let itemsHtml = inv.items.map(i => '<div class="invoice-item"><span>Lot ' + i.lot + ': ' + i.description.substring(0,50) + '</span><span class="invoice-item-price">' + (i.currency || inv.currency) + ' ' + i.hammer.toFixed(2) + '</span></div>').join('');
        
        card.innerHTML = '<div class="invoice-header" onclick="this.parentElement.classList.toggle(\'expanded\')"><div><span class="invoice-title">' + (inv.house || 'Unknown') + '</span><span class="invoice-date">' + (inv.auction || '') + ' - ' + (inv.date || '') + '</span><span class="invoice-counts"> (' + coins + 'c ' + antiq + 'a)</span></div><span class="invoice-total">' + inv.currency + ' ' + inv.total.toFixed(2) + '</span></div><div class="invoice-details"><dl class="invoice-breakdown"><dt>Hammer</dt><dd>' + inv.currency + ' ' + inv.hammer.toFixed(2) + '</dd><dt>BP (' + inv.bp_percent + '%)</dt><dd>' + inv.currency + ' ' + inv.bp.toFixed(2) + '</dd><dt>Fees</dt><dd>' + inv.currency + ' ' + inv.payment_fees.toFixed(2) + '</dd><dt>Shipping</dt><dd>' + inv.currency + ' ' + inv.shipping.toFixed(2) + '</dd><dt><strong>Total</strong></dt><dd><strong>' + inv.currency + ' ' + inv.total.toFixed(2) + '</strong></dd></dl><div class="invoice-items"><h4>Items (' + inv.items.length + ')</h4>' + itemsHtml + '</div></div>';
        container.appendChild(card);
    }
}

function renderCollectionStats(collection) {
    const totals = collection.totals;
    const coinCount = Object.keys(collection.coins).length;
    
    document.getElementById('total-owned').textContent = coinCount;
    document.getElementById('total-hammer').textContent = '�' + totals.totalHammer.toFixed(2);
    document.getElementById('total-bp').textContent = '�' + totals.totalBP.toFixed(2);
    document.getElementById('total-fees').textContent = '�' + totals.totalPaymentFees.toFixed(2);
    document.getElementById('total-shipping').textContent = '�' + totals.totalShipping.toFixed(2);
    document.getElementById('grand-total').textContent = '�' + totals.grandTotal.toFixed(2);
}

function renderOwnedCoins(collection) {
    const container = document.getElementById('owned-coins-list');
    container.innerHTML = '';
    
    for (const [coinId, coin] of Object.entries(collection.coins)) {
        const card = document.createElement('div');
        card.className = 'owned-coin-card';
        
        const coinName = getCoinNameById(coinId) || coinId;
        const qtyText = coin.quantity && coin.quantity > 1 ? ` (x${coin.quantity})` : '';
        
        card.innerHTML = `
            <div class="owned-coin-info">
                <span class="owned-coin-name">${coinName}${qtyText}</span>
                <span class="owned-coin-details">${coin.auction} � ${coin.date}</span>
                <span class="owned-coin-details">${coin.notes || ''}</span>
            </div>
            <div class="owned-coin-cost">
                <span class="owned-coin-total">�${coin.totalCost.toFixed(2)}</span>
                <span class="owned-coin-breakdown">�${coin.hammer.toFixed(2)} + ${coin.bpPercent}% BP</span>
            </div>
        `;
        container.appendChild(card);
    }
}

function renderInvoices(collection) {
    const container = document.getElementById('invoices-list');
    container.innerHTML = '';
    
    for (const invoice of collection.invoices) {
        const card = document.createElement('div');
        card.className = 'invoice-card';
        
        const itemsHtml = invoice.items.map(item => `
            <div class="invoice-item">
                <span>${item.desc}</span>
                <span class="invoice-item-price">�${item.hammer.toFixed(2)}</span>
            </div>
        `).join('');
        
        card.innerHTML = `
            <div class="invoice-header" onclick="this.parentElement.classList.toggle('expanded')">
                <div>
                    <span class="invoice-title">${invoice.auction}</span>
                    <span class="invoice-date">${invoice.house} � ${invoice.date}</span>
                </div>
                <span class="invoice-total">�${invoice.total.toFixed(2)}</span>
            </div>
            <div class="invoice-details">
                <dl class="invoice-breakdown">
                    <dt>Hammer Total</dt><dd>�${invoice.hammer.toFixed(2)}</dd>
                    <dt>Buyer's Premium (${invoice.bpPercent}%)</dt><dd>�${invoice.bp.toFixed(2)}</dd>
                    <dt>Subtotal</dt><dd>�${invoice.subtotal.toFixed(2)}</dd>
                    <dt>Payment Fees</dt><dd>�${invoice.paymentFees.toFixed(2)}</dd>
                    <dt>Shipping</dt><dd>�${invoice.shipping.toFixed(2)}</dd>
                    <dt><strong>Total</strong></dt><dd><strong>�${invoice.total.toFixed(2)}</strong></dd>
                </dl>
                <div class="invoice-items">
                    <h4>Items (${invoice.items.length})</h4>
                    ${itemsHtml}
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

function getCoinNameById(coinId) {
    const coinItem = document.querySelector(`[data-coin="${coinId}"]`);
    if (coinItem) {
        const label = coinItem.closest('.coin-item');
        if (label) {
            return label.getAttribute('data-name');
        }
    }
    return null;
}

// Load collection when My Collection tab is clicked
document.addEventListener('DOMContentLoaded', function() {
    const myCollectionTab = document.querySelector('[data-tab="my-collection"]');
    if (myCollectionTab) {
        myCollectionTab.addEventListener('click', loadMyCollection);
    }
    
    // Also load on initial page load if that tab is active
    setTimeout(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'my-collection') {
            loadMyCollection();
        }
    }, 100);
});

// ========== INVOICE PARSER ==========

let itemRowCount = 1;

// PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// PDF Upload handling
function setupPDFUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('pdf-upload');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            processPDF(files[0]);
        } else {
            showUploadStatus('error', '❌ Please upload a PDF file');
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processPDF(e.target.files[0]);
        }
    });
}

function showUploadStatus(type, message) {
    const status = document.getElementById('upload-status');
    status.style.display = 'flex';
    status.className = 'upload-status ' + type;
    status.querySelector('.status-icon').textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : '⏳';
    status.querySelector('.status-text').textContent = message;
}

function hideExtractedPreview() {
    document.getElementById('extracted-preview').style.display = 'none';
}

async function processPDF(file) {
    showUploadStatus('processing', 'Processing PDF...');
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        
        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        // Show extracted text preview
        const preview = document.getElementById('extracted-preview');
        const previewText = document.getElementById('extracted-text');
        previewText.textContent = fullText.substring(0, 2000) + (fullText.length > 2000 ? '\n...(truncated)' : '');
        preview.style.display = 'block';
        
        // Try to parse the invoice
        const parsed = parseInvoiceText(fullText);
        
        if (parsed.items.length > 0) {
            // Populate the form
            populateFromParsed(parsed);
            showUploadStatus('success', `Found ${parsed.items.length} item(s)! Review and adjust below.`);
        } else {
            showUploadStatus('error', 'Could not auto-extract items. Please enter manually or check the preview.');
        }
        
    } catch (err) {
        console.error('PDF processing error:', err);
        showUploadStatus('error', 'Error processing PDF: ' + err.message);
    }
}

function parseInvoiceText(text) {
    const result = {
        house: '',
        auction: '',
        date: '',
        items: [],
        bpPercent: 20,
        shipping: 0
    };
    
    // Try to find auction house
    const housePatterns = [
        /CNG|Classical Numismatic Group/i,
        /Leu Numismatik/i,
        /Roma Numismatics/i,
        /Heritage Auctions/i,
        /Nomos/i,
        /NAC|Numismatica Ars Classica/i,
        /Artemide/i,
        /Biddr/i,
        /Harlan J\.? Berk/i,
        /Stack'?s Bowers/i
    ];
    
    for (const pattern of housePatterns) {
        const match = text.match(pattern);
        if (match) {
            result.house = match[0];
            break;
        }
    }
    
    // Try to find auction number/name
    const auctionMatch = text.match(/(?:Auction|Sale|E-?Auction|eAuction)\s*#?\s*(\d+)/i);
    if (auctionMatch) {
        result.auction = auctionMatch[0];
    }
    
    // Try to find date
    const dateMatch = text.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dateMatch) {
        const [, day, month, year] = dateMatch;
        const fullYear = year.length === 2 ? '20' + year : year;
        result.date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try to find BP percentage
    const bpMatch = text.match(/(?:buyer'?s?\s*premium|BP)[:\s]*(\d+(?:\.\d+)?)\s*%/i);
    if (bpMatch) {
        result.bpPercent = parseFloat(bpMatch[1]);
    }
    
    // Try to find lot items with prices
    // Common patterns:
    // "Lot 123: Description... EUR 150.00" or "€150" or "$150"
    // "123 Description 150.00"
    const lotPatterns = [
        // Lot number, description, price at end
        /(?:Lot\s*#?\s*)?(\d+)[:\.\s]+(.+?)\s+(?:EUR|€|\$|GBP|£)\s*(\d+(?:[,\.]\d+)?)/gi,
        // Price at end with currency symbol
        /(.+?)\s+(?:EUR|€|\$|GBP|£)\s*(\d+(?:[,\.]\d+)?)\s*$/gim,
        // Hammer: followed by amount
        /(.+?)\s+(?:Hammer|Winning Bid)[:\s]*(?:EUR|€|\$|GBP|£)?\s*(\d+(?:[,\.]\d+)?)/gi
    ];
    
    const seenDescriptions = new Set();
    
    for (const pattern of lotPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            let desc, price;
            
            if (match.length === 4) {
                // Lot number pattern
                desc = `Lot ${match[1]}: ${match[2].trim().substring(0, 80)}`;
                price = match[3];
            } else {
                desc = match[1].trim().substring(0, 80);
                price = match[2];
            }
            
            // Clean up price
            price = price.replace(',', '.');
            const priceNum = parseFloat(price);
            
            // Skip if too small (probably not a coin) or too large (probably a total)
            if (priceNum >= 5 && priceNum < 100000 && desc.length > 3) {
                const descKey = desc.toLowerCase().substring(0, 30);
                if (!seenDescriptions.has(descKey)) {
                    seenDescriptions.add(descKey);
                    result.items.push({
                        desc: desc,
                        hammer: priceNum
                    });
                }
            }
        }
    }
    
    // Try to find shipping
    const shipMatch = text.match(/(?:shipping|postage|delivery)[:\s]*(?:EUR|€|\$|GBP|£)?\s*(\d+(?:[,\.]\d+)?)/i);
    if (shipMatch) {
        result.shipping = parseFloat(shipMatch[1].replace(',', '.'));
    }
    
    return result;
}

function populateFromParsed(parsed) {
    // Fill auction details
    if (parsed.house) {
        document.getElementById('auction-house').value = parsed.house;
    }
    if (parsed.auction) {
        document.getElementById('auction-name').value = parsed.auction;
    }
    if (parsed.date) {
        document.getElementById('auction-date').value = parsed.date;
    }
    
    // Set BP if found
    if (parsed.bpPercent) {
        const bpSelect = document.getElementById('bp-percent');
        const bpValue = parsed.bpPercent.toString();
        const option = Array.from(bpSelect.options).find(o => o.value === bpValue);
        if (option) {
            bpSelect.value = bpValue;
        } else {
            bpSelect.value = 'custom';
            document.getElementById('bp-custom').value = parsed.bpPercent;
            document.getElementById('bp-custom').style.display = 'block';
        }
    }
    
    // Set shipping
    if (parsed.shipping) {
        document.getElementById('shipping-cost').value = parsed.shipping;
    }
    
    // Clear existing items and add parsed ones
    const container = document.getElementById('coin-items-list');
    container.innerHTML = '';
    itemRowCount = 0;
    
    if (parsed.items.length > 0) {
        parsed.items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'coin-item-row';
            row.dataset.index = itemRowCount++;
            row.innerHTML = `
                <input type="text" class="item-desc" placeholder="Coin description" value="${item.desc.replace(/"/g, '&quot;')}">
                <input type="number" class="item-hammer" placeholder="Hammer €" step="0.01" min="0" value="${item.hammer}">
                <button class="remove-item-btn" onclick="removeItemRow(this)">✕</button>
            `;
            container.appendChild(row);
            
            // Add listeners
            row.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', calculateInvoice);
            });
        });
    } else {
        // Add empty row
        addItemRow();
    }
    
    // Calculate totals
    calculateInvoice();
}

function addItemRow() {
    const container = document.getElementById('coin-items-list');
    const newRow = document.createElement('div');
    newRow.className = 'coin-item-row';
    newRow.dataset.index = itemRowCount++;
    newRow.innerHTML = `
        <input type="text" class="item-desc" placeholder="Coin description">
        <input type="number" class="item-hammer" placeholder="Hammer €" step="0.01" min="0">
        <button class="remove-item-btn" onclick="removeItemRow(this)">✕</button>
    `;
    container.appendChild(newRow);
    
    // Focus the new description field
    newRow.querySelector('.item-desc').focus();
    
    // Add live calculation on input
    newRow.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateInvoice);
    });
}

function removeItemRow(btn) {
    const row = btn.closest('.coin-item-row');
    const container = document.getElementById('coin-items-list');
    
    // Don't remove if it's the last row
    if (container.children.length > 1) {
        row.remove();
        calculateInvoice();
    } else {
        // Just clear the values
        row.querySelector('.item-desc').value = '';
        row.querySelector('.item-hammer').value = '';
        calculateInvoice();
    }
}

function getBPPercent() {
    const select = document.getElementById('bp-percent');
    const customInput = document.getElementById('bp-custom');
    
    if (select.value === 'custom') {
        return parseFloat(customInput.value) || 0;
    }
    return parseFloat(select.value) || 0;
}

function getPaymentFeePercent() {
    const select = document.getElementById('payment-method');
    const customInput = document.getElementById('payment-custom');
    
    if (select.value === 'custom') {
        return parseFloat(customInput.value) || 0;
    }
    return parseFloat(select.value) || 0;
}

function calculateInvoice() {
    // Get all items with hammer prices
    const itemRows = document.querySelectorAll('.coin-item-row');
    const items = [];
    let totalHammer = 0;
    
    itemRows.forEach(row => {
        const desc = row.querySelector('.item-desc')?.value || '';
        const hammer = parseFloat(row.querySelector('.item-hammer')?.value) || 0;
        if (hammer > 0) {
            items.push({ desc, hammer, row });
            totalHammer += hammer;
        }
    });
    
    const itemCount = items.length;
    
    // Get fee percentages
    const bpPercent = getBPPercent();
    const paymentFeePercent = getPaymentFeePercent();
    
    // Get shipping and insurance
    const shipping = parseFloat(document.getElementById('shipping-cost').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance-cost').value) || 0;
    
    // Calculate totals
    const bp = totalHammer * (bpPercent / 100);
    const subtotal = totalHammer + bp;
    const paymentFees = subtotal * (paymentFeePercent / 100);
    const shippingTotal = shipping + insurance;
    const grandTotal = subtotal + paymentFees + shippingTotal;
    const avgPerCoin = itemCount > 0 ? grandTotal / itemCount : 0;
    
    // Update summary display
    document.getElementById('result-hammer').textContent = '€' + totalHammer.toFixed(2);
    document.getElementById('result-bp-pct').textContent = bpPercent;
    document.getElementById('result-bp').textContent = '€' + bp.toFixed(2);
    document.getElementById('result-subtotal').textContent = '€' + subtotal.toFixed(2);
    document.getElementById('result-fee-pct').textContent = paymentFeePercent;
    document.getElementById('result-fees').textContent = '€' + paymentFees.toFixed(2);
    document.getElementById('result-shipping').textContent = '€' + shippingTotal.toFixed(2);
    document.getElementById('result-total').textContent = '€' + grandTotal.toFixed(2);
    document.getElementById('result-avg').textContent = '€' + avgPerCoin.toFixed(2);
    
    // Generate per-coin breakdown
    updatePerCoinBreakdown(items, totalHammer, bpPercent, paymentFeePercent, shippingTotal);
}

// Calculate and display per-coin true cost breakdown
function updatePerCoinBreakdown(items, totalHammer, bpPercent, paymentFeePercent, shippingTotal) {
    const breakdownSection = document.getElementById('per-coin-breakdown');
    const tbody = document.getElementById('per-coin-tbody');
    
    if (!tbody || !breakdownSection) return;
    
    // Show/hide section based on item count
    if (items.length === 0) {
        breakdownSection.style.display = 'none';
        return;
    }
    breakdownSection.style.display = 'block';
    
    // Get all checklist coins for dropdown
    const checklistCoins = getAllChecklistCoins();
    
    // Build table rows
    tbody.innerHTML = '';
    
    items.forEach((item, index) => {
        // Proportional allocation based on hammer price
        const proportion = totalHammer > 0 ? item.hammer / totalHammer : 0;
        
        const itemBP = item.hammer * (bpPercent / 100);
        const itemSubtotal = item.hammer + itemBP;
        const itemFees = itemSubtotal * (paymentFeePercent / 100);
        const itemShipping = shippingTotal * proportion;
        const trueCost = itemSubtotal + itemFees + itemShipping;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td title="${item.desc}">${item.desc.substring(0, 50)}${item.desc.length > 50 ? '...' : ''}</td>
            <td>€${item.hammer.toFixed(2)}</td>
            <td>€${itemBP.toFixed(2)}</td>
            <td>€${itemFees.toFixed(2)}</td>
            <td>€${itemShipping.toFixed(2)}</td>
            <td class="true-cost">€${trueCost.toFixed(2)}</td>
            <td>
                <select class="coin-link-select" data-index="${index}">
                    <option value="">— Link to coin —</option>
                    ${checklistCoins.map(c => `<option value="${c.id}">${c.name.substring(0, 35)}</option>`).join('')}
                </select>
            </td>
        `;
        tbody.appendChild(tr);
        
        // Store calculated values on the row for CSV export
        tr.dataset.hammer = item.hammer;
        tr.dataset.bp = itemBP;
        tr.dataset.fees = itemFees;
        tr.dataset.shipping = itemShipping;
        tr.dataset.trueCost = trueCost;
        tr.dataset.desc = item.desc;
    });
}

// Get all coins from the checklist for dropdown
function getAllChecklistCoins() {
    const coins = [];
    document.querySelectorAll('.coin-item[data-name]').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) {
            const id = checkbox.getAttribute('data-coin');
            const name = item.getAttribute('data-name');
            if (id && name) {
                coins.push({ id, name });
            }
        }
    });
    // Sort alphabetically
    coins.sort((a, b) => a.name.localeCompare(b.name));
    return coins;
}

// Export invoice data to CSV
function exportToCSV() {
    const house = document.getElementById('auction-house').value || 'Unknown';
    const auction = document.getElementById('auction-name').value || 'Auction';
    const date = document.getElementById('auction-date').value || new Date().toISOString().split('T')[0];
    const bpPercent = getBPPercent();
    const paymentFeePercent = getPaymentFeePercent();
    
    // Get breakdown rows
    const rows = document.querySelectorAll('#per-coin-tbody tr');
    if (rows.length === 0) {
        showToast('No items to export. Calculate first!');
        return;
    }
    
    // CSV header
    const csvRows = [
        ['Description', 'Hammer (€)', 'BP (€)', 'Payment Fees (€)', 'Shipping (€)', 'TRUE COST (€)', 'Linked Coin ID', 'Auction House', 'Auction', 'Date', 'BP%', 'Fee%']
    ];
    
    // Data rows
    rows.forEach(row => {
        const linkedSelect = row.querySelector('.coin-link-select');
        const linkedCoinId = linkedSelect ? linkedSelect.value : '';
        
        csvRows.push([
            `"${(row.dataset.desc || '').replace(/"/g, '""')}"`,
            row.dataset.hammer,
            row.dataset.bp,
            row.dataset.fees,
            row.dataset.shipping,
            row.dataset.trueCost,
            linkedCoinId,
            `"${house.replace(/"/g, '""')}"`,
            `"${auction.replace(/"/g, '""')}"`,
            date,
            bpPercent,
            paymentFeePercent
        ]);
    });
    
    // Create CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${house.replace(/\s+/g, '-')}-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${rows.length} items to CSV`);
}

function clearParser() {
    // Clear auction details
    document.getElementById('auction-house').value = '';
    document.getElementById('auction-name').value = '';
    document.getElementById('auction-date').value = '';
    
    // Reset items to single empty row
    const container = document.getElementById('coin-items-list');
    container.innerHTML = `
        <div class="coin-item-row" data-index="0">
            <input type="text" class="item-desc" placeholder="Coin description">
            <input type="number" class="item-hammer" placeholder="Hammer €" step="0.01" min="0">
            <button class="remove-item-btn" onclick="removeItemRow(this)">✕</button>
        </div>
    `;
    itemRowCount = 1;
    
    // Reset fees
    document.getElementById('bp-percent').value = '20';
    document.getElementById('bp-custom').style.display = 'none';
    document.getElementById('payment-method').value = '3';
    document.getElementById('payment-custom').style.display = 'none';
    document.getElementById('shipping-cost').value = '0';
    document.getElementById('insurance-cost').value = '0';
    
    // Hide and clear per-coin breakdown
    const breakdownSection = document.getElementById('per-coin-breakdown');
    if (breakdownSection) breakdownSection.style.display = 'none';
    const tbody = document.getElementById('per-coin-tbody');
    if (tbody) tbody.innerHTML = '';
    
    // Recalculate (will show zeros)
    calculateInvoice();
    
    // Re-add event listeners
    setupParserListeners();
}

function copyResults() {
    const house = document.getElementById('auction-house').value || 'Unknown';
    const auction = document.getElementById('auction-name').value || 'Auction';
    const date = document.getElementById('auction-date').value || new Date().toLocaleDateString();
    
    // Get items
    const items = [];
    document.querySelectorAll('.coin-item-row').forEach(row => {
        const desc = row.querySelector('.item-desc').value;
        const hammer = parseFloat(row.querySelector('.item-hammer').value) || 0;
        if (desc && hammer > 0) {
            items.push(`  • ${desc}: €${hammer.toFixed(2)}`);
        }
    });
    
    const text = `📋 Invoice: ${house} - ${auction}
Date: ${date}

Items (${items.length}):
${items.join('\n')}

Hammer: ${document.getElementById('result-hammer').textContent}
BP (${document.getElementById('result-bp-pct').textContent}%): ${document.getElementById('result-bp').textContent}
Subtotal: ${document.getElementById('result-subtotal').textContent}
Payment Fees (${document.getElementById('result-fee-pct').textContent}%): ${document.getElementById('result-fees').textContent}
Shipping: ${document.getElementById('result-shipping').textContent}
━━━━━━━━━━━━━━━━━━━━
TOTAL: ${document.getElementById('result-total').textContent}
Avg/coin: ${document.getElementById('result-avg').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Results copied to clipboard!');
    }).catch(err => {
        console.error('Copy failed:', err);
        showToast('Failed to copy');
    });
}

function saveToCollection() {
    const house = document.getElementById('auction-house').value;
    const auction = document.getElementById('auction-name').value;
    const date = document.getElementById('auction-date').value;
    
    if (!house || !auction) {
        showToast('Please enter auction house and name');
        return;
    }
    
    // Get items
    const items = [];
    document.querySelectorAll('.coin-item-row').forEach(row => {
        const desc = row.querySelector('.item-desc').value;
        const hammer = parseFloat(row.querySelector('.item-hammer').value) || 0;
        if (desc && hammer > 0) {
            items.push({ desc, hammer });
        }
    });
    
    if (items.length === 0) {
        showToast('Please add at least one coin');
        return;
    }
    
    const bpPercent = getBPPercent();
    const paymentFeePercent = getPaymentFeePercent();
    const totalHammer = items.reduce((sum, item) => sum + item.hammer, 0);
    const bp = totalHammer * (bpPercent / 100);
    const subtotal = totalHammer + bp;
    const paymentFees = subtotal * (paymentFeePercent / 100);
    const shipping = parseFloat(document.getElementById('shipping-cost').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance-cost').value) || 0;
    const total = subtotal + paymentFees + shipping + insurance;
    
    const invoice = {
        house,
        auction,
        date: date || new Date().toISOString().split('T')[0],
        items,
        hammer: totalHammer,
        bpPercent,
        bp,
        subtotal,
        paymentFeePercent,
        paymentFees,
        shipping: shipping + insurance,
        total
    };
    
    // Save to localStorage
    const saved = localStorage.getItem('savedInvoices');
    const invoices = saved ? JSON.parse(saved) : [];
    invoices.push(invoice);
    localStorage.setItem('savedInvoices', JSON.stringify(invoices));
    
    showToast(`Saved! ${items.length} coin(s), €${total.toFixed(2)} total`);
    
    // Optionally clear after save
    // clearParser();
}

function setupParserListeners() {
    // BP percent custom toggle
    const bpSelect = document.getElementById('bp-percent');
    const bpCustom = document.getElementById('bp-custom');
    if (bpSelect) {
        bpSelect.addEventListener('change', function() {
            bpCustom.style.display = this.value === 'custom' ? 'block' : 'none';
            calculateInvoice();
        });
    }
    if (bpCustom) {
        bpCustom.addEventListener('input', calculateInvoice);
    }
    
    // Payment method custom toggle
    const paymentSelect = document.getElementById('payment-method');
    const paymentCustom = document.getElementById('payment-custom');
    if (paymentSelect) {
        paymentSelect.addEventListener('change', function() {
            paymentCustom.style.display = this.value === 'custom' ? 'block' : 'none';
            calculateInvoice();
        });
    }
    if (paymentCustom) {
        paymentCustom.addEventListener('input', calculateInvoice);
    }
    
    // Shipping and insurance
    document.getElementById('shipping-cost')?.addEventListener('input', calculateInvoice);
    document.getElementById('insurance-cost')?.addEventListener('input', calculateInvoice);
    
    // Initial item row listeners
    document.querySelectorAll('.item-hammer, .item-desc').forEach(input => {
        input.addEventListener('input', calculateInvoice);
    });
}

// Initialize parser listeners on load
document.addEventListener('DOMContentLoaded', function() {
    setupParserListeners();
    setupPDFUpload();
});

// ===== IMAGE LIGHTBOX =====
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    if (!lightbox) {
        console.warn('Lightbox element not found');
        return;
    }
    
    // Click on coin images to open lightbox
    document.addEventListener('click', function(e) {
        const coinImg = e.target.closest('.coin-img');
        if (coinImg && coinImg.src && !coinImg.src.includes('placeholder')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get the coin name from the parent label
            const label = coinImg.closest('.coin-item');
            const coinName = label ? label.querySelector('.coin-name')?.textContent : '';
            
            lightboxImg.src = coinImg.src;
            lightboxCaption.textContent = coinName;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    lightboxClose.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});

// ===== MOBILE BOTTOM NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
    const mobileNav = document.getElementById('mobile-bottom-nav');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-tab]');
    const moreBtn = document.getElementById('mobile-more-btn');
    
    if (!mobileNav) return;
    
    // Handle mobile nav item clicks
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId) {
                // Activate the tab
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                if (tabBtn) {
                    tabBtn.click();
                }
                
                // Update mobile nav active state
                mobileNavItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
    
    // More button shows all tabs in a modal or scrolls to nav
    if (moreBtn) {
        moreBtn.addEventListener('click', function() {
            // Scroll to top tabs
            const tabs = document.querySelector('.tabs');
            if (tabs) {
                tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Flash the tabs to draw attention
                tabs.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
                setTimeout(() => {
                    tabs.style.boxShadow = '';
                }, 1500);
            }
        });
    }
    
    // Sync mobile nav with tab changes
    document.querySelectorAll('.tab-btn').forEach(tabBtn => {
        tabBtn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            mobileNavItems.forEach(nav => {
                nav.classList.toggle('active', nav.getAttribute('data-tab') === tabId);
            });
        });
    });
    
    // Update owned badge on mobile nav
    function updateMobileOwnedBadge() {
        const badge = document.getElementById('mobile-owned-badge');
        if (badge) {
            const owned = document.querySelectorAll('input[type="checkbox"]:checked').length;
            badge.textContent = owned;
            badge.style.display = owned > 0 ? 'flex' : 'none';
        }
    }
    
    // Initial update and observe changes
    updateMobileOwnedBadge();
    
    // Update badge when checkboxes change
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', updateMobileOwnedBadge);
    });
});

// ===== CHECKBOX ANIMATIONS =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.coin-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const item = this.closest('.coin-item');
            if (!item) return;
            
            // Remove any existing animation classes
            item.classList.remove('checking', 'unchecking', 'celebrate', 'is-checked');
            
            if (this.checked) {
                // Add animation class
                item.classList.add('checking', 'is-checked');
                
                // Special celebration for rare+ coins
                const rarity = item.getAttribute('data-rarity');
                if (rarity === 'rare' || rarity === 'very-rare' || rarity === 'extremely-rare') {
                    setTimeout(() => item.classList.add('celebrate'), 100);
                }
                
                // Remove animation class after it completes
                setTimeout(() => {
                    item.classList.remove('checking', 'celebrate');
                }, 600);
            } else {
                // Uncheck animation
                item.classList.add('unchecking');
                setTimeout(() => {
                    item.classList.remove('unchecking', 'is-checked');
                }, 400);
            }
        });
        
        // Apply is-checked class on load for already checked items
        if (checkbox.checked) {
            const item = checkbox.closest('.coin-item');
            if (item) item.classList.add('is-checked');
        }
    });
});

// ===== SECTION COLLAPSE/EXPAND =====
document.addEventListener('DOMContentLoaded', function() {
    // Find all periods and add collapse functionality
    document.querySelectorAll('.period').forEach(period => {
        const h4 = period.querySelector('h4');
        if (!h4) return;
        
        // Skip if already processed
        if (period.querySelector('.period-header')) return;
        
        // Wrap the checklist in a content div
        const content = document.createElement('div');
        content.className = 'period-content';
        
        // Move all elements after h4 into content
        const elementsToMove = [];
        let sibling = h4.nextElementSibling;
        while (sibling) {
            elementsToMove.push(sibling);
            sibling = sibling.nextElementSibling;
        }
        elementsToMove.forEach(el => content.appendChild(el));
        
        // Count coins in this period
        const coinCount = content.querySelectorAll('.coin-item').length;
        
        // Create header wrapper
        const header = document.createElement('div');
        header.className = 'period-header';
        header.innerHTML = `
            <span class="period-coin-count">${coinCount} coins</span>
            <div class="period-toggle">
                <span class="period-toggle-icon">▼</span>
                <span class="period-toggle-text"></span>
            </div>
        `;
        
        // Insert h4 into header
        header.insertBefore(h4, header.firstChild);
        
        // Add header and content to period
        period.insertBefore(header, period.firstChild);
        period.appendChild(content);
        
        // Set initial max-height for animation
        content.style.maxHeight = content.scrollHeight + 'px';
        
        // Toggle on header click
        header.addEventListener('click', function() {
            period.classList.toggle('collapsed');
            
            if (period.classList.contains('collapsed')) {
                content.style.maxHeight = '0';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
    
    // NOTE: Expand/collapse buttons are now handled by initCollapsiblePeriods()
});

// ===== QUICK FILTER CHIPS =====
document.addEventListener('DOMContentLoaded', function() {
    // Add filter chips to collection sections
    document.querySelectorAll('.collection-section').forEach(section => {
        // Skip non-coin sections
        if (section.id === 'resources' || section.id === 'invoice-parser' || section.id === 'home' || section.id === 'my-collection') return;
        
        const h2 = section.querySelector('h2');
        if (!h2) return;
        
        // Check if filter chips already exist
        if (section.querySelector('.filter-chips')) return;
        
        // Count coins by rarity and status
        const allCoins = section.querySelectorAll('.coin-item');
        const counts = {
            all: allCoins.length,
            owned: section.querySelectorAll('.coin-item input:checked').length,
            needed: 0,
            common: 0,
            scarce: 0,
            rare: 0,
            'very-rare': 0,
            'extremely-rare': 0,
            special: section.querySelectorAll('.coin-item.special').length
        };
        
        allCoins.forEach(coin => {
            const rarity = coin.getAttribute('data-rarity');
            if (rarity && counts[rarity] !== undefined) counts[rarity]++;
            const checkbox = coin.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) counts.needed++;
        });
        
        const filterChips = document.createElement('div');
        filterChips.className = 'filter-chips';
        filterChips.innerHTML = `
            <span class="filter-chips-label">🔍 Quick Filter:</span>
            <button class="filter-chip active" data-filter="all">
                <span class="chip-dot"></span>
                All <span class="chip-count">${counts.all}</span>
            </button>
            <button class="filter-chip" data-filter="owned">
                <span class="chip-dot"></span>
                Owned <span class="chip-count">${counts.owned}</span>
            </button>
            <button class="filter-chip" data-filter="needed">
                <span class="chip-dot"></span>
                Needed <span class="chip-count">${counts.needed}</span>
            </button>
            <span class="filter-chips-divider"></span>
            ${counts.common > 0 ? `<button class="filter-chip" data-filter="common"><span class="chip-dot"></span>Common <span class="chip-count">${counts.common}</span></button>` : ''}
            ${counts.scarce > 0 ? `<button class="filter-chip" data-filter="scarce"><span class="chip-dot"></span>Scarce <span class="chip-count">${counts.scarce}</span></button>` : ''}
            ${counts.rare > 0 ? `<button class="filter-chip" data-filter="rare"><span class="chip-dot"></span>Rare <span class="chip-count">${counts.rare}</span></button>` : ''}
            ${counts['very-rare'] > 0 ? `<button class="filter-chip" data-filter="very-rare"><span class="chip-dot"></span>Very Rare <span class="chip-count">${counts['very-rare']}</span></button>` : ''}
            ${counts['extremely-rare'] > 0 ? `<button class="filter-chip" data-filter="extremely-rare"><span class="chip-dot"></span>Extremely Rare <span class="chip-count">${counts['extremely-rare']}</span></button>` : ''}
            ${counts.special > 0 ? `<button class="filter-chip" data-filter="special"><span class="chip-dot"></span>Special <span class="chip-count">${counts.special}</span></button>` : ''}
        `;
        
        // Find the right place to insert (after section-controls if exists, otherwise after h2)
        const sectionControls = section.querySelector('.section-controls');
        const insertAfter = sectionControls || h2;
        insertAfter.insertAdjacentElement('afterend', filterChips);
        
        // Handle filter chip clicks
        filterChips.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active state
                filterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                // Filter coins in this section
                section.querySelectorAll('.coin-item').forEach(coin => {
                    let show = true;
                    
                    switch(filter) {
                        case 'all':
                            show = true;
                            break;
                        case 'owned':
                            show = coin.querySelector('input:checked') !== null;
                            break;
                        case 'needed':
                            show = coin.querySelector('input:checked') === null;
                            break;
                        case 'special':
                            show = coin.classList.contains('special');
                            break;
                        default:
                            show = coin.getAttribute('data-rarity') === filter;
                    }
                    
                    coin.classList.toggle('hidden', !show);
                });
                
                // Update period visibility
                section.querySelectorAll('.period').forEach(period => {
                    const visibleCoins = period.querySelectorAll('.coin-item:not(.hidden)');
                    period.style.display = visibleCoins.length > 0 ? 'block' : 'none';
                });
            });
        });
        
        // Update counts when checkboxes change
        section.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const ownedCount = section.querySelectorAll('.coin-item input:checked').length;
                const neededCount = counts.all - ownedCount;
                
                const ownedChip = filterChips.querySelector('[data-filter="owned"] .chip-count');
                const neededChip = filterChips.querySelector('[data-filter="needed"] .chip-count');
                
                if (ownedChip) ownedChip.textContent = ownedCount;
                if (neededChip) neededChip.textContent = neededCount;
            });
        });
    });
});

// ===== COLLAPSIBLE PERIODS =====
function initCollapsiblePeriods() {
    const periods = document.querySelectorAll('.period');
    const savedStates = JSON.parse(localStorage.getItem('periodStates') || '{}');
    
    periods.forEach((period, index) => {
        // Find the h4 header
        const header = period.querySelector('h4');
        if (!header) return;
        
        // Count coins in this period
        const coinCount = period.querySelectorAll('.coin-item').length;
        if (coinCount === 0) return;
        
        // Create a unique ID for this period
        const periodId = header.textContent.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        period.setAttribute('data-period-id', periodId);
        
        // Wrap h4 in a clickable header
        const headerWrapper = document.createElement('div');
        headerWrapper.className = 'period-header';
        headerWrapper.innerHTML = `
            <span class="period-toggle">▶</span>
            ${header.outerHTML}
            <span class="period-coin-count">${coinCount} coins</span>
        `;
        
        // Wrap content (everything except the new header)
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'period-content';
        
        // Move all children except header to content wrapper
        header.remove();
        while (period.firstChild) {
            contentWrapper.appendChild(period.firstChild);
        }
        
        // Add new structure
        period.appendChild(headerWrapper);
        period.appendChild(contentWrapper);
        
        // Set initial state (collapsed by default, or restore saved state)
        const isExpanded = savedStates[periodId] === true;
        if (isExpanded) {
            period.classList.add('expanded');
        }
        
        // Click handler
        headerWrapper.addEventListener('click', function(e) {
            // Don't collapse if clicking a checkbox or button inside
            if (e.target.closest('input, button')) return;
            
            period.classList.toggle('expanded');
            
            // Save state
            const states = JSON.parse(localStorage.getItem('periodStates') || '{}');
            states[periodId] = period.classList.contains('expanded');
            localStorage.setItem('periodStates', JSON.stringify(states));
        });
    });
    
    // Add expand/collapse all buttons to each collection section
    document.querySelectorAll('.collection-section').forEach(section => {
        // Skip if expand bar already exists
        if (section.querySelector('.expand-collapse-bar')) return;
        
        const firstChild = section.querySelector('.history-intro, .region-header, .period');
        if (!firstChild) return;
        
        const expandBar = document.createElement('div');
        expandBar.className = 'expand-collapse-bar';
        expandBar.innerHTML = `
            <button class="expand-collapse-btn expand-all-btn" data-section="${section.id}">📂 Expand All</button>
            <button class="expand-collapse-btn collapse-all-btn" data-section="${section.id}">📁 Collapse All</button>
        `;
        
        section.insertBefore(expandBar, firstChild);
    });
    
    // Use event delegation for expand/collapse buttons (more reliable)
    document.addEventListener('click', function(e) {
        const expandBtn = e.target.closest('.expand-all-btn');
        const collapseBtn = e.target.closest('.collapse-all-btn');
        
        if (expandBtn) {
            const sectionId = expandBtn.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.querySelectorAll('.period').forEach(p => {
                    p.classList.add('expanded');
                    const periodId = p.getAttribute('data-period-id');
                    if (periodId) {
                        const states = JSON.parse(localStorage.getItem('periodStates') || '{}');
                        states[periodId] = true;
                        localStorage.setItem('periodStates', JSON.stringify(states));
                    }
                });
            }
        }
        
        if (collapseBtn) {
            const sectionId = collapseBtn.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.querySelectorAll('.period').forEach(p => {
                    p.classList.remove('expanded');
                    const periodId = p.getAttribute('data-period-id');
                    if (periodId) {
                        const states = JSON.parse(localStorage.getItem('periodStates') || '{}');
                        states[periodId] = false;
                        localStorage.setItem('periodStates', JSON.stringify(states));
                    }
                });
            }
        }
    });
    
    console.log('[App] Collapsible periods initialized');
}

// ========== ACHIEVEMENTS SYSTEM ==========

const ACHIEVEMENTS = [
    // Quantity milestones
    { id: 'first-coin', name: 'First Steps', icon: '??', description: 'Collect your first coin', check: (stats) => stats.owned >= 1 },
    { id: 'ten-coins', name: 'Getting Started', icon: '??', description: 'Collect 10 coins', check: (stats) => stats.owned >= 10 },
    { id: 'quarter-century', name: 'Quarter Century', icon: '??', description: 'Collect 25 coins', check: (stats) => stats.owned >= 25 },
    { id: 'half-century', name: 'Half Century', icon: '??', description: 'Collect 50 coins', check: (stats) => stats.owned >= 50 },
    { id: 'century-mark', name: 'Century Mark', icon: '??', description: 'Collect 100 coins', check: (stats) => stats.owned >= 100 },
    { id: 'bicentennial', name: 'Bicentennial', icon: '???', description: 'Collect 200 coins', check: (stats) => stats.owned >= 200 },
    { id: 'half-millennium', name: 'Half Millennium', icon: '??', description: 'Collect 500 coins', check: (stats) => stats.owned >= 500 },
    { id: 'millennium', name: 'Millennium Collector', icon: '???', description: 'Collect 1000 coins', check: (stats) => stats.owned >= 1000 },
    
    // Percentage milestones
    { id: 'ten-percent', name: 'One in Ten', icon: '??', description: 'Collect 10% of all coins', check: (stats) => stats.percent >= 10 },
    { id: 'quarter-way', name: 'Quarter Way', icon: '??', description: 'Collect 25% of all coins', check: (stats) => stats.percent >= 25 },
    { id: 'halfway', name: 'Halfway There', icon: '??', description: 'Collect 50% of all coins', check: (stats) => stats.percent >= 50 },
    { id: 'three-quarters', name: 'The Home Stretch', icon: '??', description: 'Collect 75% of all coins', check: (stats) => stats.percent >= 75 },
    { id: 'completionist', name: 'Completionist', icon: '??', description: 'Collect 100% of all coins', check: (stats) => stats.percent >= 100 },
    
    // Rarity achievements
    { id: 'rare-find', name: 'Rare Find', icon: '??', description: 'Collect a rare coin', check: (stats) => stats.rareOwned >= 1 },
    { id: 'treasure-hunter', name: 'Treasure Hunter', icon: '???', description: 'Collect 5 rare+ coins', check: (stats) => stats.rareOwned >= 5 },
    { id: 'museum-quality', name: 'Museum Quality', icon: '???', description: 'Collect 10 rare+ coins', check: (stats) => stats.rareOwned >= 10 },
    { id: 'legendary-hoard', name: 'Legendary Hoard', icon: '?', description: 'Collect 25 rare+ coins', check: (stats) => stats.rareOwned >= 25 },
    
    // Special category achievements
    { id: 'londinium-start', name: 'Londinium Initiate', icon: '??', description: 'Collect a Londinium coin', check: (stats) => stats.londiniumOwned >= 1 },
    { id: 'londinium-collector', name: 'Londinium Collector', icon: '????', description: 'Collect 5 Londinium coins', check: (stats) => stats.londiniumOwned >= 5 },
    { id: 'londinium-master', name: 'Londinium Master', icon: '??', description: 'Collect 15 Londinium coins', check: (stats) => stats.londiniumOwned >= 15 },
    { id: 'athens-initiate', name: 'Owl Keeper', icon: '??', description: 'Collect an Athens Owl', check: (stats) => stats.athensOwned >= 1 },
    { id: 'legionary', name: 'Legionary', icon: '??', description: 'Collect a Marc Antony denarius', check: (stats) => stats.legionaryOwned >= 1 },
    
    // Engagement achievements
    { id: 'favorites-start', name: 'Playing Favorites', icon: '?', description: 'Favorite 5 coins', check: (stats) => stats.favorites >= 5 },
    { id: 'curator', name: 'The Curator', icon: '??', description: 'Add notes to 10 coins', check: (stats) => stats.notesCount >= 10 },
    { id: 'archivist', name: 'The Archivist', icon: '??', description: 'Add notes to 25 coins', check: (stats) => stats.notesCount >= 25 },
    
    // Category completion
    { id: 'first-category', name: 'Specialist', icon: '??', description: 'Complete any category', check: (stats) => stats.completedCategories >= 1 },
    { id: 'multi-specialist', name: 'Multi-Specialist', icon: '???', description: 'Complete 3 categories', check: (stats) => stats.completedCategories >= 3 },
    { id: 'grand-master', name: 'Grand Master', icon: '??', description: 'Complete 5 categories', check: (stats) => stats.completedCategories >= 5 },
    
    // Diversity achievements
    { id: 'explorer', name: 'Explorer', icon: '??', description: 'Collect from 5 different categories', check: (stats) => stats.categoriesWithCoins >= 5 },
    { id: 'world-traveler', name: 'World Traveler', icon: '??', description: 'Collect from 10 different categories', check: (stats) => stats.categoriesWithCoins >= 10 },
    { id: 'empire-builder', name: 'Empire Builder', icon: '??', description: 'Collect from 15 different categories', check: (stats) => stats.categoriesWithCoins >= 15 },
];

function getAchievementStats() {
    const stats = {
        owned: 0,
        total: 0,
        percent: 0,
        rareOwned: 0,
        londiniumOwned: 0,
        athensOwned: 0,
        legionaryOwned: 0,
        favorites: 0,
        notesCount: 0,
        completedCategories: 0,
        categoriesWithCoins: 0
    };
    
    // Count owned and total
    const allCheckboxes = document.querySelectorAll('.coin-item input[type="checkbox"]');
    stats.total = allCheckboxes.length;
    
    // Category tracking
    const categoryStats = {};
    
    allCheckboxes.forEach(cb => {
        const coinItem = cb.closest('.coin-item');
        const section = cb.closest('.tab-content');
        const categoryId = section ? section.id : 'unknown';
        
        if (!categoryStats[categoryId]) {
            categoryStats[categoryId] = { total: 0, owned: 0 };
        }
        categoryStats[categoryId].total++;
        
        if (cb.checked) {
            stats.owned++;
            categoryStats[categoryId].owned++;
            
            // Check rarity
            const rarity = coinItem?.getAttribute('data-rarity');
            if (rarity === 'rare' || rarity === 'very-rare' || rarity === 'extremely-rare') {
                stats.rareOwned++;
            }
            
            // Check specific categories
            if (categoryId === 'londinium') stats.londiniumOwned++;
            if (categoryId === 'athens-owls') stats.athensOwned++;
            if (categoryId === 'marc-antony') stats.legionaryOwned++;
        }
    });
    
    stats.percent = stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0;
    
    // Count completed categories and categories with coins
    const excludeCategories = ['home', 'my-collection', 'invoice-parser', 'resources'];
    Object.entries(categoryStats).forEach(([catId, catStats]) => {
        if (!excludeCategories.includes(catId) && catStats.total > 0) {
            if (catStats.owned > 0) stats.categoriesWithCoins++;
            if (catStats.owned === catStats.total) stats.completedCategories++;
        }
    });
    
    // Count favorites
    stats.favorites = document.querySelectorAll('.favorite-btn.active').length;
    
    // Count notes
    const savedNotes = localStorage.getItem('coinNotes');
    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        stats.notesCount = Object.values(notes).filter(n => n && n.trim()).length;
    }
    
    return stats;
}

function checkAchievements() {
    const stats = getAchievementStats();
    const unlockedIds = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    const newlyUnlocked = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (!unlockedIds.includes(achievement.id) && achievement.check(stats)) {
            unlockedIds.push(achievement.id);
            newlyUnlocked.push(achievement);
        }
    });
    
    if (newlyUnlocked.length > 0) {
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedIds));
        newlyUnlocked.forEach(achievement => {
            showAchievementUnlocked(achievement);
        });
    }
    
    return unlockedIds;
}

function showAchievementUnlocked(achievement) {
    // Create toast notification for achievement
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="achievement-toast-icon">${achievement.icon}</div>
        <div class="achievement-toast-content">
            <div class="achievement-toast-title">Achievement Unlocked!</div>
            <div class="achievement-toast-name">${achievement.name}</div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Remove after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    const unlockedEl = document.getElementById('achievements-unlocked');
    const totalEl = document.getElementById('achievements-total');
    const progressFill = document.getElementById('achievements-progress-fill');
    const toggleBtn = document.getElementById('achievements-toggle');
    
    if (!grid) return;
    
    const unlockedIds = checkAchievements();
    const showAll = localStorage.getItem('showAllAchievements') === 'true';
    
    // Update counts
    if (unlockedEl) unlockedEl.textContent = unlockedIds.length;
    if (totalEl) totalEl.textContent = ACHIEVEMENTS.length;
    if (progressFill) {
        progressFill.style.width = (unlockedIds.length / ACHIEVEMENTS.length * 100) + '%';
    }
    
    // Sort: unlocked first, then locked
    const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedIds.includes(a.id);
        const bUnlocked = unlockedIds.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });
    
    // Filter based on toggle state
    const displayAchievements = showAll 
        ? sortedAchievements 
        : sortedAchievements.filter(a => unlockedIds.includes(a.id)).slice(0, 6);
    
    grid.innerHTML = displayAchievements.map(achievement => {
        const unlocked = unlockedIds.includes(achievement.id);
        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}" title="${achievement.description}">
                <div class="achievement-icon">${unlocked ? achievement.icon : '??'}</div>
                <div class="achievement-name">${unlocked ? achievement.name : '???'}</div>
                ${unlocked ? `<div class="achievement-desc">${achievement.description}</div>` : ''}
            </div>
        `;
    }).join('');
    
    // Handle empty state
    if (displayAchievements.length === 0 && !showAll) {
        grid.innerHTML = '<div class="achievement-empty">No achievements yet. Start collecting!</div>';
    }
    
    // Update toggle button
    if (toggleBtn) {
        toggleBtn.textContent = showAll ? 'Show Less' : `Show All (${ACHIEVEMENTS.length})`;
        toggleBtn.onclick = () => {
            localStorage.setItem('showAllAchievements', (!showAll).toString());
            renderAchievements();
        };
    }
}

function initAchievements() {
    // Initial render
    renderAchievements();
    
    // Re-check on checkbox change
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.closest('.coin-item')) {
            setTimeout(renderAchievements, 100);
        }
    });
    
    // Re-check on favorite toggle
    document.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn') || e.target.closest('.notes-btn')) {
            setTimeout(renderAchievements, 100);
        }
    });
    
    console.log('[App] Achievements system initialized');
}

// Initialize achievements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAchievements);
} else {
    initAchievements();
}
