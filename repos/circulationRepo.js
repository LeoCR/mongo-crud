const {MongoClient,ObjectID}=require('mongodb'); 
const url='mongodb://localhost:27017';
const dbName='circulation';
function circulationRepo(){
    function averageFinalistByChange(){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                console.log('averageFinalistByChange');
                
                await client.connect();
                const db = client.db(dbName);
                const average = await db.collection('newspapers')
                .aggregate([
                    {
                        $project:{
                            "Newspaper":1,
                            "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                            "Change in Daily Circulation, 2004-2013":1,
                            overallChange:{
                                $cond:{
                                    if:{
                                        $gte:["$Change in Daily Circulation, 2004-2013",0]
                                    },
                                    then:"positive",
                                    else:"negative"
                                }
                            }
                        }
                    },
                    {
                        $group:{
                            _id:"$overallChange",
                            avgFinalists:{
                                $avg:"$Pulitzer Prize Winners and Finalists, 1990-2014"
                            }
                        }
                    }
                ]).toArray();
                resolve(average);
                client.close();
            } catch (error) {
                reject(error);
            }
        }) 
    }
    function averageFinalist(){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                console.log('averageFinalist');
                
                await client.connect();
                const db = client.db(dbName);
                const average = await db.collection('newspapers')
                .aggregate([{
                    $group:{
                        _id:null,
                        avgFinalists:{
                            $avg:"$Pulitzer Prize Winners and Finalists, 1990-2014"
                        }
                    }
                }]).toArray();
                resolve(average[0].avgFinalists);
                client.close();
            } catch (error) {
                reject(error);
            }
        }) 
    }
    function remove(id){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                console.log('Remove');
                
                await client.connect();
                const db = client.db(dbName);
                 
                const removed= await db.collection('newspapers').deleteOne({
                    _id:ObjectID(id)
                })
                console.log('removed.deletedCount');
                console.log(removed.deletedCount);
                
                resolve(removed.deletedCount===1);
                client.close();
            } catch (error) {
                reject(error);
            }
        }) 
    }
    function update(id,newItem){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                console.log('Update');
                
                await client.connect();
                const db = client.db(dbName);
                 
                const updatedItem=await db.collection('newspapers').findOneAndReplace({
                    _id:ObjectID(id)
                },newItem,{returnOriginal:false})
                console.log('updatedItem.value');
                console.log(updatedItem.value);
                
                resolve(updatedItem.value);
                client.close();
            } catch (error) {
                reject(error);
            }
        })  
    }
    function add(item){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                console.log('Add');
                
                await client.connect();
                const db = client.db(dbName);
                const addedItem =await db.collection('newspapers').insertOne(item)
                console.log(addedItem.ops);
                resolve(addedItem.ops[0]);
                client.close();
            } catch (error) {
                reject(error);
            }
        })
    }
    function getById(id){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                console.log('getById');
                
                await client.connect();
                const db = client.db(dbName);

                let item=await db.collection('newspapers').findOne({_id:ObjectID(id)});
                console.log('item');
                console.log(item);
                resolve(item)
                client.close();
            } catch (error) {
                reject(error);
            }
        })
    }
    function get(query,limit){
        return new Promise(async (resolve,reject)=>{
            const client = new MongoClient(url);
            try {
                await client.connect();
                console.log('Get');
                
                const db = client.db(dbName);

                let items= db.collection('newspapers').find(query);

                if(limit>0){
                    items=items.limit(limit);
                }
                resolve(await items.toArray())
                 
                client.close();
            } catch (error) {
                reject(error);
            }
        })
    }
    function loadData(data){
        return new Promise(async (resolve,reject)=>{
            const client=new MongoClient(url,{ useUnifiedTopology: true });
            try {
                await client.connect();
                const db = client.db(dbName)

                const results= await db.collection('newspapers').insertMany(data);
                resolve(results);
                client.close();
            } catch (error) {
                reject(error)
            }
        })   
    }
    return {
        loadData,get,getById,add,update,remove,averageFinalist,averageFinalistByChange
    }
}

module.exports=circulationRepo();