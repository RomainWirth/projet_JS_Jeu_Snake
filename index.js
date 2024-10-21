window.onload = () => {
    const canvasWidth = 900;
    const canvasHeight = 600;
    let blockSize = 30;
    let context;
    let delay = 100;
    let xCoord = 0;
    let yCoord = 0;
    let snakeye;
    let applebee; 
    let widthInBlocks = canvasWidth/blockSize;
    let heightInBlocks = canvasHeight/blockSize;
    let score;
    let timeOut;
    
    init();
    
    const init = () => {
        let canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);
        context = canvas.getContext('2d');
        snakeye = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]],"right");
        applebee = new Apple([10,10]);
        score = 0;
        refreshCanvas();
    }
    
    const refreshCanvas = () => {
        snakeye.advance();
        if (snakeye.checkCollision()){
            gameOver();
        } else {
            if (snakeye.isEatingApple(applebee)){
                score++;
                snakeye.ateApple = true;
                do {
                    applebee.setNewPosition(); 
                } while(applebee.isOnSnake(snakeye));
            }
            context.clearRect(0,0,canvasWidth,canvasHeight);
            drawScore();
            snakeye.draw();
            applebee.draw();
            timeOut = setTimeout(refreshCanvas,delay);
         }
    }
    
    const gameOver = () => {
        context.save();
        context.font = "bold 70px sans-serif";
        context.fillStyle = "#000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.strokeStyle = "white";
        context.lineWidth = 5;
        let centreX = canvasWidth / 2;
        let centreY = canvasHeight / 2;
        context.strokeText("Game Over", centreX, centreY - 180);
        context.fillText("Game Over", centreX, centreY - 180);
        context.font = "bold 30px sans-serif";
        context.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        context.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        context.restore();
    }
    
    const restart = () => {
        snakeye = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]],"right");
        applebee = new Apple([10,10]);
        score = 0;
        clearTimeout(timeOut);
        refreshCanvas();
    }
    
    const drawScore = () => {
        context.save();
        context.font = "bold 200px sans-serif";
        context.fillStyle = "gray";
        context.textAlign = "center";
        context.textBaseline = "middle";
        let centreX = canvasWidth / 2;
        let centreY = canvasHeight / 2;
        context.fillText(score.toString(), centreX, centreY);
        context.restore();
    }
    
    const drawBlock = (context, position) => {
        let x = position[0]*blockSize;
        let y = position[1]*blockSize;
        context.fillRect(x,y,blockSize,blockSize);
    }
    
    const Snake = (body, direction) => {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        
        this.draw = function(){
            context.save();
            context.fillStyle="#ff0000";
            for (let i=0 ; i < this.body.length ; i++){
                drawBlock(context,this.body[i]);
            }
            context.restore();
        };
        
        this.advance = function(){
            let nextPosition = this.body[0].slice();
            switch(this.direction){
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("invalid direction");
            }
            this.body.unshift(nextPosition);
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
        };
        
        this.setDirection = function(newDirection){
            let allowedDirections;
            switch(this.direction){
                case "left":
                case "right":
                    allowedDirections=["up","down"];
                    break;
                case "down":
                case "up":
                    allowedDirections=["left","right"];
                    break;  
               default:
                    throw("invalid direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };
        
        this.checkCollision = function(){
            let wallCollision = false;
            let snakeCollision = false;
            let head = this.body[0];
            let rest = this.body.slice(1);
            let snakeX = head[0];
            let snakeY = head[1];
            let minX = 0;
            let minY = 0;
            let maxX = widthInBlocks - 1;
            let maxY = heightInBlocks - 1;
            let isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            let isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            
            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
                wallCollision = true;
            
            for (let i=0 ; i<rest.length ; i++){
                if (snakeX === rest[i][0] && snakeY === rest[i][1])
                    snakeCollision = true;
            }
            
            return wallCollision || snakeCollision;        
        };
        
        this.isEatingApple = function(appleToEat){
            let head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else
                return false;
        }
    }
    
    const Apple = (position) => {
        this.position = position;
        
        this.draw = function(){
          context.save();
          context.fillStyle = "#33cc33";
          context.beginPath();
          let radius = blockSize/2;
          let x = this.position[0]*blockSize + radius;
          let y = this.position[1]*blockSize + radius;
          context.arc(x, y, radius, 0, Math.PI*2, true);
          context.fill();
          context.restore();
        };
        
        this.setNewPosition = function(){
            let newX = Math.round(Math.random()*(widthInBlocks-1));
            let newY = Math.round(Math.random()*(heightInBlocks-1));
            this.position = [newX,newY];
        }; 
        
        this.isOnSnake = function(snakeToCheck){
            let isOnSnake = false;
            for (let i=0 ; i < snakeToCheck.body.length ; i++){
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;     
                }
            }
            return isOnSnake;
        };
    }
    
    document.onkeydown = function handleKeyDown(e){
        let key = e.keyCode;
        let newDirection;
        switch(key){
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snakeye.setDirection(newDirection);
    };
}