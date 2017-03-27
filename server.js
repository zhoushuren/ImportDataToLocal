/**
 * Created by zhoujun on 2017/3/24.
 */
const Koa = require('koa');
const mysql = require('mysql');
Promise = require('bluebird');

const app = new Koa();

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

