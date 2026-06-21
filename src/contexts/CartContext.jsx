import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import apiClient from '../utils/apiClient';

const CartContext = createContext(null);

const initialState = {
  items: [],
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const variantKey = item.variantKey || 'default';

      const existingIndex = state.items.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.variantKey === variantKey
      );

      if (existingIndex !== -1) {
        const updatedItems = state.items.map((cartItem, index) => {
          if (index === existingIndex) {
            const nextQuantity = cartItem.quantity + quantity;
            return {
              ...cartItem,
              quantity: item.maxQuantity
                ? Math.min(nextQuantity, item.maxQuantity)
                : nextQuantity,
            };
          }
          return cartItem;
        });

        return { ...state, items: updatedItems };
      }

      const newItem = {
        ...item,
        quantity: quantity,
        variantKey,
      };

      return { ...state, items: [...state.items, newItem] };
    }

    case 'REMOVE_ITEM': {
      const { id, variantKey } = action.payload;
      return {
        ...state,
        items: state.items.filter(
          (cartItem) => !(cartItem.id === id && cartItem.variantKey === (variantKey || 'default'))
        ),
      };
    }

    case 'SET_QUANTITY': {
      const { id, variantKey, quantity } = action.payload;
      const nextQuantity = Math.max(quantity, 1);

      const updatedItems = state.items.map((cartItem) => {
        if (cartItem.id === id && cartItem.variantKey === (variantKey || 'default')) {
          return {
            ...cartItem,
            quantity: cartItem.maxQuantity
              ? Math.min(nextQuantity, cartItem.maxQuantity)
              : nextQuantity,
          };
        }
        return cartItem;
      });

      return { ...state, items: updatedItems };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (item, quantity = 1) => {
    if (!item?.id) {
      console.warn('Attempted to add an item without an id to the cart.', item);
      return;
    }

    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
  };

  const removeItem = (id, variantKey) => {
    if (!id) return;
    dispatch({ type: 'REMOVE_ITEM', payload: { id, variantKey } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const setItemQuantity = (id, quantity, variantKey) => {
    if (!id) return;
    dispatch({ type: 'SET_QUANTITY', payload: { id, variantKey, quantity } });
  };

  const cartCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items]
  );

  const cartTotal = useMemo(
    () =>
      state.items.reduce((total, item) => {
        const price = Number(item.price) || 0;
        return total + price * item.quantity;
      }, 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      items: state.items,
      cartCount,
      cartTotal,
      addItem,
      removeItem,
      clearCart,
      setItemQuantity,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [state.items, cartCount, cartTotal, isCartOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};



