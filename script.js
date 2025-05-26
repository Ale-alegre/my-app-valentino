document.addEventListener('DOMContentLoaded', () => {
    // Contenedores para cada categoría de menú
    const comidaItemsContainer = document.getElementById('comida-items-container');
    const bebidasItemsContainer = document.getElementById('bebidas-items-container');
    const pizzasItemsContainer = document.getElementById('pizzas-items-container');

    // Elementos del carrito
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const emptyCartMessage = document.querySelector('.empty-cart-message'); // Solo el primero, que está en el carrito

    // Contenedor principal del menú para delegación de eventos
    const menuSection = document.getElementById('menu-section');

    // Número de WhatsApp (IMPORTANTE: Reemplazar con tu número real)
    const whatsappNumber = "3533402144"; 

    let cart = []; // Array para almacenar los ítems del carrito: { id, name, price, quantity, image, category }

    // Datos de ejemplo del menú (puedes obtenerlos de un backend en una app real)
    const menuData = [
        // Comida
        { id: 1, name: "Hamburguesa Clásica", price: 15.50, imagen: "hamburguesa.jpg", category: "comida" },
        { id: 2, name: "Papas Fritas Grandes", price: 8.00, image: "papas.jpg", category: "comida" },
        { id: 3, name: "Combo Doble Queso", price: 25.00, image: "hamburguesa_doble.jpg", category: "comida" }, // Asumir otra imagen
        { id: 4, name: "Nuggets (x6)", price: 10.50, image: "nuggets.jpg", category: "comida" },
        { id: 5, name: "Alitas BBQ (x8)", price: 18.00, image: "alitas_bbq.jpg", category: "comida" },

        // Bebidas
        { id: 6, name: "Gaseosa Personal", price: 5.00, image: "gaseosa_personal.jpg", category: "bebida" },
        { id: 7, name: "Agua Mineral", price: 3.50, image: "agua_mineral.jpg", category: "bebida" },
        { id: 8, name: "Jugo de Naranja Natural", price: 7.00, image: "jugo_naranja.jpg", category: "bebida" },
        { id: 9, name: "Limonada Frozen", price: 9.00, image: "limonada_frozen.jpg", category: "bebida" },

        // Pizzas
        { id: 10, name: "Pizza Pepperoni Individual", price: 20.00, image: "pizza_pepperoni.jpg", category: "pizza" },
        { id: 11, name: "Pizza Hawaiana Familiar", price: 38.50, image: "pizza_hawaiana.jpg", category: "pizza" },
        { id: 12, name: "Pizza Vegetariana Mediana", price: 27.00, image: "pizza_vegetariana.jpg", category: "pizza" },
        { id: 13, name: "Pizza Americana Clásica", price: 35.00, image: "pizza_americana.jpg", category: "pizza" }
    ];

    // --- RENDERIZAR MENÚ POR CATEGORÍAS ---
    function renderMenuItems() {
        // Limpiar contenedores y quitar mensajes de "cargando"
        [comidaItemsContainer, bebidasItemsContainer, pizzasItemsContainer].forEach(container => {
            if (container) container.innerHTML = '';
        });

        menuData.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.classList.add('menu-item');
            menuItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.png'; this.alt='Imagen no disponible';">
                <h3>${item.name}</h3>
                <p class="price">S/${item.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${item.id}">Agregar</button>
            `;

            let targetContainer;
            switch (item.category) {
                case "comida": targetContainer = comidaItemsContainer; break;
                case "bebida": targetContainer = bebidasItemsContainer; break;
                case "pizza":  targetContainer = pizzasItemsContainer; break;
                default:
                    console.warn(`Categoría desconocida para el ítem: ${item.name}`);
                    return; // No agregar si la categoría no es válida
            }
            if (targetContainer) {
                targetContainer.appendChild(menuItemElement);
            }
        });

        // Ocultar mensajes de "cargando" si los contenedores se llenaron
        document.querySelectorAll('.loading-message').forEach(msg => msg.style.display = 'none');
    }

    // --- MANEJO DEL CARRITO ---
    function addToCart(itemId) {
        const itemToAdd = menuData.find(item => item.id === parseInt(itemId));
        if (!itemToAdd) {
            console.error("Ítem no encontrado:", itemId);
            return;
        }

        const existingItem = cart.find(item => item.id === itemToAdd.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...itemToAdd, quantity: 1 });
        }
        updateCart();
    }

    function updateQuantity(itemId, change) {
        const itemInCart = cart.find(item => item.id === parseInt(itemId));
        if (itemInCart) {
            itemInCart.quantity += change;
            if (itemInCart.quantity <= 0) {
                removeFromCart(itemId); // Llama a removeFromCart que ya actualiza el carrito
            } else {
                updateCart(); // Actualiza solo si la cantidad es > 0
            }
        }
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== parseInt(itemId));
        updateCart();
    }

    function updateCart() {
        if (!cartItemsContainer) return; // Seguridad
        cartItemsContainer.innerHTML = ''; // Limpiar
        let total = 0;

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (checkoutButton) checkoutButton.disabled = true;
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
            if (checkoutButton) checkoutButton.disabled = false;

            cart.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                const itemSubtotal = item.price * item.quantity;
                cartItemElement.innerHTML = `
                    <div class="cart-item-details">
                        <p><strong>${item.name}</strong></p>
                        <p>${item.quantity} x S/${item.price.toFixed(2)} = S/${itemSubtotal.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn increase-qty" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                        <button class="quantity-btn decrease-qty" data-id="${item.id}" aria-label="Disminuir cantidad">-</button>
                        <button class="remove-from-cart-btn" data-id="${item.id}" aria-label="Quitar del carrito">Quitar</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
                total += itemSubtotal;
            });
        }
        if (cartTotalElement) cartTotalElement.textContent = `S/${total.toFixed(2)}`;
    }

    // --- EVENT LISTENERS ---
    // Delegación de eventos en la sección del menú para los botones "Agregar"
    if (menuSection) {
        menuSection.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-btn')) {
                const itemId = event.target.dataset.id;
                addToCart(itemId);
            }
        });
    }

    // Delegación de eventos en el contenedor de ítems del carrito
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;
            const itemId = target.dataset.id;

            if (!itemId) return; // Si no hay data-id, no hacer nada

            if (target.classList.contains('remove-from-cart-btn')) {
                removeFromCart(itemId);
            } else if (target.classList.contains('increase-qty')) {
                updateQuantity(itemId, 1);
            } else if (target.classList.contains('decrease-qty')) {
                updateQuantity(itemId, -1);
            }
        });
    }

   // Event listener para el botón de checkout
    
     if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Tu carrito está vacío. Agrega productos antes de realizar el pedido.");
                return;
            }

            let message = "Hola 👋, quisiera realizar el siguiente pedido:\n\n";
            let totalPedido = 0;

            // Opcional: Agrupar por categoría en el mensaje de WhatsApp
            const categoriesOrder = ["comida", "pizza", "bebida"]; // Define el orden
            const groupedCart = {};

            cart.forEach(item => {
                if (!groupedCart[item.category]) {
                    groupedCart[item.category] = [];
                }
                groupedCart[item.category].push(item);
            });


            categoriesOrder.forEach(categoryKey => {
                if (groupedCart[categoryKey] && groupedCart[categoryKey].length > 0) {
                    let categoryName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
                    if (categoryKey === "comida") categoryName = "Comida Principal";
                    if (categoryKey === "bebida") categoryName = "Bebidas";
                    if (categoryKey === "pizza") categoryName = "Pizzas";

                    message += `*${categoryName}*:\n`;
                    groupedCart[categoryKey].forEach(item => {
                        const subtotal = item.price * item.quantity;
                        message += `  • ${item.name} (x${item.quantity}) - S/${subtotal.toFixed(2)}\n`;
                        totalPedido += subtotal;
                    });
                    message += "\n";
                }
            });


            message += `*Total del Pedido: S/${totalPedido.toFixed(2)}*`;
            message += "\n\nPor favor, confirmar mi pedido y detalles de entrega/pago. ¡Gracias! 😊";

            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://api.whatsapp.com/send?phone=${3533402144}&text=${encodedMessage}`;

            window.open(whatsappURL, '_blank');
        });
    }

    // --- INICIALIZACIÓN ---
    renderMenuItems();
    updateCart(); // Para mostrar el mensaje de carrito vacío y deshabilitar botón inicialmente
});
