const Service = require('egg').Service;

class UserService extends Service{

    async getUserIdByName(name){
        try{
            const param = '%'+name+'%';
            const sql = "SELECT id FROM user WHERE username LIKE ?";
            const result =await this.app.mysql.query(sql, [param]);
            return result;
        }catch(err){
            console.log(err);
        }
    }

    async save(user){
        try{
            const userQ = await this.app.mysql.get('user', {username: user.username});
            if(userQ){
                return -1;
            }else{
                const result = await this.app.mysql.insert('user', user);
                const flag = result.affectedRows === 1;
                if(flag){
                    return 1;
                }
            }
            return 0;
        }catch(err){
            console.log(err);
        }
    }

    async login(username,password){
        try{
            const user =await this.app.mysql.get('user', {username: username});
            if(!user){
                return -1;
            }else if(username !== user.username || password !== this.ctx.helper.decode(user.password)){
                return 0;
            }else{
                return user;
            }
        }catch(err){
            console.log(err);
        }
    }

    async check(username){
        try{
            const user = await this.app.mysql.get('user', {username: username});
            if(!user){
                return false;
            }else{
                return true;
            }
        }catch(err){
            console.log(err)
        }
    }

    async updateAvatarUrl(username, url){
        try{
            const row = {
                avatar_url: url
            };
            const options = {
                where:{
                    username: username
                }
            };
            const result = await this.app.mysql.update('user', row, options);
            return result.affectedRows === 1;
        }catch(err){
            console.log(err);
        }
    }

    async getPreAvatar(username){
        try{
            const user = await this.app.mysql.get('user', { username: username });
            if (!user){
                return false
            } else {
                return user["avatar_url"];
            }
        }catch(err){
            console.log(err);
        }
    }

    async getAllUser(){
        try{
            const sql = "SELECT id,username,role,create_time FROM user";
            const list =await this.app.mysql.query(sql);
            return list;  
        }catch(err){
            console.log(err);
        }
    }

    async getUserByName(name){
        try{
            const user = await this.app.mysql.get('user', { username: name });
            if (!user){
                return false
            } else {
                return user;
            }
        }catch(err){
            console.log(err)
        }
    }

    async updateRole(username, role, update_time){
        try{
            const row = {
                role: role,
                update_time: update_time
            };
            const options = {
                where:{
                    username: username
                }
            };
            const result = await this.app.mysql.update('user', row, options);
            return result.affectedRows === 1;
        }catch(err){
            console.log(err);
        }
    }

    async deleteUserByName(user){
        try{
            let result = await this.app.mysql.delete("user",{username: user});
            return result.affectedRows === 1;
        }catch(err){
            console.log(err);
        }
    }

    async getSearchUserList(searchVal){
        try{
            const param = '%'+searchVal+'%';
            const sql = "SELECT id,username,role,create_time FROM user WHERE username LIKE ?";
            const result =await this.app.mysql.query(sql, [param]);
            return result;
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = UserService;