const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const ProductData = await Product.findAll({
      include: [{ model: Tag, through: ProductTag, as: 'tagged_products' }]
    });
    res.status(200).json(ProductData);
  } catch (err) {
    res.status(500).json(err);
  }

});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const ProductData = await Product.findByPk(req.params.id, {
      // JOIN with product, using the productTag through table
      include: [{ model: Tag, through: ProductTag, as: 'tagged_products' }]
    });

    if (!ProductData) {
      res.status(404).json({ message: 'No Tag found with this id!' });
      return;
    }

    res.status(200).json(ProductData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }*/

  Product.create({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    tagIds: req.body.tagIds})
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      console.log("Product updated: ", product)
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      console.log("Product Tags From DB: ", productTags);

      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      console.log("Saved Product Tags: ", productTagIds);

      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
      console.log("Product Tags to Update: ", newProductTags);
      
      // figure out which ones to remove
      const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);
      
      console.log("Product Tags to Remove: ", productTagsToRemove);
      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json({message: 'The product has been updated'}))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

  router.delete('/:id', async (req, res) => {
    // delete a category by its `id` value
    try {
      const deletedProductData = await Product.destroy({
        where: {
          id: req.params.id,
        },
      });
  
      if (!deletedProductData) {
        res.status(404).json({ message: 'No product found with that id!' });
        return;
      }
  
      res.status(200).json({message: "This product has successfully been deleted!"});
    } catch (err) {
      res.status(500).json(err);
    }
  });


module.exports = router;
