const express = require('express')
const mongoose = require('mongoose')
var https = require('https')
var assert = require('assert')


const app = express()
const port = 5000


const mongo_url = 'mongodb+srv://denesg:chebu997@cluster0.mcn7j6b.mongodb.net/MyDatabase?retryWrites=true&w=majority'

const { Schema } = mongoose;

const PokemonTypes = new mongoose.Schema({ value: 
    { type: String, enum: ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug',
                           'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic',
                           'Ice', 'Dragon', 'Dark', 'Fairy'] 
                        }});

const pokemonSchema = new Schema({
    "id": {
        type: Number,
        min: 0,
        unique: true},
    "base": {
        "HP": Number,
        "Attack": Number,
        "Defense": Number,
        "Speed": Number,
        "Speed Attack": Number,
        "Speed Defense": Number
    },
    "name": {
        "english": String,
        "japanese": String,
        "chinese": String,
        "french": String
    },
    "type": 
          {type: [String],
           enum: ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug',
                  'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic',
                'Ice', 'Dragon', 'Dark', 'Fairy']  },
    "__v": Number
});


const importData = async (data) => {
    try {
        await pokemonModel.create(data)
        console.log("data succesfully imported")
    }
    catch (error){
        console.log('error', error)
    }
}

const bodyparser = require("body-parser");
const { isBuffer } = require('util')

function pad(num, size) {
    while(num.length < size) num = "0" + num;
    return num;
}

app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.json())
mongoose.connect(mongo_url).then(() => console.log('db connected'))

const pokemonModel = mongoose.model('pokemons', pokemonSchema); 

app.listen(process.env.PORT || port, async () => {
  https.get("https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json", (res) => {
    var chunks = ''
    res.on("data", (chunk) => {
        chunks += chunk
    })
    res.on("end", async () => {
    chunks = JSON.parse(chunks)
    await importData(chunks)

})
  })
  console.log(`Example app listening on port ${port}`)
}
)

app.get('/api/v1/pokemons2', (req, res) => {
    res.send(req.params.String)
    var after = req.query.after
    var count = req.query.count
    console.log(after)
    console.log(count)
    console.log("hello")
  })

app.get('/api/v1/pokemons', (req, res) => {
    if (isNaN(parseInt(req.query.count)) || isNaN(parseInt(req.query.after))) {
        res.json( {msg: "the count and after parameters need to be numbers"} )
        process.exit()
    }
    count = parseInt(req.query.count)
    after = parseInt(req.query.after)
    pokemonModel.find({}).skip(after).limit(count)
      .then(docs => {
        res.json(docs)
      })
      .catch(err => {
        console.error(err)
        res.json({ msg: "db reading .. err.  Check with server devs" })
      })
  })

  app.get('/api/v1/pokemon/:id', (req, res) => {
    pokemonModel.find({ id: req.params.id})
    .then(doc => {
        console.log(doc)
        res.json(doc)})
    .catch(err => {
        console.error(err)
        res.json({ msg: "db reading .. err.  Check with server devs" })
    })

  })

  app.get('/api/v1/pokemonImage/:id', (req, res) => {
    var url = 'https://github.com/fanzeyi/pokemon.json/blob/master/images/'
    const id = pad(req.params.id, 3)
    url = url + id + '.png'
    res.json({msg: url})
  })


app.post('/api/v1/pokemon', (req, res) => {
  pokemonModel.create(req.body, function(err) {
    if(err) console.log(err);
  })

  res.json(req.body)
})


app.put('/api/v1/pokemon/:id', (req, res) => {
    pokemonModel.updateOne({id: req.params.id}, req.body, {upsert: true}, function(err) {
        if(err) console.error(err)
    }) 
    /*pokemonModel.deleteOne({ id: req.params.id }, function (err, result) {
        if (err) console.log(err);
        console.log(result);
    });
    pokemonModel.create(req.body, function(err) {
        if(err) console.log(err);
      }) */
    res.json(req.body)
})

app.patch('/api/v1/pokemon/:id', (req, res) => {
    const {id, ...rest} = req.body
    pokemonModel.updateOne({id: req.params.id}, rest, function(err, res) {
        if (err) console.log(err)
        console.log(res)
    });
    res.send("Updated Succesfully")
    })

app.delete('/api/v1/pokemon/:id', (req, res) => {
    pokemonModel.deleteOne({ id: req.params.id }, function (err, result) {
        if (err) console.log(err);
        console.log(result);
    });
    
    res.send("Deleted successfully?")
    })



