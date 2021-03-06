//Code concernant le format pivot du projet Adomy : l'emploi du temps (pdt)
var Intervention = require('./model/intervention.js');
var fs = require('fs');

function EmploiDuTemps(intervenant) {
    this.intervenant = intervenant;
    this.interventions = [];

    this.pdt = new Array(7);
    for (var i = 0; i < this.pdt.length; i++) {
        this.pdt[i] = new Array(48);
    }

}


//On veut ajouter x booleens au tableau d'emploi du temps
//jour commence � partir de 0 pour lundi
//heure commence � 0 pour 00h00 et incr�mente par demi heure : 0.5 = 00h30
//on suppose que c'est l'heure d�but de l'�v�nement
//Si intervenant est null, on utilise l'intervenant li� � l'instance de classe
EmploiDuTemps.prototype.ajouter = function (day, time, duration, intervenant, place) {
    try {
        if (intervenant === null)
            this.interventions.push(new Intervention(day, time, duration, this.intervenant, place));
        else
            this.interventions.push(new Intervention(day, time, duration, intervenant, place));

    } catch (e) {
        console.log(e);
    }
};

EmploiDuTemps.prototype.enlever = function (day, time, duration, place) {
    for (var i = 0; i < this.interventions.length; i++) {

        if (this.interventions[i].day === day && this.interventions[i].time === time && this.interventions[i].duration === duration && this.interventions[i].place === place) {
            this.interventions.splice(i, 1);
            console.log("Entree retiree");
            return;
        }
    }
    console.log("Entree non trouvee");
};

EmploiDuTemps.prototype.generateBooleanArray = function () {
    if(this.intervenant.includes('Complementaire'))
        return;

    for (var i = 0; i < this.pdt.length; i++) {
        for (var j = 0; j < this.pdt[i].length; j++) {
            this.pdt[i][j] = false;
        }
    }

    var varNextDay = 0;

    for (entry of this.interventions) {
        for (i = 0; i < entry.duration; i++) {
            if (entry.time + i < 48)
                this.pdt[entry.day][entry.time + i] = true;
            else {
                this.pdt[entry.day + 1][varNextDay] = true;
                varNextDay++;
            }

        }
    }
};

EmploiDuTemps.prototype.calculerNombreIntervention = function () {
    return this.interventions.length;
};

EmploiDuTemps.prototype.calculerVolumeHoraire = function () {
    var volumeHoraire = 0;
    for (var i = 0; i< 7; i++) {
        for (var j = 0; j< 48; j++) {
            if (this.pdt[i][j]) {
                volumeHoraire += 0.5;
            }
        }
    }
    return volumeHoraire;
};

EmploiDuTemps.prototype.calculerComplementaire = function () {
    var edt2 = new EmploiDuTemps("Complementaire de " + this.intervenant);
    this.generateBooleanArray();
    for (var i = 0 ; i< 7; i++) {
        for (var j = 0; j< 48; j++) {
            if(this.pdt[i][j])
                edt2.pdt[i][j] = false;
            else
                edt2.pdt[i][j] = true;
        }
    }
    
    return edt2
};

EmploiDuTemps.prototype.calculerUnion = function (edt2) {
    if (edt2 instanceof EmploiDuTemps) {
        var newEdt = new EmploiDuTemps("Union: " + this.intervenant + " et " + edt2.intervenant);
        for (entry of edt2.interventions) {
            newEdt.ajouter(entry.day, entry.time, entry.duration, entry.intervenant, entry.place);
        }

        for (entry of this.interventions) {
            newEdt.ajouter(entry.day, entry.time, entry.duration, entry.intervenant, entry.place);
        }

        return newEdt;
    }
    else
        console.log("Methode Union : veuillez envoyer un objet du type EmploiDuTemps");
};

EmploiDuTemps.prototype.calculerIntersection = function (edt2) {
    if (edt2 instanceof EmploiDuTemps) {
        var newEdt = new EmploiDuTemps("Intersection: " + this.intervenant + " et " + edt2.intervenant);
        this.generateBooleanArray();
        edt2.generateBooleanArray();

        for (var i = 0; i < this.pdt.length; i++) {
            for (var j = 0; j < this.pdt.length; j++) {

                var debutIntersection = [];
                var finIntersection = [];
                if (this.pdt[i][j] && edt2.pdt[i][j]) {
                    debutIntersection.push(i);
                    debutIntersection.push(j);

                    while (this.pdt[i][j] === true && edt2.pdt[i][j] === true) {
                        if (j < 48)
                            j++;
                        else if (i < 7) {
                            i++;
                            j = 0;
                        }
                        else {
                            break;
                        }

                    }
                    finIntersection.push(i);
                    finIntersection.push(j);
                    newEdt.ajouter(debutIntersection[0], debutIntersection[1], this.differenceDuration(debutIntersection, finIntersection), (this.intervenant + ", " + edt2.intervenant), this.getIntervention(debutIntersection[0], debutIntersection[1]).place + " ," + edt2.getIntervention(debutIntersection[0], debutIntersection[1]).place);
                }
            }
        }

        return newEdt;
    }
    else
        console.log("Methode Union : veuillez envoyer un objet du type EmploiDuTemps");
};

