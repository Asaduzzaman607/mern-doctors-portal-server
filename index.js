const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hia2w.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("doctorsPortal").collection("appointments");
  // perform actions on the collection object
  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    appointmentsCollection.insertOne(appointment)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
});

app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    console.log(date.date)
    appointmentsCollection.find({date: date.date})
        .toArray((err, documents) => {
            res.send(documents)
        })
});

app.post('/addDoctor', (req, res)=>{
    const file = req.files;
    const name = req.body.name;
    const email = req.body.email;
    console.log(name, email,file)
    file.mv(`${__dirname}/doctors/${file.name}`, err => {
        if(err){
            console.log(err);
            return res.status(500).send({msg: 'failed to upload image'})
        }

        return res.send({name: file.name, path: `/${file.name}`})
    })
})


});

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

app.listen(process.env.PORT || port)