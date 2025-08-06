import Holder from './Holder.js';
import Ball from './Ball.js';
import MainScene from './MainScene.js';


export let scene = null;
export let levelGroups = []; //all level groups


export let level = null;

export let currentLevelTiles = []; //cache level tiles


export let levelProgresses = [];
export let levelGroupNames = ["easy","normal","hard"];//n
// Put any global functions etc. here
 //level progress for each group

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	runtime.objects.holder.setInstanceClass(Holder);
	runtime.objects.Ball.setInstanceClass(Ball);
	runtime.getLayout("Game").addEventListener("beforelayoutstart",()=>{
		scene = (new MainScene(runtime,level));
	
	});
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
	
});


export function LoadGame(runtime,lvl)
{
	level= lvl;
	runtime.goToLayout("Game");

}

export function LoadMenu(runtime)
{
	scene = null;
	runtime.goToLayout("Menu");
}

async function OnBeforeProjectStart(runtime)
{
// 	const levelGroups = [];
	//load level groups
	for(const name of levelGroupNames)
	{
		const url = await runtime.assets.getProjectFileUrl(name+".json");
		const response = await fetch(url);
		const fetchedText = await response.text();
		levelGroups.push(JSON.parse(fetchedText));
		
	}
	console.log(levelGroups);
// 	setLevelGroups(levelGroups);

	runtime.addEventListener("tick", () => Tick(runtime));
}

function Tick(runtime)
{
	if(scene)
	{
		scene.update(runtime);
	}
}

// export function setLevelGroups(groups)
// {
// 	levelGroups.splice(0,levelGroups.length);
// 	levelGroups.push(...groups);
// 	console.log(levelGroups);
// }

export function setLevelProgresses(progresses)
{
	levelProgresses = progresses;
}

export function setLevel(l)
{
	level = l;
}


