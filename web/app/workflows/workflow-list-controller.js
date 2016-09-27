/*
* (C) Copyright 2016 SLU Global Bioinformatics Centre, SLU
* (http://sgbc.slu.se) and the B3Africa Project (http://www.b3africa.org/).
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the GNU Lesser General Public License
* (LGPL) version 3 which accompanies this distribution, and is available at
* http://www.gnu.org/licenses/lgpl.html
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
* Lesser General Public License for more details.
*
* Contributors:
*     Rafael Hernandez de Diego <rafahdediego@gmail.com>
*     Tomas Klingström
*     Erik Bongcam-Rudloff
*     and others.
*
* THIS FILE CONTAINS THE FOLLOWING MODULE DECLARATION
* - WorkflowListController
*
*/
(function(){
	var app = angular.module('workflows.controllers.workflow-list', [
		'common.dialogs',
		'angular.backtop',
		'workflows.services.workflow-list',
		'workflows.directives.workflow-card'
	]);

	//TODO: MOVE TO DIRECTIVES
	app.directive('ngEnter', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (event) {
				if(event.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.ngEnter);
					});
					event.preventDefault();
				}
			});
		};
	});

	/***************************************************************************/
	/*CONTROLLERS **************************************************************/
	/***************************************************************************/
	app.controller('WorkflowListController', function($rootScope, $scope, $http, $dialogs, WorkflowList){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------

		this.retrieveWorkflowsData = function(group, force){
			$scope.isLoading = true;

			if(WorkflowList.getOld() > 1 || force){ //Max age for data 5min.
				$http($rootScope.getHttpRequestConfig("GET", "workflow-list", {
					params:  {"show_published" : (group !== 'my_workflows')}})
				).then(
					function successCallback(response){
						$scope.isLoading = false;

						if(group === 'my_workflows'){
							$scope.workflows = WorkflowList.updateWorkflows(response.data).getWorkflows();
						}else{
							$scope.workflows = WorkflowList.setWorkflows(response.data).getWorkflows();
						}
						$scope.tags =  WorkflowList.updateTags().getTags();
						$scope.filteredWorkflows = $scope.workflows.length;

						//Display the workflows in batches
						if(window.innerWidth > 1500){
							$scope.visibleWorkflows = 14;
						}else if(window.innerWidth > 1200){
							$scope.visibleWorkflows = 10;
						}else{
							$scope.visibleWorkflows = 6;
						}

						$scope.visibleWorkflows = Math.min($scope.filteredWorkflows, $scope.visibleWorkflows);
					},
					function errorCallback(response){
						$scope.isLoading = false;

						debugger;
						var message = "Failed while retrieving the workflows list.";
						$dialogs.showErrorDialog(message, {
							logMessage : message + " at WorkflowListController:retrieveWorkflowsData."
						});
						console.error(response.data);
					}
				);
			}else{
				$scope.workflows = WorkflowList.getWorkflows();
				$scope.tags =  WorkflowList.getTags();
				$scope.filteredWorkflows = $scope.workflows.length;
				$scope.isLoading = false;
			}
		};

		this.retrieveWorkflowDetails = function(workflow){
			$http($rootScope.getHttpRequestConfig(
				"GET",
				"workflow-info",
				{extra: workflow.id}
			)).then(
				function successCallback(response){
					for (var attrname in response.data) {
						workflow[attrname] = response.data[attrname];
					}
					workflow.steps = Object.values(workflow.steps);
				},
				function errorCallback(response){
					if(response.data.err_code === 403002){
						workflow.annotation = "This workflow is not owned by or shared with you.";
						workflow.valid = false;
						workflow.importable = true;
					}else{
						workflow.annotation = "Unable to get the description: " + response.data.err_msg;
						workflow.valid = false;
					}
					return;
				}
			);
		};

		/**
		* This function defines the behaviour for the "filterWorkflows" function.
		* Given a item (workflow) and a set of filters, the function evaluates if
		* the current item contains the set of filters within the different attributes
		* of the model.
		*
		* @returns {Boolean} true if the model passes all the filters.
		*/
		$scope.filterWorkflows = function() {
			$scope.filteredWorkflows = 0;
			$scope.username = $scope.username || Cookies.get("loggedUsername");
			return function( item ) {
				if($scope.show === "my_workflows" && item.owner !== $scope.username){
					return false;
				}

				var filterAux, item_tags;
				for(var i in $scope.filters){
					filterAux = $scope.filters[i].toLowerCase();
					item_tags = item.tags.join("");
					if(!((item.name.toLowerCase().indexOf(filterAux)) !== -1 ||(item_tags.toLowerCase().indexOf(filterAux)) !== -1)){
						return false;
					}
				}
				$scope.filteredWorkflows++;
				return true;
			};
		};

		$scope.getTagColor = function(_tag){
			var tag = WorkflowList.getTag(_tag);
			if(tag !== null){
				return tag.color;
			}
			return "";
		}

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		this.importWorkflowHandler = function(workflow) {
			var me = this;

			$dialogs.showConfirmationDialog('Add the workflow ' + workflow.name + ' to your collection?', {
				title: "Please confirm this action.",
				callback : function(result){
					if(result === 'ok'){
						$http($rootScope.getHttpRequestConfig("POST", "workflow-import", {
							headers: {'Content-Type': 'application/json; charset=utf-8'},
							data: {"shared_workflow_id" : workflow.id}
						})).then(
							function successCallback(response){
								$dialogs.showSuccessDialog("The workflow has being successfully imported.");
								// Deep copy
								var newWorkflow = jQuery.extend(true, {}, workflow);
								for (var attrname in response.data) {
									newWorkflow[attrname] = response.data[attrname];
								}
								WorkflowList.addWorkflow(newWorkflow);
								me.retrieveWorkflowsData("my_workflows", true);
							},
							function errorCallback(response){
								debugger;
								var message = "Failed while importing the workflow.";
								$dialogs.showErrorDialog(message, {
									logMessage : message + " at WorkflowListController:importWorkflowHandler."
								});
								console.error(response.data);
								debugger
							}
						);
					}
				}
			});
		}

		this.deleteWorkflowHandler = function(workflow) {
			var me = this;
			$dialogs.showConfirmationDialog('Delete the workflow ' + workflow.name + ' from your collection?\nThis action cannot be undone.', {
				title: "Please confirm this action.",
				callback : function(result){
					if(result === 'ok'){
						$http($rootScope.getHttpRequestConfig("DELETE", "workflow-delete", {
							headers: {'Content-Type': 'application/json; charset=utf-8'},
							extra: workflow.id
						})).then(
							function successCallback(response){
								$dialogs.showSuccessDialog("The workflow was successfully deleted.");
								$scope.workflows = WorkflowList.deleteWorkflow(workflow.id);
								$scope.tags =  WorkflowList.updateTags().getTags();
								// $scope.filteredWorkflows = $scope.workflows.length;
								me.retrieveWorkflowsData("my_workflows", true);
							},
							function errorCallback(response){
								debugger;
								var message = "Failed while deleting the workflow.";
								$dialogs.showErrorDialog(message, {
									logMessage : message + " at WorkflowListController:deleteWorkflowHandler."
								});
								console.error(response.data);
								debugger
							}
						);
					}
				}
			});
		}

		this.showWorkflowChooserChangeHandler = function() {
			this.retrieveWorkflowsData($scope.show);
		}
		/**
		* This function applies the filters when the user clicks on "Search"
		*/
		this.applySearchHandler = function() {
			var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
			$scope.filters = WorkflowList.setFilters(filters).getFilters();
		};

		this.filterByTag = function(tag){
			if(tag !== "All"){
				var filters = arrayUnique($scope.filters.concat(tag));
				$scope.filters = WorkflowList.setFilters(filters).getFilters();
			}
		}

		/**
		* This function remove a given filter when the user clicks at the "x" button
		*/
		this.removeFilterHandler = function(filter){
			$scope.filters = WorkflowList.removeFilter(filter).getFilters();
		};

		this.showMoreWorkflowsHandler = function(){
			if(window.innerWidth > 1500){
				$scope.visibleWorkflows += 10;
			}else if(window.innerWidth > 1200){
				$scope.visibleWorkflows += 6;
			}else{
				$scope.visibleWorkflows += 4;
			}
			$scope.visibleWorkflows = Math.min($scope.filteredWorkflows, $scope.visibleWorkflows);
		}



		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;

		//This controller uses the WorkflowList, which defines a Singleton instance of
		//a list of workflows + list of tags + list of filters. Hence, the application will not
		//request the data everytime that the workflow list panel is displayed (data persistance).
		$scope.workflows = WorkflowList.getWorkflows();
		$scope.tags =  WorkflowList.getTags();
		$scope.filters =  WorkflowList.getFilters();
		$scope.filteredWorkflows = $scope.workflows.length;

		//Display the workflows in batches
		if(window.innerWidth > 1500){
			$scope.visibleWorkflows = 14;
		}else if(window.innerWidth > 1200){
			$scope.visibleWorkflows = 10;
		}else{
			$scope.visibleWorkflows = 6;
		}

		$scope.visibleWorkflows = Math.min($scope.filteredWorkflows, $scope.visibleWorkflows);


		if($scope.workflows.length === 0){
			this.retrieveWorkflowsData("my_workflows");
		}
	});
})();
