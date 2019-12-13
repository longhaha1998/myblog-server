'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/ifLogined', controller.home.ifLogined)

  // 处理登录登出
  router.post('/register', controller.user.register);
  router.post('/login', controller.user.login);
  router.post('/loginOut', controller.user.loginOut);

  // 处理获取、上传头像
  router.get('/avatar', controller.user.avatar);
  router.post('/postAvatar', controller.user.changeAvatar);

  // 处理文章上传图片
  router.post('/postMdPic', controller.article.saveMdPic);

  // 获取文章
  router.get('/getArticleType', controller.article.getArticleType);
  router.get('/getArticleList', controller.article.getArticleList);
  router.get('/getMyArticle', controller.article.getMyArticle);
  router.get('/getArticleById', controller.article.getArticleById);
  router.post('/saveArticle', controller.article.saveArticle);
  router.post('/updateArticleById', controller.article.updateArticleById);
  router.get('/getSearchList', controller.article.getSearchList);
};
