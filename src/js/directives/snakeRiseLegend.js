angular.module('marathon').directive('snakeRiseLegend', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/snakeRiseLegend.html',
            replace: true,
            link: function ($scope, $element) {
                /*var width = 77;
                var svg = d3.select($element[0]);
                var dots_on_distance=[100,];
                var step_for_dots = 1000; // шаг на дистанции с которым смотрим высоту змея
                var rr_on_distance = {},
                    heights_on_distance = [],
                    rr_with_max_height,
                    rr_male_on_max_height,
                    rr_female_on_max_height;
                var time_value = 6000;
                var step_for_height = 1000;
                // Из total distance формируем массив точек, где смотрим толщину змея
                while ((dots_on_distance[dots_on_distance.length - 1] + step_for_dots) < this.total_distance) {
                    dots_on_distance.push(dots_on_distance[dots_on_distance.length - 1] + step_for_dots);
                }
                dots_on_distance.push(this.total_distance);

                // Идём по всем точкам и определяем там высоту змея. Запоминаем высоту в массив
                dots_on_distance.forEach(function (dot, i) {
                    var rr_on_dot = mh.getStepHeight(that.knodes, dot, time_value, $scope.filteredRunners, $scope.time.start, that.total_distance, step_for_height);
                    rr_on_distance[rr_on_dot['height']] = rr_on_dot;
                    heights_on_distance.push(rr_on_dot['height'])
                });
                // Ищем максимальное число в массиве высот и соответствующий ему runners_rater
                rr_with_max_height = rr_on_distance[d3.max(heights_on_distance)];

                // Вычисляем высоты М и Ж змеев на участке с максимальной высотой
                rr_male_on_max_height = mh.getStepHeight(that.knodes, rr_with_max_height['distance'], time_value, current_runners_data.genders_groups[1].raw, cvs_data.start_time, that.total_distance, step_for_height)
                rr_female_on_max_height = mh.getStepHeight(that.knodes, rr_with_max_height['distance'], time_value, current_runners_data.genders_groups[0].raw, cvs_data.start_time, that.total_distance, step_for_height)

                // Возвращаем массив с runners rate для [всех, M, Ж]
                var runners_rate = [rr_female_on_max_height, rr_male_on_max_height, rr_with_max_height];

                var max_count = (type==42) ? 1210 : 920; // Максимальная толщина змея, считаем вручную
                var text = (locale == 'rus')? "макс.":'max';

                var magic_coefficient = 0.7; // Костыль для корректировки высоты змея в легенде к змею на карте.

                // Высота змея «макс» — высота контейнера
                var container_height = Math.ceil(mh.getHeightByRunners(max_count, (runners_rate) ? runners_rate[2].step : 1) * magic_coefficient);
                // Массив высот для Ж, М и всех вместе
                // var height= (runners_rate) ? [runners_rate[0]['height'], runners_rate[1]['height'], runners_rate[2]['height']] : [1,1,1] //При первой загрузке подставляем [1,1,1]
                var height = {
                    'for_counting' : (runners_rate) ? [runners_rate[0]['height'], runners_rate[1]['height'], runners_rate[2]['height']] : [0,0,0], //При первой загрузке подставляем [0,0,0]
                    'for_drawing' : (runners_rate) ? [runners_rate[0]['height'] * magic_coefficient, runners_rate[1]['height'] * magic_coefficient, runners_rate[2]['height'] * magic_coefficient] : [0,0,0] //При первой загрузке подставляем [1,1,1]
                };

                // female_coeff — доля женщин на участке максимальной толщины в данный момент
                var female_coeff = (runners_rate) ? (height['for_counting'][0] / height['for_counting'][2]) : 1;
                if (isNaN(female_coeff)) { female_coeff = 1 };

                $(this.legendcount.node()).css({
                    width: width,
                    height: container_height
                });

                function formatSnakePath(width, height, factor) {
                    return 'M0 '+ height +
                        'L' + width + ' ' + height +
                        'L' + width + ' ' + height * (1 - factor) +
                        ' C'+ width / 2 +' ' + (height * (1 - factor) +  height * factor / 5) + ' ' +
                        ( width / 2) + ' ' + (height - 1 * height * factor / 20) +
                        ' 0 ' + height + ' Z'
                }
                // Добавляем мальчиков
                svg.select('#legendcount-male')
                    .attr('d', formatSnakePath(width, height['for_drawing'][2], 1))
                    .attr('transform', 'translate(0,' + (container_height - height['for_drawing'][2]) + ')')

                // Добавляем девочек
                svg.select('#legendcount-female')
                    .attr('d', formatSnakePath(width, height['for_drawing'][2], female_coeff))
                    .attr('transform', 'translate(0,' + (container_height - height['for_drawing'][2]) + ')')
                // Добавляем общего змея
                svg.select('#legendcount-all')
                    .attr('d', formatSnakePath(width, container_height, 1))

                // Обновляем максимальное кол-во бегунов
                $('.legendcount_num.legendcount_num_max').css('bottom', container_height - 1).html(text + '</br>' + max_count);
                return height
            */}
        }
    }
);