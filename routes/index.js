const express = require('express');
const { MongoClient } = require("mongodb");
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const phone = req.query.phone;
  if (!phone || phone.length !== 11 || phone[0] !== '1') {
    return res.json({msg: 'Invalid US Phone Number'});
  }
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  const db = client.db('test');
  const one = await db.collection('geo').findOne({code: Number(phone.slice(1, 4))});
  const many = await db.collection('cities').find({code: Number(phone.slice(1, 4))}).toArray();
  await client.close();
  if (many.length > 1) {
    const [edge1, edge2] = [[-90, -180], [90, 180]];
    many.forEach(m => {
      if (m.lat > edge1[0]) edge1[0] = m.lat;
      if (m.lat < edge2[0]) edge2[0] = m.lat;
      if (m.lng > edge1[1]) edge1[1] = m.lng;
      if (m.lng < edge2[1]) edge2[1] = m.lng;
    });
    return res.json({
      msg: '',
      data: {
        lat: edge1[0] + (Math.random() * (edge2[0] - edge1[0])),
        lng: edge1[1] + (Math.random() * (edge2[1] - edge1[1])),
      }
    });
  } else if (one) {
    return res.json({
      msg: '',
      data: {
        lat: (one.lat - 0.0075) + (Math.random() * 0.015),
        lng: (one.lng - 0.01) + (Math.random() * 0.02),
      }
    });
  }
  return res.json({
    msg: 'No result found',
  });
});

module.exports = router;
