
function fieldParser(fields) {
    var searchOptions = {}
    if (fields["Name"] != undefined) {
        searchOptions["$or"] = [
            {
                "Name": {
                    $regex: new RegExp(`^${fields["Name"]}`, "i")
                }
            },
            {
                "Nimi": {
                    $regex: new RegExp(`^${fields["Name"]}`, "i")
                }
            },
            {
                "Namn": {
                    $regex: new RegExp(`^${fields["Name"]}`, "i")
                }
            }
        ];
    }
    if (fields["Adress"] != undefined) {
        searchOptions["$or"] = [
            {
                "Adress": {
                    $regex: new RegExp(`^${fields["Adress"]}`, "i")
                }
            },
            {
                "Osoite": {
                    $regex: new RegExp(`^${fields["Adress"]}`, "i")
                }
            }
        ];
    }

    if (fields["departureStationName"] != undefined) {
        searchOptions["Departure station name"] = {
            $regex: new RegExp(`^${fields["departureStationName"]}`, "i")
        };
    }
    if (fields["returnStationName"] != undefined) {
        searchOptions["Return station name"] = {
            $regex: new RegExp(`^${fields["returnStationName"]}`, "i")
        };
    }
    if (fields["durationMin"] || fields["durationMax"]) {
        searchOptions["Duration (sec)"] = {};

        if (fields["durationMin"]) {
            searchOptions["Duration (sec)"]["$gte"] = parseInt(fields["durationMin"]);
        }

        if (fields["durationMax"]) {
            searchOptions["Duration (sec)"]["$lte"] = parseInt(fields["durationMax"]);
        }
    }
    if (fields["coveredDistanceMin"] || fields["coveredDistanceMax"]) {
        searchOptions["Covered distance (m)"] = {};

        if (fields["coveredDistanceMin"]) {
            searchOptions["Covered distance (m)"]["$gte"] = parseInt(fields["coveredDistanceMin"]);
        }

        if (fields["coveredDistanceMax"]) {
            searchOptions["Covered distance (m)"]["$lte"] = parseInt(fields["coveredDistanceMax"]);
        }
    }

    if (fields["departureStart"] || fields["departureEnd"]) {
        searchOptions["Departure"] = {};
        if (fields["departureStart"]) {
            searchOptions["Departure"]["$gte"] = new Date(fields["departureStart"]);
        }

        if (fields["departureEnd"]) {
            searchOptions["Departure"]["$lte"] = new Date(fields["departureEnd"]);
        }
    }
    if (fields["returnStart"] || fields["returnEnd"]) {
        searchOptions["Return"] = {};
        if (fields["returnStart"]) {
            searchOptions["Departure"]["$gte"] = new Date(fields["returnStart"]);
        }

        if (fields["returnEnd"]) {
            searchOptions["Return"]["$lte"] = new Date(fields["returnEnd"]);
        }
    }
    console.log(searchOptions)
    return searchOptions
}

module.exports = {
    fieldParser
};