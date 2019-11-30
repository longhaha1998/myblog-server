module.exports = (options, app) => {
    return async function ifLogined(ctx, next){
        if(ctx.request.path === '/avatar' || ctx.request.path === '/login' || ctx.request.path === '/register'){
            await next();
        }else{
            if(ctx.cookies.get('username')){
                let flag = await ctx.service.user.check(ctx.cookies.get('username'));
                if (flag) {
                    await next();
                } else {
                    ctx.boy = {
                        status: -2,
                        msg: '身份认证已过期，用户名不存在，请重新登录'
                    }
                }
            }else{
                ctx.body = {
                    status: -2,
                    msg: '身份认证已过期，请重新登录'
                }
            }
        }
    }
}