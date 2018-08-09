
var groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

function calcCommonElements(arr1, arr2) {
    var score = 0;
    for (var i = 0, len1 = arr1.length; i < len1; i++) {
        for (var j = 0, len2 = arr2.length; j < len2; j++) {
            if (arr1[i] === arr2[j]){
                score = score + 1;
            }
        }
    }
    return score;
}


function calcAdvOrthodromeDistance(longA, longB, latA, latB) {
    var distance;
    var absplattung = 1 / 298.257223563;
    var aequatorradius = 6378.137;
    var f = (latA + latB) / 2;
    var g = (latA - latB) / 2;
    var l = (longA - longB) / 2;
    var s = Math.pow(Math.sin(/* toRadians */ (function (x) { return x * Math.PI / 180; })(g)), 2) * Math.pow(Math.cos(/* toRadians */ (function (x) { return x * Math.PI / 180; })(l)), 2) + Math.pow(Math.cos(/* toRadians */ (function (x) { return x * Math.PI / 180; })(f)), 2) * Math.pow(Math.sin(/* toRadians */ (function (x) { return x * Math.PI / 180; })(l)), 2);
    var c = Math.pow(Math.cos(/* toRadians */ (function (x) { return x * Math.PI / 180; })(g)), 2) * Math.pow(Math.cos(/* toRadians */ (function (x) { return x * Math.PI / 180; })(l)), 2) + Math.pow(Math.sin(/* toRadians */ (function (x) { return x * Math.PI / 180; })(f)), 2) * Math.pow(Math.sin(/* toRadians */ (function (x) { return x * Math.PI / 180; })(l)), 2);
    var w = Math.atan(Math.sqrt(s / c));
    var distanceSimple = 2 * w * aequatorradius;
    var t = Math.sqrt(s * c) / w;
    var h1 = (3 * t - 1) / (2 * c);
    var h2 = (3 * t + 1) / (2 * s);
    distance = distanceSimple * (1 + absplattung * h1 * Math.pow(Math.sin(/* toRadians */ (function (x) { return x * Math.PI / 180; })(f)), 2) * Math.pow(Math.cos(/* toRadians */ (function (x) { return x * Math.PI / 180; })(g)), 2) - absplattung * h2 * Math.pow(Math.cos(/* toRadians */ (function (x) { return x * Math.PI / 180; })(f)), 2) * Math.pow(Math.sin(/* toRadians */ (function (x) { return x * Math.PI / 180; })(g)), 2));
    return distance;
}

function matchAlgo(coaches, founders, config){

    var obligations = Array.from(config.obligations);
    var matches2 = [];

    coaches.forEach(function(coach){
        var match = {coach: coach.name};

        founders.forEach(function(founder){
            var match2 = {"founder":founder[config.identFounder]};
            match2["coach"] = coach[config.identCoach] ;
            var totalScore = 0;

            var obligationCheck = true;

            // Essentiell
            // Sprache und sonstige Obligations
            obligations.forEach(function(obligation){
                if (calcCommonElements(coach[obligation], founder[obligation]) === 0){
                    obligationCheck = false;
                    match2["check"+obligation] = false;
                }else{
                    match2["check"+obligation] = true;
                }
            });

            // Alter überprüfung: Alter vom Coach > Alter vom Gründer
            if (coach[config.alter]<founder[config.alter] ){
                obligationCheck = false;
                match2["checkAlter"] = false;
            }else{
                match2["checkAlter"] = true;
            }

            if (obligationCheck) {

                // Hoch
                match2["erfahrungMatch"] = false;

                //Erfahrung Mapping
                switch (coach.experience) {
                    case config.expCoachLvl[0]:
                        if (founder.experience === config.expFounderLvl[0]) {
                            totalScore = totalScore + config.scoreExperience[0];
                            match2["erfahrungMatch"] = true;
                        }
                        break;
                    case config.expCoachLvl[1]:
                        if (founder.experience === config.expFounderLvl[0]) {
                            totalScore = totalScore + config.scoreExperience[1];
                            match2["erfahrungMatch"] = true;
                        }
                        break;
                    case config.expCoachLvl[2]:
                        if (founder.experience === config.expFounderLvl[1]) {
                            totalScore = totalScore + config.scoreExperience[2];
                            match2["erfahrungMatch"] = true;
                        }
                        break;
                    case config.expCoachLvl[3]:
                        if (founder.experience === config.expFounderLvl[2]) {
                            totalScore = totalScore + config.scoreExperience[3];
                            match2["erfahrungMatch"] = true;
                        }
                        break;
                    default:
                }

                //Thema
                var scoreThema = calcCommonElements(coach[config.thema], founder[config.thema]) * config.scoreThema;
                match2["scoreThema"] = scoreThema;
                totalScore = totalScore + scoreThema;

                // Mittel

                //Priorität
                var scorePrio = (10 - Math.abs(coach[config.prio] - founder[config.prio])) * config.scorePrio;
                match2["scorePrio"] = scorePrio;
                totalScore = totalScore + scorePrio;


                // Distanz
                match2["distanzBonus"] = false;
                if (founder.lat != null && founder.lng != null  && coach.lat != null && coach.lng != null ){
                    if(calcAdvOrthodromeDistance(founder.lng, coach.lng, founder.lat, coach.lat) < 100){
                        totalScore = totalScore + config.scoreDistanzBonus;
                        match2["distanzBonus"] = true;
                    }
                }

                //Niedrig

                // Interessen
                var scoreInteressen = calcCommonElements(coach[config.interessen], founder[config.interessen]) * config.scoreInteressen;
                match2["scoreInteressen"] = scoreInteressen;
                totalScore = totalScore + scoreInteressen;

                match2["profitMatch"] = false;
                //Profit
                switch (coach.profit) {
                    case config.profitCoachLvl[0]:
                        if (founder.profit === config.profitFounderLvl[0]) {
                            totalScore = totalScore + config.scoreProfit[0];
                            match2["profitMatch"] = true;
                        }
                        break;
                    case config.profitCoachLvl[1]:
                        if (founder.experience === config.profitFounderLvl[1]) {
                            totalScore = totalScore + config.scoreProfit[1];
                            match2["profitMatch"] = true;
                        }
                        break;
                    case config.profitCoachLvl[2]:
                        if (founder.experience === config.profitFounderLvl[2]) {
                            totalScore = totalScore + config.scoreProfit[2];
                            match2["profitMatch"] = true;
                        }
                        break;
                    default:

                }
                match2["totalScore"] = totalScore;
            }else{
                match2["erfahrungMatch"] = false;
                match2["scoreThema"] = 0;
                match2["scorePrio"] = 0;
                match2["distanzBonus"] = false;
                match2["scoreInteressen"] = 0;
                match2["profitMatch"] = false;
                match2["totalScore"] = 0;
            }
            matches2.push(match2);
        });
    });

    matches2.sort((a,b) => a.totalScore - b.totalScore);
    matches2.sort(function(obj1, obj2) {
        return obj2.totalScore - obj1.totalScore;
    });
    matches2 = groupBy(matches2, "founder");
    return Object.values(matches2);
}
export { matchAlgo };

