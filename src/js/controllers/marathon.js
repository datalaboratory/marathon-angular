angular.module('marathon').controller('MarathonController', function ($scope, $rootScope, $http, $translate, $parse, $timeout, numberDeclension, multifilter, ageGroups, runnerLoader, urlParameter) {
    var langFromUrl = urlParameter.get('lang');
    if (!langFromUrl) langFromUrl = 'ru';
    $rootScope.language = langFromUrl;
    $translate.use(langFromUrl);

    $(window).on('resize', function () {
        $scope.$emit('renderRequired');
    });

    $scope.externalData = {
        track: {
            '42km': $http.get('/data/geo/2017_42.json'),
            '10km': $http.get('data/geo/2017_10.json'),
            'hb': $http.get('/data/geo/2017_42.json'),
            'rw': $http.get('/data/geo/2017_42.json'),
        },
        runners: {
            '42km': runnerLoader.loadRunners([
                'data/runners/20170924_psb_mm_m_42km.json',
                'data/runners/20170924_psb_mm_f_42km.json'
                /*'http://moscowmarathon.org/media/filer_public/17/20170924_psb_mm_m_42km.json',
                'http://moscowmarathon.org/media/filer_public/17/20170924_psb_mm_f_42km.json?'*/
            ]),
            '10km': runnerLoader.loadRunners([
                'data/runners/20170924_psb_mm_m_10km.json',
                'data/runners/20170924_psb_mm_f_10km.json'
                /*'http://moscowmarathon.org/media/filer_public/17/20170924_psb_mm_m_10km.json',
                'http://moscowmarathon.org/media/filer_public/17/20170924_psb_mm_f_10km.json'*/
            ]),
            'hb': runnerLoader.loadRunners([
                'data/runners/20170924_psb_mm_m_hb.json',
                'data/runners/20170924_psb_mm_f_hb.json'
                /*'http://moscowmarathon.org/media/filer_public/17/20170924_psb_mm_m_hb.json',
                'http://moscowmarathon.org/media/filer_public/17/20170924_psb_mm_f_hb.json'*/
            ]),
            'rw': runnerLoader.loadRunners([
                'data/runners/20170924_psb_mm_m_rw.json',
                'data/runners/20170924_psb_mm_f_rw.json'
                /*'http://moscowmarathon.org/media/filer_public/17/20170924_psb_mm_m_rw.json',
                'http://moscowmarathon.org/media/filer_public/17/20170924_psb_mm_f_rw.json'*/
            ])
        }
    };

    var init = {
        currentTrackName: true,
        limit: true,
        selectedRunners: true
    };

    $scope.$watch('currentTrackName', function (name) {
        if (name == '42km') urlParameter.remove('track', name);
        if (name != '42km') urlParameter.set('track', name);
        $rootScope.$broadcast('showCover:map');
        $timeout(function () {
            $scope.selectedTrack = $scope.externalData.track[name];
            $scope.selectedRunnersData = $scope.externalData.runners[name];

            $scope.selectedRunners = [];
            $scope.filteredRunners = null;
            $scope.filterValues = {};

            if (init.currentTrackName) {
                if (name == 'hb' || name == 'rw') {
                    $scope.states.winnersInTable = false;
                } else {
                    var showFromUrl = urlParameter.get('show');
                    if (showFromUrl == 'women') $scope.filterValues.gender = 0;
                    if (showFromUrl == 'men') $scope.filterValues.gender = 1;
                    if (showFromUrl == 'all') $scope.filterValues.gender = null;
                    $scope.states.winnersInTable = !showFromUrl || showFromUrl == 'winners';
                }
                init.currentTrackName = false;
            } else {
                $scope.states.winnersInTable = true;
            }

            delete $scope.states.activatingWinners
        });
    });

    $scope.clearFilters = function () {
        Object.keys($scope.filterValues).forEach(function (key) {
            if (key == 'gender') return;
            delete $scope.filterValues[key];
        })
    };

    $scope.runnersCount = {};
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

    $scope.altitudePoint = {
        altitude: '',
        position: {}
    };

    $scope.states = {
        winnersInTable: true,
        showMapAltitude: false
    };
    $scope.showWinners = function () {
        if (!$scope.states.winnersInTable) {
            $scope.states.activatingWinners = true;
            $scope.filterValues = {};
            $timeout(function () {
                $scope.states.activatingWinners = false;
            })
        }
        $scope.states.winnersInTable = true;
    };

    function updateLimit() {
        if (!$scope.filteredRunnersForTable) return;
        if ($scope.limit == 100) {
            urlParameter.remove('limit');
        } else {
            urlParameter.set('limit', $scope.limit);
        }
        $scope.limitedFilteredRunners = $scope.filteredRunnersForTable.slice(0, $scope.limit);
    }

    var othersTeam = '"TEAMS_OTHER" | translate';
    var noCity = '"NO_CITY" | translate';
    function teamSort(counts) {
        var keys = Object.keys(counts);
        keys.sort(function (a, b) {
            if (a == othersTeam) return 1;
            if (b == othersTeam) return -1;
            return counts[b] - counts[a];
        });
        return keys;
    }

    function citySort(counts) {
        var keys = Object.keys(counts);
        keys.sort(function (a, b) {
            if (a == noCity) return 1;
            if (b == noCity) return -1;
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

    var noCityItemExist = false;

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
            if (item == noCity) {
                noCityItemExist = true;
                result[item] = '<span class="dropdown-filter__other">' + result[item] + '</span>';
            }
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
                timePercent = ($scope.time.current - $scope.time.start) / ($scope.time.maxTime * 1000)
            }

            var maxTime = $scope.currentTrackName == '10km' ? 7200 : data.max_time;
            $scope.time = {
                start: moment(data.start_time),
                current: moment(data.start_time + timePercent * data.max_time * 1000),
                maxTime: maxTime
            };

            var currentYear = new Date(data.start_time).getFullYear();
            $scope.winnersForTable = [];
            var runners = data.items;
            var runnersFromUrl = urlParameter.get('runners');

            if (runnersFromUrl) {
                runnersFromUrl = runnersFromUrl.split(',');
            } else {
                runnersFromUrl = [];
            }

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
                if (runnersFromUrl.length && init.selectedRunners) {
                    if (runnersFromUrl.indexOf('' + runner.num) != -1) $scope.selectedRunners.push(runner);
                } else {
                    if (runner.gender_pos == 1) $scope.selectedRunners.push(runner);
                }
            });

            if (init.selectedRunners) init.selectedRunners = false;

            $rootScope.$broadcast('runnersUpdated');
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
        if ($scope.currentTrackName == 'hb' || $scope.currentTrackName == 'rw') {
            var smallTeams = []
        } else {
            smallTeams = _.countBy(runnersData.items, 'team');
            smallTeams = Object.keys(smallTeams).filter(function (team) {
                return smallTeams[team] < 3;
            });
        }

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

    function updateFilters(notFromWatch) {
        if (!$scope.runnersData) return;

        var show = 'winners';
        if ($scope.filterValues.gender == 0) show = 'women';
        if ($scope.filterValues.gender == 1) show = 'men';
        if ($scope.filterValues.gender === null) show = 'all';
        if (show != 'winners') urlParameter.set('show', show);
        if (show == 'winners') urlParameter.remove('show');

        if (Object.keys($scope.filterValues).filter(function (key) {
                return $scope.filterValues[key] != null;
            }).length > 0 && $scope.states.activatingWinners === false) {
            $scope.states.winnersInTable = false;
        }

        if (init.limit) {
            var limitFromUrl = urlParameter.get('limit');
            $scope.limit = limitFromUrl ? limitFromUrl : 100;
            init.limit = false;
        } else {
            $scope.limit = 100;
        }

        filterRunners();

        $scope.filterGender.values = {
            0: '<span class="gender-filter__item-female">' + translate('WOMEN') + '</span>',
            1: '<span class="gender-filter__item-male">' + translate('MEN') + '</span>'
        };
        $scope.filterGender.allValues = '<span class="gender-filter__item-all">' + translate('ALL_RUNNERS') + '</span>';

        var prefilteredTeams = prefilter('team');
        $scope.filters.team.values = formatItems(prefilteredTeams, 'team', teamSort);
        var teamCount = Object.keys($scope.filters.team.values).length - 1;
        $scope.filters.team.allValues = teamCount + ' ' + numberDeclension(teamCount, translate('TEAMS_DECLENSION'));

        noCityItemExist = false;
        var prefilteredCities = prefilter('city');
        $scope.filters.city.values = formatItems(prefilteredCities, 'city', citySort);
        var cityCount = Object.keys($scope.filters.city.values).length;
        if (noCityItemExist) cityCount--;
        $scope.filters.city.allValues = cityCount + ' ' + numberDeclension(cityCount, translate('CITIES_DECLENSION'));

        var prefilteredAgeGroups = prefilter('ageGroup');
        $scope.filters.age.values = formatItems(prefilteredAgeGroups, 'ageGroup', nameSort);
        var minMaxAges = d3.extent(prefilteredAgeGroups, function (runner) {
            return runner.age;
        });
        var maxAge = minMaxAges[1];
        if (minMaxAges[0] == minMaxAges[1]) minMaxAges.shift();
        minMaxAges = translate('ALL') + ': ' + minMaxAges.join('–') + ' ' + numberDeclension(maxAge, translate('YEAR_DECLENSION_FILTER'));
        $scope.filters.age.allValues = minMaxAges;
    }

    $scope.$watch('filterValues', updateFilters, true);
    $scope.$watch('limit', updateLimit)

    $scope.$watch('selectedRunners', function() {
        var nums = $scope.selectedRunners.map(function(r) {
            return r.num;
        });

        if (nums.length) {
            urlParameter.set('runners', nums.join(','));
        } else if (!init.selectedRunners) {
            urlParameter.remove('runners');
        }
    }, true);
});

