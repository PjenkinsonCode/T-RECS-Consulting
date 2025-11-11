// Cart Management System
// This file handles all cart functionality across the website

// Initialize cart from localStorage or create empty array
function getCart() {
    const cartData = localStorage.getItem('trecsCart');
    return cartData ? JSON.parse(cartData) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('trecsCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(serviceName, category) {
    let cart = getCart();
    
    // Check if item already exists
    const existingItem = cart.find(item => item.name === serviceName);
    
    if (existingItem) {
        // Item already in cart - remove it (toggle functionality)
        removeFromCart(existingItem.id);
        return;
    }
    
    // Add new item
    cart.push({
        name: serviceName,
        category: category,
        id: Date.now() // unique identifier
    });
    
    saveCart(cart);
    updateCartUI();
    showToast('Service added to cart!', 'success');
}

// Remove item from cart
function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    updateCartUI();
    renderCartDropdown();
    showToast('Service removed from cart', 'info');
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear all services from your cart?')) {
        localStorage.removeItem('trecsCart');
        updateCartUI();
        renderCartDropdown();
        showToast('Cart cleared', 'info');
    }
}

// Update cart UI elements (count badge, button states)
function updateCartUI() {
    const cart = getCart();
    const cartCount = document.getElementById('cartCount');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
        if (cart.length > 0) {
            cartCount.classList.add('show');
        } else {
            cartCount.classList.remove('show');
        }
    }
    
    // Update "Add to Cart" button states
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        if (!onclickAttr) return;
        
        const match = onclickAttr.match(/'([^']+)'/);
        if (!match) return;
        
        const serviceName = match[1];
        const isInCart = cart.some(item => item.name === serviceName);
        
        if (isInCart) {
            button.classList.add('in-cart');
            button.innerHTML = '<i class="fas fa-check"></i> In Cart';
        } else {
            button.classList.remove('in-cart');
            button.innerHTML = '<i class="fas fa-plus"></i> Add to Cart';
        }
    });
    
    // Update selected services on contact page if function exists
    if (typeof displaySelectedServices === 'function') {
        displaySelectedServices();
    }
}

// Render cart dropdown
function renderCartDropdown() {
    const cart = getCart();
    const cartDropdown = document.getElementById('cartDropdown');
    
    if (!cartDropdown) return;
    
    if (cart.length === 0) {
        cartDropdown.innerHTML = `
            <div class="cart-dropdown-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="services.html" class="browse-services-btn">Browse Services</a>
            </div>
        `;
        return;
    }
    
    const cartItemsHTML = cart.map(item => `
        <div class="cart-dropdown-item">
            <div class="cart-dropdown-item-info">
                <h4>${item.name}</h4>
                <div class="cart-dropdown-item-category">${item.category}</div>
            </div>
            <button class="cart-dropdown-remove" onclick="event.stopPropagation(); removeFromCart(${item.id})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    cartDropdown.innerHTML = `
        ${cartItemsHTML}
        <div class="cart-dropdown-footer">
            <button class="cart-dropdown-clear" onclick="event.stopPropagation(); clearCart()">Clear All</button>
            <a href="contact.html" class="cart-dropdown-checkout">Proceed to Contact</a>
        </div>
    `;
}

// Toggle cart dropdown
function toggleCartDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    
    const dropdown = document.getElementById('cartDropdown');
    if (!dropdown) return;
    
    const isVisible = dropdown.classList.contains('show');
    
    if (isVisible) {
        dropdown.classList.remove('show');
    } else {
        renderCartDropdown();
        dropdown.classList.add('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const cartWrapper = document.querySelector('.cart-icon-wrapper');
    const dropdown = document.getElementById('cartDropdown');
    
    if (!cartWrapper || !dropdown) return;
    
    // Don't close if clicking inside the dropdown
    if (dropdown.contains(event.target)) {
        return;
    }
    
    if (!cartWrapper.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Add animation styles to document
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export functions for use in HTML onclick attributes
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.toggleCartDropdown = toggleCartDropdown;
window.updateCartUI = updateCartUI;
window.getCart = getCart;
window.renderCartDropdown = renderCartDropdown;