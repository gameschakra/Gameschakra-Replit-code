import Vector from './Vector.js';
import {ballSize} from './Settings.js';


export default class Holder extends ISpriteInstance{

	
	constructor()
	{
		super();
		this.expand = false;
		this.maxBalls = 4;
		this.pending = false;
		this.pendingBall = null;
		this.balls = [];
	}
	
	topBall()
	{
		return this.balls.length ? this.balls[this.balls.length-1] : null;
	}
	
	isFull()
	{
		return this.balls.length >= this.maxBalls;
	}
	
	pendingPoint()
	{
		return new Vector(this.getImagePointX("PendingPoint"),this.getImagePointY("PendingPoint"));
	}
	
	print(str)
	{
		console.log(str);
	}
	
	tap()
	{
		this.setPending(!this.pending);
		console.log("tap"+this.pending);
	}
	
	init(balls)
	{
		this.balls = balls;
		
		for(let i=0;i<this.balls.length;i++)
		{
			const ball = this.balls[i];
			ball.x = this.getBallPosition(i).x;
			ball.y = this.getBallPosition(i).y;
		}
	}
	
	moveBall(ball)
	{
		if(this.pending)
		{
			this.setPending(false);
		}
		
		this.balls.push(ball);
		ball.movePath([this.pendingPoint().add(new Vector(0,0.1)),this.getBallPosition(this.balls.length-	1)]);
		
	}
	
	removeTopBall()
	{
		if(this.balls.length == 0)
		return;
		
		const ball = this.balls[this.balls.length-1];
		this.balls.splice(this.balls.length-1,1)
		this.pendingBall = null;
		
		this.pending = false;
		
		return ball;
		
	}
	
	getBallPosition(index)
	{
		return new Vector(this.x,this.y - (index +0.5)*ballSize);
	}
	
	setPending(pending)
	{
		if(this.pending === pending)
		return;
		
		if(this.balls.length ===0)
			{
			this.pending = false;
			return;
			}
			
			if(pending)
			{
				this.pendingBall = this.balls[this.balls.length-1];
				this.pendingBall.moveTo(this.pendingPoint());
			}
			else if(this.pendingBall)
			{
				this.pendingBall.moveTo(this.getBallPosition(this.balls.length-1));
				this.pendingBall = null;
			}
		
		this.pending = pending;
		
	}
	

}