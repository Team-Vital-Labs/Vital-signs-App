(function() {
	'use strict';

	angular
		.module('eventsjs', [
		])
        .config(function($stateProvider) {
			$stateProvider
				.state('events_list', {
					cache: false,
					url: '/events_list',
					templateUrl: 'js/app_specific/events/events.list.html',
                    controller: 'eventsListCtrl as vm'
                })
                .state('events_detail', {
					cache: false,
					url: '/events_detail',
                    templateUrl: 'js/app_specific/events/events.detail.html',
                    controller: 'eventsDetailCtrl as vm'
				})
				.state('level_2_detail', {
					cache: false,
					url: '/level_2_detail',
                    templateUrl: 'js/app_specific/events/level.2.detail.html',
                    controller: 'level2DetailCtrl as vm'
				})
				.state('level_3_detail', {
					cache: false,
					url: '/level_3_detail',
                    templateUrl: 'js/app_specific/events/level.3.detail.html',
                    controller: 'level3DetailCtrl as vm'
				})
				.state('main_menu', {
					cache: false,
					url: '/main_menu',
                    templateUrl: 'js/app_specific/events/main.menu.html', 
                    controller: 'mainMenuCtrl as vm'
				})
				.state('logging', {
					cache: false,
					url: '/logging',
                    templateUrl: 'js/app_specific/events/logging.html',
                    controller: 'loggingCtrl as vm'
				})
				.state('get_files', {
					cache: false,
					url: '/get_files',
                    templateUrl: 'js/app_specific/events/get.files.html',
                    controller: 'getFilesCtrl as vm'
                })
            });
				
})();