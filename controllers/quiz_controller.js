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
  if (req.query.search !== undefined){      // Preguntas por búsqueda
    models.Quiz.findAll( { 
        where: ["pregunta like ?", "%" + req.query.search + "%"]
      } 
    ).then(function(quizes) {
        var msg = (quizes.length === 0 ? 'No hay preguntas que coincidan con su búsqueda.':'');
        res.render('quizes/index.ejs', { quizes: quizes, msg: msg});
      }
    ).catch(function(error) { next(error);});
  } else if (req.query.tema !== undefined){ // Preguntas de un tema específico
    models.Quiz.findAll( {
        where: ["tema = ?", req.query.tema ]
      } 
    ).then(function(quizes) {
        var msg = (quizes.length === 0 ? 'No hay preguntas para el tema seleccionado.':'');
        res.render('quizes/index.ejs', { quizes: quizes, msg: msg});
      }
    ).catch(function(error) { next(error);});
  } else {                                  // Muestra todas las preguntas
    models.Quiz.findAll().then(function(quizes) {
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

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        console.log("Error aqui");
        res.render('quizes/new', {quiz: quiz, errors: err.errors });
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({ fields: ["pregunta", "respuesta", "tema"] })
               // fields: permitira filtrar añadidos por hackers
        .then( function(){ res.redirect('/quizes'); }); 
               // res: Redirección HTTP (URL relativo) Lista de preguntas
      }  // else
    } // function(err)
  ); // then
};

// GET quizes/:id/edit
exports.edit = function(req, res) {
    var quiz = req.quiz; // autoload de instancia de quiz

    res.render('quizes/edit', {quiz: quiz});
};

// PUT quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema      = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz});
      } else {
          req.quiz  // save: guarda  cmapos pregunta y respuesta en BD
          .save({ fields: ["pregunta", "respuesta", "tema"] })
          .then( function(){ res.redirect('/quizes'); });
                 // Redirección HTTP a lista de preguntas (URL relativo)
      } // if-else
    } // function
  ); // then
};

// DELETE quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function(){
      res.redirect('/quizes');
  }).catch( function(error){next(error);} );
};
