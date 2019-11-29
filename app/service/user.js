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
        const user = await this.app.mysql.get('user', {username: username});
        if(!user){
            return false;
        }else{
            return true;
        }
    }
}

module.exports = UserService;