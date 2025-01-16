// Cart Management
let cart = [];
let totalAmount = 0;

// Load cart data from localStorage when the page loads
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    const savedTotal = localStorage.getItem('totalAmount');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
        totalAmount = parseFloat(savedTotal) || 0;
    } else {
        cart = [];
        totalAmount = 0;
    }
    
    updateCartDisplay();
    updateCartCounter();
}

// Function to add a product to the cart
function addToCart(productName, price) {
    // Load the latest cart data before adding new item
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }

    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
    } else {
        cart.push({ 
            name: productName, 
            price: price,
            quantity: 1,
            totalPrice: price
        });
    }
    
    updateTotalAmount();
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCounter();

    // Show modal
    const modal = document.getElementById('modal');
    if (modal) {
        showModal('Success', `${productName} has been added to the cart!`);
    }
}

// Function to update the cart display
function updateCartDisplay() {
    const cartList = document.getElementById('cart-list');
    const totalAmountElement = document.getElementById('total-amount');
    
    if (cartList && totalAmountElement) {
        cartList.innerHTML = ''; // Clear current display
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <span class="item-name">${item.name}</span>
                <div class="quantity-controls">
                    <button class="quantity-button" onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-button" onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
                <span class="item-price">₹${item.totalPrice}</span>
                <button class="remove-item" onclick="removeItem('${item.name}')">Remove</button>
            `;
            cartList.appendChild(cartItem);
        });

        totalAmountElement.textContent = `₹${totalAmount}`;
    }
}

// Function to remove a product from the cart
function removeItem(productName) {
    const itemIndex = cart.findIndex(item => item.name === productName);
    if (itemIndex !== -1) {
        // Subtract the total price of the item (price * quantity)
        totalAmount -= cart[itemIndex].totalPrice;
        cart.splice(itemIndex, 1);
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('totalAmount', totalAmount.toString());
        
        updateCartDisplay();
        updateCartCounter();
    }
}

// Function to proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showModal('Error', 'Your cart is empty. Please add some products before proceeding to checkout.');
        return;
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';

    // Simulate processing delay
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 1000);
}

// Update Checkout Form Validation
if (document.getElementById('checkout-form')) {
    document.getElementById('checkout-form').addEventListener('submit', function (event) {
        event.preventDefault();

        // Validate phone number
        const phone = document.getElementById('phone').value;
        if (!/^\d{10}$/.test(phone)) {
            showModal('Error', 'Please enter a valid 10-digit phone number.');
            return;
        }

        // Validate pincode
        const pincode = document.getElementById('pincode').value;
        if (!/^\d{6}$/.test(pincode)) {
            showModal('Error', 'Please enter a valid 6-digit pincode.');
            return;
        }

        // Clear the cart since order is placed
        cart = [];
        localStorage.removeItem('cart');
        localStorage.removeItem('totalAmount');

        // Redirect to thank you page
        window.location.href = 'thank-you.html';
    });
}

// Auto-fill City and State based on Pincode (Example for India)
document.getElementById('pincode').addEventListener('input', function () {
    const pincode = this.value;
    if (pincode.length === 6) {
        // Example: Auto-fill city and state based on pincode
        const cityField = document.getElementById('city');
        const stateField = document.getElementById('state');

        // Example data for pincode lookup (you can replace this with an API call)
        const pincodeData = {
            '560001': { city: 'Bangalore', state: 'Karnataka' },
            '400001': { city: 'Mumbai', state: 'Maharashtra' },
            '110001': { city: 'New Delhi', state: 'Delhi' },
            '600001': { city: 'Chennai', state: 'Tamil Nadu' },
            '700001': { city: 'Kolkata', state: 'West Bengal' }
        };

        if (pincodeData[pincode]) {
            cityField.value = pincodeData[pincode].city;
            stateField.value = pincodeData[pincode].state;
        } else {
            cityField.value = '';
            stateField.value = '';
        }
    }
});

// Add this function to update cart counter
function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (counter) {
        counter.textContent = cart.length;
    }
}

// Add quantity update function
function updateQuantity(productName, change) {
    const item = cart.find(item => item.name === productName);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0) {
            item.quantity = newQuantity;
            item.totalPrice = item.price * newQuantity;
            updateTotalAmount();
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        } else if (newQuantity === 0) {
            removeItem(productName);
        }
    }
}

// Function to update total amount calculation
function updateTotalAmount() {
    totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    localStorage.setItem('totalAmount', totalAmount.toString());
}

// Add this at the bottom of the file
document.addEventListener('DOMContentLoaded', loadCart);

function clearCart() {
    showModal('Confirm Clear Cart', 'Are you sure you want to clear your cart?', (confirmed) => {
        if (confirmed) {
            cart = [];
            totalAmount = 0;
            localStorage.removeItem('cart');
            localStorage.removeItem('totalAmount');
            updateCartDisplay();
            updateCartCounter();
        }
    }, true);
}

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
            name: user.fullname,
            email: user.email
        }));
        
        showModal('Success', 'Login successful!', () => {
            window.location.href = 'index.html';
        });
    } else {
        showModal('Error', 'Invalid email or password!');
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showModal('Error', 'Passwords do not match!');
        return false;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(user => user.email === email)) {
        showModal('Error', 'Email already registered!');
        return false;
    }
    
    users.push({ fullname, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    showModal('Success', 'Registration successful! Please login.', () => {
        window.location.href = 'login.html';
    });
}

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const nav = document.querySelector('nav ul');
        if (nav) {
            const loginLink = nav.querySelector('a[href="login.html"]').parentElement;
            const signupLink = nav.querySelector('a[href="signup.html"]').parentElement;
            
            // Create welcome element with icon
            loginLink.innerHTML = `<a href="#" onclick="handleLogout()">Logout</a>`;
            signupLink.innerHTML = `
                <div class="user-welcome">
                    <i class="fas fa-user"></i>
                    <span>Hello, ${user.name}</span>
                </div>
            `;
        }
    }
}

// Logout function
function handleLogout() {
    showModal('Confirm Logout', 'Are you sure you want to logout?', (confirmed) => {
        if (confirmed) {
            localStorage.removeItem('currentUser');
            showModal('Success', 'Logged out successfully!', () => {
                window.location.href = 'index.html';
            });
        }
    }, true);
}

// Add this to your existing DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    checkAuth();
});

// Modal Functions
function showModal(title, message, callback = null, showCancel = false) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const cancelBtn = document.getElementById('modal-cancel');
    const okBtn = document.getElementById('modal-ok');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    cancelBtn.style.display = showCancel ? 'block' : 'none';

    modal.style.display = 'block';

    const closeModal = () => {
        modal.style.display = 'none';
    };

    // Close button event
    document.querySelector('.close-modal').onclick = closeModal;

    // OK button event
    okBtn.onclick = () => {
        closeModal();
        if (callback) callback(true);
    };

    // Cancel button event
    cancelBtn.onclick = () => {
        closeModal();
        if (callback) callback(false);
    };

    // Click outside modal to close
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
}