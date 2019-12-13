'use strict';

const Controller = require('egg').Controller;
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const awaitWriteStream = require('await-stream-ready').write;
const moment = require('moment');

class ArticleController extends Controller {
    async saveMdPic(){
        const {ctx} = this;
        const stream = await ctx.getFileStream();
        const filename = ctx.helper.encode(ctx.cookies.get("username"))+moment().format("YYYYMMDDHHmmssSSS")+path.extname(stream.filename).toLocaleLowerCase();
        const target = path.join('app/public/mdPic',filename);
        const writeStream = fs.createWriteStream(target);
        if(stream.mime !== "image/jpeg" && stream.mime !== "image/png"){
            await sendToWormhole(stream);
            ctx.body={
                status: 0,
                msg: '上传失败，类型错误'
            }
        }else{
            try{
                await awaitWriteStream(stream.pipe(writeStream));
            }catch(err){
                await sendToWormhole(stream);
                ctx.body={
                    status: 0,
                    msg: '上传失败'
                }
                console.log(err);
            }
            ctx.body={
                status: 1,
                path: target,
                msg: '上传成功'
            }
        }
    }

    async getArticleType(){
        const {ctx} = this;
        const redis = this.app.redis;
        try{
            let list;
            if(redis){
                let temp = await redis.get("articleType");
                if(temp){
                    list = JSON.parse(temp);
                }else{
                    list = await ctx.service.article.getType();
                    await redis.set("articleType", JSON.stringify(list));
                }
            }else{
                list = await ctx.service.article.getType();
            }
            if(list){
                ctx.body = {
                    status: 1,
                    data:list
                }
            }else{
                ctx.body = {
                    status: 0,
                    msg: "获取失败"
                }
            }
        }catch(err){
            console.log(err);
        }
    }

    async saveArticle(){
        const {ctx} = this;
        const redis = this.app.redis;
        const tempId = ctx.helper.uuid();
        const { title, detail, author, type, visible } = ctx.request.body;
        const newArticle = {
            id: tempId,
            title: title,
            detail: detail,
            author: author,
            type: type,
            visible: visible,
            create_time: new Date(),
            update_time: new Date()
        }
        const flag = await ctx.service.article.save(newArticle);
        if(redis){
            if(await redis.zcard("articleList")>0){
                await redis.zadd("articleList",tempId,JSON.stringify(newArticle));
                await redis.zadd(`${type}ArticleList`,tempId,JSON.stringify(newArticle));
            }
            if(await redis.zcard(`${author}ArticleCache`)>0){
                await redis.zadd(`${author}ArticleCache`,tempId,JSON.stringify(newArticle));
                await redis.zadd(`${author}${type}ArticleCache`,tempId,JSON.stringify(newArticle));
            }
            await redis.set(tempId,JSON.stringify(newArticle),'EX',2*24*60*60);
        }
        if(flag){
            ctx.body={
                status: 1,
                articleId: tempId,
                msg: '发布成功',
            }
        }else{
            ctx.body={
                status: 0,
                msg: '发布失败',
            }
        }
    }

    async getArticleList(){
        const {ctx} = this;
        const redis = this.app.redis;
        try{
            let articleList;
            if(redis){
                if(!await redis.zcard("articleList")){
                    await ctx.service.redisHelper.updateRedis();
                }
                let count = await redis.zcard(ctx.query.type);
                let temp =await redis.zrange(ctx.query.type,Number(ctx.query.begin),Number(ctx.query.end));
                articleList = temp.map( ele =>{
                    let temp = JSON.parse(ele);
                    temp.detail = temp.detail.slice(0,400);
                    return temp;
                });
                ctx.body={
                    status:1,
                    count: count,
                    data: articleList
                }
            }else{
                ctx.body={
                    status: 0,
                    msg: "redis错误"
                }
            }
        }catch(err){
            console.log(err);
        }
    }

    async getMyArticle(){
        const {ctx} = this;
        const redis = this.app.redis;
        try{
            let articleList;
            if(redis){
                if(!await redis.zcard(`${ctx.query.user}ArticleCache`)){
                    await ctx.service.redisHelper.getMyActicleRedis(ctx.query.user);
                }
                let count = await redis.zcard(ctx.query.type);
                let temp =await redis.zrange(ctx.query.type,Number(ctx.query.begin),Number(ctx.query.end));
                articleList = temp.map( ele => {
                    let temp = JSON.parse(ele);
                    temp.detail = temp.detail.slice(0,400);
                    return temp;
                });
                ctx.body={
                    status:1,
                    count: count,
                    data: articleList
                }
            }else{
                ctx.body={
                    status: 0,
                    msg: "redis错误"
                }
            }
        }catch(err){
            console.log(err);
        }
    }

    async getArticleById(){
        const {ctx} = this;
        const redis = this.app.redis;
        try{
            let article;
            if(redis){
                if(!await redis.get(ctx.query.id)){
                    await ctx.service.redisHelper.getArticleById(ctx.query.id);
                }
                let temp =await redis.get(ctx.query.id);
                article = JSON.parse(temp);
                ctx.body={
                    status:1,
                    data: article
                }
            }else{
                article = await ctx.service.article.getArticleById(ctx.query.id);
            }
            ctx.body={
                status: 1,
                data: article
            }
        }catch(err){
            console.log(err);
        }
    }

    async updateArticleById(){
        const {ctx} = this;
        const redis = this.app.redis;
        const {id, title, detail, author, type, visible} = ctx.request.body;
        try{
            let tempData = {
                title: title,
                detail: detail,
                author: author,
                type: type,
                visible: visible,
                update_time: new Date()
            }
            let flag = await ctx.service.article.updateArticleById(id, tempData);
            if(redis && flag){
                let tempData = await ctx.service.article.getArticleById(id);
                if(await redis.zcard("articleList")>0){
                    await redis.zremrangebyscore("articleList",id,id);
                    await redis.zremrangebyscore(`${type}ArticleList`,id,id);
                    await redis.zadd("articleList",id,JSON.stringify(tempData));
                    await redis.zadd(`${type}ArticleList`,id,JSON.stringify(tempData));
                }
                if(await redis.zcard(`${author}ArticleCache`)){
                    await redis.zremrangebyscore(`${author}ArticleCache`,id,id);
                    await redis.zremrangebyscore(`${author}${type}ArticleCache`,id,id);
                    await redis.zadd(`${author}ArticleCache`,id,JSON.stringify(tempData));
                    await redis.zadd(`${author}${type}ArticleCache`,id,JSON.stringify(tempData));
                }
                await redis.set(id,JSON.stringify(tempData),'EX',2*24*60*60);
            }
            if(flag){
                ctx.body={
                    status:1,
                    msg: "修改成功"
                }
            }else{
                ctx.body={
                    status:1,
                    msg: "修改失败"
                }   
            }
        }catch(err){
            console.log(err);
        }
    }

    async getSearchList(){
        const {ctx} = this;
        const redis = this.app.redis;
        try{
            if(redis){
                if(ctx.query.searchVal){
                    await ctx.service.redisHelper.getSerchArticleRedis(ctx.query.searchVal);
                }
                let count = await redis.zcard(ctx.query.type);
                let temp =await redis.zrange(ctx.query.type,Number(ctx.query.begin),Number(ctx.query.end));
                let articleList = temp.map( ele => {
                    let temp = JSON.parse(ele);
                    temp.detail = temp.detail.slice(0,400);
                    return temp;
                });
                ctx.body={
                    status:1,
                    count: count,
                    data: articleList
                }
            }else{
                ctx.body={
                    status: 0,
                    msg: "redis错误"
                }
            }
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = ArticleController;