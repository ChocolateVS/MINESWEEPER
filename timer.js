//TIMER
var Stopwatch = function(elem, options) {

    var timer = createTimer(),
        offset,
        clock,
        interval;

    timer.className = "timer";
    timer.id = "timer";

    let seconds;
    let minutes;

    function createTimer() {
        return document.createElement("span");
    }

    // default options
    options = options || {};
    options.delay = options.delay || 0;
    
  
    // initialize
    reset();

    // public API
    this.start  = start;
    this.stop   = stop;
    this.reset  = reset;
    this.get = get;
    
    function get() {
        return timer;
    }
  
    function start() {
      if (!interval) {
        offset   = Date.now();
        interval = setInterval(update, options.delay);
      }
    }
  
    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  
    function reset() {
      seconds = 0;
      minutes = 0;
      clock = 0;
      render();
    }
  
    function update() {
      clock += delta();
      render();
    }
  
    function render() {
        seconds = Math.floor(clock/1000) % 60;
        minutes = Math.floor(clock/1000/60);
        let s = seconds;
        let m = minutes;
        if (seconds < 10) s = "0" + seconds;
        if (minutes < 10) m = "0" + minutes;
        timer.innerHTML = m + ":" + s;  
    }
  
    function delta() {
      var now = Date.now(),
          d   = now - offset;
      offset = now;
      return d;
    }
  
  };