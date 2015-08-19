angular.module('marathon').controller('MarathonController', function ($scope, $rootScope, $http, $q, $translate, $parse, $timeout, $location, numberDeclension, multifilter, ageGroups) {
    function changeLanguage() {
        $rootScope.location = document.location.href;
        var lang = ($rootScope.location.indexOf('/ru/') > -1) ? 'ru' : 'en';
        $rootScope.language = lang;
        $translate.use(lang);
    }

    changeLanguage();
    $rootScope.$on('$locationChangeSuccess', changeLanguage);

    $(window).on('resize', function () {
        $scope.$emit('renderRequired');
    });

    function getDateFromString(string, startTime) {
        var time = string.split(':');
        var hours = time[0];
        var minutes = time[1];
        var seconds = time[2];
        return moment(startTime).add(hours, 'hour').add(minutes, 'minute').add(seconds, 'second');
    }

    function getSecondsFromString(string) {
        var time = string.split(':');
        if (time.length < 3) return null;
        var hours = time[0];
        var minutes = time[1];
        var seconds = time[2];
        return hours * 3600 + minutes * 60 + seconds;
    }

    function loadRunners(data) {
        return $q.all(data.map(function (url) {
            return $http.get(url);
        })).then(function (results) {
            var startTime = moment(results[0].data.startTime, 'DD.MM.YYYY HH:mm');
            var fieldNames = results[0].data.meta;
            results.forEach(function (result) {
                result.data.data.forEach(function (runner) {
                    runner.gender = result.data.gender
                })
            });

            var runners = d3.merge(results.map(function (data) {
                return data.data.data
            })).map(function (runner) {
                var processedRunner = {result_steps: [{distance: 0, time: startTime + 500}]};
                fieldNames.forEach(function (field, i) {
                    if (field == String(parseInt(field))) {
                        processedRunner.result_steps.push({distance: +field, time: getDateFromString(runner[i], startTime) * 1})
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
                var city = processedRunner['city'];
                if (city) {
                    city = capitalize(city);
                    ['-', '—', ' '].forEach(function (separator) {
                        if (city.indexOf(separator) == -1) return;
                        city = city.split(separator).map(capitalize).join(separator);
                    });
                }
                return {
                    gender: runner.gender,
                    winner: processedRunner['position'] < 7,
                    gender_pos: processedRunner['position'],
                    num: processedRunner['number'],
                    full_name: processedRunner['lastName'] + ' ' + processedRunner['firstName'],
                    age: processedRunner['age'],
                    country: processedRunner['country'],
                    city: city,
                    team: processedRunner['team'],
                    end_time: finishTime * 1,
                    result_time_string: result_time_string,
                    result_time: +getSecondsFromString(result_time_string),
                    result_steps: processedRunner['result_steps']
                };
            });
            runners.sort(function (a, b) {
                if (a.gender == 2) return 1;
                if (b.gender == 2) return -1;
                return a.end_time - b.end_time;
            });
            runners.forEach(function (runner, i) {
                if (runner.gender == 2) return;
                if (runners[i - 1] && runners[i - 1].result_time_string == runner.result_time_string) {
                    runner.pos = runners[i - 1].pos;
                } else {
                    runner.pos = i + 1
                }
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

    $scope.externalData = {
        track: {
            '10km': $http.get('data/geo/mm2015_17may-10km-geo.json'),
            '21km': $http.get('data/geo/mm2015_17may-21km-geo.json')
        },
        runners: {
            '10km': loadRunners([
                '../../../protocols/2015/half_run/10km-men.json',
                '../../../protocols/2015/half_run/10km-women.json'
            ]),
            '21km': loadRunners([
                '../../../protocols/2015/half_run/21km-men.json',
                '../../../protocols/2015/half_run/21km-women.json'])
        }
    };

    $scope.$watch('currentTrackName', function (name) {
        $rootScope.$broadcast('showCover:map');
        $timeout(function () {
            $scope.selectedTrack = $scope.externalData.track[name];
            $scope.selectedRunnersData = $scope.externalData.runners[name];

            $scope.selectedRunners = [];
            $scope.filteredRunners = null;
            $scope.filterValues = {};
            $scope.states.winnersInTable = true;
            delete $scope.states.activatingWinners
        });
    });
    $scope.selectedRunnersWatch = function (z) {
        if (!z) return false;
        return z.some(function (runner) {
            return runner.full_name == 'wat'
        });
    };
    $scope.$watch(function () {
        if (!$scope.selectedRunners) return;
        if ($scope.selectedRunnersWatch($scope.selectedRunners)) {
            console.log('waaat')
        }
    });
    $scope.clearFilters = function () {
        Object.keys($scope.filterValues).forEach(function (key) {
            if (key == 'gender') return;
            delete $scope.filterValues[key];
        })
    };

    $scope.limit = 100;
    $scope.filterValues = {};
    $scope.filterGender = {
        model: 'filterValues.gender',
        filterClass: 'gender-filter'
    };
    $scope.filters = {
        age: {
            model: 'filterValues.ageGroup',
            filterClass: 'age-group-filter'
        },
        team: {
            model: 'filterValues.team',
            filterClass: 'team-filter'
        },
        city: {
            model: 'filterValues.city',
            filterClass: 'city-filter'
        }
    };
    $scope.selectedRunners = [];
    $scope.storage = {};

    $scope.states = {
        winnersInTable: true
    };
    $scope.showWinners = function () {
        if (!$scope.states.winnersInTable) {
            $scope.states.activatingWinners = true;
            $scope.filterValues = {};
            $timeout(function () {
                $scope.states.activatingWinners = false;
            })
        }
        $scope.states.winnersInTable = !$scope.states.winnersInTable;
    };

    function updateLimit() {
        if (!$scope.filteredRunnersForTable) return;
        $scope.limitedFilteredRunners = $scope.filteredRunnersForTable.slice(0, $scope.limit);
    }

    var othersTeam = '"TEAMS_OTHER" | translate';

    function teamSort(counts) {
        var keys = Object.keys(counts);
        keys.sort(function (a, b) {
            if (a == othersTeam) return 1;
            if (b == othersTeam) return -1;
            return counts[b] - counts[a];
        });
        return keys;
    }

    function countSort(counts) {
        var keys = Object.keys(counts);
        keys.sort(function (a, b) {
            return counts[b] - counts[a];
        });
        return keys;
    }

    function nameSort(counts) {
        var keys = Object.keys(counts);
        keys.sort();
        return keys;
    }

    function formatItems(filteredItems, key, sort) {
        var names = _.pluck(filteredItems, key);
        var counts = _.countBy(names);
        var keys = Object.keys(counts);
        if (sort) {
            keys = sort(counts);
        }
        var result = {};
        var filter = {};
        keys.forEach(function (item) {
            filter[key] = item;
            var count = multifilter(filteredItems, filter).length;
            var name = item;
            if (-1 != name.indexOf('|')) {
                name = $parse(name)($scope);
            }
            result[item] = name + '<span class="dropdown-filter__count">' + count + '</span>';
        });
        return result;
    }

    function filterRunners() {
        var runners = $scope.runnersData.items;
        var query = $scope.storage.search;
        if (angular.isString(query) && query.length) {
            var searchRunners = runners;
            Object.keys($scope.filterValues).forEach(function (key) {
                if (key == 'gender') return;
                delete $scope.filterValues[key]
            });
            if (angular.isDefined($scope.filterValues.gender)) {
                searchRunners = multifilter(searchRunners, $scope.filterValues)
            }
            $scope.filteredRunnersForTable = searchRunners.filter(function (runner) {
                var q = query.toLowerCase();

                function found(where) {
                    return where.toLowerCase().indexOf(q) > -1;
                }

                return [
                    runner.full_name,
                    runner.num.toString()
                ].some(found);
            });
        } else {
            $scope.filteredRunnersForTable = multifilter(runners, $scope.filterValues);
        }
        $scope.filteredRunners = $scope.filteredRunnersForTable.filter(function (runner) {
            return runner.gender != 2
        });
        updateLimit();
        $scope.$emit('renderRequired');
    }

    function prefilter(key) {
        if (!$scope.runnersData) return;
        var filters = angular.copy($scope.filterValues);
        delete filters[key];
        return multifilter($scope.runnersData.items, filters);
    }

    $scope.$watch('selectedRunnersData', function (selectedRunnersData) {
        if (!selectedRunnersData) return;
        selectedRunnersData.then(function (data) {
            data = $scope.runnersData = data.data;
            var timePercent = 0.2;
            if ($scope.time) {
                timePercent = ($scope.time.current - $scope.time.start ) / ($scope.time.maxTime * 1000)
            }

            $scope.time = {
                start: moment(data.start_time),
                current: moment(data.start_time + timePercent * data.max_time * 1000),
                maxTime: data.max_time
            };

            var currentYear = new Date(data.start_time).getFullYear();
            $scope.winnersForTable = [];
            var runners = data.items;
            runners.forEach(function (runner) {
                if (!runner.age) {
                    runner.age = currentYear - runner.birthyear;
                }
                runner.ageGroup = ageGroups.small.filter(function (group) {
                    return group.start <= runner.age && runner.age <= group.end;
                })[0].label;
                runner.ageGroupForSnake = ageGroups.big.filter(function (group) {
                    return group.start <= runner.age && runner.age <= group.end;
                })[0].label;
                runner.winner = (runner.gender_pos && runner.gender_pos < 7);
                if (runner.winner) {
                    $scope.winnersForTable.push(runner)
                }
                if (runner.gender_pos == 1) {
                    if (runner.full_name == 'wat') {
                        debugger
                    }
                    $scope.selectedRunners.push(runner);
                }
            });
        });
    });

    $scope.$watch('storage.search', function () {
        if (!$scope.runnersData) return;
        $scope.states.winnersInTable = false;
        filterRunners()
    });

    $scope.$watch('runnersData', function (runnersData) {
        if (!runnersData) return;

        runnersData.items.forEach(function (runner) {
            if (runner.team == String(parseInt(runner.team))) {
                runner.team += ' '
            }
        });

        var smallTeams = _.countBy(runnersData.items, 'team');
        smallTeams = Object.keys(smallTeams).filter(function (team) {
            return smallTeams[team] < 3;
        });
        runnersData.items.forEach(function (runner) {
            if (!angular.isDefined(runner.realTeam)) {
                runner.realTeam = runner.team;
            }
            if (-1 != smallTeams.indexOf(runner.team) || runner.team == '')
                runner.team = othersTeam;
        });
        updateFilters();
    });
    $rootScope.$on('$translateChangeSuccess', function () {
        updateFilters();
    });

    function translate(word) {
        return $parse("'" + word + "'" + " | translate")($scope);
    }

    function updateFilters() {
        if (!$scope.runnersData) return;
        if (Object.keys($scope.filterValues).filter(function (key) {
                return $scope.filterValues[key] != null;
            }).length > 0 && $scope.states.activatingWinners === false) {
            $scope.states.winnersInTable = false;
        }
        $scope.limit = 100;
        filterRunners();

        $scope.filterGender.values = {
            0: '<span class="gender-filter__item-female">' + translate('WOMEN') + '</span>',
            1: '<span class="gender-filter__item-male">' + translate('MEN') + '</span>'
        };
        $scope.filterGender.allValues = '<span class="gender-filter__item-all">' + translate('ALL_RUNNERS') + '</span>';

        var prefilteredTeams = prefilter('team');
        $scope.filters.team.values = formatItems(prefilteredTeams, 'team', teamSort);
        var teamCount = Object.keys($scope.filters.team.values);
        $scope.filters.team.allValues = (teamCount.length - 1) + ' ' + numberDeclension(teamCount.length - 1, translate('TEAMS_DECLENSION'));

        var prefilteredCities = prefilter('city');
        $scope.filters.city.values = formatItems(prefilteredCities, 'city', countSort);
        var cityCount = Object.keys($scope.filters.city.values);
        $scope.filters.city.allValues = cityCount.length + ' ' + numberDeclension(cityCount.length, translate('CITIES_DECLENSION'));

        var prefilteredAgeGroups = prefilter('ageGroup');
        $scope.filters.age.values = formatItems(prefilteredAgeGroups, 'ageGroup', nameSort);
        var minMaxAges = d3.extent(prefilteredAgeGroups, function (runner) {
            return runner.age;
        });
        var maxAge = minMaxAges[1];
        if (minMaxAges[0] == minMaxAges[1]) minMaxAges.shift();
        minMaxAges = translate('ALL') + ': ' + minMaxAges.join('–') + ' ' + numberDeclension(maxAge, translate('YEAR_DECLENSION'));
        $scope.filters.age.allValues = minMaxAges;
    }

    $scope.$watch('filterValues', updateFilters, true);
    $scope.$watch('limit', updateLimit)
});

