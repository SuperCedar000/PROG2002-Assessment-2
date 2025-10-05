// 配置API基础URL
const API_BASE = 'http://localhost:3000';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing search page...');
    initializeEventListeners();
    loadCategories();
    loadAllEvents(); // 初始加载所有活动
});

// 初始化事件监听器
function initializeEventListeners() {
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearButton');
    const searchInput = document.getElementById('searchKeyword');
    
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', clearSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// 加载分类到下拉菜单
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const result = await response.json();
        
        if (result.success) {
            const categorySelect = document.getElementById('searchCategory');
            categorySelect.innerHTML = '<option value="">All Categories</option>' + 
                result.data.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        }
    } catch (error) {
        console.error('❌ Failed to load categories:', error);
    }
}

// 执行搜索
async function performSearch() {
    try {
        showLoading(true);
        
        const keyword = document.getElementById('searchKeyword').value.trim();
        const category = document.getElementById('searchCategory').value;
        
        console.log('🔍 Search parameters:', { keyword, category });
        
        // 构建正确的搜索URL
        let url = `${API_BASE}/api/events/search`;
        
        // 如果有搜索条件，添加到URL
        if (keyword || category) {
            const params = new URLSearchParams();
            
            if (keyword) params.append('keyword', keyword);
            if (category) params.append('category', category);
            
            url += '?' + params.toString();
        }
        
        console.log('🔍 Fetching URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Search returned ${result.data.length} events`);
            displaySearchResults(result.data, keyword, category);
        } else {
            throw new Error(result.message || 'Search failed');
        }
    } catch (error) {
        console.error('❌ Search failed:', error);
        showError('Search failed: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 显示搜索结果
function displaySearchResults(events, keyword, category) {
    const resultsGrid = document.getElementById('searchResultsGrid');
    const noResults = document.getElementById('noResults');
    const resultsTitle = document.getElementById('resultsTitle');
    
    if (!resultsGrid || !noResults || !resultsTitle) {
        console.error('❌ Required DOM elements not found');
        return;
    }
    
    // 更新标题
    let title = 'Search Results';
    let hasFilter = false;
    
    if (keyword) {
        title += ` - Keyword: "${keyword}"`;
        hasFilter = true;
    }
    
    if (category) {
        const categorySelect = document.getElementById('searchCategory');
        const categoryName = categorySelect ? categorySelect.options[categorySelect.selectedIndex].text : category;
        title += hasFilter ? `, Category: ${categoryName}` : ` - Category: ${categoryName}`;
        hasFilter = true;
    }
    
    if (!hasFilter) {
        title = 'All Events';
    }
    
    resultsTitle.textContent = title;
    
    if (!events || events.length === 0) {
        resultsGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    resultsGrid.innerHTML = events.map(event => `
        <div class="event-card">
            <div class="event-header">
                <h3 class="event-name">${event.name}</h3>
                <span class="event-category">${event.category_name || 'Uncategorized'}</span>
            </div>
            <div class="event-basic-info">
                <p><strong>📅 Date:</strong> ${formatDate(event.event_date)}</p>
                <p><strong>📍 Location:</strong> ${event.location}</p>
                <p><strong>🏢 Organization:</strong> ${event.organisation_name || 'Unknown Organization'}</p>
                <p class="event-description"><strong>📝 Description:</strong> ${event.description ? (event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '')) : 'No description available'}</p>
            </div>
            <button class="view-details-btn" onclick="viewEventDetails(${event.id})">View Details</button>
        </div>
    `).join('');
}

// 查看活动详情
function viewEventDetails(eventId) {
    // 确保eventId是有效的数字
    if (isNaN(eventId) || eventId <= 0) {
        console.error('❌ Invalid event ID:', eventId);
        alert('Invalid event ID');
        return;
    }
    window.location.href = `index.html?eventId=${eventId}`;
}

// 清空搜索
function clearSearch() {
    document.getElementById('searchKeyword').value = '';
    document.getElementById('searchCategory').value = '';
    
    // 重新加载所有活动
    loadAllEvents();
    
    document.getElementById('resultsTitle').textContent = 'Please enter search criteria';
}

// 加载所有活动
async function loadAllEvents() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/api/events`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displaySearchResults(result.data, '', '');
        } else {
            throw new Error(result.message || 'Failed to load events');
        }
    } catch (error) {
        console.error('❌ Failed to load events:', error);
        showError('Failed to load events: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 格式化日期
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('❌ Date formatting error:', error);
        return dateString;
    }
}

// 显示/隐藏加载指示器
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// 显示错误信息
function showError(message) {
    const resultsGrid = document.getElementById('searchResultsGrid');
    const noResults = document.getElementById('noResults');
    
    if (resultsGrid) {
        resultsGrid.innerHTML = '';
    }
    
    if (noResults) {
        noResults.classList.remove('hidden');
        noResults.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button class="retry-button" onclick="loadAllEvents()">Retry</button>
            </div>
        `;
    }
}