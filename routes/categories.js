var express = require('express');
var router = express.Router();
const slugify = require('slugify');
let categoryModel = require('../schemas/category');

// Lấy danh sách category
router.get('/', async function (req, res, next) {
  let categories = await categoryModel.find({});
  res.status(200).send({ success: true, data: categories });
});

// Lấy category theo `slug`
router.get('/:slug', async function (req, res, next) {
  try {
    let category = await categoryModel.findOne({ slug: req.params.slug });
    if (!category) throw new Error("Category không tồn tại");

    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Tạo mới category (tự động tạo slug)
router.post('/', async function (req, res, next) {
  try {
    let newCategory = new categoryModel({
      name: req.body.name,
      slug: slugify(req.body.name, { lower: true, strict: true })
    });

    await newCategory.save();
    res.status(200).send({ success: true, data: newCategory });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

module.exports = router;
