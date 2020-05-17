const Service = require('egg').Service;
const path = require('path');
const moment = require('moment');

class DataService extends Service{
    async getUserInfo(id){
        try{
            const param = '%'+id+'%';
            const sql = "SELECT username, avatar_url, role, create_time FROM user WHERE id LIKE ?";
            const user =await this.app.mysql.query(sql, [param]);
            let temp = user[0];
            if(user.length>0){
                const result = {
                    username: temp.username,
                    role: JSON.parse(temp.role),
                    avatar_url: path.join(temp.avatar_url),
                    create_time: moment(temp.create_time).format("dddd, MMMM Do YYYY, h:mm:ss a")
                }
                return result;
            }else{
                return -1;
            }
        }catch(err){
            console.log(err);
        }
    }

    async getArticleTypeInfo(){
        try{
            const sql = "SELECT id,type FROM article";
            const list =await this.app.mysql.query(sql);
            return list; 
        }catch(err){
            console.log(err);
        }
    }

    async getWebInfo(){
        try{
            const sql = "SELECT * FROM webInfo";
            const list = await this.app.mysql.query(sql);
            return list;
        }catch(err){
            console.log(err);
        }
    }

    async getArticleById(id){
        try{
            const param = '%'+id+'%';
            const sql = "SELECT username FROM user WHERE id LIKE ?";
            const result =await this.app.mysql.query(sql, [param]);
            const nameVal = '%'+result[0].username+'%';
            const realSql = "SELECT create_time,type,id FROM article WHERE author LIKE ?"
            const list =await this.app.mysql.query(realSql, [nameVal]);
            return list;
        }catch(err){
            console.log(err);
        }
    }

    async insertKOLInfo(){
        try{
            let temp = {
                id: moment().format("YYYYMMDD"),
                date: moment().format("YYYY-MM-DD"),
                clickTimes: 0,
                articleTimes: 0,
                userTimes: 0,
                js: 0,
                data: 0,
                essay: 0,
                cs: 0,
                other: 0,
                html: 0,
                css: 0,
                mood: 0,
                frame: 0
            }
            await this.app.mysql.insert('webInfo', temp);
        }catch(err){
            console.log(err);
        }
    }

    async updateClickTimes(){
        try{
            let id = moment().format("YYYYMMDD");
            const param = '%'+id+'%';
            const sql = "SELECT * FROM webInfo WHERE id LIKE ?";
            const result =await this.app.mysql.query(sql, [param]);
            let newVal = result[0];
            newVal.clickTimes = newVal.clickTimes+1;
            const options = {
                where:{
                    id: id
                }
            };
            await this.app.mysql.update('webInfo', newVal, options);
        }catch(err){
            console.log(err);
        }
    }

    async updateUserTimes(){
        try{
            let id = moment().format("YYYYMMDD");
            const param = '%'+id+'%';
            const sql = "SELECT * FROM webInfo WHERE id LIKE ?";
            const result =await this.app.mysql.query(sql, [param]);
            let newVal = result[0];
            newVal.userTimes = newVal.userTimes+1;
            const options = {
                where:{
                    id: id
                }
            };
            await this.app.mysql.update('webInfo', newVal, options);
        }catch(err){
            console.log(err);
        }
    }

    async updateArticleTimes(type){
        try{
            let id = moment().format("YYYYMMDD");
            const param = '%'+id+'%';
            const sql = "SELECT * FROM webInfo WHERE id LIKE ?";
            const result =await this.app.mysql.query(sql, [param]);
            let newVal = result[0];
            newVal.articleTimes = newVal.articleTimes+1;
            newVal[type] = newVal[type]+1
            const options = {
                where:{
                    id: id
                }
            };
            await this.app.mysql.update('webInfo', newVal, options);
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = DataService;