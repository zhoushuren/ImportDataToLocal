/**
 * Created by zhoujun on 2017/3/24.
 *
 * 从生产环境读数据到本地数据库
 * 此代码再客户端本地执行
 */

const rp = require('request-promise');
Promise = require('bluebird');
const EventEmitter = require('events');
var MongoClient = require('mongodb').MongoClient
	, assert = require('assert');
// server.js 的服务器url
var url = 'mongodb://127.0.0.1:27017/record';

//这里的Demo是导数据到本地的Mongodb，实际上用什么数据库自行决定。
const  db = MongoClient.connect(url);

function req(id){
	return rp({
		uri:'http://youdomain/',
		qs:{last_id:id},
		json:true
	});
}

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

let isOk = false;
myEmitter.on('query', (id) => {
	req(id).then((r)=>{
		if(r.result){
			setTimeout(function(){
				insertLocal(r);		//异步写本地的数据库
			},0);

			myEmitter.emit('query',r.last_id);	//递归调用
			// process.nextTick(myEmitter.emit('query',r.last_id));
		}else{
			isOk = true;
			console.log('任务完成!')
		}
	})
});
myEmitter.emit('query',0);

//写本地库
function insertLocal(r){
	//这里是组装成自己想要的结构，
	// let data = r.data.map((item)=>{
	// 	let content = JSON.parse(item.content);
	// 	return {
	// 		mysql_id: item.id,
	// 		user_id: item.user_id,
	// 		created_time: item.created_time,
	// 		...content,
	// 		struct: item.struct
	// 	};
	// });
	//console.log(data);
	db.then((dbInstance)=>{
		var collection = dbInstance.collection('record_data');
		return collection.insertMany(data);
	}).then((insertedCount,insertedIds)=>{
		//console.log('insertedCount',insertedCount);
	});

}



