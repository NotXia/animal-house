import { Error } from "/admin/import/Error.js";
import * as DiscountAPI from "../DiscountAPI.js";


export function init() {
    $("#input-discount-start_date").on("change", () => {
        console.log($("#input-discount-start_date").val())
        $("#input-discount-end_date").attr("min", $("#input-discount-start_date").val());
    });

    $("#input-discount-end_date").on("change", () => {
        console.log($("#input-discount-end_date").val())
        $("#input-discount-start_date").attr("max", $("#input-discount-end_date").val());
    });
}


export async function renderDiscountsOf(barcode) {
    const discounts = await DiscountAPI.getProductDiscounts(barcode);
    $("#table-discount").html("");

    // Nessuno sconto
    if (discounts.length === 0) {
        return $("#container-table-discount").after(`
            <p class="text-center w-100">Nessuno sconto programmato</p>
        `);
    }

    discounts.sort((d1, d2) => moment(d1.start_date).diff(moment(d2.start_date)));

    for (const discount of discounts) {
        $("#table-discount").append(`
            <tr>
                <td>${moment(discount.start_date).format("DD/MM/YYYY")}</td>
                <td>${discount.end_date ? moment(discount.end_date).format("DD/MM/YYYY") : "-"}</td>
                <td>${discount.discount}%</td>
                <td><button id="button-delete-discount-${discount.id}" class="btn btn-outline-danger btn-sm">Cancella</button></td>
            </tr>
        `);

        $(`#button-delete-discount-${discount.id}`).on("click", async function() {
            await DiscountAPI.deleteDiscount(discount.id);
            renderDiscountsOf(barcode);
        });
    }
}

export async function addDiscountTo(barcode) {
    const discount = {
        start_date: `${$("#input-discount-start_date").val()}T00:00:00.000Z`,
        end_date: `${$("#input-discount-end_date").val()}T23:59:59.999Z`,
        discount: $("#input-discount-amount").val()
    }

    await DiscountAPI.addDiscountToProduct(barcode, discount);
    $("#form-discount").trigger("reset");
    renderDiscountsOf(barcode);
}