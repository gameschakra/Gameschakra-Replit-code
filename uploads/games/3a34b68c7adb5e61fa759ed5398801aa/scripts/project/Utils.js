export function lerp(x,y,val)
{
	const v = val>1?1:val<0?0:val;
	
	return x + (y-x)*v;
	
}

export function clamp(val,min,max)
{

	return	val < min ? min : (val > max ? max : val);
}

export function max(val1,val2)
{
	return val1>val2?val1:val2;
}