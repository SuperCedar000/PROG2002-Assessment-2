// Specialized JavaScript for search page
const API_BASE_URL = '/api';

// DOM elements
const searchKeyword = document.getElementById('searchKeyword');
const searchCategory = document.getElementById('searchCategory');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const resultsTitle = document.getElementById('resultsTitle');
const noResults = document.getElementById('noResults');
const loading = document.getElementById('loading');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Search page initialized');
    loadCategoriesForSearch();
    
    // Auto-execute search if URL parameters exist
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('q');
    const category = urlParams.get('category');
    
    if (keyword) {
        searchKeyword.value = keyword;
    }
    if (category) {
        searchCategory.value = category;
    }
    
    if (keyword || category) {
        console.log('🔍 Detected URL parameters, auto-executing search:', { keyword, category });
        performSearch();
    } else {
        // Show prompt if no search conditions
        resultsTitle.textContent = 'Please enter search criteria';
        searchResultsGrid.innerHTML = '';
        noResults.classList.add('hidden');
    }
});

// Load categories for search page
async function loadCategoriesForSearch() {
    try {
        console.log('🏷️ Loading category data...');
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Category data loaded successfully');
        
        if (data.success) {
            const optionsHTML = data.data.map(category => 
                `<option value="${category.name}">${category.name}</option>`
            ).join('');
            
            searchCategory.innerHTML = '<option value="">All categories</option>' + optionsHTML;
            console.log('🏷️ Category dropdown updated');
        }
    } catch (error) {
        console.error('❌ Failed to load categories:', error);
        searchCategory.innerHTML = '<option value="">Failed to load categories</option>';
    }
}

