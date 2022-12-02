const Database = require("./database");
const fs=require('fs');
const express = require('express')
const { Server: SocketServer} = require('socket.io')
const { Server: HttpServer} = require('http')
const messages = require("./messages.json")
const db = new Database;


const MessageContenedorSqlite = require('./src/contenedores/MessageContenedorSqlite')

const messageSqlite = new MessageContenedorSqlite('mensajes');

const productRouter = require('./src/routers/products');

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const httpServer = new HttpServer(app);

const io = new SocketServer(httpServer);



app.use(express.static('public'))


app.use('/api/products', productRouter);



io.on('connection', (socket) => {
    console.log("socket id: ", socket.id);

    socket.emit('products', db.getAll());

    socket.emit('conversation', messageSqlite.getAll('mensajes'));

    socket.on('new-message', async (newMessage)=> {
        console.log({newMessage});
        messageSqlite.save(newMessage)
        const messages =  await messageSqlite.getAll('mensajes');
        console.log("mensajes nuevos", messages)
        io.sockets.emit('conversation', messages);
       

    });

  

    
});





app.get('/', (req, res) => {
    
    
});

app.post('/', (req, res) => {
  console.log(req.body);
  db.save(req.body);
  
  io.sockets.emit('products', db.getAll())

  res.redirect('/');
});


app.get('/productos', (req, res) => {
    res.json(db.getAll());
});




const connectedServer = httpServer.listen(8080, () => {
    console.log(`Servidor Http con Websockets escuchando en el puerto ${connectedServer.address().port}`)
  })
  connectedServer.on('error', error => console.log(`Error en servidor ${error}`))
  
