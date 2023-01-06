const mongoose = require("mongoose");

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

discountSchema.statics.getDiscountForProduct = async function(barcode, is_vip=false) {
    const discount = (await this.findOne({ type: "shop", identifier: barcode, start_date: {"$lte": new Date()} }))?.discount ?? 0;
    let vip_discount = 0;
    if (is_vip) { vip_discount = (await this.findOne({ type: "vip" }))?.discount ?? 0; }

    return Math.max(discount, vip_discount)/100;
};


module.exports = mongoose.model("discount", discountSchema);
