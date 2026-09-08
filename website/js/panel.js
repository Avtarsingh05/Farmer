/**
 * KisanMitra Unified Panel System (HTML/CSS/JS)
 * Shared high-fidelity Shell for Farmer, Buyer, and Admin Panels
 * Replicates the exact React layout, styling, and Lucide icons.
 */

window.ADMIN_UID = 'DGzP6ZxUblbqM8RyvwoVrbAmEEs1';

// Currency Formatter matching currency.ts
window.formatCurrency = function(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

// Order Status Badge matching React OrderStatusBadge
window.getOrderStatusBadge = function(status) {
  const s = status || 'pending';
  let badgeClass = 'bg-neutral-100 text-neutral-700 border-neutral-200';
  switch (s) {
    case 'pending': badgeClass = 'bg-amber-100 text-amber-800 border-amber-200'; break;
    case 'accepted':
    case 'processing': badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'; break;
    case 'ready_for_dispatch':
    case 'out_for_delivery': badgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200'; break;
    case 'delivered': badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'; break;
    case 'cancelled':
    case 'rejected': badgeClass = 'bg-red-100 text-red-800 border-red-200'; break;
  }
  const label = s.replace(/_/g, ' ');
  return `<span class="px-3 py-1 text-xs font-bold rounded-full capitalize border shadow-sm ${badgeClass}">${label}</span>`;
};

// Toast notification helper
window.toast = function({ type = 'info', message = '' }) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.className = 'pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all duration-300 transform translate-y-4 opacity-0 max-w-md';
  
  let bg = 'bg-white text-neutral-800 border-neutral-200';
  let icon = 'info';
  if (type === 'success') {
    bg = 'bg-emerald-900 text-white border-emerald-800';
    icon = 'check-circle-2';
  } else if (type === 'error') {
    bg = 'bg-red-900 text-white border-red-800';
    icon = 'alert-circle';
  } else if (type === 'warning') {
    bg = 'bg-amber-900 text-white border-amber-800';
    icon = 'alert-triangle';
  }

  toastEl.className += ' ' + bg;
  toastEl.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 shrink-0"></i><span>${message}</span>`;
  container.appendChild(toastEl);
  if (window.lucide) lucide.createIcons({ root: toastEl });

  requestAnimationFrame(() => {
    toastEl.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toastEl.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toastEl.remove(), 300);
  }, 4000);
};

// Navigation item definitions matching React Sidebars
const NAV_CONFIG = {
  farmer: [
    { id: 'dashboard', label: 'Dashboard', path: 'dashboard.html', icon: 'layout-dashboard' },
    { id: 'products', label: 'Products', path: 'products.html', icon: 'package' },
    { id: 'orders', label: 'Orders', path: 'orders.html', icon: 'shopping-bag' },
    { id: 'inventory', label: 'Inventory', path: 'inventory.html', icon: 'archive' },
    { id: 'earnings', label: 'Earnings', path: 'earnings.html', icon: 'indian-rupee' },
    { id: 'analytics', label: 'Analytics', path: 'analytics.html', icon: 'bar-chart-2' },
  ],
  buyer: [
    { id: 'dashboard', label: 'Dashboard', path: 'dashboard.html', icon: 'layout-dashboard' },
    { id: 'search', label: 'Search Produce', path: 'search.html', icon: 'search' },
    { id: 'cart', label: 'Cart', path: 'cart.html', icon: 'shopping-cart', hasBadge: true },
    { id: 'orders', label: 'Orders', path: 'orders.html', icon: 'clipboard-list' },
    { id: 'favorites', label: 'Favorites', path: 'favorites.html', icon: 'heart' },
    { id: 'profile', label: 'Profile', path: 'profile.html', icon: 'user' },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', path: 'dashboard.html', icon: 'layout-dashboard' },
    { id: 'users', label: 'Users', path: 'users.html', icon: 'users' },
    { id: 'farmers', label: 'Farmers', path: 'farmers.html', icon: 'sprout' },
    { id: 'products', label: 'Products', path: 'products.html', icon: 'package' },
    { id: 'orders', label: 'Orders', path: 'orders.html', icon: 'shopping-bag' },
    { id: 'categories', label: 'Categories', path: 'categories.html', icon: 'tag' },
    { id: 'settings', label: 'Settings', path: 'settings.html', icon: 'settings' },
  ]
};

