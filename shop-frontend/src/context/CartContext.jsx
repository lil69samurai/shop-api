import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // During initialization, the shopping cart data is read from localStorage; if it is not found, the array is empty.
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // CartItems change, update localStorage synchronously.
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add into cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      const stockLimit = product.stockQuantity ?? product.stock ?? 999999;

      if (existingItem) {
        // If the item is already in your cart, increase the quantity.
        const newQuantity = Math.min(existingItem.quantity + quantity, stockLimit);
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, ...product, quantity: newQuantity } : item
        );
      }
      // If it's not in your cart, add it to your cart.
      return [...prevItems, { ...product, quantity }];
    });
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Update number of product
  const updateQuantity = (productId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
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
        cartItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};