// Execute search - fixed version
async function performSearch() {
    const keyword = searchKeyword.value.trim();
    const category = searchCategory.value;
    
    console.log('🔍 Executing search:', { keyword, category });
    
    // Validate search criteria
    if (!keyword && !category) {
        resultsTitle.textContent = 'Please enter a keyword or select a category';
        return;
    }
    
    showLoading();
    
    try {
        console.log('📡 Starting to fetch event data...');
        
        const response = await fetch(`${API_BASE_URL}/events`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Successfully fetched event data, total:', data.count);
        
        if (data.success && data.data) {
            let filteredEvents = data.data;

            // Apply keyword search
            if (keyword) {
                console.log(`🔤 Applying keyword filter: "${keyword}"`);
                filteredEvents = filteredEvents.filter(event => {
                    const nameMatch = event.name && event.name.toLowerCase().includes(keyword.toLowerCase());
                    const descMatch = event.description && event.description.toLowerCase().includes(keyword.toLowerCase());
                    const locationMatch = event.location && event.location.toLowerCase().includes(keyword.toLowerCase());
                    return nameMatch || descMatch || locationMatch;
                });
                console.log(`🔤 After keyword filter: ${filteredEvents.length} events`);
            }

            // Apply category filter
            if (category) {
                console.log(`🏷️ Applying category filter: "${category}"`);
                filteredEvents = filteredEvents.filter(event => 
                    event.category_name === category
                );
                console.log(`🏷️ After category filter: ${filteredEvents.length} events`);
            }

            console.log(`📊 Final search results: ${filteredEvents.length} events`);
            displaySearchResults(filteredEvents, keyword, category);
            updateURLParams(keyword, category);
        } else {
            throw new Error('API returned data format error');
        }
    } catch (error) {
        console.error('❌ Search failed:', error);
        displayError('Search failed: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Display search results (new version: expand/collapse mode)
function displaySearchResults(events, keyword, category) {
    console.log('📊 Displaying search results:', events);
    
    if (!events || events.length === 0) {
        searchResultsGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        
        let message = 'No matching events found';
        if (keyword || category) {
            message += ':';
            if (keyword) message += ` keyword "${keyword}"`;
            if (category) message += ` category "${category}"`;
        }
        noResults.querySelector('p').textContent = message;
        
        return;
    }

    noResults.classList.add('hidden');
    
    // Update results title
    let title = `Found ${events.length} events`;
    if (keyword || category) {
        title += ' (';
        if (keyword) title += `keyword: "${keyword}" `;
        if (category) title += `category: "${category}"`;
        title += ')';
    }
    resultsTitle.textContent = title;

    // Display event cards (using new expand/collapse mode)
    const eventsHTML = events.map(event => {
        // Ensure data exists
        const eventName = event.name || 'Untitled event';
        const organisation = event.organisation_name || 'Unknown organization';
        const description = event.description || 'No description available';
        const location = event.location || 'Location unknown';
        const categoryName = event.category_name || 'Uncategorized';
        const currentAmount = event.current_amount || '0';
        const goalAmount = event.goal_amount || '0';
        const ticketPrice = event.ticket_price || '0';
        
        return `
        <div class="event-card collapsed" data-event-id="${event.id}">
            <div class="event-preview" onclick="toggleEventDetails(${event.id})">
                <div class="event-header">
                    <h3 class="event-title">${eventName}</h3>
                    <p class="event-organisation">${organisation}</p>
                </div>
                <div class="event-preview-info">
                    <div class="preview-details">
                        <div class="preview-location">
                            <span>📍</span>
                            <span>${location}</span>
                        </div>
                        <div class="preview-date">
                            <span>📅</span>
                            <span>${formatDate(event.event_date)} ${event.event_time || ''}</span>
                        </div>
                    </div>
                    <div class="preview-actions">
                        <div class="ticket-price">
                            ${ticketPrice === '0.00' ? 'free' : `$${formatCurrency(ticketPrice)}`}
                        </div>
                    </div>
                </div>
            </div>
            <div class="event-body">
                <p class="event-description">${description}</p>
                <div class="event-details">
                    <div class="event-detail">
                        <span>📅</span>
                        <span>${formatDate(event.event_date)} ${event.event_time || ''}</span>
                    </div>
                    <div class="event-detail">
                        <span>📍</span>
                        <span>${location}</span>
                    </div>
                    <div class="event-detail">
                        <span>🏷️</span>
                        <span>${categoryName}</span>
                    </div>
                    <div class="event-detail">
                        <span>👥</span>
                        <span>${organisation}</span>
                    </div>
                </div>
                <div class="event-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${calculateProgress(currentAmount, goalAmount)}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>Raised: $${formatCurrency(currentAmount)}</span>
                        <span>Goal: $${formatCurrency(goalAmount)}</span>
                    </div>
                </div>
                <div class="event-footer">
                    <div class="ticket-price">
                        ${ticketPrice === '0.00' ? 'Free' : `$${formatCurrency(ticketPrice)}`}
                    </div>
                    <div>
                        <button class="view-details expanded" onclick="toggleEventDetails(${event.id})">
                            Collapse
                        </button>
                        <button class="view-details" onclick="viewEventDetails(${event.id})">
                            more
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    searchResultsGrid.innerHTML = eventsHTML;
    console.log('✅ Search results rendered');
}

// Toggle event details expand/collapse
function toggleEventDetails(eventId) {
    const eventCard = document.querySelector(`.event-card[data-event-id="${eventId}"]`);
    if (eventCard) {
        const isExpanded = eventCard.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse details
            eventCard.classList.remove('expanded');
            eventCard.classList.add('collapsed');
        } else {
            // Expand details
            eventCard.classList.remove('collapsed');
            eventCard.classList.add('expanded');
        }
    }
}

// View event details - 跳转到 index.html 页面
function viewEventDetails(eventId) {
    // Safely prevent event bubbling
    const clickEvent = window.event || arguments[0];
    if (clickEvent) {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
    }
    
    // Validate eventId
    if (isNaN(eventId) || eventId <= 0) {
        console.error('❌ Invalid event ID:', eventId);
        alert('Invalid event ID');
        return false;
    }
    
    console.log(`🔍 Viewing event details ID: ${eventId}`);
    
    // 跳转到 index.html 页面，传递 eventId 参数
    window.location.href = `index.html?eventId=${eventId}`;
    
    return false;
}

// Display error message
function displayError(message) {
    searchResultsGrid.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button onclick="performSearch()" class="retry-button">Retry Search</button>
        </div>
    `;
    noResults.classList.add('hidden');
}

// Update URL parameters
function updateURLParams(keyword, category) {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (category) params.set('category', category);
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
    console.log('🔗 URL updated:', newURL);
}

// Clear search criteria
function clearSearch() {
    searchKeyword.value = '';
    searchCategory.value = '';
    searchResultsGrid.innerHTML = '';
    noResults.classList.add('hidden');
    resultsTitle.textContent = 'Please enter search criteria';
    
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
    console.log('🧹 Search criteria cleared');
}

// Utility functions
function formatDate(dateString) {
    try {
        if (!dateString) return 'Date unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function formatCurrency(amount) {
    try {
        if (!amount) return '0';
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } catch (error) {
        return amount;
    }
}

function calculateProgress(current, goal) {
    try {
        const currentNum = parseFloat(current) || 0;
        const goalNum = parseFloat(goal) || 1;
        return Math.min((currentNum / goalNum) * 100, 100);
    } catch (error) {
        return 0;
    }
}

function showLoading() {
    loading.classList.remove('hidden');
    console.log('⏳ Showing loading...');
}

function hideLoading() {
    loading.classList.add('hidden');
    console.log('✅ Hiding loading');
}

// Add keyboard event
searchKeyword.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        console.log('↵ Enter key triggered search');
        performSearch();
    }
});

// Add category change event (auto-search)
searchCategory.addEventListener('change', function() {
    if (searchCategory.value) {
        console.log('🏷️ Category change triggered search');
        performSearch();
    }
});