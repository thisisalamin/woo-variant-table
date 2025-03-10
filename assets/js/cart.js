jQuery(document).ready(function($) {
    // Handle Add to Cart
    $(document).on('click', '.add-to-cart', function(e) {
        e.preventDefault();
        const button = $(this);
        const buttonContainer = button.parent();
        const productId = button.data('id');
        const quantity = button.closest('tr').find('input[type="number"]').val() || 1;

        button.prop('disabled', true).text('ADDING...');

        $.ajax({
            url: wcCart.ajaxUrl,
            type: 'POST',
            data: {
                action: 'add_to_cart',
                product_id: productId,
                quantity: quantity,
                nonce: wcCart.nonce
            },
            success: function(response) {
                if (response.success) {
                    updateCartDisplay(response.data);
                    openCart();
                    
                    buttonContainer.html(`
                        <button class="add-to-cart bg-black text-white px-4 py-2 text-sm hover:bg-black/80 transition-colors mb-2 w-full font-bold" data-id="${productId}">
                            ADD MORE
                        </button>
                        <div class="added-status bg-green-500 text-white px-4 py-2 text-sm text-center w-full mb-2 font-bold">
                            ADDED
                        </div>
                    `);
                }
            },
            complete: function() {
                if (!buttonContainer.find('.added-status').length) {
                    button.prop('disabled', false).text('ADD TO CART');
                }
            }
        });
    });

    // Toggle Cart Slide
    $('#close-cart, #cart-overlay').on('click', function() {
        closeCart();
    });

    // Update Cart Display
    function updateCartDisplay(data) {
        $('#cart-count').text(data.count);
        $('#cart-subtotal').text(data.subtotal);
        $('#cart-total').text(data.total);

        const cartItems = $('#cart-items');
        cartItems.empty();

        data.items.forEach(item => {
            cartItems.append(`
                <div class="flex items-center space-x-4 cart-item" data-key="${item.key}">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover">
                    <div class="flex-1">
                        <h4 class="font-medium">${item.name}</h4>
                        ${item.variation ? `<p class="text-sm text-gray-500">${item.variation}</p>` : ''}
                        <div class="flex items-center mt-2">
                            <input type="number" 
                                   value="${item.quantity}" 
                                   min="1" 
                                   class="w-16 p-1 border rounded cart-qty-input text-center">
                            <span class="ml-4">${item.price}</span>
                        </div>
                    </div>
                    <button class="remove-item text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `);
        });
    }

    // Open Cart
    function openCart() {
        $('#slide-cart').addClass('active');
        $('#cart-overlay').addClass('active');
        $('body').css('overflow', 'hidden');
    }

    // Close Cart
    function closeCart() {
        $('#slide-cart').removeClass('active');
        $('#cart-overlay').removeClass('active');
        $('body').css('overflow', '');
    }

    // Handle quantity updates
    $(document).on('change', '.cart-qty-input', function() {
        const input = $(this);
        const cartItem = input.closest('.cart-item');
        const cartKey = cartItem.data('key');
        const quantity = input.val();

        $.ajax({
            url: wcCart.ajaxUrl,
            type: 'POST',
            data: {
                action: 'update_cart',
                cart_key: cartKey,
                quantity: quantity,
                nonce: wcCart.nonce
            },
            success: function(response) {
                if (response.success) {
                    $('#cart-count').text(response.data.count);
                    $('#cart-subtotal').text(response.data.subtotal);
                    $('#cart-total').text(response.data.total);
                }
            }
        });
    });

    // Handle remove item
    $(document).on('click', '.remove-item', function() {
        const cartItem = $(this).closest('.cart-item');
        const cartKey = cartItem.data('key');

        $.ajax({
            url: wcCart.ajaxUrl,
            type: 'POST',
            data: {
                action: 'remove_from_cart',
                cart_key: cartKey,
                nonce: wcCart.nonce
            },
            success: function(response) {
                if (response.success) {
                    cartItem.remove();
                    $('#cart-count').text(response.data.count);
                    $('#cart-subtotal').text(response.data.subtotal);
                    $('#cart-total').text(response.data.total);
                }
            }
        });
    });
});
