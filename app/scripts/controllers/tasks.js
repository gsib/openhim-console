'use strict';
/* global jQuery:false */
/* global moment:false */
/* global valueNotEmpty:false */

angular.module('openhimConsoleApp')
  .controller('TasksCtrl', function ($scope, $modal, $location, $interval, Api, Alerting, $route) {

    /**********************************************/
    /**         Initial load functions           **/
    /**********************************************/

    // default settings
    $scope.showpage = 0;
    $scope.showlimit = 10;
    $scope.filters = {};
    $scope.filters.limit = 10;
    $scope.settings = {};
    $scope.settings.list = {};
    $scope.settings.list.tabview = 'same';


    // setup task filtter settings
    if ( $location.search().limit ){ $scope.filters.limit = $location.search().limit; }
    if ( $location.search().date ){ $scope.filters.date = $location.search().date; }
    if ( $location.search().status ){ $scope.filters.status = $location.search().status; }
    if ( $location.search().user ){ $scope.filters.user = $location.search().user; }

    // get the users for the tasks filter dropdown
    $scope.users = Api.Users.query();

    $scope.refreshSuccess = function (tasks){
      // on success
      $scope.tasks = tasks;

      if( tasks.length < $scope.showlimit ){
        jQuery('#loadMoreBtn').hide();

        if( tasks.length === 0 ){
          Alerting.AlertAddMsg('bottom', 'warning', 'There are no tasks for the current filters');
        }

      }else{
        //Show the load more button
        jQuery('#loadMoreBtn').show();
      }
    };

    $scope.refreshError = function(err){
      // on error - Hide load more button and show error message
      jQuery('#loadMoreBtn').hide();
      Alerting.AlertAddServerMsg(err.status);
    };

    //setup filter options
    $scope.returnFilters = function(){

      var filtersObject = {};
      var filterDate;

      filtersObject.filterPage = $scope.showpage;
      filtersObject.filterLimit = $scope.showlimit;

      /* ##### construct filters ##### */
      filtersObject.filters = {};

      // date filter
      filterDate = $scope.filters.date;
      if(filterDate){
        var startDate = moment(filterDate).format();
        var endDate = moment(filterDate).endOf('day').format();
        filtersObject.filters.created = JSON.stringify( { '$gte': startDate, '$lte': endDate } );
      }

      /* ----- filter by tasks (basic) ----- */
      // add task status filter
      var taskStatus = $scope.filters.status;
      if ( valueNotEmpty(taskStatus) === true ) {
        filtersObject.filters.status = taskStatus;
      }

      var taskUser = $scope.filters.user;
      if ( valueNotEmpty(taskUser) === true ) {
        filtersObject.filters.user = taskUser;
      }
      /* ----- filter by tasks (basic) ----- */
      
      /* ##### construct filters ##### */
      return filtersObject;
      
    };

    $scope.applyFiltersToUrl = function(){

      // get the filter params object before clearing them
      var filterParamsBeforeClear = JSON.stringify( angular.copy( $location.search() ) );

      // first clear existing filters
      clearUrlParams();

      // Add filters to url
      if ( $scope.filters.status ){ $location.search( 'status', $scope.filters.status ); }
      if ( $scope.filters.user ){ $location.search( 'user', $scope.filters.user ); }
      if ( $scope.filters.limit ){ $location.search( 'limit', $scope.filters.limit ); }
      if ( $scope.filters.date ){ $location.search( 'date', $scope.filters.date ); }

      // get the filter params object after clearing them
      var filterParamsAfterClear = JSON.stringify( angular.copy( $location.search() ) );

      // if the filters object stays the same then call refresh function
      // if filters object not the same then angular changes route and loads controller ( refresh )
      if ( filterParamsBeforeClear === filterParamsAfterClear ){
        $scope.refreshTasksList();
      }

    };

    $scope.refreshTasksList = function(){

      Alerting.AlertReset();

      $scope.tasks = null;

      //reset the showpage filter to start at 0
      $scope.showpage = 0;
      $scope.showlimit = $scope.filters.limit;

      // do the initial request
      Api.Tasks.query( $scope.returnFilters(), $scope.refreshSuccess, $scope.refreshError);

    };
    // run the tasks list view for the first time
    $scope.refreshTasksList();


    //Refresh tasks list
    $scope.loadMoreTasks = function () {
      $scope.busyLoadingMore = true;
      Alerting.AlertReset();

      $scope.showpage++;
      Api.Tasks.query( $scope.returnFilters(), loadMoreSuccess, loadMoreError);
    };

    var loadMoreSuccess = function (tasks){
      //on success
      $scope.tasks = $scope.tasks.concat(tasks);
      //remove any duplicates objects found in the tasks scope
      $scope.tasks = jQuery.unique($scope.tasks);

      if( tasks.length < $scope.showlimit ){
        jQuery('#loadMoreBtn').hide();
        Alerting.AlertAddMsg('bottom', 'warning', 'There are no more tasks to retrieve');
      }

      //make sure newly added tasks are checked as well
      $scope.busyLoadingMore = false;
    };

    var loadMoreError = function(err){
      // on error - Hide load more button and show error message
      jQuery('#loadMoreBtn').hide();
      Alerting.AlertAddServerMsg(err.status);
    };


    var clearUrlParams =  function(){
      // loop through all parameters
      for (var property in $location.search()) {
        if ($location.search().hasOwnProperty(property)) {
          // set parameter to null to remove
          $location.search(property, null);
        }
      }
    };
    
    //Clear filter data end refresh tasks scope
    $scope.clearFilters = function () {

      // reset default filters
      $scope.filters.limit = 100;
      $scope.filters.date = '';
      $scope.filters.status = '';
      $scope.filters.user = '';
      $scope.settings.list.tabview = 'same';

      // get the filter params object before clearing them
      var filterParamsBeforeClear = JSON.stringify( angular.copy( $location.search() ) );

      // clear all filter parameters
      clearUrlParams();

      // get the filter params object after clearing them
      var filterParamsAfterClear = JSON.stringify( angular.copy( $location.search() ) );

      // if the filters object stays the same then call refresh function
      // if filters object not the same then angular changes route and loads controller ( refresh )
      if ( filterParamsBeforeClear === filterParamsAfterClear ){
        $scope.refreshTasksList();
      }

    };

    /**********************************************/
    /**         Initial load functions           **/
    /**********************************************/



    /*****************************************************/
    /**         General rerun task functions            **/
    /*****************************************************/

    $scope.viewTaskDetails = function(path) {

      var baseUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/#/';
      var taskUrl = baseUrl + path;
      if ( $scope.settings.list.tabview && $scope.settings.list.tabview === 'new' ){
        window.open(taskUrl, '_blank');
      }else{
        $location.path(path);
      }

    };

    $scope.getProcessedTotal = function(task){
      var totalTransactions = task.totalTransactions;
      var remainingTransactions = task.remainingTransactions;
      return parseInt( totalTransactions - remainingTransactions );
    };

    $scope.getProcessedPercentage = function(task){
      var totalTransactions = task.totalTransactions;
      var remainingTransactions = task.remainingTransactions;
      var completedTransactions = totalTransactions - remainingTransactions;
      return ( 100 / totalTransactions * completedTransactions ).toFixed(0) + '%';
    };

    $scope.getExecutionTime = function(task){
      if (task){
        if( task.completedDate ){
          var created = new Date(task.created);
          var completedDate = new Date(task.completedDate);
          var miliseconds = completedDate - created;
          var seconds = miliseconds/1000;
          return seconds.toFixed(2);
        }else{
          return 0;
        }
      }
    };
    
    /*****************************************************/
    /**         General rerun task functions            **/
    /*****************************************************/

    function updateTaskWithStatus(task, status) {
      var updated = new Api.Tasks();
      updated._id = task._id;
      updated.status = status;
      updated.$update({}, function(){
        $route.reload();
      });
    }

    $scope.pauseTask = function(task){
      updateTaskWithStatus(task, 'Paused');
    };

    $scope.resumeTask = function(task){
      updateTaskWithStatus(task, 'Queued');
    };

    $scope.cancelTask = function(task){
      var cancelObject = {
        title: 'Cancel Task',
        button: 'Yes',
        message: 'Are you sure you want to cancel this task?'
      };

      var modalInstance = $modal.open({
        templateUrl: 'views/confirmModal.html',
        controller: 'ConfirmModalCtrl',
        resolve: {
          confirmObject: function () {
            return cancelObject;
          }
        }
      });

      modalInstance.result.then(function () {
        // cancel confirmed
        updateTaskWithStatus(task, 'Cancelled');
      }, function () {
        // cancel cancelled
      });
    };

  });
