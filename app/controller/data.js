'use strict'

const Controller = require('egg').Controller;
const moment = require('moment');

class DataController extends Controller {
    async getUserInfo(){
        try{
            const {ctx} = this;
            const id = ctx.query.id;
            let result = await ctx.service.data.getUserInfo(id);
            if(result){
                ctx.body = {
                    status: 1,
                    data: result,
                    msg: "获取成功"
                }
            }else{
                ctx.body = {
                    status: 0,
                    msg: "获取失败",
                }
            }
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = DataController;