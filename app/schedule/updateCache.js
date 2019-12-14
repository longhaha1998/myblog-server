module.exports = {
    schedule: {
        // 周一的3点30分30秒更新缓存
        corn: '30 30 3 * * 1',
        //   interval: 7*24*60*60*1000,
        type: 'all', // 指定所有的 worker 都需要执行
        immediate: true
    },
    async task(ctx) {
        const redis = ctx.app.redis;
        try{
            console.log("updateRedisCache")
            await redis.flushall();
            list = await ctx.service.article.getType();
            await redis.set("articleType", JSON.stringify(list));
            await ctx.service.redisHelper.updateRedis();
            await ctx.service.redisHelper.updateAllArticleRedis();
            await ctx.service.redisHelper.getAllUser();
        }catch(err){
            console.log(err);
        }
    },
  };