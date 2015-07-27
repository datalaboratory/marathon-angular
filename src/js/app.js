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
            ALTITUDE_TEXT: 'Общий набор высоты - 73м <br>169м - самая высокая точка Московского Марафона',
            RESULTS: 'Результаты',
            WINNERS: 'призёров',
            WOMEN: 'женщин',
            MEN: 'мужчин',
            ALL_RUNNERS: 'всех вместе',
            CITIES: 'город,города,городов',
            TEAMS: 'команда,команды,команд',
            ALL: 'все',
            FROM: 'от',
            TO: 'до',
            NAME_OR_NUMBER: 'Имя или номер',
            SHOW_MORE_RESULTS: 'Показать еще 100 результатов'
        })
        .translations('en', {
            MAIN_TITLE: 'MOSCOW HALF MARATHON',
            ALTITUDE_TITLE: 'Altitude',
            GENDER_AGE_TITLE: 'Age and sex',
            SNAKE_WIDTH_TITLE: 'Snake width',
            ALTITUDE_TEXT: 'Total climb: 73 m <br>Highest point of Moscow Marathon: 169 m',
            RESULTS: 'Results',
            WINNERS: 'winners',
            WOMEN: 'women',
            MEN: 'men',
            ALL_RUNNERS: 'all runners',
            CITIES: 'city,cities',
            TEAMS: 'team,teams',
            ALL: 'all',
            FROM: 'from',
            TO: 'to',
            NAME_OR_NUMBER: 'Name or number',
            SHOW_MORE_RESULTS: 'Show more 100 results'
        });
    $translateProvider.preferredLanguage('ru');
});