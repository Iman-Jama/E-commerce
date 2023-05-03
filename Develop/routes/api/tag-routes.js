const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint
  // find all tags
  // be sure to include its associated Product data
  router.get('/', async (req, res) => {
    try {
      const TagData = await Tag.findAll({
        include: [{ model: Product }],
      });
      res.status(200).json(TagData);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const TagData = await Tag.findByPk(req.params.id, {
        // JOIN with product, using the productTag through table
        include: [{ model: Product, through: ProductTag, as: 'product_tags' }]
      });
  
      if (!TagData) {
        res.status(404).json({ message: 'No Tag found with this id!' });
        return;
      }
  
      res.status(200).json(TagData);
    } catch (err) {
      res.status(500).json(err);
    }
  });

router.post('/', (req, res) => {
  // create a new tag
  router.post('/', async (req, res) => {
    try {
      const TagData = await Tag.create(req.body);
      res.status(200).json(TagData);
    } catch (err) {
      res.status(400).json(err);
    }
  });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((updatedTags) => res.json(updatedTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});


router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
    try {
      const TagData = await TagData.destroy({
        where: {
          id: req.params.id,
        },
      });
  
      if (!TagData) {
        res.status(404).json({ message: 'No tag found with that id!' });
        return;
      }
  
      res.status(200).json(TagData);
    } catch (err) {
      res.status(500).json(err);
    }
  });


module.exports = router;
