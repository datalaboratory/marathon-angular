var app = angular.module('marathon', ['dataLab']);

app.controller('MarathonController', function ($scope, $http, numberDeclension, multifilter) {
    $scope.externalData = {
        track: {
            10: $http.get('data/geo/mm2015_17may-10km-geo.json'),
            21: $http.get('data/geo/mm2015_17may-21km-geo.json')
        },
        runners: {
            10: $http.get('data/runners/data10.json'),
            21: $http.get('data/runners/data21.json')
        }
    };

    $scope.$watch('currentTrackName', function (name) {
        $scope.selectedTrack = $scope.externalData.track[name];
        $scope.selectedRunnersData = $scope.externalData.runners[name];

        $scope.selectedRunners = [];
    });

    $scope.generateGradient = function (beginColor, endColor, stepsCount) {
        return d3.scale.linear()
            .domain([1, stepsCount])
            .range([beginColor, endColor])
            .clamp(true)
            .interpolate(d3.interpolateHcl);
    };
    $scope.genderGradients = [
        $scope.generateGradient('#FFCBD5', '#EE2046', 5),
        $scope.generateGradient('#B8E8FF', '#1D56DF', 5)
    ];
    $scope.grayGradient = $scope.generateGradient('#EEEEEE', '#777777', 5);
    $scope.genderWords = [
        ['женщинa', 'женщины', 'женщин'],
        ['мужчинa', 'мужчины', 'мужчин']
    ];
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

    function updateLimit() {
        $scope.limitedFilteredRunners = $scope.filteredRunners.slice(0, $scope.limit);
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
        if (sort) {
            var keys = sort(counts);
            var newCounts = {};
            keys.forEach(function (key) {
                newCounts[key] = counts[key];
            });
            counts = newCounts;
        }
        var result = {};
        var filter = {};
        Object.keys(counts).forEach(function (item) {
            filter[key] = item;
            var count = multifilter(filteredItems, filter).length;
            result[item] = item + '<span class="dropdown-filter__count">' + count + '</span>';
        });
        return result;
    }
    var ageGroups = [
        {
            start: 15,
            end: 19,
            label: '15-19'
        }, {
            start: 20,
            end: 22,
            label: '20-22'
        }, {
            start: 23,
            end: 34,
            label: '23-34'
        }, {
            start: 35,
            end: 39,
            label: '35-39'
        }, {
            start: 40,
            end: 44,
            label: '40-44'
        }, {
            start: 45,
            end: 49,
            label: '45-49'
        }, {
            start: 50,
            end: 54,
            label: '50-54'
        }, {
            start: 55,
            end: 59,
            label: '55-59'
        }, {
            start: 60,
            end: 64,
            label: '60-64'
        }, {
            start: 65,
            end: 90,
            label: '65+'
        }
    ];
    var ageGroupsForSnake = [
        {
            start: 15,
            end: 22,
            label: '16-22'
        }, {
            start: 23,
            end: 34,
            label: '23-34'
        }, {
            start: 35,
            end: 49,
            label: '35-49'
        }, {
            start: 50,
            end: 65,
            label: '50-65'
        }, {
            start: 65,
            end: 90,
            label: '65+'
        }
    ];
    var ageGroupStarts = _.pluck(ageGroupsForSnake, 'start');
    ageGroupStarts.shift();
    $scope.colorNumberScale = d3.scale.threshold()
        .domain(ageGroupStarts)
        .range(d3.range(1, 6));

    $scope.$watch('selectedRunnersData', function (runnersData) {
        runnersData.then(function (data) {
            $scope.runnersData = data.data;
            $scope.time = {
                start: moment($scope.runnersData.start_time),
                current: moment($scope.runnersData.start_time + 0.2 * $scope.runnersData.max_time * 1000),
                maxTime: $scope.runnersData.max_time
            };
            var runners = $scope.runnersData.items;
            function filter() {
                $scope.filteredRunners = multifilter(runners, $scope.filterValues);
                updateLimit();
            }
            function prefilter(key) {
                var filters = angular.copy($scope.filterValues);
                delete filters[key];
                return multifilter(runners, filters);
            }

            var currentYear = new Date($scope.runnersData.start_time).getFullYear();
            runners.forEach(function (runner, i) {
                runner.id = i;
                runner.age = currentYear - runner.birthyear;
                runner.ageGroup = ageGroups.filter(function (group) {
                    return group.start <= runner.age && runner.age <= group.end;
                })[0].label;
                runner.ageGroupForSnake = ageGroupsForSnake.filter(function (group) {
                    return group.start <= runner.age && runner.age <= group.end;
                })[0].label;
                runner.winner = (runner.gender_pos && runner.gender_pos < 7);
            });


            $scope.$watch('filterValues', function () {
                filter();
                $scope.filterGender.values = {
                    0: '<span class="gender-filter__item-female">женщин</span>',
                    1: '<span class="gender-filter__item-male">мужчин</span>'
                };
                $scope.filterGender.allValues = '<span class="gender-filter__item-all">всех вместе</span>';

                var prefilteredTeams = prefilter('team');
                $scope.filters.team.values = formatItems(prefilteredTeams, 'team', countSort);
                var teamCount = Object.keys($scope.filters.team.values);
                $scope.filters.team.allValues = teamCount.length + ' ' + numberDeclension(teamCount.length, ['команда', 'команды', 'команд']);

                var prefilteredCities = prefilter('city');
                $scope.filters.city.values = formatItems(prefilteredCities, 'city', countSort);
                var cityCount = Object.keys($scope.filters.city.values);
                $scope.filters.city.allValues = cityCount.length + ' ' + numberDeclension(cityCount.length, ['город', 'города', 'городов']);

                var prefilteredAgeGroups = prefilter('ageGroup');
                $scope.filters.age.values = formatItems(prefilteredAgeGroups, 'ageGroup', nameSort);
                var minMaxAges = d3.extent(prefilteredAgeGroups, function (runner) {
                    return runner.age;
                });
                minMaxAges = 'все от ' + minMaxAges.join(' до ');
                $scope.filters.age.allValues = minMaxAges;
            }, true);
            $scope.$watch('limit', updateLimit)
        });
    });
});

