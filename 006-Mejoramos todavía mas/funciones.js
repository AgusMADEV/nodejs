function stringToMod360(input) {
	 let sum = 0;
	 for (let char of input) {
		  sum += char.charCodeAt(0); // Get ASCII value and add to sum
	 }
	 return sum % 360; // Modulo to keep within 0-360 range
}
