import Vector from './Vector.js';
import {ballSize} from './Settings.js';
import {max} from './Utils.js';

export default class MainScene{


	constructor(runtime,level)
	{
		this.runtime = runtime;
		this.minXDistanceBetweenHolders = 250;
		this.holders=[];
		this.level = level;
		
		//update level txt
		const lvlTxt = runtime.objects.GameLevelTxt.getFirstInstance();
		lvlTxt.text = "LEVEL "+level.no;
		
		//get positions for holders
		const pos = this.calculatePositionsForHolders(level.map.length);
		runtime.globalVars.ExpectWidth = pos.expectWidth;
		
		//instiate the holders and balls
		for(let i =0;i<level.map.length;i++)
		{
			const lvlColumn = level.map[i].values;
			const holder = runtime.objects.holder.createInstance(0,0,0);
			const point = pos.positions[i];
			holder.x = point.x;
			holder.y = point.y;
			
			holder.init(lvlColumn.map(l=>{
				
				const ball = runtime.objects.Ball.createInstance(0,0,0);
				ball.width  = ballSize;
				ball.height = ballSize;
				ball.setGroupId(l);
				
				return ball;
			
			}))
			this.holders.push(holder);
		}
		
		this.runtime.globalVars.GameState = "playing";
		
	}
	
	//on click the holder - call by event script
	onClickHolder(holder)
	{
		
		
		if(this.runtime.globalVars.GameState!=="playing")
		return;
	
		//if ball can move then move the ball otherwise toggle the pending
		const pendingHolder = this.holders.find(h=>h.pending);
		
		if(pendingHolder && pendingHolder != holder)
		{
			const topBall = holder.topBall();
			
			if(topBall==null || (pendingHolder.topBall().groupId === topBall.groupId && !holder.isFull()))
			{
				this.moveBallFromOneToAnother(pendingHolder,holder);
			}
			else
			{
			
				
				this.playSound("spray");
				pendingHolder.setPending(false);
				holder.setPending(true);
			}
		}
		else{
			if(holder.balls.length)
			{
				this.playSound("spray");
				holder.setPending(!holder.pending);
			}
		}
	}
	
			//Play sound effect
	playSound(name)
	{
	if(!this.runtime.globalVars.Sound)
	return;
		const ist = this.runtime.objects.SoundEffect.createInstance(0,0,0);
		ist.instVars.Name = name;
		ist.destroy();
	}
	
	checkAndGameOver()
	{
	
	//make sure all balls are same in holder
	const sameBallInHolder = this.holders.every(h=> {
		const balls = h.balls;
		return !balls.length || balls.every(b=>b.groupId == balls[0].groupId);
		});
		
		//make sure same color ball are in one container
	const sameBallInOneContainer = sameBallInHolder && this.holders.filter(h=>h.balls.length).every(h=>{
		
	return	this.holders.filter(h=>h.balls.length).every(hn=>hn==h || hn.balls[0].groupId != h.balls[0].groupId)
	
	});
	
	if(sameBallInHolder && sameBallInOneContainer)
		{
			this.overTheGame();
		}
		
	}
	
	async overTheGame()
	{
		
		this.runtime.globalVars.GameState = "over";
		this.playSound("Correct");

	//particle effect
	for(const color of [[.5,.5,.5],[1,.5,.5],[.5,1,.5],[.5,.5,1]])
	{
		
		for(let i=1;i<8;i++)
		{
			const ist = this.runtime.objects["Particle_"+i].createInstance(1,this.runtime.layout.width/2,this.runtime.layout.height/4);
			ist.colorRgb = color;

		}
	}
		
		
		//update local storage for completed level if needed
		const lastCompletedLevel =  await this.runtime.storage.getItem("LevelProgress_"+this.runtime.globalVars.SelectedLevelGroup);
		
		if(lastCompletedLevel<this.runtime.globalVars.SelectedLevel)
		{
		await this.runtime.storage.setItem("LevelProgress_"+this.runtime.globalVars.SelectedLevelGroup, this.runtime.globalVars.SelectedLevel);
		}
		this.sendEvent("GameOver");
		
	}
	
	//send the event to event sheet
	sendEvent(name)
	{
		const event = this.runtime.objects.SimpleEvent.createInstance(0,0,0);
		event.instVars.Name = name;
		event.destroy();
	}
	
	moveBallFromOneToAnother(fromHolder,toHolder)
	{
		this.playSound("pop_sound_effect");
	
		toHolder.moveBall(fromHolder.removeTopBall());
		this.checkAndGameOver();
	}
	
	update(runtime)
	{
		for(const inst of runtime.objects.Ball.instances())
		{
			inst.update(runtime);
		}
	}
	
	
	//get the positions for holder based on count
	calculatePositionsForHolders(count)
	{
		let expectWidth = 4*this.minXDistanceBetweenHolders;
		const midPoint = new Vector(this.runtime.layout.width/2,this.runtime.layout.height/2)
		if(count<6)
		{
			const minPoint = midPoint.sub(new Vector(1,0).mul(this.minXDistanceBetweenHolders *(count-1)/2)).add(new Vector(0,1).mul(160));
			console.log(minPoint)
			
			expectWidth = max((count+.5)*this.minXDistanceBetweenHolders,expectWidth);
			
			return { positions : [...Array(count).keys()].map( i=>{
			
			return minPoint.add(new Vector(1,0).mul(i*this.minXDistanceBetweenHolders));}),
			expectWidth : expectWidth
			}
		}
		
// 		const aspect = this.runtime.layout.width/this.runtime.layout.height;
		const maxCountInRow = Math.ceil(count/2);
		
		if((maxCountInRow+1)*this.minXDistanceBetweenHolders>expectWidth)
		{
			 expectWidth = max((maxCountInRow + 1) * this.minXDistanceBetweenHolders,this.runtime.layout.width);
		}
		
// 		const height = expectWidth/aspect;
		
		const list = [];
		const topRowMinPoint = midPoint.sub(new Vector(0,1).mul(this.runtime.layout.height/5.5)).sub(new Vector(1,0).mul((maxCountInRow-1)*this.minXDistanceBetweenHolders/2)).add(new Vector(0,1).mul(250));
		
		list.push(...[...Array(maxCountInRow).keys()].map( i=>{
			
			return topRowMinPoint.add(new Vector(1,0).mul(i*this.minXDistanceBetweenHolders));}));
			
				const lowRowMinPoint = midPoint.add(new Vector(0,1).mul(this.runtime.layout.height/4.5)).sub(new Vector(1,0).mul((count - maxCountInRow-1)*this.minXDistanceBetweenHolders/2)).add(new Vector(0,1).mul(250));
		
		console.log(lowRowMinPoint,topRowMinPoint);
		
		list.push(...[...Array(count - maxCountInRow).keys()].map( i=>{
			
			return lowRowMinPoint.add(new Vector(1,0).mul(i*this.minXDistanceBetweenHolders));}));
			
		return {
		positions:list,
		expectWidth:expectWidth
		};
		
	}
}