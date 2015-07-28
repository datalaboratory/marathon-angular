angular.module('marathon').directive('genderAgeLegend', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/genderAgeLegend.html',
        replace: true,
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
                var runners = checkData($scope.runnersData.items);
                var genderGroups = [runners.big_genders_groups[0], runners.big_genders_groups[1]];
                var genderGroupsMale = genderGroups[1];
                var genderGroupsFemale = genderGroups[0];
                var ageGroupsData = runners.big_ages_ranges;

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
                    $scope.generateGradient('#FFCBD5', '#EE2046', 10),
                    $scope.generateGradient('#B8E8FF', '#1D56DF', 10)
                ];
                var genderConstants = ['WOMEN_DECLENSION', 'MEN_DECLENSION'];
                genderGroups.forEach(function (genderGroup, genderNumber) {
                    var el_top = 0;
                    genderGroup.age_groups.forEach(function (ageGroup, i) {
                        var y = el_top;
                        var groupHeight = getGroupHeight(i);
                        var groupWidth = getGroupWidth(ageGroup, i);
                        el_top = el_top + groupHeight + vert_space;
                        $scope.ageGraphData.genderItems[genderNumber].push({
                            y: y,
                            width: groupWidth,
                            height: groupHeight,
                            color: genderGradients[genderNumber](i + 1),
                            count: ageGroup.length,
                            gender: genderNumber,
                            genderString: genderConstants[genderNumber],
                            start: ageGroupsData[i].start,
                            end: ageGroupsData[i].end
                        });

                    });
                });
                $scope.labelsData = ageGroupsData.map(function (group, i) {
                    var item = $scope.ageGraphData.genderItems[0][i];
                    return {
                        label: group.label,
                        y: item.y + item.height / 2
                    }
                });
                $scope.ageGraphData.maxMaleWidth = d3.extent(genderGroupsMale.age_groups, getGroupWidth)[1];
                $scope.ageGraphData.maxFemaleWidth = d3.extent(genderGroupsFemale.age_groups, getGroupWidth)[1];

            }
            $scope.$watch('time.start', function () {
                updateData();
            });


            $scope.showTooltip = function (item, isLast) {
                $scope.tooltipData = item;
                $scope.isLast = isLast;
            };
            $scope.tooltipPosition = {};
            $scope.moveTooltip = function ($event) {
                var y = $event.offsetY;
                var x = $event.offsetX;
                $scope.tooltipPosition = {
                    top: y + 'px',
                    left: x + 'px'
                };
            };

            $scope.hideTooltip = function () {
                $scope.tooltipData = null;
            };
        }
    }
});