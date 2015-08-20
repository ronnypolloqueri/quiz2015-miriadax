var path = require ('path');


// Postgres DATABASE_URL = postgres://user::paswd@host:port/database
// SQLite DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

var sequelize = new Sequelize( DB_name, user, pwd,
                    {  dialect:  protocol,
                       protocol: protocol,
                       port:     port,
                       host:     host,
                       storage:  storage, // Solo sqlite
                       omitNull: true     // Solo Postgres
                    }
                );

// Importar la definicion de la tabla Quiz en quiz.js
var quiz_path = path.join(__dirname, 'quiz');
var Quiz = sequelize.import(quiz_path);

exports.Quiz = Quiz; // exportar definicion de la tabla Quiz

// sequelize.sync() crea e inicializa tabla de preguntas en BD
sequelize.sync().then(function() {
    // sucess(..) ejecuta el manejador una vez creada la tabla
    Quiz.count().then(function(count) {
        if(count === 0) {
            Quiz.bulkCreate( 
              [ {pregunta: 'Capital de Italia',   respuesta: 'Roma'  , tema: 'geografia'},
                {pregunta: 'Capital de Portugal', respuesta: 'Lisboa', tema: 'geografia'}
              ]
            ).then(function(){console.log('Base de datos inicializada.');});
        }
    });
});

