/**
* Posts
* @namespace oipa.activityStatus
*/
(function () {
	'use strict';

	angular
		.module('oipa.activityStatus')
		.factory('ActivityStatus', ActivityStatus);

	ActivityStatus.$inject = ['$http', 'oipaUrl', 'reportingOrganisationId'];

	/**
	* @namespace ActivityStatus
	* @returns {Factory}
	*/
	function ActivityStatus($http, oipaUrl, reportingOrganisationId) {

		var activityStatuses = null;

		var ActivityStatus = {
			all: all 
		};

		return ActivityStatus;

		////////////////////

		/**
         * @name all
         * @desc Try to get all activity statuses
         * @returns {Promise}
         * @memberOf oipa.activityStatus.activityStatus
         */
        function all() {
        	var url = oipaUrl + '/activity-aggregate-any/?format=json&group_by=activity-status&aggregation_key=iati-identifier';
            if(reportingOrganisationId){
                url += '&reporting_organisation__in=' + reportingOrganisationId;
            }
            return $http.get(url, { cache: true });
        }

	}
})();