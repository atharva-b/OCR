var ocrDemo = {
    CANVAS_WIDTH: 200, 
    TRANSLATED_WIDTH: 20,
    PIXEL_WIDTH: 10, 
    BLUE: '#0000FF',
    data: [],
    isDrawing: false,
    trainArray: [],

   
    drawGrid: function(ctx) {
        for (var x = this.PIXEL_WIDTH, y = this.PIXEL_WIDTH; 
            x < this.CANVAS_WIDTH; x += this.PIXEL_WIDTH, 
            y += this.PIXEL_WIDTH) {
                ctx.strokeStyle = this.BLUE;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.CANVAS_WIDTH);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.CANVAS_WIDTH, y);
                ctx.stroke();
            }
    },


    fillSquare: function(ctx, x, y, reset) {
        var xPixel = Math.floor(x / this.PIXEL_WIDTH);
        var yPixel = Math.floor(y / this.PIXEL_WIDTH);
        this.data[((xPixel - 1)  * this.TRANSLATED_WIDTH + yPixel) - 1] = 1;

        if(!reset)
            ctx.fillStyle = "black";
        else 
            ctx.fillStyle = "white";
        ctx.fillRect(xPixel * this.PIXEL_WIDTH, yPixel * this.PIXEL_WIDTH, 
            this.PIXEL_WIDTH, this.PIXEL_WIDTH);
    },

    train: function() {
        var digitVal = document.getElementById("digit").value;
        if(!digitVal || this.data.indexOf(1) < 0){
            alert("Please type and draw a digit value in order to train the network.");
            return;
        }
        this.trainArray.push({"y0": this.data, "label": parseInt(digitVal)});
        this.trainingRequestCount++;

        if(this.trainingRequestCount == this.BATCH_SIZE){
            alert("sending data to server...");
            var json = {
                trainArray : this.trainArray,
                train: true
            };

            this.sendData(json);
            this.trainingRequestCount = 0;
            this.trainArray = [];
        }
    }, 

    test: function() {
        if(this.data.indexOf(1) < 0){
            alert("please draw a digit in order to test!");
            return;
        }
        var json = {
            image : this.data, 
            predict: true
        };
        this.sendData(json);
    },

    receiveResponse: function(xmlHttp){
        if(xmlHttp.status != 200){
            alert("server returned status " + xmlHttp.status);
            return;
        }
        var responseJSON = JSON.parse(xmlHttp.responseText);
        if(xmlHttp.responseText && responseJSON.type == "test"){
            alert("the neural network predicts you wrote a \'" + responseJSON.result + "\'");
        }
    },

    onError: function(e){
        alert("Error occurred while connecting to server: " + e.target.statusText);
    }, 

    onLoadFunction: function(canvas, ctx){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        this.drawGrid(ctx);
        canvas.addEventListener("mousedown", function(e) {
            onMouseDown(e, ctx, canvas);
        });
        canvas.addEventListener("mousemove", function(e) {
            onMouseMove(e, ctx, canvas);
        });
    
        canvas.addEventListener("mouseup", function(e) {
        onMouseUp(e, canvas);
        });
    },

    resetCanvas : function(){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_WIDTH);
        this.drawGrid(ctx);
    },


    sendData: function(json){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('POST', this.HOST + ":" + this.PORT, false);
        xmlHttp.onload = function() { this.receiveResponse(xmlHttp); }.bind(this);
        xmlHttp.onerror = function() { this.onError(xmlHttp); }.bind(this);
        var msg = JSON.stringify(json);
        xmlHttp.setRequestHeader('Content-length', msg.length);
        xmlHttp.setRequestHeader("Connection", "close");
        xmlHttp.send(msg);
    }
}

onMouseMove = function(e, ctx, canvas) {
    if (!ocrDemo.isDrawing) {
        return;
    }
    ocrDemo.fillSquare(ctx, 
        e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, false);
}

onMouseDown = function(e, ctx, canvas) {
    ocrDemo.isDrawing = true;
    ocrDemo.fillSquare(ctx, 
        e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, false);
}

onMouseUp = function(e) {
    ocrDemo.isDrawing = false;
}