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

    async getArticleTypeInfo(){
        try{
            const {ctx} = this;
            let result = await ctx.service.data.getArticleTypeInfo();
            let map = new Map([
                ["js", 0],
                ['data', 0],
                ["essay", 0],
                ["cs", 0],
                ["other", 0],
                ["html", 0],
                ["css", 0],
                ["mood", 0],
                ["frame", 0],
            ]);
            result.forEach((item) => {
                map.set(item.type, (map.get(item.type))+1);
            })
            let temp = {
                key:[],
                value:[]
            };
            map.forEach((val, key) => {
                temp.key.push(key);
                temp.value.push(val);
            });
            ctx.body = {
                status: 1,
                data: temp
            }
        }catch(err){
            console.log(err);
        }
    }

    async getWebInfo(){
        try{
            const {ctx} = this;
            const result = await ctx.service.data.getWebInfo();
            ctx.body = {
                status: 1,
                data: result
            }
        }catch(err){
            console.log(err)
        }
    }

    async getPersonalKOLInfo(){
        try{
            const {ctx} = this;
            let id = ctx.query.id;
            const temp = await ctx.service.data.getArticleById(id);
            let typeMap = new Map([
                ["js", 0],
                ['data', 0],
                ["essay", 0],
                ["cs", 0],
                ["other", 0],
                ["html", 0],
                ["css", 0],
                ["mood", 0],
                ["frame", 0],
            ]);
            let dateMap = new Map();
            let classifyMap = new Map();
            temp.forEach((item) => {
                let date = moment(item.create_time).format("YYYY-MM-DD");
                typeMap.set(item.type, (typeMap.get(item.type))+1);
                if(dateMap.has(date)){
                    dateMap.set(date, dateMap.get(date)+1);
                    let newVal = classifyMap.get(date);
                    newVal[item.type] = newVal[item.type]+1;
                    classifyMap.set(date,newVal);
                }else{
                    dateMap.set(date, 1);
                    classifyMap.set(date,{
                        id: date,
                        js: 0,
                        data: 0,
                        essay: 0,
                        cs: 0,
                        other: 0,
                        html: 0,
                        css: 0,
                        mood: 0,
                        frame: 0
                    })
                }
            });
            let resultData = {
                radioData:[],
                key:[],
                value:[],
                date:[],
                dateVal:[],
                classifyData:[]
            }
            typeMap.forEach((val, key) => {
                resultData.radioData.push({
                    name: key,
                    value: val
                });
                resultData.key.push(key);
                resultData.value.push(val);
            });
            dateMap.forEach((val, key) => {
                resultData.date.push(key);
                resultData.dateVal.push(val);
            });
            classifyMap.forEach((val) => {
                resultData.classifyData.push(val);
            })
            ctx.body = {
                status: 1,
                data: resultData
            }
        }catch(err){
            console.log(err);
        }
    }

    async updateClickTimes(){
        try{
            const {ctx} = this;
            await ctx.service.data.updateClickTimes();
        }catch(err){
            console.log(err);
        }
    }

    async updateUserTimes(){
        try{
            const {ctx} = this;
            await ctx.service.data.updateUserTimes();
        }catch(err){
            console.log(err);
        }
    }
    
    async updateArticleTimes(){
        try{
            const {ctx} = this;
            await ctx.service.data.updateArticleTimes(ctx.query.type);
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = DataController;