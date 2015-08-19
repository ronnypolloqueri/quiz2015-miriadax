var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function(quiz) {
      if (quiz) {
          req.quiz = quiz;
          next();
      } else { 
          next(new Error('No existe quizId=' + quizId));
      }
    }
  ).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
  if (req.query.search === undefined){
    models.Quiz.findAll().then(function(quizes) {
        res.render('quizes/index.ejs', { quizes: quizes});
      }
    ).catch(function(error) { next(error);});
  } else {
    models.Quiz.findAll( {
        where: ["pregunta like ?", "%" + req.query.search + "%"]
      } 
    ).then(function(quizes) {
        res.render('quizes/index.ejs', { quizes: quizes});
      }
    ).catch(function(error) { next(error);});
  }
};

// GET /quizes/:id
exports.show = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    res.render('quizes/show', { quiz: quiz});
  });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    if (req.query.respuesta === quiz.respuesta) {
      res.render('quizes/answer', 
                 { quiz: quiz, respuesta: 'Correcto' });
    } else {
      res.render('quizes/answer', 
                 { quiz: quiz, respuesta: 'Incorrecto'});
    }
  });
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz
      { pregunta: "Pregunta", respuesta: "Respuesta" }
  );

  res.render('quizes/new', { quiz: quiz });
};

// guarda en la DB los campos pregunta y respuesta de quiz
exports.create = function(req, res) {
     var quiz = models.Quiz.build( req.body.quiz );
     // !!! Fields  nos permitira filtrar 
     //     añadidos por hackers
     quiz.save({fields: ["pregunta", "respuesta"]}).then( function(){
         res.redirect('/quizes');
     }); // Redirección HTTP (URL relativo) Lista de preguntas
 };
