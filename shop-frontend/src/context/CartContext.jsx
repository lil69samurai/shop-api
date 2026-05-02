import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const buildCartItemKey = (productId, variantId) => {
  return `${productId}-${variantId ? variantId : 'base'}`;
};

const ensureCartItemKey = (item) => {
  if (item.cartItemKey) return item;
  const variantId = item.productVariantId || item.variantId || null;
  return {
    ...item,
    productVariantId: variantId,
    cartItemKey: buildCartItemKey(item.id, variantId),
  };
};

export const CartProvider = ({ children }) => {
  // During initialization, the shopping cart data is read from localStorage; if it is not found, the array is empty.
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return [];
    try {
      const parsed = JSON.parse(savedCart);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(ensureCartItemKey);
    } catch (e) {
      return [];
    }
  });

  // CartItems change, update localStorage synchronously.
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add into cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const variantId = product.productVariantId || product.variantId || null;
      const cartItemKey = buildCartItemKey(product.id, variantId);
      const stockLimit = product.stockQuantity ?? product.stock ?? 999999;

      const existingItem = prevItems.find((item) => item.cartItemKey === cartItemKey);

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, stockLimit);
        return prevItems.map((item) =>
          item.cartItemKey === cartItemKey
            ? { ...item, ...product, productVariantId: variantId, cartItemKey, quantity: newQuantity }
            : item
        );
      }

      return [
        ...prevItems,
        { ...product, productVariantId: variantId, cartItemKey, quantity },
      ];
    });
  };

  // Remove product from cart by cartItemKey
  const removeFromCart = (cartItemKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartItemKey !== cartItemKey));
  };

  // Update number of product by cartItemKey
  const updateQuantity = (cartItemKey, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemKey === cartItemKey ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // Empty your shopping cart (use after checkout)
  const clearCart = () => setCartItems([]);

  // Calculate the total amount in your shopping cart
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Calculate the total number of items in the shopping cart
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
