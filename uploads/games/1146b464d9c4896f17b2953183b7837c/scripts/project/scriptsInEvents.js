

export let boundBoxes = [];


export function rand(start,end)
{
	return Math.floor(Math.random()*(end-start)) + start;
}

export function lerp(x,y,val)
{
	const v = val>1?1:val<0?0:val;
	
	return x + (y-x)*v;
	
}


const scriptsInEvents = {

		async Egame_Event1_Act1(runtime, localVars)
		{
			//Get All Obstacles and Bound Boxes to Spwan Randomly later
			const obstacles = Array.from(runtime.objects.Obstacles.instances());
			const bounds = Array.from(runtime.objects.BoundBox.instances());
			
			
			boundBoxes = bounds.map(b=> {
				return {
					height:b.height,
					obstacles: obstacles.filter(obs=> obs.x<=b.width/2 + b.x && obs.x>= b.x-b.width/2 && obs.y<=b.height/2 + b.y && obs.y>= b.y-b.height/2).map(obs=>{
					return {
						relX: obs.x - b.x,
						relY:obs.y - b.y,
						obstacle :obs
					};
					
					}
					)
				};
			});
			
		},

		async Egame_Event2_Act1(runtime, localVars)
		{
			//Create Random Obstacles and Destroy Earlier as Camera Move
			
			const cam = runtime.objects.Camera.getFirstInstance()
			
			if(cam.y-runtime.layout.height<runtime.globalVars.LastObstacleY)
			{
				runtime.callFunction("CreateObstacles");
			}
			runtime.callFunction("CleanUpObstaclesIfCan");
			
		},

		async Egame_Event2_Act2(runtime, localVars)
		{
			//Camera Follow The Player
			
			const camera = runtime.objects.Camera.getFirstInstance();
			const player = runtime.objects.Player.getFirstInstance();
			
			if(!player)
			return;
			
			if(player.y<camera.y)
			{
				camera.y = lerp(camera.y,player.y,4*runtime.dt);
			}
			
			
		},

		async Egame_Event2_Act3(runtime, localVars)
		{
			const activeObjects = Array.from(runtime.objects.Obstacles.instances()).filter(ist=>ist.layer.index==1);
			
			const rotateObjects = activeObjects.filter(ist=>ist.instVars && ist.instVars.AngularSpeed);
			rotateObjects.forEach(ist=>ist.angle +=ist.instVars.AngularSpeed*runtime.dt);
			
			const sinMoveObjects = activeObjects.filter(ist=>ist.instVars && ist.instVars.Movement&&ist.instVars.Movement == "Sin");
			
			sinMoveObjects.forEach(ist=>{
				ist.instVars.CurrentTime = (ist.instVars.CurrentTime + runtime.dt > ist.instVars.Duration) ? ist.instVars.CurrentTime + runtime.dt - ist.instVars.Duration : ist.instVars.CurrentTime + runtime.dt;
				
				if(ist.instVars.StartX < 0)
				{
					ist.instVars.StartX = ist.x;
				}
				
				ist.x = ist.instVars.StartX + Math.sin(2*Math.PI*ist.instVars.CurrentTime/ist.instVars.Duration)*ist.instVars.Amplitude;
				
			});
			
			
		},

		async Egame_Event4_Act1(runtime, localVars)
		{
			//add new obstacles
			
			const count = rand(3,5);
			
			
			
			
			
			
			for(let i=0;i<count;i++)
			{
				const box = boundBoxes[rand(0,boundBoxes.length)];
				const y = runtime.globalVars.LastObstacleY - box.height/2;
				const x = runtime.layout.width/2;
				box.obstacles.forEach(obs=>{
				const ist = obs.obstacle.objectType.createInstance(1,x + obs.relX,y+obs.relY);
				ist.angle = obs.obstacle.angle;
				ist.width = obs.obstacle.width;
				ist.height = obs.obstacle.height;
				ist.colorRgb = obs.obstacle.colorRgb;
			
				if(obs.obstacle.instVars)
				{
				for(const [key,val] of Object.entries(obs.obstacle.instVars))
				{
					ist.instVars[key] = val;
				}
				
				
				}
			});
			
			// 	const bTest = runtime.objects.BoundBox.createInstance(0,x,y);
			// 	bTest.width = box.width;
			// 	bTest.height = box.height;
			// 	bTest.opacity = 0.1;
				runtime.globalVars.LastObstacleY =runtime.globalVars.LastObstacleY-box.height; 
			}	
		},

		async Egame_Event5_Act1(runtime, localVars)
		{
			//destroy earlier objects
			const cam = runtime.objects.Camera.getFirstInstance();
			
			Array.from(runtime.objects.Obstacles.instances()).filter(item=>
			item.layer.index == 1 &&
			item.y>cam.y+runtime.layout.height).forEach(item=>item.destroy());
			
			
		},

		async Egame_Event14_Act2(runtime, localVars)
		{
			const player = runtime.objects.Player.getFirstInstance();
			
			if(!player)
			return;
			
			const incScore = Math.floor((runtime.globalVars.LastScoreY - player.y)*runtime.globalVars.ScoreRate);
			runtime.globalVars.Score += incScore;
			runtime.globalVars.LastScoreY -= incScore/runtime.globalVars.ScoreRate;
			
			
		}

};

self.C3.ScriptsInEvents = scriptsInEvents;

