var appDemo = {
    ini: function(){

        var objForm = $("form[name='form']");
        var fnCall = function(){
            return $.ajax({
                url: 'p/probando.php',
                data:{
                    text1: $('input[name="text1"]').val(),
                    text2: $('input[name="text2"]').val(),
                    text3: $('input[name="text3"]').val()
                },
                dataType: 'json',
                type: 'post'
            }).done(function( r ){
                return alert( r );
            });
        };

        return appOffline.eventos( objForm , 'submit', fnCall ); 
    }
};

$(document).ready(function(){
    return appDemo.ini();
});