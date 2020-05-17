'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/ifLogined', controller.home.ifLogined);

  // 获取用户id
  router.get('/getUserId', controller.user.getUserId);

  // 处理登录登出
  router.post('/register', controller.user.register);
  router.post('/login', controller.user.login);
  router.post('/loginOut', controller.user.loginOut);

  // 获取用户数据
  router.get('/getAllUser',controller.user.getAllUser);

  // 更新用户权限
  router.get('/updateRight',controller.user.updateRight);

  // 删除用户
  router.delete('/deleteUserByName',controller.user.deleteUserByName);

  // 删除文章
  router.delete('/deleteArticleById',controller.article.deleteArticleById)

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

  // 搜索文章
  router.get('/getSearchList', controller.article.getSearchList);

  // 搜索用户
  router.get('/getSearchUserList', controller.user.getSearchUserList);

  // 获取所有文章用于管理
  router.get('/getAllArticle', controller.article.getAllAtricle);

  // 个人主页获取用户信息
  router.get('/getUserInfo', controller.data.getUserInfo);

  // 网站KOL获取文章信息
  router.get('/getArticleTypeInfo', controller.data.getArticleTypeInfo);

  router.get('/getWebInfo', controller.data.getWebInfo);

  router.get('/getPersonalKOLInfo', controller.data.getPersonalKOLInfo);

  router.get('/updateClickTimes', controller.data.updateClickTimes);
  router.get('/updateUserTimes', controller.data.updateUserTimes);
  router.get('/updateArticleTimes', controller.data.updateArticleTimes);
};
