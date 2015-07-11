var big_ages_group = [
    {
        start: 16,
        end: 19,
        label: '16-19'
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

var small_ages_group = [
    {
        start: 16,
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


var getAgeGroups = function (array, ranges) {
    var age_groups = [];
    var r = array;
    var max = 0;
    var lng = 0;

    for (var i = 0; i < ranges.length; i++) {

        var age_range = ranges[i];

        var g = array.filter(function (runner) {
            return runner.age >= age_range.start && runner.age <= age_range.end;
        });

        age_groups.push(g);
        r = g.not;
        max = Math.max(max, (g.length / (age_range.end + 1 - age_range.start)));
        lng = lng + age_range.end + 1 - age_range.start;
        // console.log(lng);
    }

    age_groups.max = max;
    age_groups.lng = lng;

    return age_groups;
};

var getGenderAgesGroups = function (items, age_ranges_to_use) {
    var genders_groups = [{
        raw: []
    }, {
        raw: []
    }, {
        raw: []
    }];
    var runners_groups = [];

    var i;
    for (i = 0; i < items.length; i++) {

        genders_groups[items[i].gender].raw.push(items[i]);
    }
    genders_groups.forEach(function (el) {
        el.age_groups = getAgeGroups(el.raw, age_ranges_to_use);
    });
    for (i = 0; i < genders_groups[0].age_groups.length; i++) {
        runners_groups.push({
            key: 0 + '-' + i,
            num: i + 1,
            groups_count: genders_groups[0].age_groups.length,
            gender: 0,
            runners: genders_groups[0].age_groups[i]
        });
    }
    for (i = genders_groups[1].age_groups.length - 1; i >= 0; i--) {
        runners_groups.push({
            key: 1 + '-' + i,
            num: i + 1,
            groups_count: genders_groups[1].age_groups.length,
            gender: 1,
            runners: genders_groups[1].age_groups[i]
        });
    }
    runners_groups.reverse();


    return {
        genders_groups: genders_groups,
        runners_groups: runners_groups
    };
};

var checkData = function (items) {
    if (!items) return;

    var last_finish_time = 0;

    for (var i = 0; i < items.length; i++) {

        last_finish_time = Math.max(last_finish_time, items[i].end_time);
    }


    var setRunnersGroupMark = function (runners_groups, marker_prop) {
        if (!marker_prop) {
            throw new Error();
        }
        runners_groups.forEach(function (el) {
            for (var i = 0; i < el.runners.length; i++) {
                el.runners[i][marker_prop] = el.key;
                el.runners[i][marker_prop + '_full'] = el;
            }
        });
    };

    var ga_groups = getGenderAgesGroups(items, small_ages_group);
    var big_ga_groups = getGenderAgesGroups(items, big_ages_group);
    setRunnersGroupMark(big_ga_groups.runners_groups, 'big_genderage_group');


    items.getAgeGroups = function (array, ranges, field) {
        return getAgeGroups(array, ranges, field, start_year);
    };
    items.genders_groups = ga_groups.genders_groups;
    items.runners_groups = ga_groups.runners_groups;
    items.big_genders_groups = big_ga_groups.genders_groups;
    //cvs_data.start_year = start_year;

    items.last_finish_time = last_finish_time;
    //cvs_data.run_gap = (last_finish_time - cvs_data.start_time) / 1000;
    items.age_ranges = small_ages_group;
    items.big_ages_ranges = big_ages_group;
    return items

};


