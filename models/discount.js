const mongoose = require("mongoose");
const moment = require("moment");

const discountSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    identifier: { 
        type: String 
    },

    discount: {
        type: Number,
        required: true
    },

    start_date: {
        type: Date, 
    },
    end_date: { 
        type: Date, 
        expires: 0 // In questo modo la data del campo expiration indica la validità
    }
});

discountSchema.methods.getData = function() {
    return {
        id: this._id,
        discount: this.discount,
        start_date: this.start_date,
        end_date: this.end_date
    }
};

discountSchema.statics.getDiscountForProduct = async function(barcode, is_vip=false) {
    // Seleziona lo sconto che inizia più recentemente e con il valore più alto
    const product_discounts = await this.find({ type: "shop", identifier: barcode, start_date: {"$lte": new Date()} });
    product_discounts.sort((d1, d2) => moment(d2.start_date).diff(moment(d1.start_date)) || d2.discount - d1.discount);

    let discount = product_discounts.length > 0 ? product_discounts[0].discount : 0;
    let vip_discount = 0;
    if (is_vip) { vip_discount = (await this.findOne({ type: "vip" }))?.discount ?? 0; }

    return Math.max(discount, vip_discount)/100;
};


module.exports = mongoose.model("discount", discountSchema);
