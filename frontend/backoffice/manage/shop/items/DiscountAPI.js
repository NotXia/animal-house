import { api_request } from "/js/auth.js";

export async function getProductDiscounts(barcode) {
    return await api_request({ 
        type: "GET", url: `/shop/products/${encodeURIComponent(barcode)}/discounts/`
    });
}

export async function addDiscountToProduct(barcode, discount) {
    return await api_request({ 
        type: "POST", url: `/shop/products/${encodeURIComponent(barcode)}/discounts/`,
        data: discount
    });
}

export async function deleteDiscount(discount_id) {
    return await api_request({ 
        type: "DELETE", url: `/shop/products/discounts/${encodeURIComponent(discount_id)}`
    });
}