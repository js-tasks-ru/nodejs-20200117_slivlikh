const product = require('../models/Product');


module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const searchQuery = ctx.request.query.query;
  const mongoQuery = product.find( {$text: {$search: searchQuery}} );
  const rawProducts = await mongoQuery.exec();
  const products = rawProducts.map((rawProduct) => {
    return {
      id: rawProduct._id,
      title: rawProduct.title,
      images: rawProduct.images,
      category: rawProduct.category,
      subcategory: rawProduct.subcategory,
      price: rawProduct.price,
      description: rawProduct.description
    };
  });

  ctx.body = {products};
};
