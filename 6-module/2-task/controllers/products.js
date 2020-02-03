const mongoose = require('mongoose');
const Product = require('../models/Product');


module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const subcategoryId = ctx.request.query.subcategory;
  const isValid = mongoose.Types.ObjectId.isValid(subcategoryId);
  if (!isValid) {
    ctx.throw(400, 'invalid id');
    return;
  }

  const query = Product.find({subcategory: subcategoryId});
  const rawProducts = await query.exec();

  if (!rawProducts) {
    ctx.throw(404);
    return;
  }

  const products = rawProducts.map((rawProduct) => {
    return {
      id: rawProduct._id,
      images: rawProduct.images,
      title: rawProduct.title,
      description: rawProduct.description,
      price: rawProduct.price,
      category: rawProduct.category,
      subcategory: rawProduct.subcategory,

    };
  });
  ctx.body = {products: products};
  await next();
};

module.exports.productList = async function productList(ctx, next) {
  // ctx.body = {products: []};
};

module.exports.productById = async function productById(ctx, next) {
  const productId = ctx.params.id;
  const isValid = mongoose.Types.ObjectId.isValid(productId);
  if (!isValid) {
    ctx.throw(400, 'invalid id');
    return;
  }
  const query = Product.findById(productId);
  const rawProduct = await query.exec();

  if (!rawProduct) {
    ctx.throw(404);
    return;
  }

  ctx.body = {product: {
    id: rawProduct._id,
    title: rawProduct.title,
    images: rawProduct.images,
    category: rawProduct.category,
    subcategory: rawProduct.subcategory,
    price: rawProduct.price,
    description: rawProduct.description,
  }};
};

