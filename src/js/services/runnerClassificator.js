angular.module('marathon').factory('runnerClassificator', function (ageGroups) {

    var getAgeGroups = function (array, ranges) {
        var max = 0;
        var lng = 0;

        var age_groups = ranges.map(function (range) {
            var g = array.filter(function (runner) {
                return range.start <= runner.age && runner.age <= range.end;
            });
            max = Math.max(max, (g.length / (range.end + 1 - range.start)));
            lng += range.end + 1 - range.start;
            return g;
        });

        age_groups.max = max;
        age_groups.lng = lng;

        return age_groups;
    };

    var getGenderAgesGroups = function (runners, age_ranges_to_use) {
        var genders_groups = [[], []];
        var runners_groups = [];

        runners.forEach(function (runner) {
            if (runner.gender > 1) return;
            genders_groups[runner.gender].push(runner);
        });

        genders_groups.forEach(function (genderGroup, gender) {
            genderGroup.age_groups = getAgeGroups(genderGroup, age_ranges_to_use);
            genderGroup.age_groups.forEach(function (ageGroup, i) {
                runners_groups.push({
                    key: gender + '-' + i,
                    num: i + 1,
                    gender: gender,
                    label: age_ranges_to_use[i].label,
                    runners: ageGroup
                });
            })
        });

        runners_groups.sort(function (a, b) {                        //сортируем мужские возрастные группы по возрастанию, женские наоборот
            var groupsLength = runners_groups.length / 2;
            var aNum = (groupsLength - a.num) * (a.gender - 0.5) * 2;
            var bNum = (groupsLength - b.num) * (b.gender - 0.5) * 2;
            return bNum - aNum;
        });

        return {
            genders_groups: genders_groups,
            runners_groups: runners_groups
        };
    };

    var checkData = function (items) {
        if (!items) return;

        var ga_groups = getGenderAgesGroups(items, ageGroups.big);
        var big_ga_groups = getGenderAgesGroups(items, ageGroups.small);

        return {
            genders_groups: ga_groups.genders_groups,
            runners_groups: ga_groups.runners_groups,
            big_genders_groups: big_ga_groups.genders_groups,
            big_runners_groups: big_ga_groups.runners_groups
        }
    };

    return {
        checkData: checkData
    }
});