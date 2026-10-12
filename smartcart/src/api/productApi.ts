import axios from "axios";
import type { Product } from "../types/product";

const API_URL = "http://localhost:8081/api/products";

export const getProducts = async (): Promise<Product[]> => {
    const response = await axios.get<Product[]>(API_URL);
    return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
    const response = await axios.get<Product>(
        `${API_URL}/${id}`
    );
    return response.data;
};

export const addProduct = async (
    product: Omit<Product, "productId">
): Promise<Product> => {
    const response = await axios.post<Product>(
        API_URL,
        product
    );
    return response.data;
};

export const updateProduct = async (
    id: number,
    product: Omit<Product, "productId">
): Promise<Product> => {
    const response = await axios.put<Product>(
        `${API_URL}/${id}`,
        product
    );
    return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};