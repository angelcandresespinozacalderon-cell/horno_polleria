// Product data and application state
let allProducts = [];
let filteredProducts = [];
let currentFilter = 'all';

// DOM elements
const productsGrid = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const noResultsElement = document.getElementById('no-results');
const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');
const contactForm = document.getElementById('contact-form');
const productSelect = document.getElementById('product');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const successMessage = document.getElementById('success-message');

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_xxxxxx'; // User needs to configure
const EMAILJS_TEMPLATE_ID = 'template_xxxxxx'; // User needs to configure
const EMAILJS_PUBLIC_KEY = 'xxxxxx'; // User needs to configure

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    setupSmoothScrolling();
});

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderProducts();
        populateProductSelect();
    } catch (error) {
        console.error('Error loading products:', error);
        showErrorState();
    }
}

// Populate product select dropdown
function populateProductSelect() {
    if (!productSelect) return;
    
    // Clear existing options except the first one
    productSelect.innerHTML = '<option value="">Seleccionar producto...</option>';
    
    // Add products to select
    allProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name;
        option.textContent = product.name;
        productSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilter);
    });
    
    // Modal events
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
    }
    
    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Mobile navigation
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && hamburger) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const templateParams = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        phone: formData.get('phone') || 'No proporcionado',
        product: formData.get('product') || 'No especificado',
        message: formData.get('message'),
        to_name: 'Hornos Eche',
        to_email: 'yovani.pao@gmail.com'
    };
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Send email using EmailJS
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        
        // Show success message
        showSuccessMessage('¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.');
        
        // Reset form
        contactForm.reset();
        
    } catch (error) {
        console.error('Error sending email:', error);
        showErrorMessage('Error al enviar el mensaje. Por favor, inténtalo de nuevo o contacta por WhatsApp.');
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Show success message
function showSuccessMessage(message) {
    if (successMessage) {
        const messageText = successMessage.querySelector('span');
        if (messageText) {
            messageText.textContent = message;
        }
        successMessage.style.display = 'flex';
        successMessage.style.opacity = '1';
        
        setTimeout(() => {
            successMessage.style.opacity = '0';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 300);
        }, 3000);
    }
}

// Show error message
function showErrorMessage(message) {
    alert(message); // Simple alert for now
}

// Handle search functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        filteredProducts = allProducts.filter(product => 
            currentFilter === 'all' || product.category === currentFilter
        );
    } else {
        filteredProducts = allProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(query) ||
                                product.brand.toLowerCase().includes(query) ||
                                product.features.some(feature => feature.toLowerCase().includes(query));
            
            const matchesFilter = currentFilter === 'all' || product.category === currentFilter;
            
            return matchesSearch && matchesFilter;
        });
    }
    
    renderProducts();
}

// Handle filter functionality
function handleFilter(e) {
    const filter = e.target.getAttribute('data-filter');
    currentFilter = filter;
    
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Apply filter
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    if (query === '') {
        filteredProducts = allProducts.filter(product => 
            filter === 'all' || product.category === filter
        );
    } else {
        filteredProducts = allProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(query) ||
                                product.brand.toLowerCase().includes(query) ||
                                product.features.some(feature => feature.toLowerCase().includes(query));
            
            const matchesFilter = filter === 'all' || product.category === filter;
            
            return matchesSearch && matchesFilter;
        });
    }
    
    renderProducts();
}

// Render products
function renderProducts() {
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '';
        if (noResultsElement) {
            noResultsElement.style.display = 'block';
        }
        return;
    }
    
    if (noResultsElement) {
        noResultsElement.style.display = 'none';
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:200px;background:#f5f5f5;color:#999\\'><i class=\\'fas fa-image fa-2x\\'></i></div>';" />
                <div class="product-overlay">
                    <button class="btn btn-primary">Ver Detalles</button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <p class="product-price">$${product.price.toLocaleString()}</p>
                <div class="product-features">
                    ${product.features.slice(0, 2).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Open product modal
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product || !modal || !modalBody) return;
    
    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:300px;background:#f5f5f5;color:#999\\'><i class=\\'fas fa-image fa-3x\\'></i></div>';" />
            </div>
            <div class="modal-product-info">
                <h2>${product.name}</h2>
                <p class="modal-brand">${product.brand}</p>
                <p class="modal-price">$${product.price.toLocaleString()}</p>
                
                <div class="modal-features">
                    <h3>Características:</h3>
                    <ul>
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="modal-specifications">
                    <h3>Especificaciones:</h3>
                    <div class="spec-grid">
                        <div class="spec-item">
                            <span class="spec-label">Capacidad:</span>
                            <span class="spec-value">${product.specifications.capacity}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Potencia:</span>
                            <span class="spec-value">${product.specifications.power}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Dimensiones:</span>
                            <span class="spec-value">${product.specifications.dimensions}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Garantía:</span>
                            <span class="spec-value">${product.specifications.warranty}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-whatsapp" onclick="contactWhatsApp('${product.name}')">
                        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// WhatsApp contact functions
function contactWhatsApp(productName) {
    const message = `Hola, me interesa el ${productName}. ¿Podrías darme más información?`;
    const whatsappUrl = `https://wa.me/34900123456?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function contactWhatsAppGeneral() {
    const message = "Hola, me gustaría obtener información sobre sus hornos. ¡Gracias!";
    const whatsappUrl = `https://wa.me/34900123456?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Mobile navigation functions
function toggleMobileMenu() {
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

function closeMobileMenu() {
    if (navMenu) {
        navMenu.classList.remove('active');
    }
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Show error state when products fail to load
function showErrorState() {
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los productos. Por favor, recarga la página.</p>
            </div>
        `;
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
