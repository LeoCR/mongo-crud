const MongoClient=require('mongodb').MongoClient;
const circulationRepo= require('./repos/circulationRepo')
const assert = require("assert");
const data=require('./circulation.json');

const url='mongodb://localhost:27017';
const dbName='circulation';

async function main(){
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();

    try {
        const results= await circulationRepo.loadData(data);
        //console.log(results.insertedCount,results.ops);
        assert.equal(data.length,results.insertedCount);
        
        const getData=await circulationRepo.get();
        assert.equal(data.length,getData.length);

        const filterData=await circulationRepo.get({Newspaper:getData[4].Newspaper});
        assert.deepEqual(filterData[0],getData[4]);
         
        const limitData= await circulationRepo.get({},3);
        assert.equal(limitData.length,3)

        const id =getData[4]._id.toString()
        const byId=await circulationRepo.getById(id);
        assert.deepEqual(byId,getData[4])

        const newItem=  {
            "Newspaper": "Costa Rica News",
            "Daily Circulation, 2004": 213,
            "Daily Circulation, 2013": 123,
            "Change in Daily Circulation, 2004-2013": 2,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 2,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 3,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 1
        };
        const addedItem = await circulationRepo.add(newItem);
        assert(addedItem._id)
        const adddedItemQuery=await circulationRepo.getById(addedItem._id);
        assert.deepEqual(adddedItemQuery,newItem);

        const updatedItem= await circulationRepo.update(addedItem._id,{
            "Newspaper": "Costa Rican News",
            "Daily Circulation, 2004": 2,
            "Daily Circulation, 2013": 43,
            "Change in Daily Circulation, 2004-2013": 4,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 2,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 3,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 1
        });
        assert.equal(updatedItem.Newspaper,"Costa Rican News");
        const newAddedItemQuery=await circulationRepo.getById(addedItem._id);
        assert.equal(newAddedItemQuery.Newspaper,"Costa Rican News");
    
        const removed= await circulationRepo.remove(addedItem._id);
        assert(removed)
        const deletedItem=await circulationRepo.getById(addedItem._id);
        assert.equal(deletedItem,null);

        const avgFinalists=await circulationRepo.averageFinalist();
        console.log(avgFinalists);

        const avgByChange=await circulationRepo.averageFinalistByChange();
        console.log(avgByChange);
        
        
    } catch (error) {
        console.log("An error occurs");
        console.log(error);
        
    }
    finally{
        const admin = client.db(dbName).admin();
        //console.log(await admin.serverStatus());
        await client.db(dbName).dropDatabase();
        console.log(await admin.listDatabases());
        client.close();
    }  
}
main();