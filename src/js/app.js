var app = angular.module('marathon', [
    'dataLab',
    'pascalprecht.translate'
]);
app.config(function ($translateProvider) {
    $translateProvider
        .translations('ru', {
            MAIN_TITLE: 'МОСКОВСКИЙ ПОЛУМАРАФОН',
            ALTITUDE_TITLE: 'Высотный профиль',
            GENDER_AGE_TITLE: 'Пол и возраст',
            SNAKE_WIDTH_TITLE: 'Толщина змея',
            ALTITUDE_TEXT: 'Общий набор высоты - 73м<br>169м - самая высокая точка Московского Марафона',
            RESULTS: 'Результаты',
            WINNERS: 'призёров',
            WOMEN: 'женщин',
            MEN: 'мужчин',
            WOMEN_DECLENSION: 'женщина,женщины,женщин',
            MEN_DECLENSION: 'мужчина,мужчины,мужчин',
            ALL_RUNNERS: 'всех вместе',
            CITIES_DECLENSION: 'город,города,городов',
            TEAMS_DECLENSION: 'команда,команды,команд',
            TEAMS_OTHER: 'остальные',
            ALL: 'все',
            FROM: 'от',
            TO: 'до',
            AND: 'и',
            YEAR_DECLENSION: 'год,года,лет',
            YEARS_OLD_DECLENSION: 'год,года,лет',
            OLDER: 'старше',
            FINISH_TIME: 'по времени финиша',
            RUNNERS_PER_KM: 'бегунов на км',
            MAX: 'макс.',
            METER: 'м',
            KILOMETER: 'км',
            METER_PER_SECOND: 'м/с',
            NAME_OR_NUMBER: 'Имя или номер',
            SHOW_MORE_RESULTS: 'Показать еще 100 результатов',
            VISUALIZATION: 'Визуализация',
            BY_DATA_LABORATORY: 'Лаборатории&nbsp;данных',
            MAP_SRC: 'img/half-marathon-map.png'
        })
        .translations('en', {
            MAIN_TITLE: 'MOSCOW HALF MARATHON',
            ALTITUDE_TITLE: 'Altitude',
            GENDER_AGE_TITLE: 'Age and sex',
            SNAKE_WIDTH_TITLE: 'Snake width',
            ALTITUDE_TEXT: 'Total climb: 73m<br>Highest point of Moscow Marathon: 169m',
            RESULTS: 'Results',
            WINNERS: 'winners',
            WOMEN: 'women',
            MEN: 'men',
            WOMEN_DECLENSION: 'woman,women',
            MEN_DECLENSION: 'man,men',
            ALL_RUNNERS: 'all runners',
            CITIES_DECLENSION: 'city,cities',
            TEAMS_DECLENSION: 'team,teams',
            TEAMS_OTHER: 'other teams',
            ALL: 'all',
            FROM: 'from',
            TO: 'to',
            AND: 'and',
            YEAR_DECLENSION: 'year,years',
            YEARS_OLD_DECLENSION: 'year old,years old',
            OLDER: 'over',
            FINISH_TIME: 'by finish times',
            RUNNERS_PER_KM: 'runners per km',
            MAX: 'max',
            METER: 'm',
            KILOMETER: 'km',
            METER_PER_SECOND: 'm/s',
            NAME_OR_NUMBER: 'Name or number',
            SHOW_MORE_RESULTS: 'Show more 100 results',
            VISUALIZATION: 'Visualization',
            BY_DATA_LABORATORY: 'by&nbsp;Data&nbsp;laboratory',
            MAP_SRC: 'img/half-marathon-map.png'
        });
    $translateProvider.preferredLanguage('ru');
});