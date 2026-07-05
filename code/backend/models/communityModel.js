const { db } = require('../config/firebase');

const COLLECTION = 'communityPosts';

async function createPost(data) {
  const docRef = db.collection(COLLECTION).doc();
  const post = {
    id: docRef.id,
    ...data,
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString()
  };
  await docRef.set(post);
  return post;
}

async function addComment(postId, data) {
  const commentRef = db.collection(COLLECTION).doc(postId).collection('comments').doc();
  const comment = {
    id: commentRef.id,
    ...data,
    createdAt: new Date().toISOString()
  };
  await commentRef.set(comment);

  // Increment comments count
  const postRef = db.collection(COLLECTION).doc(postId);
  const postDoc = await postRef.get();
  if (postDoc.exists) {
    await postRef.update({ commentsCount: (postDoc.data().commentsCount || 0) + 1 });
  }

  return comment;
}

async function toggleLike(postId, userId) {
  const likeRef = db.collection(COLLECTION).doc(postId).collection('likes').doc(userId);
  const likeDoc = await likeRef.get();
  
  const postRef = db.collection(COLLECTION).doc(postId);
  const postDoc = await postRef.get();
  let count = postDoc.exists ? (postDoc.data().likesCount || 0) : 0;

  if (likeDoc.exists) {
    await likeRef.delete();
    count = Math.max(0, count - 1);
  } else {
    await likeRef.set({ createdAt: new Date().toISOString() });
    count += 1;
  }
  
  await postRef.update({ likesCount: count });
  return count;
}

module.exports = { createPost, addComment, toggleLike };
