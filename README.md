## Clocks ##
**counting down**

[Demo](http://misha-panyushkin.github.io/clocks.js/) is presented at [http://misha-panyushkin.github.io/clocks.js/](http://misha-panyushkin.github.io/clocks.js/)

To create a new **clocks** just find the container and apply count method to the element(s). Simply container is single DOM element, but it could be a set of elements. The clocks instance'll be added to each one.

    var clocks = $("#clocks").countDown(int);

> `int` - the time to count it down in milliseconds.

## API ##

Benefit is structure.



1. `.fill(int);`
2. `.getTime();`
3. `.resume();`
4. `.start([int]);`
5. `.stop([int]);`


###simply are:###

1. Stop current count if it's running & filling out the clocks instance with new time;
2. Return remain time to go; 
3. Resume counting if it has been stopped before;
4. Start new count in case `int` is pointed out or simply resume previous;
5. Stop current count & fill it with new value if needed.