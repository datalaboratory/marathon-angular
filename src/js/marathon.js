var app = angular.module('marathon', ['dataLab']);

app.controller('MarathonController', function ($scope, $http, numberDeclension, multifilter) {
    var req = $http.get('data/runners/data.json');
    req.then(function (data) {
        function filter() {
            $scope.filteredRunners = multifilter(runners, $scope.filterValues);
            $scope.limitedFilteredRunners = $scope.filteredRunners.slice(0, $scope.limit);
        }
        $scope.runnerData = data.data;
        var runners = $scope.runnerData.items;
        $scope.time = {
            start: $scope.runnerData.start_time,
            current: 0,
            finish: $scope.runnerData.max_time
        };
        $scope.generateGradient = function (beginColor, endColor, stepsCount) {
            return d3.scale.linear()
                .domain([1, stepsCount])
                .range([beginColor, endColor])
                .interpolate(d3.interpolateHsl);
        };
        $scope.genderGradients = {
            0: $scope.generateGradient('#FFCBD5', '#EE2046', 5),
            1: $scope.generateGradient('#B8E8FF', '#1D56DF', 5)
        };
        $scope.grayGradient = $scope.generateGradient('#EEEEEE', '#777777', 5);
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
            },{
                start: 23,
                end: 34,
                label: '23-34'
            },{
                start: 35,
                end: 49,
                label: '35-49'
            },{
                start: 50,
                end: 65,
                label: '50-65'
            },{
                start: 65,
                end: 90,
                label: '65+'
            }
        ];
        var currentYear = new Date($scope.runnerData.start_time).getFullYear();
        runners.forEach(function (runner, i) {
            runner.id = i;
            runner.age = currentYear - runner.birthyear;
            runner.ageGroup = ageGroups.filter(function (group) {
                return group.start <= runner.age && runner.age <= group.end;
            })[0].label;
            runner.ageGroupForSnake = ageGroupsForSnake.filter(function (group) {
                return group.start <= runner.age && runner.age <= group.end;
            })[0].label;
        });
        $scope.limit = 100;
        $scope.filterValues = {};
        $scope.filters = {
            gender: {
                model: 'filterValues.gender'
            },
            team: {
                model: 'filterValues.team'
            },
            city: {
                model: 'filterValues.city'
            },
            age: {
                model: 'filterValues.ageGroup'
            }
        };
        $scope.$watch('filterValues', function () {
            function formatItems(key, sort) {
                var filters = angular.copy($scope.filterValues);
                delete filters[key];
                var filteredItems = multifilter(runners, filters);
                var names = _.pluck(filteredItems, key);
                var counts = _.countBy(names);
                if (sort) {
                    names.sort(function (a, b) {
                        return counts[b] - counts[a];
                    })
                }
                var result = {};
                var filter = {};
                Object.keys(counts).forEach(function (item) {
                    filter[key] = item;
                    var count =  multifilter(filteredItems, filter).length;
                    result[item] = item + '<span>' + count + '</span>';
                });
                return result;
            }

            $scope.filters.gender.values = {
                0: 'женщин',
                1: 'мужчин'
            };
            $scope.filters.gender.allValues = 'всех вместе';

            var allTeams = _.pluck(runners, 'team');
            var teamsCount = _.countBy(allTeams);
            var teams = _.uniq(allTeams)
                .filter(function (team) {
                    return teamsCount[team] > 2 && team != '';
                });
            $scope.filters.team.values = formatItems('team', true);
            $scope.filters.team.allValues = teams.length + ' ' + numberDeclension(teams.length, ['команда', 'команды', 'команд']);

            var allCities = _.pluck(runners, 'city');
            var cities = _.uniq(allCities);
            $scope.filters.city.values = formatItems('city', true);
            $scope.filters.city.allValues = cities.length + ' ' + numberDeclension(cities.length, ['город', 'города', 'городов']);

            var ageGroupLabels = _.pluck(runners, 'ageGroup');
            var minMaxAges = d3.extent(runners, function (runner) {
                return runner.age;
            });
            minMaxAges = 'все от ' + minMaxAges.join(' до ');
            $scope.filters.age.values = formatItems('ageGroup', false);
            $scope.filters.age.allValues = minMaxAges;

            filter();
        }, true);
        $scope.$watch('limit', filter)
    });
});

