import { create } from "zustand";

import type {
    Product
} from "../types/product";

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    cartItems: CartItem[];

    addToCart:
        (product: Product) => void;

    increaseQuantity:
        (productId: number) => void;

    decreaseQuantity:
        (productId: number) => void;

    clearCart:
        () => void;

    getTotal:
        () => number;
}

export const useCartStore =
    create<CartState>((set, get) => ({

        cartItems: [],

        addToCart: product =>
            set(state => {

                const existing =
                    state.cartItems.find(
                        item =>
                            item.product.productId ===
                            product.productId
                    );

                if (existing) {

                    return {
                        cartItems:
                            state.cartItems.map(
                                item =>
                                    item.product.productId ===
                                    product.productId
                                        ? {
                                            ...item,
                                            quantity:
                                                item.quantity + 1
                                        }
                                        : item
                            )
                    };
                }

                return {
                    cartItems: [
                        ...state.cartItems,
                        {
                            product,
                            quantity: 1
                        }
                    ]
                };
            }),

        increaseQuantity: productId =>
            set(state => ({
                cartItems:
                    state.cartItems.map(
                        item =>
                            item.product.productId ===
                            productId
                                ? {
                                    ...item,
                                    quantity:
                                        item.quantity + 1
                                }
                                : item
                    )
            })),

        decreaseQuantity: productId =>
            set(state => ({
                cartItems:
                    state.cartItems
                        .map(item =>
                            item.product.productId ===
                            productId
                                ? {
                                    ...item,
                                    quantity:
                                        item.quantity - 1
                                }
                                : item
                        )
                        .filter(
                            item =>
                                item.quantity > 0
                        )
            })),

        clearCart: () =>
            set({
                cartItems: []
            }),

        getTotal: () =>
            get().cartItems.reduce(
                (total, item) =>
                    total +
                    item.product.price *
                    item.quantity,
                0
            )
    }));