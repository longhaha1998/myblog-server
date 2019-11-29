'use strict';

const Controller = require('egg').Controller;

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
            update_time: nowTime
        }
        const flag = await ctx.service.user.save(newUser);
        if (flag === 1){
            ctx.cookies.set('username',newUser.username,{httpOnly:false,maxAge:this.config.rememberMeCookie});
            ctx.body={
                status: 1,
                msg: '注册成功',
                username: newUser.username
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
            if(ifMemberMe){
                ctx.cookies.set('username',user.username,{httpOnly:false,maxAge:this.config.rememberMeCookie});
            }else{
                ctx.cookies.set('username',user.username,{httpOnly:false,maxAge:24 * 60 * 60 * 1000});
            }
            ctx.body = {
                status: 1,
                msg: '登陆成功',
                username: user.username
            }
        }
    }
}

module.exports = UserController;