 const express = require('express');
const mongodb = require('mongodb');
const db = require('../database/database');
const { render } = require('ejs');
const router = express.Router();
const objectId = mongodb.ObjectId;
router.get('/', function (req, res) {
  res.redirect('/posts');
});
router.get('/posts', async function (req, res) {
  const post = await db.getDb().collection('posts').find({}, {
    _id: 1,
    title: 1,
    summary: 1,
    'author.name': 1
  }).toArray();
  res.render('posts-list', { posts: post });
});

router.get('/post/:id', async function (req, res) {
  const id = req.params.id;
let postData;
  try{

     postData = await db.getDb().collection('posts').findOne({ _id: new objectId(id) }, { summary: 0 })
  }

  catch (error) {
    return res.status(404).render('404');
  }
  res.render('post-detail', { postData: postData });
});

router.get('/post/update/:id', async function (req, res) {
  const id = req.params.id;
  let post
  try{

     post = await db.getDb().collection('posts').findOne(
      { _id: new objectId(id) },
      {
        _id: 1,
        title: 1,
        summary: 1,
        content: 1
      });
  }
  catch(error){

    return res.status(404).render('404');
  }
 
  res.render('update-post', { post: post });
})

router.get('/new-post', async function (req, res) {
  const documents = await db.getDb().collection('authors').find().toArray();
  console.log(documents)
  res.render('create-post', { authors: documents });
});


router.post('/posts', async function (req, res) {
  const authorId = new objectId(req.body.author)
  const author = await db.getDb().collection('authors').findOne();

  const data = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
  };
  const result = await db.getDb().collection('posts').insertOne(data);
  res.render('message');
});

router.post('/post/update/:id', async function (req, res) {
  const id = new objectId(req.params.id);
  let updatePost;
  try{
    
     updatePost = await db.getDb().collection('posts').updateOne({ _id: new objectId(id) },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          content: req.body.content,
          date: new Date()
        }
      });
  }
catch(error){
res.status(404).render('404')
}
  res.redirect('/');
});


router.post('/post/delete/:id', async function (req, res) {
  const id = new objectId(req.params.id);

  const postDelete = await db.getDb().collection('posts').deleteOne({ _id: id });
  if (!postDelete) {
    return res.status(404).render('404');
  }
  res.redirect('/posts');
})
module.exports = router;