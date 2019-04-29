var express = require('express');
var router = express.Router();
const axios = require('axios');


/* GET users listing. */
router.post('/', function(req, res, next) {

  axios({
      method: 'post',
      url: 'https://www.aplicaciones.bbvafrances.com.ar/PuntosDeVenta/evaluacion',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': req.body.cookies},
      data: req.body.cliente,
      timeout: 10000,
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
    }
  )
  .then(response => {
    
    if(response.data===""){

      axios({
        method: 'get',
        url: 'https://www.aplicaciones.bbvafrances.com.ar/PuntosDeVenta/ofertas',
        headers: {'Cookie': req.body.cookies},       
        timeout: 10000,
      })
      .then(responseGet => {

        var resultado = responseGet.data.indexOf('Productos disponibles')>=0;

        if(!resultado){
          resultado = responseGet.data.indexOf('NO PARTICIPA DE LA ACCIÓN COMERCIAL SOLICITADA')>=0?
            'NO PARTICIPA': 'No determinado';
        }else{
          resultado = 'PARTICIPA DE LA CAMPAÑA'
        }

        res.send({
          error:false,
          mensaje:'Exitoso',
          participa: resultado
        });
      })
      .catch(errorGet=>{
        res.send({
          error:true,
          mensaje:'Ha ocurrido un error'
        });
      });

    }else{
      res.send({
        error:true,
        mensaje:'Ha ocurrido un error'
      });
    }
    
  })
  .catch(error => {

    var mensajes = [];
    
    if(error && error.response && error.response.data){
      for(var p in error.response.data)
        mensajes.push(error.response.data[p]);
    }

    res.send({
      error:true,
      mensaje: mensajes.length>0 ? mensajes.join('. ') : 'Error no detectado'
    });
  });


  
});

module.exports = router;
