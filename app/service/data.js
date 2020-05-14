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
}

module.exports = DataService;