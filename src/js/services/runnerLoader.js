angular.module('marathon').factory('runnerLoader', function ($http, $q) {
    function getDateFromString(string, startTime) {
        var time = string.split(':');
        var hours = time[0];
        var minutes = time[1];
        var seconds = time[2];
        return moment(startTime).add(hours, 'hour').add(minutes, 'minute').add(seconds, 'second');
    }

    function getDateFromDayStart(string, startTime) {
        var time = string.split(':');
        var hours = time[0];
        var minutes = time[1];
        var seconds = time[2];
        return moment(startTime).startOf('day').add(hours, 'hour').add(minutes, 'minute').add(seconds, 'second');
    }

    function getSecondsFromString(string) {
        var time = string.split(':');
        if (time.length < 3) return null;
        var hours = time[0];
        var minutes = time[1];
        var seconds = time[2];
        return hours * 3600 + minutes * 60 + seconds;
    }

    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1).toLowerCase();
    }

    function capitalizeFirstLetters(name) {
        if (!name) return;
        name = capitalize(name);
        ['-', '—', ' '].forEach(function (separator) {
            if (name.indexOf(separator) == -1) return;
            name = name.split(separator).map(capitalize).join(separator);
        });
        return name
    }

    function removeSpaces(name) {
        while (name[0] == ' ') {
            name = name.slice(1)
        }
        return name
    }
    function renameTeam(name) {
        var iLoveRunning = /i\s?love\s?running/i;
        var adidasBoost = /adidas\s?boost/i;
        var noComand = /^(нет|лично|[0\s]+)$/i;
        var trilife = /trilife|трилайф/i;
        var BiM = /^\s*бим\s*$/i;
        var nike = /(найк|nike)\s*(\+|плюс|plus)/i;

        if (nike.exec(name)) return 'Nike+';
        if (BiM.exec(name)) return 'БиМ';
        if (trilife.exec(name)) return 'Trilife';
        if (iLoveRunning.exec(name)) return 'I ❤ running';
        if (adidasBoost.exec(name)) return 'Adidas Boost team';
        if (noComand.exec(name)) return '';
        else return name
    }
    return {
        loadRunners: function loadRunners(data) {
            return $q.all(data.map(function (url) {
                return $http.get(url);
            })).then(function (results) {
                var startTime = moment(results[0].data.startTime, 'DD.MM.YYYY HH:mm');
                var fieldNames = results[0].data.meta;
                results.forEach(function (result) {
                    result.data.data.forEach(function (runner) {
                        runner.gender = (result.data.gender == 1) ? 1 : 0;
                    })
                });

                var runners = d3.merge(results.map(function (data) {
                    return data.data.data
                })).map(function (runner) {

                    var realStartTime = runner[fieldNames.indexOf('realStartTime')];
                    realStartTime = (!realStartTime) ? startTime * 1 : getDateFromDayStart(realStartTime, startTime);
                    var processedRunner = {
                        result_steps: [{
                            distance: 0,
                            time: realStartTime * 1
                        }]
                    };

                    fieldNames.forEach(function (field, i) {
                        if (field == String(parseInt(field)) && runner[i]) {
                            processedRunner.result_steps.push({
                                distance: +field,
                                time: getDateFromString(runner[i], startTime) * 1
                            })
                        } else {
                            processedRunner[field] = runner[i]
                        }
                    });
                    if (processedRunner['resultTime'].indexOf(':') < 0) {
                        var result_time_string = 'н/ф';
                        runner.gender = 2;

                    } else {
                        result_time_string = processedRunner['resultTime'];
                        var finishTime = getDateFromString(result_time_string, startTime)
                    }

                    var country = removeSpaces(processedRunner['country']);

                    var city = capitalizeFirstLetters((processedRunner['city']));

                    country = capitalizeFirstLetters(country);
                    if (country != 'Россия') {
                        city += (', ' + country)
                    }
                    var team = renameTeam(processedRunner['team']);
                    return {
                        gender: runner.gender,
                        winner: processedRunner['genderPosition'] < 7,
                        pos: processedRunner['absolutePosition'],
                        gender_pos: processedRunner['genderPosition'],
                        num: processedRunner['number'],
                        full_name: processedRunner['last_name'] + ' ' + processedRunner['first_name'],
                        age: processedRunner['age'],
                        country: country,
                        city: city,
                        team: team,
                        end_time: finishTime * 1,
                        result_time_string: result_time_string,
                        result_time: +getSecondsFromString(result_time_string),
                        result_steps: processedRunner['result_steps'],
                        all_result_steps: null
                    };
                });
                runners.sort(function (a, b) {
                    if (a.gender == 2) return 1;
                    if (b.gender == 2) return -1;
                    return a.end_time - b.end_time;
                });
                var maxTime = d3.extent(runners, function (runner) {
                    return (runner.end_time - startTime) / 1000;
                })[1];
                return {
                    data: {
                        items: runners,
                        start_time: startTime * 1,
                        max_time: maxTime
                    }
                }
            });
        }
    }

});