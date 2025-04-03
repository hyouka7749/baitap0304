var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product');
let categoryModel = require('../schemas/category');

// Route lấy danh sách tất cả danh mục
router.get('/categories', async (req, res) => {
  let categories = await categoryModel.find({});
  res.status(200).send({ success: true, data: categories });
});

// Route lấy tất cả sản phẩm
router.get('/products', async (req, res) => {
  let products = await productModel.find({}).populate("category");
  res.status(200).send({ success: true, data: products });
});

// Route động cho danh mục & sản phẩm
router.get('/:categorySlug/:productSlug?', async (req, res) => {
  try {
    let category = await categoryModel.findOne({ slug: req.params.categorySlug });
    if (!category) return res.status(404).send({ success: false, message: "Category không tồn tại" });

    if (req.params.productSlug) {
      let product = await productModel.findOne({ slug: req.params.productSlug, category: category._id });
      if (!product) return res.status(404).send({ success: false, message: "Product không tồn tại" });

      return res.status(200).send({ success: true, data: product });
    } else {
      let products = await productModel.find({ category: category._id });
      return res.status(200).send({ success: true, data: products });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
