var editor = null; 
  
function StartEditor(){ 
	editor = new Editor(); 
}


function Row(){
	this.indices = [];
	this.bits = [];
	this.bitsPrint = [];
	this.value = "-"; 
	this.tag = 0;
	this.implicant = '_';//not an implicant
}


function Editor(){
	
	$("solve").onclick = function(){
		//ON-SET
		var letters = $("function").value.match(/[a-zA-Z]+?[a-zA-Z]*/g);
		if(letters.length == 0){
			editor.printError("inserisci almeno una lettera");
			return;
		}
		
		console.log(letters);
		
		//ON-SET
		var onset = [];
		var val = $("onset").value.match(/\d+?\d*/g);
		
		if(val.length >= 1)
			onset = val;
	
		//OFF-SET
		var offset = [];
		var val = $("offset").value.match(/\d+?\d*/g);
		if(val.length >= 1)
			offset = val;
		
		
		
		//SOLVE
		editor.Solve(letters, onset, offset);
		
	}
	
	
	this.Solve = function(letters, onset, offset){
		
		console.log("ON-SET: "+onset);
		console.log("OFF-SET: "+offset);
		this.implicants = [];
		this.implicantIndex = 1;
		var table1 = [];
		var tableRows = Math.pow(2, letters.length);
		this.spaces = tableRows.toString().length;
		var lettersLength = letters.length;
		console.log("table rows = "+tableRows);
		for(var i = 0; i<  tableRows; i++){
			var row = new Row();
			
			//bits
			var bits = [];
			for(var n = 0; n < lettersLength; n++){
				lval = tableRows / Math.pow(2, n+1);
				lmod = lval * 2;
				bit = Math.floor( (i%lmod) / lval);
				bits.push(bit); 
			}
			row.bits = bits;
			//on-set, off-set, dc-set 
			
			console.log(onset, onset.indexOf(i.toString()));
			console.log(offset, offset.indexOf(i.toString()));
			if(onset.indexOf(i.toString()) != -1)
				row.value = "1";
			else if(offset.indexOf(i.toString()) != -1)
				row.value = "0";
			else
				row.value = "-";
			
			table1.push(row);
		}
		
		console.log("table1", table1);
		
		
		//1) Exact 2 level minimization
		
		//A) sorting table based on true bit ('1')
		var table2 = this.SortTable(table1);
		
		console.log("table2", table2);
		
		var minTables = this.Minimize(table2);
		var coverTable = this.MinCoverage(onset, table1);
		this.printAll(letters, onset, offset, table1, table2, minTables, coverTable);
	}
	
	
	this.SortTable = function(table){
		newTable = [];
		var len = table[0].bits.length;
		console.log(len);
		for(i = 0; i <= len ; i++){
			newTable[i] = [];
		}
		
		for(i = 0; i < table.length; i++){
			var row = table[i]; 
			if(row.value != "0"){
				row.indices.push(i); //indices of this Row;
				var count = ArrayCountOf(row.bits, "1");
				newTable[count].push(row);
			}
		}
		return newTable;
	}
	
	this.Minimize = function(table){
		var tables = [];
		var tab = table;
		var count = 0 ;
		 
		var maxIterations = 50000;
		while(true){ //minimization
			var newTable = [];
			for(var i = 0; i < tab.length-1; i++){
				
				var group1 = tab[i];
				var group2 = tab[i+1]; 
				
				
				var newGroup = [];
				for(var j = 0; j < group1.length; j++){
					var row1 = group1[j];
					for(var k = 0; k < group2.length; k++){
						var row2 = group2[k]; 
						if(this.CheckDontCare(row1.bits, row2.bits)){
							if(this.HemmingDistance(row1.bits, row2.bits) == 1){
								//add 2 rows
								row1.tag = 1;
								row2.tag = 1;
								var b = this.ApplyDontCare(row1.bits, row2.bits);
								if(!this.BitsExists(newGroup, b)){
									var newRow = new Row();
									newRow.indices =  row1.indices.concat(row2.indices);
									newRow.bits = b
									newGroup.push(newRow); 
								}
							} 
						} 
					}
				}
				if(newGroup.length > 0){
					newTable.push(newGroup);
				}
				
			}
				
			//check implicants
			for(var i = 0; i < tab.length; i++){
				var group1 = tab[i]; 
				for(var j = 0; j < group1.length; j++){
					var row = group1[j]; 
					if(!row.tag){
						row.implicant = this.implicantIndex++; //increase general implicant index
						this.implicants.push(row);
					} 
				}
			}
			if(newTable.length > 0)
				tables.push(newTable);
			else
				break;
			

			//set temp table for next iteration
			tab = newTable;
			
			count++;
		}
		return tables;
	}
	
	this.MinCoverage = function(onset, table){
		var tables = [];
		
		var tabM = [];
		var rowsIndices = [];
		for(var i = 0; i< this.implicants.length; i++){
			var imp = this.implicants[i];
			var ind = imp.indices;
			for(var j = 0; j< ind.length; j++){
				var m = ind[j];
				
				if(table[m].value == "1"){
					
					if(!tabM[m]){ //initialize row if not exists
						var ar = [];
						for(var k =0; k< this.implicants.length; k++){
							ar[k] = 0;
						}
						tabM[m] = ar; 
						rowsIndices.push(m);
					}
					//add implicant to m row 
					tabM[m][imp.implicant-1] = 1;
				}
			}
		} 
		tables.push(tabM);
		
		//column dominance
		var tab = [];
		
		
		this.removeEmptyColumns(tabM);
			
		while(true){
			
			break;
			
		}
		
		//row dominance 
		return tabM;
	}
	 
	
	this.removeEmptyColumns = function(table){
		/*
		var first = Object.keys(table)[0]; 
		 console.log("before", table);
		//check column
		for(var c = 0; c < table[first].length; c++){
			
			var check = true;
			for(var row in table){
				if(table[row][c] == 1){
					check = false;
					break;
				}
			}
			if(check){
				console.log("si");
				//remove column
				for(var row in table){
					if(table[row][c] == 1){
						table[row].splice(c, 1);
					}
				} 
			}
		}
		console.log("After", table);
		*/
	}
	
	this.printAll = function(letters, onset, offset, table1, table2, minimTable, coverTable){
	
		$("output").innerHTML = "<h3>True Table</h3> <br />";
		
		//Table1
		for(var i = 0; i < table1.length; i++){
			var row = table1[i];	
			$("output").innerHTML += FixedDigits(i, 2)+" |"+row.bits.toString()+"| "+row.value+ "<br />";
		}
		
		$("output").innerHTML += "<hr /> <h3>1) Exact 2 level minimization</h3> <br />";

		//Table2

		$("output").innerHTML += "<h4>a) Sorting by '1' count</h3> <br />";
		for(var i = 0; i < table2.length; i++){
			var group = table2[i]; 
			for(var j = 0; j < group.length; j++){
				var row = group[j];		 
				if(row.tag)
					implicantString = "&#10003";
				else 
					implicantString = "IMPL"+row.implicant;
				$("output").innerHTML += ArrayFixed(row.indices).toString()+" |"+row.bits.toString()+"| "+implicantString+" <br />";
			}
			$("output").innerHTML += StringRepeat("-", letters.length*2 +row.indices.length*3+3)+"<br />";
			
		}
		
		//minimized tables
		for(var n = 0; n < minimTable.length; n++){
			$("output").innerHTML += "<h4>a) Minimized: iteration "+n+"</h3> <br />";
			var tab = minimTable[n];
			for(var i = 0; i < tab.length; i++){
				var group = tab[i]; 
				for(var j = 0; j < group.length; j++){
					var row = group[j];		 	 
					if(row.tag)
						implicantString = "&#10003";
					else 
						implicantString = "IMPL"+row.implicant;
					
					$("output").innerHTML += ArrayFixed(row.indices).toString()+" |"+row.bits.toString()+"| "+implicantString+" <br />";
				}
				$("output").innerHTML += StringRepeat("-", letters.length*2 +row.indices.length*3 +3)+"<br />";
			}
			$("output").innerHTML += "<hr/>";
		}
		
		
		$("output").innerHTML += "<h3>2)Min, Coverage:</h3> <br />";
		var str = FixedDigits("m")+" |";
		//TODO:  ADD M, and indices
		for(var k =0; k<this.implicants.length; k++){
			str += FixedDigits(this.implicants[k].implicant)+"|";
		}
		$("output").innerHTML += str+"<br />";
		$("output").innerHTML += StringRepeat("-", this.implicants.length * (this.spaces +1) +4)+"<br />";
		
		for(var i = 0; i < coverTable.length; i++){ 
			var row = coverTable[i];
			if(row == undefined) continue; 
			
			var str = FixedDigits(i, 2)+" |";
			
			for(var j = 0; j < row.length; j++){
				if(row[j] == 1){
					str += FixedDigits("1")+"|";
				}else{
					str += FixedDigits(" ")+"|";
				}
			}
			
			$("output").innerHTML += str+"<br />";
		
		}
		
	}
	
	this.printError = function(error){
		//TODO: display in document
		console.error(error);
	}
	
	this.HemmingDistance = function(bits1, bits2){
		var dist = 0;
		for(var i = 0; i < bits1.length; i++){ 
			if(bits1[i] != bits2[i])
				dist++;
		}
		return dist;		
	}
	
	this.ApplyDontCare = function (bits1, bits2){
		var arr = [];
		for(var i = 0; i < bits1.length; i++){ 
			if(bits1[i] != bits2[i])
				arr.push("-");
			else
				arr.push(bits1[i]);
		} 
		return arr;
	}

	this.CheckDontCare = function (bits1, bits2){
		var arr = [];
		for(var i = 0; i < bits1.length; i++){ 
			if(bits1[i] == "-")
				if(bits2[i] != bits1[i])
					return false;
		}
		return true;
	}
	
	this.BitsExists = function(array, bits){
		for(var i = 0; i< array.length; i++){
			if(array[i].bits.toString() === bits.toString())
				return true;
		}
		return false;
	}
	
}