EmploiDuTemps.prototype.differenceDuration = function (durDebut, durFin) {
    var compteur = 0;
    if (durFin[1] < durDebut[1] || durFin[0] != durDebut[0]) {
        while (durFin[1] > 0) {
            durFin[1]--;
            compteur++;
        }
        durFin[1] = this.pdt[0].length;
        durFin[0]--;
    }
    else {
        while (durFin[1] != durDebut[1]) {
            durFin[1]--;
            compteur++;
        }
        return compteur;
    }
};

EmploiDuTemps.prototype.getIntervention = function (day, temps) {


    if (this.pdt[day][temps]) {
        for (entry of this.interventions) {
            if (entry.day === day && entry.time === temps)
                return entry;
        }

        while (this.pdt[day][temps]) {
            if (temps > 0)
                temps--;
            else if (day > 0) {
                day--;
                temps = this.pdt[0].length - 1;
            }
            else {
                break;
            }
        }

        if (temps == 47) {
            temps = 0;
            day++;
        }
        else
            temps++;


        for (entry of this.interventions) {
            if (entry.day === day && entry.time === temps)
                return entry;
        }
        //throw new Error('intervention not found');
    }
    else {
        console.log("getIntervention : pas d'intervention � ce moment");
    }
};

EmploiDuTemps.prototype.afficherBoolean = function () {
    this.generateBooleanArray();
    for (var i = 0; i < this.pdt.length; i++) {
        for (var j = 0; j < this.pdt[i].length; j++) {
            process.stdout.write(this.pdt[i][j] + " ");
        }
        console.log("");
    }
};


EmploiDuTemps.prototype.exportCsv = function () {

    var data = new Array(48);
    for(var i = 0 ; i< 48 ; i++)
    {
        data[i] = new Array(7);
        for(var j = 0; j<7; j++)
        {
            data[i][j] = 'vide';
        }
    }


    for (entry of this.interventions) {
            var day = entry.day;
            var time = entry.time;
        
        for (var i = 0; i < entry.duration; i++) {

            data[time][day] =( entry.intervenant + "(" + entry.place + ")");

            time += 1;
            if (time >= 48) {
                time = 0;
                day += 1;
            }
            
        }
    }
    data.map(function (obj) {
        return obj.join(';');
    });


    var intervenant  = this.intervenant;
    fs.writeFile('./' + intervenant+'.csv', '', function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Fichier crée!");
    });

        for(var i =0 ; i<48 ; i++)
        {
            for(var j = 0; j < 7; j++)
            {
               
                fs.appendFileSync('./' + intervenant+'.csv', data[i][j]+';', encoding='utf8'); 

            }
            fs.appendFileSync('./' + intervenant+'.csv', '\r\n', encoding='utf8'); 

        }
   
};


EmploiDuTemps.prototype.exportiCal = function () {
    var iCal = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Adomy Corporation//MonProduit v1.0//FR\n";
    
    for (entry of this.interventions) {
        iCal += "BEGIN:VEVENT\n";
        var min = (entry.time % 2) * 30;
        var heure = Math.floor(entry.time / 2);
        iCal += "DTSTART:XXXXXXX" + entry.day + "T" + heure + min + "00Z\nDTEND:";
        var duration = entry.duration;
        var jour = 0;
        for(var i =0 ; i< entry.duration; i++)
       {
            if(heure < 24)
                heure += 0.5
            else
                heure = 0;
       }

        while (duration >= 48) {
            ++jour;
            duration -= 48;
        }

        
        if(heure%2 === 0 )
           var min2 = '00';
       else
            var min2 = '30';

        var heure2 = Math.floor(heure);
        if(heure2 < 10)
            iCal += "XXXXXXX" + (entry.day + jour) + "T0" + heure2  +  min2 + "00Z\nSUMMARY:NULL\n";
        else
            iCal += "XXXXXXX" + (entry.day + jour) + "T" + heure2  +  min2 + "00Z\nSUMMARY:NULL\n";
        iCal += "DESCRIPTION:" + entry.intervenant + "\n";
        iCal += "LOCATION:" + entry.place + "\nEND:VEVENT\n";
    }

    iCal += "END:VCALENDAR";


    var intervenant  = this.intervenant;
    fs.open('./' + intervenant+'.ics','w', function(err) {
    if(err) {
        return console.log(err);
    }
        fs.writeFile('./' + intervenant+'.ics', iCal, function(err) {
        if(err) {
            return console.log(err);
        }

        }); 

    console.log("Fichier crée!");
    }); 

    return iCal;
};


module.exports = EmploiDuTemps;