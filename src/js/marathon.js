angular.module('marathon').controller('MarathonController', function ($scope, $rootScope, $http, $translate, $q, numberDeclension, multifilter) {
    $scope.setLanguage = function (lang) {
        $translate.use(lang);
    };

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
        $scope.filteredRunners = null;
        $scope.filterValues = {};
    });

    $scope.clearFilters = function () {
        Object.keys($scope.filterValues).forEach(function (key) {
            if (key == 'gender') return;
            $scope.filterValues[key] = null;
        })
    };

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
    $scope.storage = {};

    $scope.states = {
        winnersInTable: false
    };
    var activatingWinners;
    $scope.showWinners = function () {
        if (!$scope.states.winnersInTable) {
            activatingWinners = true;
            $scope.filterValues = {};
        }
        $scope.states.winnersInTable = !$scope.states.winnersInTable;
    };

    function updateLimit() {
        if (!$scope.filteredRunners) return;
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

    function applyFilters() {
        var runners = $scope.runnersData.items;
        var query = $scope.storage.search;
        if (angular.isString(query) && query.length) {
            $scope.filteredRunners = runners.filter(function (runner) {
                var q = query.toLowerCase();

                function found(where) {
                    return where.toLowerCase().indexOf(q) > -1;
                }

                return [
                    runner.full_name,
                    runner.num.toString(),
                    String(runner.pos)
                ].some(found);
            });
        } else {
            $scope.filteredRunners = multifilter(runners, $scope.filterValues);
        }
        updateLimit();
    }

    function prefilter(key) {
        if (!$scope.runnersData) return;
        var filters = angular.copy($scope.filterValues);
        delete filters[key];
        return multifilter($scope.runnersData.items, filters);
    }

    $scope.$watch('selectedRunnersData', function (selectedRunnersData) {
        selectedRunnersData.then(function (data) {
            data = $scope.runnersData = data.data;

            $scope.time = {
                start: moment(data.start_time),
                current: moment(data.start_time + 0.2 * data.max_time * 1000),
                maxTime: data.max_time
            };

            var currentYear = new Date(data.start_time).getFullYear();
            $scope.winnersForTable = [];
            var runners = data.items;
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
                if (runner.winner) {
                    $scope.winnersForTable.push(runner)
                }
            });
        });
    });

    $scope.$watch('storage.search', function () {
        if (!$scope.runnersData) return;
        $scope.states.winnersInTable = false;
        applyFilters()
    });

    $scope.$watch('runnersData', function (runnersData) {
        if (!runnersData) return;
        updateFilters();
    });
    $rootScope.$on('$translateChangeSuccess', function () {
        console.log('translate change start');
        updateFilters();
    });
    function updateFilters() {
        if (!$scope.runnersData) return;
        if (activatingWinners) {
            activatingWinners = false;
        } else {
            $scope.states.winnersInTable = false;
        }
        $scope.limit = 100;
        applyFilters();
        $q.all([
            $translate('WOMEN'),
            $translate('MEN'),
            $translate('ALL_RUNNERS')
        ]).then(function (results) {
            var women = results[0];
            var men = results[1];
            var all = results[2];
            $scope.filterGender.values = {
                0: '<span class="gender-filter__item-female">' + women + '</span>',
                1: '<span class="gender-filter__item-male">' + men + '</span>'
            };
            $scope.filterGender.allValues = '<span class="gender-filter__item-all">' + all + '</span>';
        });

        var prefilteredTeams = prefilter('team');
        $scope.filters.team.values = formatItems(prefilteredTeams, 'team', countSort);
        var teamCount = Object.keys($scope.filters.team.values);

        var prefilteredCities = prefilter('city');
        $scope.filters.city.values = formatItems(prefilteredCities, 'city', countSort);
        var cityCount = Object.keys($scope.filters.city.values);

        var prefilteredAgeGroups = prefilter('ageGroup');
        $scope.filters.age.values = formatItems(prefilteredAgeGroups, 'ageGroup', nameSort);
        var minMaxAges = d3.extent(prefilteredAgeGroups, function (runner) {
            return runner.age;
        });


        $q.all({
            team: $translate('TEAMS'),
            city: $translate('CITIES'),
            all: $translate('ALL'),
            from: $translate('FROM'),
            to: $translate('TO')
        }).then(function (result) {
            $scope.filters.team.allValues = teamCount.length + ' ' + numberDeclension(teamCount.length, result.team);
            $scope.filters.city.allValues = cityCount.length + ' ' + numberDeclension(cityCount.length, result.city);
            minMaxAges = result.all + ' ' + result.from + ' ' + minMaxAges.join(' ' + result.to + ' ');
            $scope.filters.age.allValues = minMaxAges;

        })
    }

    $scope.$watch('filterValues', updateFilters, true);
    $scope.$watch('limit', updateLimit)
});

