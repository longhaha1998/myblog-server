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
        const { ctx } = this;
        const {username, password} = ctx.request.body;

        const nowTime = new Date();
        const newUser = {
            id: ctx.helper.uuid(),
            username: ctx.helper.decode(username),
            password: password,
            create_time: nowTime,
            update_time: nowTime,
            avatar_url: path.join('app/public/avatarImg','default.jpg'),
            role:["1"].join(",")
        }
        const flag = await ctx.service.user.save(newUser);
        if (flag === 1){
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
            ctx.body={
                status: 0,
                msg: '更换失败，类型错误'
            }
        }else{
            const preUrl = await ctx.service.user.getPreAvatar(ctx.cookies.get("username"));
            // let preTarget = path.join('app',preUrl);
            try{
                if(preUrl && preUrl !== path.join('app/public/avatarImg','default.jpg')){
                    fs.unlinkSync(preUrl);
                }
                await awaitWriteStream(stream.pipe(writeStream));
            }catch(err){
                await sendToWormhole(stream);
                throw err;
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
}

module.exports = UserController;