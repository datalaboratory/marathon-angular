angular.module('marathon').directive('genderAgeLegend', function ($rootScope, runnerClassificator, ageGroups, genderColors, $timeout, last) {
    var render = {
        margin: {
            left: 2,
            right: 0,
            top: 1,
            bottom: 0
        }
    };
    return {
        restrict: 'E',
        templateUrl: 'directives/genderAgeLegend.html',
        replace: true,
        scope: true,
        link: function ($scope, $element) {
            var container = $element;
            var width = container.width();
            var height = container.height();
            $scope.width = width;
            $scope.height = height;
            var space = 1;
            var vert_space = 1;
            $scope.ageGraphData = {};
            $scope.ageGraphData.space = space;
            function updateData () {
                var runners = runnerClassificator.checkData($scope.runnersData.items);
                var genderGroups = [runners.big_genders_groups[0], runners.big_genders_groups[1]];
                var ageGenderGroups = _.groupBy(runners.big_runners_groups, 'label');

                var genderGroupsMale = genderGroups[1];
                var genderGroupsFemale = genderGroups[0];
                var ageGroupsData = ageGroups.small;

                var maxMale = genderGroupsMale.age_groups.max;
                var maxFemale = genderGroupsFemale.age_groups.max;

                var lngMale = genderGroupsMale.age_groups.lng;
                var lngFemale = genderGroupsFemale.age_groups.lng;

                var height_factor = (height - vert_space * genderGroupsMale.age_groups.length) / Math.max(lngMale, lngFemale);
                var width_factor = height_factor * (width - space) / (2 * (maxMale + maxFemale));

                function getGroupWidth(group, i) {
                    return group.length * width_factor / (height_factor * (ageGroupsData[i].end - ageGroupsData[i].start + 1))
                }

                function getGroupHeight(i) {
                    return height_factor * (ageGroupsData[i].end - ageGroupsData[i].start + 1)
                }

                $scope.ageGraphData.genderItems = [[],[]];
                var genderGradients = [
                    genderColors.generateGradient('#FFCBD5', '#EE2046', 10),
                    genderColors.generateGradient('#B8E8FF', '#1D56DF', 10)
                ];
                var genderConstants = ['WOMEN_DECLENSION', 'MEN_DECLENSION'];
                var el_top = 0;
                $scope.ageGraphData.ageItems = Object.keys(ageGenderGroups).map(function (key, i) {
                    var ageGroup = ageGenderGroups[key];
                    var y = el_top;
                    var groupHeight = getGroupHeight(i);
                    el_top = el_top + groupHeight + vert_space;
                    return {
                        y: y,
                        height: groupHeight,
                        runners: ageGroup.map(function (genderGroup) {
                            return getRunnersDataByGender(genderGroup, i)
                        }),
                        label: key
                    }
                });
                console.log($scope.ageGraphData.ageItems);
                function getRunnersDataByGender(ageGroup, i) {
                    return {
                        width: getGroupWidth(ageGroup.runners, i),
                        color: genderGradients[ageGroup.gender](i + 1),
                        count: ageGroup.runners.length,
                        gender: ageGroup.gender,
                        genderString: genderConstants[ageGroup.gender],
                        start: ageGroupsData[i].start,
                        end: ageGroupsData[i].end
                    }
                }

                $scope.ageGraphData.maxMaleWidth = d3.extent(genderGroupsMale.age_groups, getGroupWidth)[1];
                $scope.ageGraphData.maxFemaleWidth = d3.extent(genderGroupsFemale.age_groups, getGroupWidth)[1];

            }

            $scope.renderText = function () {
                var $scope = angular.element(this).scope();
                var d3element = d3.select(this);
                d3element.select('text')
                    .attr('x', $scope.ageGraphData.maxMaleWidth + $scope.ageGraphData.maxFemaleWidth + 4)
                    .attr('y', $scope.item.y + $scope.item.height / 2);
            };
            $scope.renderBlurRect = function () {
                var d3element = d3.select(this);
                d3element
                    .attr('y', last($scope.ageGraphData.ageItems).y)
                    .attr('width', $scope.ageGraphData.maxMaleWidth + $scope.ageGraphData.maxFemaleWidth)
                    .attr('height', last($scope.ageGraphData.ageItems).height)
                    .attr('fill', 'url(' + $rootScope.location + '#ageBottomGradient)')
            };
            $scope.renderRect = function () {
                var $scope = angular.element(this).scope();
                var maxWidth = [$scope.ageGraphData.maxFemaleWidth, $scope.ageGraphData.maxMaleWidth];
                var d3element = d3.select(this);
                d3element.selectAll('.gender-age-legend__color-rect')
                    .attr('x', function () {
                        var gender = $scope.genderGroup.gender;
                        return $scope.ageGraphData.maxMaleWidth - gender * $scope.genderGroup.width + (1 - gender) * $scope.ageGraphData.space * 2
                    })
                    .attr('y', $scope.item.y)
                    .attr('width', $scope.genderGroup.width)
                    .attr('height', $scope.item.height - $scope.ageGraphData.space)
                    .attr('fill', $scope.genderGroup.color)
                    .attr('stroke', $scope.genderGroup.color);

                d3element.selectAll('.gender-age-legend__color-transparent-rect')
                    .attr('x', function () {
                        var gender = $scope.genderGroup.gender;
                        return (1 - gender) * ($scope.ageGraphData.maxMaleWidth + $scope.ageGraphData.space * 2);
                    })
                    .attr('y', $scope.item.y)
                    .attr('width', maxWidth[$scope.genderGroup.gender])
                    .attr('height', $scope.item.height);
            };
            $scope.$on('runnersUpdated', function () {
                updateData();
                $timeout(function () {
                    $scope.$broadcast('render', render);
                });
            });
            $scope.tooltip = {
                data: null,
                position: {}
            };
            $scope.moveTooltip = function ($event, isLast) {
                var x = $event.originalEvent.layerX || $event.offsetX;
                var y = $event.originalEvent.layerY || $event.offsetY;
                $scope.tooltip.position = {
                    top: y + 'px',
                    left: x + 'px'
                };
                $scope.isLast = isLast;
            };
        }
    }
});