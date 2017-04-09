
// VueJS Instance
var vm = new Vue({
  el: '#app',
  data: {
    drawingboard: {
      width: 800,
      height: 500,
      posX: 0,
      poxY: 0
    },
    mousePosition: {
      x: 0,
      y: 0
    },
    drawState: {
      speed: 0,
      x: 0,
      y: 0
    },
    isDrawing: false,
    counter: 0,
    drawInterval: 50,
    navBar: {
      width: '0',
      openWidth: '200px',
      isOpen: false,
      links: [
        {ref: '#', title: 'Home', isActive: true},
        {ref: '#', title: 'About', isActive: false},
        {ref: '#', title: 'Contacts', isActive: false}
      ]
    }
  },
  methods: {

    // Draws in canvas while mouse is clicked
    startDrawing: function(){

      var vm = this;

      this.isDrawing = true;

      // Begins a new path in canvas. This allows user to create any number of paths by clicking and releasing mouse buttons
      drawingContext.beginPath();

      this.updateDrawState();

      // Stars line in mouse position
      drawingContext.moveTo(this.drawState.x, this.drawState.y);

      // Send desired state to robot server and makes robot lower pen to touch drawing board
      this.setRobotState({
        speed: 320,
        x: vm.drawState.x,
        y: vm.drawState.y,
        z: 0
      });

      // Starts <drawTimer>, which draws a line according to the mouse position every <this.drawInterval> miliseconds
      drawTimer = setInterval(function(){

        vm.updateDrawState();

        // Draws line that ends in mouse position
        drawingContext.lineTo(vm.drawState.x, vm.drawState.y);
        drawingContext.stroke();

        // Send desired state to robot server
        vm.setRobotState(vm.drawState);

      }, this.drawInterval);
    },

    // Called to stop <drawTimer> from executing
    stopDrawing: function(){

      if (!this.isDrawing) return;

      clearInterval(drawTimer);

      // Makes robot lift pen from drawing board
      vm.setRobotState({
        speed: 320,
        x: vm.drawState.x,
        y: vm.drawState.y,
        z: 20
      });

      this.isDrawing = false;

    },

    // Called to clear drawing board
    clearBoard: function(){
      drawingContext.clearRect(0, 0, canvas.width, canvas.height);
    },

    // Updates mouse position coordinates
    updateCoordinates: function(event){
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
    },

    // Switches Navigation Bar state from open to close or vice-versa
    switchNavBar: function(){
      return this.navBar.isOpen ? this.closeNavBar() : this.openNavBar();
    },

    // Opens Navigation Bar
    openNavBar: function(){
      this.navBar.width = this.navBar.openWidth;
      return this.navBar.isOpen = true;
    },

    // Closes Navigation Bar
    closeNavBar: function(){
      this.navBar.width = '0';
      return this.navBar.isOpen = false;
    },

    // Calculates to which position robot should go
    updateDrawState: function(){

      oldX = this.drawState.x;
      oldY = this.drawState.y;

      newX = this.mousePosition.x - drawingCanvas.getBoundingClientRect().left;
      newY = this.mousePosition.y - drawingCanvas.getBoundingClientRect().top;

      this.drawState = {
        speed: Math.round( Math.sqrt( Math.pow(newX - oldX, 2) + Math.pow(newY - oldY, 2) ) , 0),
        x: newX,
        y: newY,
        z: 0
      };
    },

    // Sends instruction to robot server
    setRobotState: function(state){
      console.log('begin');
      var http = new XMLHttpRequest();

      http.open("POST", "http://localhost:8080/", true);

      http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

      // Send data as JSON
      http.send(JSON.stringify(state));

      // Done
      http.onloadend = function () {
        console.log('end');
      };
    }

  },
  mounted: function(){

    // Canvas rectangle properties
    //var drawingBoardRect = document.getElementById("canvas").getBoundingClientRect();

    //this.drawingboard.posX = drawingBoardRect.left;
    //this.drawingboard.posY = drawingBoardRect.top;
  }
});

// Timer object
var drawTimer = null;

// Canvas object
var drawingCanvas = document.getElementById("canvas");

// Canvas drawing object
var drawingContext = drawingCanvas.getContext("2d");
