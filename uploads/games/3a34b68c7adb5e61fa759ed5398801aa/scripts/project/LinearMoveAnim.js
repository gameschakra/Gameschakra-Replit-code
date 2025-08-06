import {clamp} from './Utils.js';

class LinearMoveAnim{

	constructor(speed,updateCallback,finishCallback)
	{
		this.normalized = 0;
		this.speed = speed;
		this.finished = false;
		this.updateCallback = updateCallback;
		this.finishCallback = finishCallback;
	}

	update(dt)
	{
		
		if(this.finished)
		return;
		
		this.normalized  = clamp(this.normalized+dt*this.speed,0,1);

if(this.updateCallback)
		{
			this.updateCallback(this.normalized);
		}
		
		if(this.normalized>=1 )
		{
			this.finished = true;
			if(this.finishCallback)
			this.finishCallback()
		}
		
	}

}

