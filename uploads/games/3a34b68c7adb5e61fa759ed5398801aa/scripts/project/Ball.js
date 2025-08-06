import Vector from './Vector.js';
import LerpAnim from './LerpAnim.js';

export default class Ball extends ISpriteInstance{
	
	
	constructor()
	{
		super();
		this.groupId = 0;
	}
	
	setGroupId(id)
	{
		this.groupId = id;
		this.setAnimation("Ball_"+id,"beginning");
	}
	
	update(runtime)
	{
		if(this.anim)
		{
			this.anim.update(runtime.dt);
		}
	}
	
	
	moveTo(target,finished)
	{
	
	const startPoint = new Vector(this.x,this.y);
		this.anim = new LerpAnim(8,0,1.5,n=>{
			const point = Vector.lerp(startPoint,target,n);
			this.x = point.x;
			this.y = point.y;
		},()=>{
			if(finished)
			{
				finished();
			}
		});
	}
	
	
	movePath(targets)
	{		
		
		this.moveTo(targets[0],()=>{
			if(targets.length>1)
			{
				targets.splice(0,1);
				this.movePath(targets);
			}
		});
	}
	
}


