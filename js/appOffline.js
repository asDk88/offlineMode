var appOffline = {
    /* opciones */ 
    relay: 5, //segundos 
    reconect: 3, //segundos 
    connect: true, 
    objTime: null, 
    urlTarget: '[url]', //url target 
    /**/ 

    /**/ 
    objAjaxs:{}, 
    baulEventos:{}, 
    /**/ 

    ini: function(){

        if( $("body > .barraOffline").text() == '' ) 
            $("body").prepend('<div class="barraOffline"></div>');

        appOffline.objTime = setTimeout(function(){
            return appOffline.detecta();
        }, ( appOffline.relay * 1000 ));
    },

    detecta: function(){
        return $.ajax({
            url: appOffline.urlTarget,
            crossDomain: true,
            timeout: 2000,
            error: function(err){
                appOffline.connect = false;
                appOffline.desactiva();
                return appOffline.mensaje();
            }
        }).done(function( r ){
            appOffline.mensaje();
                //$("body .barraOffline").remove();
                
                if( !appOffline.connect ) 
                    $(".barraOffline").show() 
                .removeClass('conectError') 
                .addClass("conectOk") 
                .html("Enviando datos......");
                
                appOffline.llamadaQueue();
                appOffline.liberaEventos();
                appOffline.connect = true;
                return appOffline.ini();
            });
    },

    //maneja la barra del mensaje de des/conectado
    mensaje: function(){

        if( appOffline.connect ) 
            $(".barraOffline").slideUp("slow");
        else
            $(".barraOffline").show() 
        .addClass('conectError') 
        .removeClass('conectOk') 
        .html("Usted se encuentra desconectado");

        return ;
    },

    //desactiva el temporizador 
    desactiva: function(){

        clearInterval( appOffline.objTime );
        appOffline.objTime = setTimeout(function(){
            return appOffline.detecta();
        }, ( appOffline.reconect * 1000 ));
        return ;
    },

    /* Se envia por ajax, si resulta error de status 0, 
    *   se agrega a la cola de envios 
    */
    queue: function( obj, fnOk, fnError ){
        var marca = Date.now();

        var fnErrorQueue = function( error , textStatus, errorThrow ){
            if( error.status == 0 ){
                //index correspondiente a la funcion, en caso de error
                appOffline.objAjaxs[ marca ] = { obj, fnOk, fnError };
                return ;
            }

            if( ( typeof fnError ) == 'function' )
                return fnError();

            return ;
        };

    //si no hay una funcion ok se iniciliza una
    if( (typeof fnOk) != 'function' ){
        fnOk = function( datos ){};
    }

    //si esta conectado se envia por ajax
    if( appOffline.connect ){
            //enviando por ajax
            return $.ajax( obj )
                .done( fnOk )
                .fail( fnErrorQueue );
        }else{
            //agregando a la cola
            appOffline.objAjaxs[ marca ] = { obj, fnOk, fnError };
        }

        return;
    },

    //libera las llamadas que se hayan hecho por ajax
    llamadaQueue: function(){
        return $.each( appOffline.objAjaxs, function( k,v ){
            return $.ajax( v.obj )
            .done( function( d ){
                v.fnOk( d );
                //eliminado datos del ajax que estan en cola
                delete appOffline.objAjaxs[ k ];
                return ;
            })
            .fail( v.fnError );
        });   
    },

    //capturando eventos 
    eventos: function( obj , event, fnCall ){
        obj.off(event);

        obj.on(event + "", function(){
            
            //si no hay coneccion se guarda para luego ser lanzada
            if( !appOffline.connect ){

                obj.off(event); 
                var objLadda = Ladda.create( document.getElementById( obj.attr("id") ) ); 
                var marca = Date.now();
                
                if( !obj.is('disabled') ){
                    obj.attr('disabled','disabled');
                    objLadda.start();
                    appOffline.baulEventos[ marca ] = [ obj, event, fnCall , objLadda ];
                }

                return ;
            }

            if( (typeof fnCall) == 'function')
                fnCall();

            return ;
        });

        return ;
    },

    //libera los eventos
    liberaEventos: function(){
        return $.each( appOffline.baulEventos, function( k,v ){
            if( appOffline.connect ){
                v[2]();
                v[0].removeAttr('disabled');
                v[3].stop();
                v[0].off(v[1]);
                
                v[0].on(v[1], function(){
                    if( (typeof v[2]) == 'function')
                        return v[2]();
                    return ;
                }); 

                delete appOffline.baulEventos[k];
            }

            return ;
        });
    }
};