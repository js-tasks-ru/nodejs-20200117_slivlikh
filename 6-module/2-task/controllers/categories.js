const Category = require('../models/Category');


module.exports.categoryList = async function categoryList(ctx, next) {
  const query = Category.find();
  const docs = await query.exec().catch(async (err) => {
    await next(err);
  });

  const result = docs.map((docCategory) => {
    return {
      id: docCategory._id,
      title: docCategory.title,
      subcategories: docCategory.subcategories.map((docSubcategory) => {
        return {
          id: docSubcategory._id,
          title: docSubcategory.title,
        };
      }),
    };
  });
  ctx.body = {categories: result};
  await next();
};

