const { response, request } = require('express');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const connection = require('./database/database.js');
const Pergunta = require('./database/Pergunta.js');
const Resposta = require('./database/Resposta.js');

// Database
connection
    .authenticate()
    .then(()=>{
        console.log("Conexão feita com o banco de dados!")
    })
    .catch((e)=>{
        console.log(e)
    })

// Estou dizendo para o Express usar o EJS como View Engine
app.set('view engine','ejs');
app.use(express.static('public'));

// Body Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Rotas
app.get('/', (request,response)=>{
    Pergunta.findAll({ raw: true , order:[
        ['id','DESC']
    ]}).then(pergunta => {
        response.render("index", {
            perguntas: pergunta
        });
    });
})

app.get("/perguntar", (request, response)=>{
    return response.render("perguntar");
})

app.post("/salvarpergunta", (request, response)=>{
    const titulo = request.body.titulo;
    const descricao = request.body.descricao;

    Pergunta.create({
    titulo: titulo,
    descricao: descricao
    }).then(()=>{
        response.redirect("/");
    })
})

app.get("/pergunta/:id", (request, response)=> {
    const id = request.params.id;

    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta=>{
        if(pergunta != undefined){
            Resposta.findAll({
                where: {perguntaId: pergunta.id},
                order:[
                    ["id","DESC"]
                ]
            }).then(respostas=>{
                response.render("pergunta", {
                    pergunta: pergunta,
                    respostas: respostas
            })
            })
        }else{
            response.redirect("/");
        }
    });
})

app.post("/responder", (request, response)=>{
    const corpo = request.body.corpo;
    const perguntaId = request.body.pergunta;

    Resposta.create({
    corpo: corpo,
    perguntaId: perguntaId
    }).then(()=>{
        response.redirect(`/pergunta/${perguntaId}`);
    })
})


app.listen(3333);