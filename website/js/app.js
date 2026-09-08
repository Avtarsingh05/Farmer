// ==========================================================================
// Core Utilities
// ==========================================================================
window.formatCurrency = (n) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(n);
};

window.formatDate = (d) => {
    if (!d) return '';
    const date = d.toDate ? d.toDate() : new Date(d);
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

window.generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

window.cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

window.debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

window.throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

window.handleImageError = (img) => {
    img.onerror = null;
    img.src = '/assets/placeholder-image.png'; // Make sure this placeholder exists or use a base64 inline string
};

// ==========================================================================
// Toast System
// ==========================================================================
window.toast = ({ type = 'info', message, duration = 3000 }) => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    
    const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'i'
    };

    toastEl.innerHTML = `
        <div style="font-weight:bold; font-size: 1.2rem;">${iconMap[type]}</div>
        <div>${message}</div>
    `;

    container.appendChild(toastEl);

    setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(100%)';
        toastEl.style.transition = 'all 0.3s ease';
        setTimeout(() => toastEl.remove(), 300);
    }, duration);
};

// ==========================================================================
// Modal System
// ==========================================================================
window.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

// Attach global close handlers
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
    if (e.target.closest('.close-modal')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
    }
});

// ==========================================================================
// Cart System
// ==========================================================================
window.Cart = {
    items: [],
    
    init() {
        try {
            const stored = localStorage.getItem('kisanmitra_cart');
            if (stored) {
                this.items = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to load cart", e);
            this.items = [];
        }
        this.triggerUpdate();
    },

    save() {
        localStorage.setItem('kisanmitra_cart', JSON.stringify(this.items));
        this.triggerUpdate();
    },

    addItem(product, quantity = 1) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
        this.save();
        window.toast({ type: 'success', message: 'Added to cart' });
    },

    removeItem(productId) {
        this.items = this.items.filter(i => i.id !== productId);
        this.save();
    },

    updateQty(productId, quantity) {
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }
        const item = this.items.find(i => i.id === productId);
        if (item) {
            item.quantity = quantity;
            this.save();
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },
    
    triggerUpdate() {
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: this.items }));
        // Update cart badge if exists
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = this.getCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    }
};

window.Cart.init();

// ==========================================================================
// Auth State Manager
// ==========================================================================
window.currentUser = null;

if (window.FM && window.FM.auth) {
    window.FM.auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Fetch extra user details (role) from Firestore
                const doc = await window.FM.db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    window.currentUser = { ...user, ...doc.data() };
                } else {
                    window.currentUser = user;
                    // Default fallback
                    window.currentUser.role = 'buyer'; 
                }
            } catch (error) {
                console.error("Error fetching user role", error);
                window.currentUser = user;
                window.currentUser.role = 'buyer';
            }
        } else {
            window.currentUser = null;
        }
        
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: window.currentUser }));
        
        // Re-evaluate routes after auth change
        window.Router.handleRoute();
    });
}

// ==========================================================================
// Router (Hash-based SPA)
// ==========================================================================
window.Router = {
    routes: {},
    currentRoute: null,

    on(path, callback) {
        this.routes[path] = callback;
    },

    navigate(path) {
        window.location.hash = path;
    },

    async handleRoute() {
        let path = window.location.hash.slice(1) || '/';
        
        // Example Route Guards
        const requireAuthRoutes = ['/dashboard', '/cart', '/checkout'];
        const isAuthRequired = requireAuthRoutes.some(r => path.startsWith(r));
        
        // Wait for auth to initialize if it's still pending
        // Simple heuristic: if auth is not checked yet, it might need to wait.
        // Assuming onAuthStateChanged has run at least once if window.currentUser is defined or null explicitly.
        // In a real robust app, you'd have an auth state 'loading' flag.
        
        if (isAuthRequired && window.currentUser === null) {
            console.log("Auth required, redirecting to login");
            this.navigate('/login');
            return;
        }

        // Example Role Guard
        if (path.startsWith('/admin') && (!window.currentUser || window.currentUser.role !== 'admin')) {
            window.toast({type: 'error', message: 'Unauthorized access'});
            this.navigate('/');
            return;
        }

        if (path.startsWith('/farmer') && (!window.currentUser || window.currentUser.role !== 'farmer')) {
            window.toast({type: 'error', message: 'Farmer account required'});
            this.navigate('/');
            return;
        }

        const routeHandler = this.routes[path] || this.routes['*'];
        if (routeHandler) {
            this.currentRoute = path;
            this.updateNavLinks();
            await routeHandler();
        } else {
            const app = document.getElementById('app');
            if(app) app.innerHTML = `<h2>404 - Page Not Found</h2>`;
        }
    },

    updateNavLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${this.currentRoute}`) {
                link.classList.add('active');
            }
        });
    }
};

window.addEventListener('hashchange', () => window.Router.handleRoute());

// Initialize page load
document.addEventListener('DOMContentLoaded', () => {
    // Basic setup if no routes defined yet
    setTimeout(() => {
        window.Router.handleRoute();
    }, 100); // small delay to allow other scripts to register routes
});
