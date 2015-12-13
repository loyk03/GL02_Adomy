

if(require.main === module){
	// We're running as a cli app
	
	/*var csv = require('./lib/csv');
	console.log(csv.parseFile(__dirname + '/test/data/sample.csv'));*/

	var ical = require('./lib/ical_Parser');
	//Sconsole.log(ical.parseFile(__dirname + '/test/data/sample.iCal'));

    var EmploiDuTemps = require('./lib/emploi_du_temps');
	var edt = new EmploiDuTemps("Michel");

	edt.ajouter(0,46,5,"Mark","Jardiland");
	edt.ajouter(1,0,3,null,"UTT");


	var data = edt.exportCsv();





}else{
	// We're being used as a library !
	// Then we should expose our API
	// module.exports = ...;
}//test
