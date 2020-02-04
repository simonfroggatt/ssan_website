(function( ) {  // Define an anonymous function.  No name means no global symbols

    var vars = {
      test: 'test'
    }

    var root = this
    /*
     * Constructor
     */
    this.construct = function(options){
        $.extend(vars , options)
        console.log(vars)
    };

    this.construct(options);

})( );