// Main Panel Initializer
window.initPanel = function({ role = 'farmer', currentPage = 'dashboard', title = 'Dashboard' }) {
  let isCollapsed = localStorage.getItem('kisanmitra_sidebar_collapsed') === 'true';

  // Get Platform settings (custom logo if uploaded)
  let logoUrl = null;
  try {
    const rawSettings = localStorage.getItem('kisanmitra_platform_settings');
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      logoUrl = parsed.logoUrl;
    }
  } catch(e) {}

  const navItems = NAV_CONFIG[role] || NAV_CONFIG.farmer;
  const menuCategory = role === 'admin' ? 'Management' : (role === 'buyer' ? 'Buyer Menu' : 'Farmer Menu');
  const roleTitle = role === 'admin' ? 'Administrator' : (role === 'buyer' ? 'Buyer Account' : 'Farmer Account');

  // 1. Render Sidebar HTML
  const sidebarHTML = `
  <!-- Desktop Sidebar -->
  <aside id="sidebar" class="hidden lg:flex flex-col bg-neutral-900 text-white h-screen fixed top-0 left-0 z-50 shadow-2xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}">
    <!-- Floating toggle button on right border -->
    <button id="sidebar-toggle" class="absolute -right-3.5 top-7 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-300 rounded-full w-7 h-7 flex items-center justify-center z-50 shadow-md transition-colors" title="Toggle Sidebar">
      <i id="toggle-chevron" data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-left'}" class="w-4 h-4 ${isCollapsed ? 'ml-0.5' : 'mr-0.5'}"></i>
    </button>

    <!-- Header / Brand -->
    <div id="sidebar-header" class="flex items-center h-20 cursor-pointer bg-neutral-950/50 border-white/5 backdrop-blur-md border-b transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-start px-6'}" onclick="window.location.href='dashboard.html'">
      <div class="flex items-center space-x-3 overflow-hidden">
        <div class="bg-primary w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 shrink-0 overflow-hidden">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="w-full h-full object-contain bg-white">` : `<span class="text-white font-black text-xl">K</span>`}
        </div>
        <span id="sidebar-brand-name" class="text-2xl font-bold tracking-tight text-white whitespace-nowrap ${isCollapsed ? 'hidden' : 'block animate-fade-in'}">KisanMitra</span>
      </div>
    </div>

    <!-- Nav Items -->
    <nav class="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-hide">
      <div id="sidebar-menu-title" class="px-4 mb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}">${menuCategory}</div>
      ${navItems.map(item => {
        const isActive = item.id === currentPage;
        return `
          <a href="${item.path}" 
             class="flex items-center py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'px-4 justify-between'} ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}"
             title="${isCollapsed ? item.label : ''}">
            <div class="flex items-center ${isCollapsed ? 'justify-center w-full relative' : ''}">
              <i data-lucide="${item.icon}" class="flex-shrink-0 h-5 w-5 transition-transform duration-300 ${isCollapsed ? '' : 'mr-3.5'} ${isActive ? 'scale-110' : 'group-hover:scale-110'}"></i>
              <span class="nav-label relative z-10 ${isCollapsed ? 'hidden' : 'block'}">${item.label}</span>
              ${item.hasBadge ? `<span id="sidebar-cart-dot" class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-neutral-900"></span>` : ''}
            </div>
            ${item.hasBadge ? `<span id="sidebar-cart-badge" class="hidden text-xs font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 relative z-10 ${isCollapsed ? 'hidden' : 'block'}">0</span>` : ''}
            ${isActive && !isCollapsed ? `<div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>` : ''}
          </a>
        `;
      }).join('')}
    </nav>

    <!-- Footer Profile & Actions -->
    <div id="sidebar-footer" class="p-4 bg-neutral-950/50 backdrop-blur-md border-t border-white/5 mt-auto ${isCollapsed ? 'items-center flex flex-col' : ''}">
      <div id="sidebar-user-row" class="flex items-center mb-4 ${isCollapsed ? 'justify-center px-0' : 'px-2'}">
        <div class="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold overflow-hidden shadow-md ring-2 ring-white/10 shrink-0">
          <span id="user-initial">U</span>
        </div>
        <div id="sidebar-user-details" class="ml-3 flex-1 min-w-0 ${isCollapsed ? 'hidden' : 'block'}">
          <p id="user-display-name" class="text-sm font-bold text-white truncate">Loading...</p>
          <p class="text-xs text-neutral-400 font-medium truncate">${roleTitle}</p>
        </div>
      </div>
      <div id="sidebar-action-buttons" class="flex flex-col space-y-1.5 w-full ${isCollapsed ? 'items-center' : ''}">
        <a href="${role === 'admin' ? 'settings.html' : (role === 'buyer' ? 'profile.html' : 'profile.html')}" 
           class="flex items-center py-2.5 text-sm font-medium text-neutral-400 rounded-xl hover:bg-white/5 hover:text-white w-full transition-colors group ${isCollapsed ? 'justify-center px-0' : 'px-4'}"
           title="${isCollapsed ? 'Settings' : ''}">
          <i data-lucide="settings" class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90 ${isCollapsed ? '' : 'mr-3'}"></i>
          <span class="${isCollapsed ? 'hidden' : 'block'}">Settings</span>
        </a>
        <button id="logout-btn" 
                class="flex items-center py-2.5 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 w-full transition-colors group ${isCollapsed ? 'justify-center px-0' : 'px-4'}"
                title="${isCollapsed ? 'Logout' : ''}">
          <i data-lucide="log-out" class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 ${isCollapsed ? '' : 'mr-3'}"></i>
          <span class="${isCollapsed ? 'hidden' : 'block'}">Logout</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Mobile Drawer Overlay -->
  <div id="mobile-drawer" class="lg:hidden fixed inset-0 z-50 hidden">
    <div id="mobile-drawer-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
    <div class="relative flex-1 flex flex-col max-w-xs w-full bg-neutral-900 text-white h-full shadow-2xl p-6">
      <div class="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
        <div class="flex items-center space-x-3">
          <div class="bg-primary w-10 h-10 flex items-center justify-center rounded-xl font-bold text-white shadow-md">K</div>
          <span class="text-2xl font-bold text-white tracking-tight">KisanMitra</span>
        </div>
        <button id="mobile-drawer-close" class="p-2 text-neutral-400 hover:text-white rounded-lg">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
      </div>
      <nav class="space-y-2 flex-1 overflow-y-auto">
        ${navItems.map(item => `
          <a href="${item.path}" class="flex items-center py-3 px-4 rounded-xl text-sm font-medium transition-colors ${item.id === currentPage ? 'bg-primary text-white font-bold' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}">
            <i data-lucide="${item.icon}" class="w-5 h-5 mr-3"></i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
      <div class="pt-6 border-t border-white/10">
        <button id="mobile-logout-btn" class="flex items-center py-2.5 px-4 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 w-full">
          <i data-lucide="log-out" class="w-4 h-4 mr-3"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
  `;

  // 2. Render Topbar HTML
  const topbarHTML = `
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 h-16 flex items-center justify-between px-4 sm:px-8 transition-all duration-300">
    <div class="flex items-center gap-3">
      <button id="mobile-menu-toggle" class="lg:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors">
        <i data-lucide="menu" class="w-5 h-5"></i>
      </button>
      <h1 class="text-xl font-extrabold text-neutral-900 tracking-tight">${title}</h1>
    </div>
    <div class="flex items-center gap-4">
      <div class="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Live Network</span>
      </div>
      <button class="relative p-2 text-neutral-500 hover:text-primary rounded-xl hover:bg-primary/5 transition-colors" title="Notifications">
        <i data-lucide="bell" class="w-5 h-5"></i>
        <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
      </button>
      <div class="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold flex items-center justify-center shadow-sm overflow-hidden ring-2 ring-primary/20">
        <span id="topbar-initial">U</span>
      </div>
    </div>
  </header>
  `;

  // Inject into DOM
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.insertAdjacentHTML('afterbegin', topbarHTML);
    // Adjust margin based on collapsed state
    if (isCollapsed) {
      mainContent.classList.remove('lg:ml-72');
      mainContent.classList.add('lg:ml-20');
    } else {
      mainContent.classList.remove('lg:ml-20');
      mainContent.classList.add('lg:ml-72');
    }
  }

  // 3. Sidebar toggle interaction
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isCollapsed = !isCollapsed;
      localStorage.setItem('kisanmitra_sidebar_collapsed', isCollapsed);
      window.location.reload();
    });
  }

  // 4. Mobile Drawer toggles
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileClose = document.getElementById('mobile-drawer-close');
  const mobileBackdrop = document.getElementById('mobile-drawer-backdrop');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => mobileDrawer.classList.remove('hidden'));
    if (mobileClose) mobileClose.addEventListener('click', () => mobileDrawer.classList.add('hidden'));
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', () => mobileDrawer.classList.add('hidden'));
  }

  // 5. Update Cart Badge for Buyer
  if (role === 'buyer') {
    function updateCartCount() {
      try {
        const cart = JSON.parse(localStorage.getItem('kisanmitra_cart') || '{"items":[]}');
        const count = (cart.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
        const dot = document.getElementById('sidebar-cart-dot');
        const badge = document.getElementById('sidebar-cart-badge');
        if (count > 0) {
          if (dot) dot.classList.remove('hidden');
          if (badge) {
            badge.textContent = count;
            badge.classList.remove('hidden');
          }
        } else {
          if (dot) dot.classList.add('hidden');
          if (badge) badge.classList.add('hidden');
        }
      } catch(e) {}
    }
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
  }

  // 6. Firebase Auth & Role Guard
  function attachLogout(btn) {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      try {
        if (window.FM && window.FM.auth) {
          await window.FM.auth.signOut();
        }
        window.location.href = '../login.html';
      } catch(e) {
        window.location.href = '../login.html';
      }
    });
  }
  attachLogout(document.getElementById('logout-btn'));
  attachLogout(document.getElementById('mobile-logout-btn'));

  if (window.FM && window.FM.auth) {
    window.FM.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = '../login.html';
        return;
      }

      // Check role in Firestore
      try {
        const doc = await window.FM.db.collection('users').doc(user.uid).get();
        const data = doc.exists ? doc.data() : null;
        const userRole = data?.role || 'farmer';
        const displayName = data?.name || user.displayName || (role === 'admin' ? 'Administrator' : 'User');

        // Admin check
        if (role === 'admin') {
          const isAdmin = user.uid === window.ADMIN_UID || userRole === 'admin';
          if (!isAdmin) {
            alert('Access Denied: You do not have Administrator permissions.');
            window.location.href = '../index.html';
            return;
          }
        }

        // Set user info
        const initial = (displayName.charAt(0) || 'U').toUpperCase();
        const initialEl = document.getElementById('user-initial');
        const topbarInitialEl = document.getElementById('topbar-initial');
        const nameEl = document.getElementById('user-display-name');

        if (initialEl) initialEl.textContent = initial;
        if (topbarInitialEl) topbarInitialEl.textContent = initial;
        if (nameEl) nameEl.textContent = displayName;

        // Custom event for page scripts
        window.currentUser = { uid: user.uid, ...data, email: user.email, displayName };
        document.dispatchEvent(new CustomEvent('user-loaded', { detail: window.currentUser }));

      } catch(err) {
        console.warn('Error loading user profile:', err);
      }
    });
  }

  // Create Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
};
