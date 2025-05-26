const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./serviceAccountKey.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", function(req, res){
    db.collection("Agendamentos").get().then((snapshot)=>{
        const post = snapshot.docs.map(doc =>{
            return{
                id: doc.id,
                ...doc.data()
            }
        })
        res.render('consulta', {post:post})
        console.log(post)
    }) 
})

app.get("/editar/:id", function(req, res){
    db.collection("Agendamentos").doc(req.params.id).get().then((doc)=>{
        res.render('editar', { 
            post: {
                id: doc.id, 
                ...doc.data()
             }
        })
    })
})

app.get("/excluir/:id", function(req, res){
    const id = req.params.id;

    db.collection("Agendamentos").doc(id).delete()
        .then(() => {
            res.redirect("/consulta");
        })
        .catch((error) => {
            res.send("Erro ao excluir o agendamento.");
        })
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('Agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar/:id", function(req, res){
    const id = req.params.id;
    const dadosAtualizados = {
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }

    db.collection("Agendamentos").doc(id).update(dadosAtualizados)
        .then(() => {
            res.redirect("/consulta");
        })
        .catch((error) => {
            res.send("Erro ao atualizar.");
        })
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})