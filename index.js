/**
 * Created by zhoujun on 2017/3/24.
 *
 * 从生产环境读数据到本地数据库
 */

const rp = require('request-promise');
Promise = require('bluebird');

var MongoClient = require('mongodb').MongoClient
	, assert = require('assert');

var url = 'mongodb://127.0.0.1:27017/record';

const  db = MongoClient.connect(url);

function req(id){
	return rp({
		uri:'http://youdomain/',
		qs:{last_id:id},
		json:true
	});
}

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

let isOk = false;
myEmitter.on('query', (id) => {
	req(id).then((r)=>{
		if(r.result){
			setTimeout(function(){
				insertLocal(r);		//异步写本地的数据库
			},0);

			myEmitter.emit('query',r.last_id);
			// process.nextTick(forLoops, i+=1);
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



