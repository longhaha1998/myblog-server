const Service = require('egg').Service;

class RedisServie extends Service{
    async updateRedis(){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            let tempData = await ctx.service.article.getArticleList();
            for(let i = 0; i<tempData.length; i++){
                let element = tempData[i];
                await redis.zadd("articleList",element.id,JSON.stringify(element));
                await redis.zadd(`${element.type}ArticleList`,element.id,JSON.stringify(element));
            }
        }catch(err){
            console.log(err);
        }
    }

    async getMyActicleRedis(author){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            let tempData = await ctx.service.article.getMyArticle(author);
            for(let i = 0; i<tempData.length; i++){
                let element = tempData[i];
                await redis.zadd(`${author}ArticleCache`,element.id,JSON.stringify(element));
                await redis.zadd(`${author}${element.type}ArticleCache`,element.id,JSON.stringify(element));
            }
        }catch(err){
            console.log(err);
        }
    }

    async getArticleById(id){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            let tempData = await ctx.service.article.getArticleById(id);
            await redis.set(id,JSON.stringify(tempData),'EX',2*24*60*60);
        }catch(err){
            console.log(err);
        }
    }

    async getSerchArticleRedis(val){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            await redis.del("searchList");
            let tempData = await ctx.service.article.getSearchArticleList(val);
            for(let i = 0; i<tempData.length; i++){
                let element = tempData[i];
                await redis.zadd(`searchList`,element.id,JSON.stringify(element));
            }
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = RedisServie;