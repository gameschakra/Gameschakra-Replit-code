let value = 1;

function langreturn() {

	return value;

}


function toggleValue(){
    if(value === 1){
        value = 0;
    } else if(value === 0){
        value = 1;
    }
    
    console.log("Updated Value!", value);
}