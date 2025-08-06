
function rand(start,end)
{
	return Math.floor(Math.random()*(end-start)) + start;
}

function lerp(x,y,val)
{
	const v = val>1?1:val<0?0:val;
	
	return x + (y-x)*v;
	
}