

class Agent {
    // constructor({ position, velocity, angle, maxVelocity, rotationVel, acceleration, color = "blue" }) {
    constructor(vars){    
        this.position = vars.position;
        this.velocity = vars.velocity
        this.angle = vars.angle
        this.maxVelocity =  vars.maxVelocity
        this.rotationVel = vars.rotationVel
        this.acceleration = vars.acceleration
        this.angleWave = vars.angleWave
        this.size = 15;
        this.color = vars.color;
        this.canvas = vars.canvas
        this.ctx = vars.ctx
        this.distanceBetween =  vars.distanceBetween
    }
      
    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath()
        this.ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        this.ctx.fill()
    }
      
    update() {
        this.draw();


        // this.angleWave += 0.2
        // this.position.x += this.velocity * Math.cos(this.angle) + 2 * Math.sin(this.angleWave)
        // this.position.y += this.velocity * Math.sin(this.angle) + 2 * Math.sin(this.angleWave)

        this.position.x += this.velocity * Math.cos(this.angle)
        this.position.y += this.velocity * Math.sin(this.angle)

        // this.angleWave += Math.random() * 0.2
        // this.position.x += this.velocity * Math.cos(this.angle) + 2 * Math.sin(this.angleWave)
        // this.position.y += this.velocity * Math.sin(this.angle) + 2 * Math.sin(this.angleWave)
        
        // this.position.x += this.velocity * Math.cos(this.angle)
        // this.angle += 0.05
        // this.position.y += Math.sin(this.angle)


        // Detect Side Walls
        if (this.position.x + this.size > this.canvas.width) {
            this.position.x = this.canvas.width - this.size
        }

        if (this.position.x - this.size < 0) {
            this.position.x = this.size
        }


        // Detect top and bottom walls
        if (this.position.y + this.size > this.canvas.height) {
            this.position.y = this.canvas.height -this.size
        }

        if (this.position.y - this.size < 0) {
            this.position.y = this.size
        }
    }

    updateWaves() {
        this.draw();

        if (this.distanceBetween >= 1) {
            this.angleWave += 0.2
        this.position.x += this.velocity * Math.cos(this.angle) + 10 * Math.sin(this.angleWave)
        this.position.y += this.velocity * Math.sin(this.angle) + 10 * Math.sin(this.angleWave)
        } else if (this.distanceBetween < 1) {
            this.position.x += this.velocity * Math.cos(this.angle)
            this.position.y += this.velocity * Math.sin(this.angle)
        }
        

        // this.position.x += this.velocity * Math.cos(this.angle)
        // this.position.y += this.velocity * Math.sin(this.angle)

        // this.angleWave += Math.random() * 0.2
        // this.position.x += this.velocity * Math.cos(this.angle) + 2 * Math.sin(this.angleWave)
        // this.position.y += this.velocity * Math.sin(this.angle) + 2 * Math.sin(this.angleWave)
        
        // this.position.x += this.velocity * Math.cos(this.angle)
        // this.angle += 0.05
        // this.position.y += Math.sin(this.angle)


        // Detect Side Walls
        if (this.position.x + this.size > this.canvas.width) {
            this.position.x = this.canvas.width - this.size
        }

        if (this.position.x - this.size < 0) {
            this.position.x = this.size
        }


        // Detect top and bottom walls
        if (this.position.y + this.size > this.canvas.height) {
            this.position.y = this.canvas.height -this.size
        }

        if (this.position.y - this.size < 0) {
            this.position.y = this.size
        }
    }
  }

class Player {
    constructor(vars) {
        this.position = vars.position;
        this.velocity = vars.velocity
        this.maxVelocity =  vars.maxVelocity
    //   this.minVelocity = minVelocity;
    //   this.maxVelocity = maxVelocity;
    //   this.height = 150;
    //   this.width = 50;
        this.size = 15;
        this.color = vars.color;
        this.canvas = vars.canvas
        this.xpos = vars.xpos
        this.ypos = vars.ypos
        this.ctx = vars.ctx
    }
      
    draw() {
        this.ctx.fillStyle = this.color;
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // ctx.translate(this.position.x, this.position.y)
        this.ctx.beginPath()
        this.ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        this.ctx.fill()
        // ctx.restore()
    }
      
    update() {
        // ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        this.draw();


        // Detect Side Walls
        if (this.position.x + this.size > this.canvas.width) {
            this.position.x = this.canvas.width - this.size
        }

        if (this.position.x - this.size < 0) {
            this.position.x = this.size
        }


        // Detect top and bottom walls
        if (this.position.y + this.size > this.canvas.height) {
            this.position.y = this.canvas.height -this.size
        }

        if (this.position.y - this.size < 0) {
            this.position.y = this.size
        }

    }
  }

// module.exports = Player