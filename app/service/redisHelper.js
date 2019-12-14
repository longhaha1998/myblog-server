const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');

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

    async updateAllArticleRedis(){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            let tempData = await ctx.service.article.getAllArticle();
            for(let i = 0; i<tempData.length; i++){
                let element = tempData[i];
                await redis.zadd("allArticle",element.id,JSON.stringify(element));
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

    async getAllUser(){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            let tempData = await ctx.service.user.getAllUser();
            for(let i=0; i<tempData.length; i++){
                let element = tempData[i];
                await redis.zadd('allUser',element.id,JSON.stringify(element));
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

    async getSerchUserRedis(val){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            await redis.del("searchUserList");
            let tempData = await ctx.service.user.getSearchUserList(val);
            for(let i = 0; i<tempData.length; i++){
                let element = tempData[i];
                await redis.zadd(`searchUserList`,element.id,JSON.stringify(element));
            }
        }catch(err){
            console.log(err);
        }
    }

    async deleteArticleById(id,type,author){
        try{
            const redis = this.app.redis;
            if(await redis.zcard('articleList')){
                await redis.zremrangebyscore('articleList',id,id);
            }
            if(await redis.zcard(`${type}ArticleList`)){
                await redis.zremrangebyscore(`${type}ArticleList`,id,id);
            }
            if(await redis.zcard(`${author}ArticleCache`)){
                await redis.zremrangebyscore(`${author}ArticleCache`,id,id);
            }
            if(await redis.zcard(`${author}${type}ArticleCache`)){
                await redis.zremrangebyscore(`${author}${type}ArticleCache`,id,id);
            }
        }catch(err){
            console.log(err);
        }  
    }

    async deleteUserArticle(user){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            const tempList = await ctx.service.article.getUserArticle(user);
            if(await redis.zcard(`${user}ArticleCache`)){
                await redis.del(`${user}ArticleCache`);
            }
            for(let i=0;i<tempList.length;i++){
                const ele = tempList[i];
                if(await redis.zcard('articleList')){
                    await redis.zremrangebyscore('articleList',ele.id,ele.id);
                }
                if(await redis.zcard(`${ele.type}ArticleList`)){
                    await redis.zremrangebyscore(`${ele.type}ArticleList`,ele.id,ele.id);
                }
                if(await redis.zcard(`${user}${ele.type}ArticleCache`)){
                    await redis.zremrangebyscore(`${user}${ele.type}ArticleCache`,ele.id,ele.id);
                }
                if(await redis.zcard("allArticle")){
                    await redis.zremrangebyscore("allArticle",ele.id,ele.id);
                }
                await ctx.service.article.deleteArticleById(ele.id);
                const pattern = /\!\[图片描述\]\(http:\/\/47\.103\.11\.183\:7001(.*?)\)/gm;
                let temp = ele.detail;
                let data;
                while((data = pattern.exec(temp) )!== null){
                    fs.unlinkSync(path.join('app',data[1]));
                }
            }
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = RedisServie;