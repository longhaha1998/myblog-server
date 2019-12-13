const Service = require('egg').Service;

class UserService extends Service{
    async save(user){
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
    }

    async login(username,password){
        const user =await this.app.mysql.get('user', {username: username});
        if(!user){
            return -1;
        }else if(username !== user.username || password !== this.ctx.helper.decode(user.password)){
            return 0;
        }else{
            return user;
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
    }

    async getPreAvatar(username){
        const user = await this.app.mysql.get('user', { username: username });
        if (!user){
            return false
        } else {
            return user["avatar_url"];
        }
    }
}

module.exports = UserService;