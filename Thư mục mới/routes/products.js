var express = require('express');
var router = express.Router();
const slugify = require('slugify');
let productModel = require('../schemas/product');
let CategoryModel = require('../schemas/category');

function buildQuery(obj) {
  let result = {};
  if (obj.name) {
      result.name = new RegExp(obj.name, 'i');
  }
  result.price = {};
  if (obj.price) {
      if (obj.price.$gte) {
          result.price.$gte = obj.price.$gte;
      } else {
          result.price.$gte = 0;
      }
      if (obj.price.$lte) {
          result.price.$lte = obj.price.$lte;
      } else {
          result.price.$lte = 10000;
      }
  } else {
      result.price.$gte = 0;
      result.price.$lte = 10000;
  }
  return result;
}

// Lấy danh sách sản phẩm theo query
router.get('/', async function (req, res, next) {
  let products = await productModel.find(buildQuery(req.query)).populate("category");
  res.status(200).send({ success: true, data: products });
});

// Lấy sản phẩm theo `id`
router.get('/:id', async function (req, res, next) {
  try {
    let product = await productModel.findById(req.params.id);
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(404).send({ success: false, message: "khong co id phu hop" });
  }
});

// Lấy sản phẩm theo `slug`
router.get('/slug/:categorySlug/:productSlug', async function (req, res, next) {
  try {
    let category = await CategoryModel.findOne({ slug: req.params.categorySlug });
    if (!category) return res.status(404).send({ success: false, message: "Category không tồn tại" });

    let product = await productModel.findOne({ slug: req.params.productSlug, category: category._id });
    if (!product) return res.status(404).send({ success: false, message: "Product không tồn tại" });

    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Lấy tất cả sản phẩm theo `categorySlug`
router.get('/slug/:categorySlug', async function (req, res, next) {
  try {
    let category = await CategoryModel.findOne({ slug: req.params.categorySlug });
    if (!category) return res.status(404).send({ success: false, message: "Category không tồn tại" });

    let products = await productModel.find({ category: category._id });
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Tạo mới sản phẩm (tự động tạo slug)
router.post('/', async function (req, res, next) {
  try {
    let category = await CategoryModel.findOne({ name: req.body.category });
    if (!category) return res.status(404).send({ success: false, message: "Category không đúng" });

    let newProduct = new productModel({
      name: req.body.name,
      slug: slugify(req.body.name, { lower: true, strict: true }),
      price: req.body.price,
      quantity: req.body.quantity,
      category: category._id
    });

    await newProduct.save();
    res.status(200).send({ success: true, data: newProduct });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Cập nhật sản phẩm (cập nhật slug nếu thay đổi name)
router.put('/:id', async function (req, res, next) {
  try {
    let updateObj = {};
    if (req.body.name) {
      updateObj.name = req.body.name;
      updateObj.slug = slugify(req.body.name, { lower: true, strict: true });
    }
    if (req.body.price) updateObj.price = req.body.price;
    if (req.body.quantity) updateObj.quantity = req.body.quantity;

    let updatedProduct = await productModel.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    res.status(200).send({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Xóa sản phẩm (soft delete)
router.delete('/:id', async function (req, res, next) {
  try {
    let product = await productModel.findById(req.params.id);
    if (product) {
      let deletedProduct = await productModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
      res.status(200).send({ success: true, data: deletedProduct });
    } else {
      res.status(404).send({ success: false, message: "ID không tồn tại" });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

module.exports = router;
