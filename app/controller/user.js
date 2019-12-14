'use strict';

const Controller = require('egg').Controller;
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const awaitWriteStream = require('await-stream-ready').write;
const moment = require('moment');

class UserController extends Controller{
    async loginOut(){
        const { ctx } = this;
        ctx.cookies.set('username',null,{httpOnly:false});
        ctx.body={
            status: 1,
            msg: '注销成功'
        }
    }

    async register(){
        try{
            const { ctx } = this;
            const {username, password} = ctx.request.body;
            const nowTime = new Date();
            let tempId = ctx.helper.uuid();
            const newUser = {
                id: tempId,
                username: ctx.helper.decode(username),
                password: password,
                create_time: nowTime,
                update_time: nowTime,
                avatar_url: path.join('app/public/avatarImg','default.jpg'),
                role:JSON.stringify(["1"])
            }
            const redis = this.app.redis;
            if(redis){
                const flag = await ctx.service.user.save(newUser);
                if (flag === 1){
                    if(!redis.zcard("allUser")){
                        await ctx.service.redisHelper.getAllUser();
                    }
                    await redis.zadd("allUser",tempId,JSON.stringify(newUser));
                    ctx.cookies.set('username',newUser.username,{httpOnly:false,maxAge:this.config.rememberMeCookie});
                    ctx.body={
                        status: 1,
                        msg: '注册成功',
                        username: newUser.username,
                        role:newUser.role
                    }
                }else if(flag === -1){
                    ctx.body = {
                        status: -1,
                        msg: '用户名已存在'
                    }
                }else{
                    ctx.body = {
                        status: 0,
                        msg: '注册失败'
                    }
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

    async login(){
        const {ctx} = this;
        const {username, password, ifMemberMe} = ctx.request.body;
        const user = await ctx.service.user.login(ctx.helper.decode(username), ctx.helper.decode(password));
        if(user === -1){
            ctx.body = {
                status: -1,
                msg: '用户不存在'
            };
        }else if(user === 0){
            ctx.body = {
                status: 0,
                msg: '用户名或密码错误'
            };
        }else {
            // 设置 Session
            // ctx.session.user = {username:user.username};
            let mime = path.extname(user["avatar_url"]);
            if(mime === ".jpg" || mime === ".jpeg"){
                mime = "image/jpeg";
            }else{
                mime = "image/png";
            }
            if(ifMemberMe){
                ctx.cookies.set('username',user.username,{httpOnly:false,maxAge:this.config.rememberMeCookie});
            }else{
                ctx.cookies.set('username',user.username,{httpOnly:false,maxAge:24 * 60 * 60 * 1000});
            }
            ctx.body = {
                status: 1,
                msg: '登陆成功',
                username: user.username,
                role:user.role,
                mime:mime
            }
        }
    }

    async avatar(){
        const {ctx} = this;
        const preUrl = await ctx.service.user.getPreAvatar(ctx.helper.decode(ctx.query.username));
        const readStream = fs.createReadStream(preUrl);
        ctx.set('Content-Type','application/octet-stream');
        ctx.body = readStream;
    }

    async changeAvatar(){
        const {ctx} = this;
        const stream = await ctx.getFileStream();
        const filename = ctx.cookies.get("username")+moment().format("YYYYMMDDHHmmssSSS")+path.extname(stream.filename).toLocaleLowerCase();
        const target = path.join('app/public/avatarImg',filename);
        const writeStream = fs.createWriteStream(target);
        if(stream.mime !== "image/jpeg" && stream.mime !== "image/png"){
            await sendToWormhole(stream);
            ctx.body={
                status: 0,
                msg: '更换失败，类型错误'
            }
        }else{
            const preUrl = await ctx.service.user.getPreAvatar(ctx.cookies.get("username"));
            try{
                if(preUrl && preUrl !== path.join('app/public/avatarImg','default.jpg')){
                    fs.unlinkSync(preUrl);
                }
                await awaitWriteStream(stream.pipe(writeStream));
            }catch(err){
                await sendToWormhole(stream);
                console.log(err);
            }
            const res = await ctx.service.user.updateAvatarUrl(ctx.cookies.get("username"),target);
            if(res){
                ctx.body={
                    status: 1,
                    mime:stream.mime,
                    msg: '更换成功'
                }
            }else{
                ctx.body={
                    status: 4,
                    msg: '更换失败'
                }
            }
        }
    }

    async getAllUser(){
        const {ctx} = this;
        const redis = this.app.redis;
        try{
            if(redis){
                if(!await redis.zcard("allUser")){
                    await ctx.service.redisHelper.getAllUser();
                }
                let count = await redis.zcard(ctx.query.type);
                let temp = await redis.zrange(ctx.query.type,ctx.query.begin,ctx.query.end);
                let userList = temp.map(ele => {
                    let temp = JSON.parse(ele);
                    temp.role = JSON.parse(temp.role);
                    delete temp.id;
                    return temp
                });
                ctx.body = {
                    status:1,
                    count:count,
                    data: userList
                }
            }else{
                ctx.body={
                    status: 0,
                    msg: "redis错误"
                };
            }
        }catch(err){
            console.log(err);
        }
    }

    async updateRight(){
        try{
            const {ctx} = this;
            const {user, ifAdd, ifWrite} = ctx.query;
            const redis = this.app.redis;
            if(redis){
                const tempUser =await ctx.service.user.getUserByName(user);
                if(tempUser){
                    if(ifAdd === "true"){
                        if(ifWrite === "true"){
                            tempUser.role = JSON.parse(tempUser.role);
                            tempUser.role.push("2");
                            tempUser.role = JSON.stringify(tempUser.role);
                        }else{
                            tempUser.role = JSON.parse(tempUser.role);
                            tempUser.role.push("666");
                            tempUser.role = JSON.stringify(tempUser.role);
                        }
                    }else{
                        if(ifWrite === "true"){
                            tempUser.role = JSON.parse(tempUser.role);
                            tempUser.role.splice(tempUser.role.indexOf("2"),1);
                            tempUser.role = JSON.stringify(tempUser.role);
                        }else{
                            tempUser.role = JSON.parse(tempUser.role);
                            tempUser.role.splice(tempUser.role.indexOf("666"),1);
                            tempUser.role = JSON.stringify(tempUser.role);
                        }
                    }
                    tempUser.update_time = new Date();
                    let flag = await ctx.service.user.updateRole(user, tempUser.role, tempUser.update_time);
                    if(flag){
                        await redis.zremrangebyscore("allUser",tempUser.id,tempUser.id);
                        await redis.zadd("allUser",tempUser.id,JSON.stringify(tempUser));
                        let count = await redis.zcard("allUser");
                        let tempData = await redis.zrange("allUser",ctx.query.begin,ctx.query.end);
                        let tableList = tempData.map(ele => {
                            let temp = JSON.parse(ele);
                            temp.role = JSON.parse(temp.role);
                            delete temp.id;
                            return temp
                        });
                        ctx.body = {
                            status: 1,
                            msg: "更新成功",
                            count: count,
                            data: tableList
                        }
                    }else{
                        ctx.body = {
                            status: 0,
                            msg: "更新失败"
                        }
                    }
                }else{
                    ctx.body = {
                        status: 0,
                        msg: "更新失败"
                    }
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

    async deleteUserByName(){
        try{
            const {ctx} = this;
            const redis = this.app.redis;
            if(redis){ 
                const tempUser =await ctx.service.user.getUserByName(ctx.query.user);
                const flag = await ctx.service.user.deleteUserByName(ctx.query.user);
                if(flag){
                    if(tempUser.avatar_url && tempUser.avatar_url !== path.join('app/public/avatarImg','default.jpg')){
                        fs.unlinkSync(tempUser.avatar_url);
                    }
                    await redis.zremrangebyscore("allUser",tempUser.id,tempUser.id);
                    await ctx.service.redisHelper.deleteUserArticle(ctx.query.user);
                    let count = await redis.zcard("allUser");
                    let tempData = await redis.zrange("allUser",ctx.query.begin,ctx.query.end);
                    let tableList = tempData.map(ele => {
                        let temp = JSON.parse(ele);
                        temp.role = JSON.parse(temp.role);
                        delete temp.id;
                        return temp
                    });
                    ctx.body={
                        status:1,
                        data: tableList,
                        count: count,
                        mag: "删除成功"
                    }
                }else{
                    ctx.body={
                        status: 0,
                        msg: "删除失败"
                    } 
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

    async getSearchUserList(){
        const {ctx} = this;
        const redis = this.app.redis;
        try{
            if(redis){
                if(ctx.query.searchVal){
                    await ctx.service.redisHelper.getSerchUserRedis(ctx.query.searchVal);
                }
                let count = await redis.zcard(ctx.query.type);
                let temp = await redis.zrange(ctx.query.type,ctx.query.begin,ctx.query.end);
                let userList = temp.map(ele => {
                    let temp = JSON.parse(ele);
                    temp.role = JSON.parse(temp.role);
                    delete temp.id;
                    return temp
                });
                ctx.body = {
                    status:1,
                    count:count,
                    data: userList
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

module.exports = UserController;