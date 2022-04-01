
const mongoose=require('mongoose');
const campground = require('../models/campground');
const Campground=require('../models/campground')
const cities=require('./cities')
const {places,descriptors}=require('./seedHelpers')
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});


const sample=(array)=>array[Math.floor(Math.random()*array.length)];



const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<200;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'60cdb9e7f0623d1a0c23a33e',//60cdb9e7f0623d1a0c23a33e
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            
            description:'lorem ipsum lorem ipsumlorem ipsum',
            price:price,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude,cities[random1000].latitude ] },
            images:[
                {
                  
                  url: 'https://res.cloudinary.com/ddvzs6j20/image/upload/v1624263710/Yelp_camp/u96hplbskz9jtslzxssl.jpg',
                  filename: 'https://res.cloudinary.com/ddvzs6j20/image/upload/v1624263710/Yelp_camp/u96hplbskz9jtslzxssl.jpg'
                },
                {
                  
                  url: 'https://res.cloudinary.com/ddvzs6j20/image/upload/v1624263720/Yelp_camp/rwk2yitqt3h0zdbmzzzu.jpg',
                  filename: 'https://res.cloudinary.com/ddvzs6j20/image/upload/v1624263720/Yelp_camp/rwk2yitqt3h0zdbmzzzu.jpg'
                }
              ]
            
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})