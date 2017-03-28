/**
 * Created by zhoujun on 2017/3/24.
 * 服务器端代码
 */
const Koa = require('koa');
const mysql = require('mysql');
Promise = require('bluebird');

const app = new Koa();
/*
数据库的配置文件
*/
const  Mysqloptions = {
	user:  process.env.MYSQL_USER || 'root',
	password: process.env.MYSQL_PWD || 'PWD',
	database:  process.env.MYSQL_DB ||'db',
	host:  process.env.MYSQL_HOST ||'127.0.0.1',
	charset: 'utf8mb4',
	connectionLimit : 200
};

var Pool = require("mysql/lib/Pool");
var Connection = require("mysql/lib/Connection");
Promise.promisifyAll([Pool, Connection]);

function createMysqlPool(  ) {
	return mysql.createPool(Mysqloptions);
}
let pool = createMysqlPool();
/*
*这是一个中间价，当请求时去Mysql数据库里查询
*@param last_id  上次请求里列表中的最大id
*@return {data , result,  last_id} data为数据，result 为fasle则同步完成，last_id 为当前列表中的最大id，
*/
app.use(async (ctx,next)=>{
	let last_id = ctx.query.last_id || 0;
	last_id = parseInt(last_id)
	let sql = 'select * from record_data where id > ? order by id asc limit 1000'
	let result = await pool.queryAsync(sql,[last_id]);
	let sqlStr = mysql.format(sql,[last_id]);
	console.log(sqlStr);
	if(result && result.length>0){
		ctx.body = {
			data: result,
			result: true,
			last_id : result[result.length-1].id
		}
		
	}else{
		ctx.body = {
			result: false
		}
	}
});

app.listen(3454);

