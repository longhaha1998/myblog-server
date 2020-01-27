const Service = require('egg').Service;

class ArticleService extends Service{
    async getType(){
        const sql = "SELECT id,name,num FROM articleType";
        const list =await this.app.mysql.query(sql);
        return list;  
    }

    async save(article){
        try{
            const result = await this.app.mysql.insert('article', article);
            return result.affectedRows === 1;
        }catch(err){
            console.log(err);
        }
    }

    async getArticleList(){
        try{
            const sql = "SELECT id,title,detail,author,type,visible,create_time,update_time FROM article WHERE visible = 1";
            const list =await this.app.mysql.query(sql);
            return list;
        }catch(err){
            console.log(err);
        }
    }

    async getUserArticle(user){
        try{
            const sql = "SELECT id,type,detail FROM article WHERE author = ?";
            const list = await this.app.mysql.query(sql,[user]);
            return list;
        }catch(err){
            console.log(err);
        }
    }

    async getAllArticle(){
        try{
            const sql = "SELECT id,title,author,type,visible,create_time,update_time FROM article WHERE type <> ?";
            const list =await this.app.mysql.query(sql,["mood"]);
            return list;
        }catch(err){
            console.log(err);
        }
    }

    async getMyArticle(author){
        try{
            const sql = "SELECT id,title,detail,author,type,visible,create_time,update_time FROM article WHERE author = ?";
            const list =await this.app.mysql.query(sql,[author]);
            return list;
        }catch(err){
            console.log(err);
        }
    }

    async getArticleById(id){
        try{
            const result = await this.app.mysql.get('article', {id : id})
            return result;
        }catch(err){
            console.log(err);
        }
    }

    async updateArticleById(id, data){
        try{
            const options = {
                where:{
                    id: id
                }
            };
            const result = await this.app.mysql.update('article', data, options);
            return result.affectedRows === 1;
        }catch(err){
            console.log(err);
        }
    }

    async getSearchArticleList(searchVal){
        try{
            const param = '%'+searchVal+'%';
            const sql = "SELECT id,title,detail,author,type,visible,create_time,update_time FROM article WHERE title LIKE ?";
            const result =await this.app.mysql.query(sql, [param]);
            return result;
        }catch(err){
            console.log(err);
        }
    }

    async deleteArticleById(id){
        try{
            let result = await this.app.mysql.delete("article",{id: id});
            return result.affectedRows === 1;
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = ArticleService;