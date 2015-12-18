/*
 * (C) Copyright 2014 The Genomics of Gene Expression Lab, CIPF 
 * (http://bioinfo.cipf.es/aconesawp) and others.
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
 *     Rafael Hernandez de Diego, rhernandez@cipf.es
 *     Ana Conesa Cegarra, aconesa@cipf.es
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 * - AnalysisWizardView
 * - AnalysisWizardViewPanel
 * - AnalysisWizardStep2View
 * - AnalysisWizardStep3View
 * - AnalysisWizardStep3StepView
 * - AnalysisWizardCreationDialog
 * 
 */
/* global Ext */

Ext.define('SL.view.AnalysisViews.AnalysisWizardView', {
    requires: ['SL.model.AnalysisModels.Analysis'],
    mixins: {
        //Extends the Observer class
        View: 'SL.view.senchaExtensions.View',
        //Extends the Observer class
        Observer: 'SL.view.senchaExtensions.Observer'
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisWizardViewPanel', {
    extend: 'Ext.container.Container',
    alias: 'widget.AnalysisWizardViewPanel',
    mixins: {AnalysisWizardViewPanel: 'SL.view.AnalysisViews.AnalysisWizardView'},
    requires: ['SL.view.AnalysisViews.FileLocationSelectorField'],
    name: "AnalysisWizardViewPanel",
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    stepNumber: 1,
    analysisModels: null,
    analysisTemplateModel: null,
    analysisDetailsView1: null,
    analysisDetailsView2: null,
    analysisEditorView: null,
    currentPanel: null,
    lastFileLocationField: null,
    inEditionMode: true,
    /**BC******************************************************************************      
     * 
     * GETTERS AND SETTERS
     * 
     **EC******************************************************************************/
    /********************************************************************************      
     * This function returns the associated MODEL showed into the current VIEW 
     *  
     * @return a model      
     ********************************************************************************/
    getModel: function () {
        return this.analysisTemplateModel;
    },
    getAnalysisTemplateModel: function () {
        return this.analysisTemplateModel;
    },
    getAnalysisModels: function () {
        return this.analysisModels;
    },
    loadModel: function (model) {
        this.analysisTemplateModel = model;
        this.sampleViews = null;
        this.stepViews = null;
        this.analysisModels = [];
        this.analysisID = model.getID();
    },
    addNewAnalysisModel: function (newModel) {
        this.analysisModels.push(newModel);
        this.updateAnalysisListView();
    },
    updateObserver: function () {
        this.loadModel(this.getModel());
    },
    getCurrentPanel: function () {
        return this.currentPanel;
    },
    getAnalysisEditorView: function () {
        return this.analysisEditorView;
    },
    showCurrentStepView: function () {
        this.setLoading(true);
        var newPanel = null;
        if (this.stepNumber === 1) {
            $("#headerPanelStepTitle").html("Analysis Wizard - Step 1. Workflow definition");
            $("#headerPanelStepHelp").html("<i class='fa fa-info-circle'></i> Please, define the common pipeline for all the Analysis.");

            //CREATE THE ANALYSIS DETAILS VIEW (DESIGN THE ANALYSIS PIPELINE)
            if (this.analysisEditorView === null) {
                this.analysisEditorView = Ext.create('SL.view.AnalysisViews.AnalysisDetailsView', {parent: this, updatedNeeded: true, flex: 1});
            }

            this.analysisEditorView.flex = 1;

            //REMOVE PREVIOUS MODEL
            //TODO: REVISAR ESTO
            if (this.analysisEditorView.getModel() != null) {
                this.analysisEditorView.getModel().deleteObserver(this.analysisEditorView);
            }

            //LOAD THE TEMPLATE MODEL
            this.analysisEditorView.loadModel(this.getModel());
            this.getModel().addObserver(this.analysisEditorView);
            this.analysisEditorView.setViewMode('wizard');
            newPanel = this.analysisEditorView;

        } else if (this.stepNumber === 2) {
            $("#headerPanelStepTitle").html("Analysis Wizard - Step 2. Analysis creation");
            $("#headerPanelStepHelp").html(" <i class='fa fa-info-circle'></i> Please, for each analysis specify a name and the set of samples associated to each analysis." +
                    " Use \"Apply changes\" button to save the information.");

            //TODO: COMPROBAR SI HA CAMBIADO...           
            //CREATE THE ANALYSIS CREATION PANEL
            if (this.analysisDetailsView1 === null) {
                this.analysisDetailsView1 = Ext.create('SL.view.AnalysisViews.AnalysisWizardStep2View', {parent: this, flex: 2});
            }

            this.updateAnalysisListView();
            newPanel = this.analysisDetailsView1;

        } else if (this.stepNumber === 3) {
            $("#headerPanelStepTitle").html("Analysis Wizard - Step 3. Samples and files assignament");
            $("#headerPanelStepHelp").html("<i class='fa fa-info-circle'></i> Please, for each analysis, fill the information for all steps in the pipeline," +
                    " i.e. type a name for each step, indicate the location of resulting files (if any) and for <i>raw data acquisition steps</i>, indicate which samples were used as input. " +
                    " Use \"Apply changes\" button to save the information.");

            //TODO: COMPROBAR SI HA COMBIADO...
            //CREATE THE ANALYSIS STEP EDITOR PANEL
            if (this.analysisDetailsView2 === null) {
                this.analysisDetailsView2 = Ext.create('SL.view.AnalysisViews.AnalysisWizardStep3View', {parent: this, flex: 2});
            }
            //RESET THE TEMPORAL VARIABLES
            this.lastFileLocationField = null;
            this.lastSampleField = null;
            newPanel = this.analysisDetailsView2;

        } else if (this.stepNumber === 4) {
            $("#headerPanelStepTitle").html("Analysis Wizard - Step 4. Specific details");
            $("#headerPanelStepHelp").html(" <i class='fa fa-info-circle'></i> Finally, specify for each analysis the specific details for the pipeline, i.e. new steps not in the common pipeline, alternative settings for existing steps, etc. Use \"Apply changes\" button to save the information.");

            this.analysisEditorView.flex = 2;

            //CREATE THE ANALYSIS STEP EDITOR PANEL
            if (this.analysisEditorView.getModel() != null) {
                this.analysisEditorView.getModel().deleteObserver(this.analysisEditorView);
            }

            this.analysisEditorView.setViewMode('edition');
            this.analysisEditorView.loadModel(this.analysisModels[0]);
            this.analysisModels[0].deleteObserver(this.analysisEditorView);

            newPanel = this.analysisEditorView;
        }

        //SHOW OR HIDE THE ANALYSIS SELECTOR PANEL (ONLY HIDDEN FOR STEP 1)
        this.queryById("lateralPanel").setVisible(this.stepNumber !== 1);

        //SHOW OR HIDE THE ANALYSIS TOOLBAR (ONLY VISIBLE FOR STEP 2)
        this.queryById("analysisToolbar").setVisible(this.stepNumber === 2);

        //HIDE THE FILE SELECTOR PANEL 
        this.queryById("fileLocationSelectorContainer").setVisible(false);

        if (this.currentPanel !== null) {
            this.remove(this.currentPanel, false);
        }

        newPanel.region = "center";

        this.currentPanel = newPanel;
        this.add(this.currentPanel);

        this.setLoading(false);
    },
    showAnalysisDetails: function (analysisPos) {
        if (analysisPos === "first") {
            analysisPos = 0;
        } else if (analysisPos === "last") {
            analysisPos = this.analysisModels.length - 1;
        }

        if (this.currentPanel.getModel() != null) {
            this.currentPanel.getModel().deleteObserver(this.currentPanel);
        }

        this.currentPanel.loadModel(this.analysisModels[analysisPos]);
        this.currentPanel.getModel().addObserver(this.currentPanel);
        if (this.currentPanel.updateWorkflowPanel !== undefined) {
            this.currentPanel.updateWorkflowPanel
            this.currentPanel.updateWorkflowPanel(true);
        }
    },
    updateAnalysisListView: function () {
        var analysisAux = null, modelsAux = [];
        var analysisListView = this.queryById("analysisListContainer");
        analysisListView.getStore().removeAll();

        for (var i in this.analysisModels) {
            analysisAux = this.analysisModels[i];
            modelsAux.push({analysis_name: analysisAux.getName(), is_valid: analysisAux.checkIsValid(this.stepNumber)});
        }
        analysisListView.getStore().add(modelsAux);
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;

        this.setController(application.getController("AnalysisController"));

        Ext.apply(me, {
            border: 0, layout: 'border', padding: 5,
            items: [
                {xtype: 'box', region: 'north', itemId: "headerPanel",
                    html: "<h1 id='headerPanelStepTitle' class='form_title'></h1><p id='headerPanelStepHelp' style='font-size: 12px; color: #A3A3A3;'></p>"
                },
                {xtype: 'container', itemId: "lateralPanel", region: 'west', border: 0,
                    layout: {type: 'vbox', align: "stretch"}, hidden: true, flex: 1,
                    items: [
                        {xtype: "grid", itemId: "analysisListContainer", flex: 1,
                            store: {fields: ['analysis_name', 'is_valid']},
                            columns: {
                                defaults: {sortable: false, align: 'center', width: 45},
                                items: [
                                    {text: "", dataIndex: 'row_number', width: 18,
                                        renderer: function (value, metaData, record, rowIndex) {
                                            return rowIndex + 1;
                                        }
                                    },
                                    {text: "Analysis name", dataIndex: 'analysis_name', flex: 1, align: 'left', sortable: true},
                                    {text: 'Valid', dataIndex: 'is_valid',
                                        renderer: function (value) {
                                            if (value) {
                                                return '<i class="fa fa-check fa-2x" style="color: rgb(81, 199, 136);"></i>';
                                            } else {
                                                return '<i class="fa fa-close fa-2x" style="color: rgb(242, 105, 105);"></i>';
                                            }
                                        }
                                    },
                                    {xtype: 'customactioncolumn', text: "",
                                        items: [
                                            {icon: "fa-trash-o fa-2x", text: "", style: "color: rgb(242, 105, 105);", tooltip: 'Delete this analysis.',
                                                handler: function (grid, rowIndex, colIndex) {
                                                    alert("TODO");
                                                }
                                            }]
                                    }
                                ]},
                            dockedItems: [
                                {xtype: 'toolbar', itemId: "analysisToolbar",
                                    items: [
                                        '->',
                                        {text: '<i class="fa fa-plus-circle"></i> Add new analysis', itemId: "addNewAnalysisButton", tooltip: 'Add new Analysis', cls: 'button', scope: me,
                                            handler: function () {
                                                if (me.analysisModels.length > 0) {
                                                    me.getController().analysisWizardApplyChangesButtonClickHandler(me.currentPanel, me.stepNumber);
                                                }
                                                this.getController().analysisWizardAddNewAnalysisButtonClickHandler(this);
                                            }
                                        }
                                    ]
                                }
                            ],
                            listeners: {
                                itemclick: function (dv, record, item, index, e) {
                                    me.getController().analysisWizardApplyChangesButtonClickHandler(me.currentPanel, me.stepNumber);
                                    me.showAnalysisDetails(index);
                                }
                            }
                        },
                        {xtype: 'container', itemId: "fileLocationSelectorContainer", flex: 1, border: 0,
                            layout: {type: "vbox", align: "stretch"},
                            items: [
                                {xtype: "FileLocationSelectorPanel", flex: 1, border: 0},
                                {xtype: 'button', text: '<i class="fa fa-plus-circle"></i> Add Selection', cls: "button",
                                    handler: function () {
                                        if (me.lastFileLocationField !== null) {
                                            var prevValue = me.lastFileLocationField.getValue();
                                            prevValue = (prevValue !== "" ? prevValue.chomp() + "\n" : prevValue);
                                            var selectedPaths = this.previousSibling("FileLocationSelectorPanel").getSelectedPaths();
                                            for (var i in selectedPaths) {
                                                prevValue += selectedPaths[i] + "\n";
                                            }
                                            me.lastFileLocationField.setRawValue(prevValue);
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            listeners: {
                afterlayout: function () {
                    //TODO: REMOVE THIS CODE
                    if (debugging === true)
                        console.info("AnalysisWizardViewPanel : Layout");
                },
                beforedestroy: function () {
                    Ext.destroy([this.analysisEditorView, this.analysisDetailsView1, this.analysisDetailsView2]);
                    if (this.getModel() != null) {
                        this.getModel().deleteObserver(this);
                    }
                }
            }
        });

        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisWizardStep2View', {
    extend: 'Ext.container.Container',
    mixins: {AnalysisWizardStep2View: 'SL.view.AnalysisViews.AnalysisWizardView'},
    alias: 'widget.AnalysisWizardStep2View',
    requires: ['SL.view.SampleViews.AnalyticalReplicateView'],
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    parent: null,
    /********************************************************************************      
     * This function returns the associated MODEL showed into the current VIEW 
     *  
     * @return a model      
     ********************************************************************************/
    getModel: function () {
        return this.model;
    },
    loadModel: function (model) {
        //SET THE ANALYSIS NAME FIELD
        this.model = model;
        this.queryById('analysisNameField').setValue(this.model.getName());

        //SET THE CONTENT OF THE SAMPLES GRID
        var selectedSamples = this.model.getUsedSamples();
        this.queryById("selectedSamplesGrid").getStore().loadData(selectedSamples);
        this.queryById('analysisNameContainer').setVisible(true);
        this.queryById('selectedSamplesGrid').setVisible(true);
        this.queryById('emptyBox').setVisible(false);
    },
    updateObserver: function () {
    },
    validate: function () {
        this.queryById('analysisNameField').validate();
    },
    setLoading: function (loading) {
        this.parent.setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    /**BC**************************************************************************************
     ** 
     ** SOME EVENTS HANDLERS
     ** 
     **EC**************************************************************************************/

    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;
        this.setController(application.getController("AnalysisController"));

        Ext.apply(me, {autoScroll: true, layout: {type: "vbox", align: "stretch", padding: 20},
            items: [
                {xtype: "box", itemId: "emptyBox", style: "background-color: #FAFAFA;text-align: center;",
                    html: '<h1 style="font-size: 25px; color: #DB5A74;margin-top: 22%;">No analysis selected</h1>'
                            + '<p style=" font-size: 20px; color: #A3A3A3;">To start editing, please choose an Analysis at the "Analysis Browser" panel</p>', flex: 1},
                {xtype: "container", itemId: "analysisNameContainer", layout: {type: "hbox", pack: "center"}, hidden: true, items: [
                        {xtype: "textfield", itemId: "analysisNameField", fieldLabel: 'Analysis name', labelWidth: 120, allowBlank: false, margin: "15px 0px", flex: 1},
                        {xtype: "button", text: '<i class="fa fa-check"></i> Apply changes', cls: 'acceptButton', scope: this, margin: "10",
                            handler: function () {
                                this.getController().analysisWizardApplyChangesButtonClickHandler(me, 2);
                            }
                        }
                    ]
                },
                {xtype: "grid", itemId: "selectedSamplesGrid", hidden: true, flex: 1,
                    emptyText: '<p style="font-size: 18px; color: #DB5A74;padding-left: 15px;">No samples specified. Analysis must be associated to at least one sample.</p>',
                    store: Ext.create('Ext.data.Store', {
                        fields: [{name: 'analytical_rep_id'}, {name: 'analytical_rep_name'}],
                        idProperty: "analytical_rep_id",
                        data: []
                    }),
                    columns: [
                        {text: "Analytical sample name", flex: 1, sortable: true, dataIndex: 'analytical_rep_name'},
                        {xtype: 'actioncolumn', itemId: 'deleteRowButton',
                            width: 30, sortable: false,
                            items: [{icon: 'resources/images/delete_row_16x16.gif', tooltip: 'Delete this Analytical Sample',
                                    handler: function (grid, rowIndex, colIndex) {
                                        console.error("CHECK THIS CODE");
                                        application.getController("BioReplicateController").removeAnalyticalRepButtonClickHandler(grid, rowIndex);
                                    }
                                }
                            ]
                        }
                    ], // inline buttons
                    dockedItems: [
                        {xtype: 'toolbar', items: [
                                {text: '<i class="fa fa-plus-circle"></i> Add new samples', tooltip: 'Add new samples to this analysis', cls: 'button',
                                    handler: function (button) {
                                        Ext.create("SL.view.SampleViews.AnalyticalReplicateSelectorWindow", {multiselection: true,
                                            callBackFn: function (selectedSamples) {
                                                button.up("grid").getStore().add(selectedSamples);
                                            }
                                        }).show();
                                    }
                                }]}
                    ]
                }
            ],
            listeners: {
                beforedestroy: function () {
                    if (this.getModel() != null) {
                        this.getModel().deleteObserver(this);
                    }
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisWizardStep3View', {
    extend: 'Ext.container.Container',
    mixins: {AnalysisWizardStep3View: 'SL.view.AnalysisViews.AnalysisWizardView'},
    alias: 'widget.AnalysisWizardStep3View',
    /**BC******************************************************************************      
     * 
     * SOME ATTRIBUTES
     * 
     **EC******************************************************************************/
    parent: null,
    /********************************************************************************      
     * This function returns the associated MODEL showed into the current VIEW 
     *  
     * @return a model      
     ********************************************************************************/
    getModel: function () {
        return this.model;
    },
    loadModel: function (model) {
        //SET THE ANALYSIS NAME FIELD
        this.model = model;
        this.queryById('analysisNameLabel').update("<h1 class='form_subtitle'>" + this.model.getName() + "</h1>");

        var rawDataStepsContainer = this.queryById("rawDataStepsContainer");
        var intermediateDataStepsContainer = this.queryById("intermediateDataStepsContainer");
        var processedDataStepsContainer = this.queryById("processedDataStepsContainer");

        //REMOVE ALL THE PREVIOUS PANELS
        rawDataStepsContainer.removeAll();
        intermediateDataStepsContainer.removeAll();
        processedDataStepsContainer.removeAll();

        //FIRST ADD THE NON PROCESSED DATA
        var steps = this.model.getNonProcessedData();
        var stepView, stepModel;
        for (var i = 0; i < steps.getCount(); i++) {
            stepModel = steps.getAt(i);
            stepView = Ext.widget("AnalysisWizardStep3StepView", {parent: this});
            stepView.loadModel(stepModel, this.model.getName());
            if (stepModel.getType() === "rawdata") {
                rawDataStepsContainer.add(stepView);
            } else {
                intermediateDataStepsContainer.add(stepView);
            }
        }

        steps = this.model.getProcessedData();
        for (var i = 0; i < steps.getCount(); i++) {
            stepView = Ext.widget("AnalysisWizardStep3StepView", {parent: this});
            stepView.loadModel(steps.getAt(i), this.model.getName());
            processedDataStepsContainer.add(stepView);
        }

        if (rawDataStepsContainer.child() === null) {
            rawDataStepsContainer.update('<p style="font-size: 18px; color: #DB5A74;padding-left: 15px;">No steps were added</p>');
        }
        if (intermediateDataStepsContainer.child() === null) {
            intermediateDataStepsContainer.update('<p style="font-size: 18px; color: #DB5A74;padding-left: 15px;">No steps were added</p>');
        }
        if (processedDataStepsContainer.child() === null) {
            processedDataStepsContainer.update('<p style="font-size: 18px; color: #DB5A74;padding-left: 15px;">No steps were added</p>');
        }

        this.queryById('emptyBox').setVisible(false);
        this.queryById('analysisNameContainer').setVisible(true);
        this.queryById('analysisWorkflowPanel').setVisible(true);
        this.queryById('stepsContainer').setVisible(true);
        this.updateWorkflowPanel();
    },
    updateObserver: function () {
    },
    setLoading: function (loading) {
        this.parent.setLoading(loading);
        if (loading === true) {
            Ext.suspendLayouts();
        } else {
            Ext.resumeLayouts(true);
        }
    },
    updateWorkflowPanel: function (force) {
        force = (force === undefined) ? false : force;
        var workflowPanel = this.queryById('analysisWorkflowPanel');
        if (workflowPanel.updateNeeded === true || force === true) {
            workflowPanel.setLoading(true);
            var json_data = this.getModel().getJSONforGraph();
            this.cytoscape_graph = configureCytoscapeAnalysisGraph(workflowPanel, 'cytoscapeweb_analysis', json_data);
            workflowPanel.updateNeeded = false;
            workflowPanel.setLoading(false);
        }
    },
    validate: function () {
        var children = this.query("AnalysisWizardStep3StepView");
        for (var i in children) {
            children[i].validate();
        }
    },
    /**BC**************************************************************************************
     ** 
     ** SOME EVENTS HANDLERS
     ** 
     **EC**************************************************************************************/
    /**BC*********************************************************************************************************
     * This function handles the event fires when
     * 
     * @return 
     /**EC*********************************************************************************************************/
    onAnalysisWorkflowPanelResize: function () {
        try {
            if (this.cytoscape_graph != null)
                this.cytoscape_graph.resize();
            this.cytoscape_graph.fit();
        } catch (error) {
        }
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;
        this.setController(application.getController("AnalysisController"));

        Ext.apply(me, {layout: {type: "vbox", align: "stretch", padding: 20},
            items: [
                {xtype: "box", itemId: "emptyBox", style: "background-color: #FAFAFA;text-align: center;",
                    html: '<h1 style="font-size: 25px; color: #DB5A74;margin-top: 22%;">No analysis selected</h1>'
                            + '<p style=" font-size: 20px; color: #A3A3A3;">To start editing, please choose an Analysis at the "Analysis Browser" panel</p>', flex: 1},
                {xtype: "container", itemId: "analysisNameContainer", layout: "hbox", hidden: true, items: [
                        {xtype: "label", itemId: "analysisNameLabel", flex: 1},
                        {xtype: "button", text: '<i class="fa fa-check"></i> Apply changes', cls: 'acceptButton', margin: "10", scope: this,
                            handler: function () {
                                var mainView = this.up("AnalysisWizardViewPanel");
                                mainView.queryById("fileLocationSelectorContainer").setVisible(false);
                                mainView.queryById("analysisListContainer").setVisible(true);
                                this.getController().analysisWizardApplyChangesButtonClickHandler(me, 3);
                            }
                        }
                    ]
                },
                {xtype: 'panel', itemId: 'analysisWorkflowPanel', updateNeeded: true, minHeight: 150, height: 150, cls: 'fieldBox', border: 1, hidden: true,
                    html: '<div  class="cytoscapewebPanel" id="cytoscapeweb_analysis">Cytoscape Web should replace this content with the workflow diagram. If not, please check your flash settings.</div><div id="note"></div>',
                    listeners: {
                        resize: {fn: me.onAnalysisWorkflowPanelResize, scope: me}
                    }
                },
                {xtype: "container", itemId: "stepsContainer", autoScroll: true, flex: 1, hidden: true, items: [
                        {xtype: "label", html: "<h1 class='form_subtitle'>Raw data acquisition steps</h1>"},
                        {xtype: "container", itemId: "rawDataStepsContainer", items: []},
                        {xtype: "label", html: "<h1 class='form_subtitle'>Intermediate data generation steps</h1>"},
                        {xtype: "container", itemId: "intermediateDataStepsContainer", items: []},
                        {xtype: "label", html: "<h1 class='form_subtitle'>Processed data generation steps</h1>"},
                        {xtype: "container", itemId: "processedDataStepsContainer", items: []},
                    ]
                }
            ],
            listeners: {
                beforedestroy: function () {
                    if (this.getModel() != null) {
                        this.getModel().deleteObserver(this);
                    }
                }
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisWizardStep3StepView', {
    extend: 'Ext.container.Container',
    mixins: {AnalysisWizardStep3StepView: 'SL.view.AnalysisViews.AnalysisWizardView'},
    alias: 'widget.AnalysisWizardStep3StepView',
    /********************************************************************************      
     * SOME ATTRIBUTES
     ********************************************************************************/
    border: 0, model: null, index: 0, parent: null,
    /********************************************************************************      
     * FUNCTION DEFINITION
     ********************************************************************************/
    loadModel: function (stepModel, analysisName) {
        this.model = stepModel;
        var stepName = this.model.getName();
        if (stepName == null || stepName === "") {
            stepName = analysisName + "_";
            if (this.model.getType() === "rawdata") {
                stepName += this.model.getRawDataType();
            } else if (this.model.getType() === "intermediate_data") {
                stepName += this.model.getIntermediateDataType();
            } else {
                stepName += this.model.getProcessedDataType();
            }
        }
        this.queryById("stepNameField").setValue(stepName);
        if (this.model.getType() === "rawdata") {
            this.queryById("usedSampleIDField").setVisible(true);
            this.queryById("usedSampleIDField").setValue(this.model.getAnalyticalReplicateID());
        }
        this.queryById("fileLocationArea").setValue(this.model.getFileLocation());
    },
    getModel: function () {
        return this.model;
    },
    getFileLocation: function () {
        return this.queryById("fileLocationArea").getValue();
    },
    getAnalyticalReplicateID: function () {
        return this.queryById("usedSampleIDField").getValue();
    },
    validate: function () {
        this.queryById("usedSampleIDField").validate();
        this.queryById("fileLocationArea").validate();
    },
    /**BC**************************************************************************************** 
     * 
     * COMPONENT DEFINITION
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;
        this.setController(application.getController("AnalysisController"));

        Ext.apply(me, {
            padding: 10, cls: 'fieldBox', defaults: {width: "100%", labelAlign: "top", labelWidth: 500},
            items: [
                {xtype: 'textfield', itemId: "stepNameField", fieldLabel: 'Step name', allowBlank: false,
                    listeners: {
                        focus: function () {
                            var mainView = this.up("AnalysisWizardViewPanel");
                            mainView.queryById("fileLocationSelectorContainer").setVisible(false);
                            mainView.queryById("analysisListContainer").setVisible(true);
                            mainView.lastFileLocationField = null;
                        }
                    }
                },
                {xtype: 'combo', itemId: "usedSampleIDField", fieldLabel: 'Used sample name', width: "100%",
                    hidden: true, displayField: 'analytical_rep_name', valueField: 'analytical_rep_id',
                    validator: function () {
                        return (me.getModel().getType() !== "rawdata") || (this.getValue() !== "");
                    },
                    store: Ext.create('Ext.data.Store', {
                        fields: [{name: 'analytical_rep_id'}, {name: 'analytical_rep_name'}], idProperty: "analytical_rep_id",
                        data: me.parent.getModel().getUsedSamples()
                    }),
                    listeners: {
                        focus: function () {
                            var mainView = this.up("AnalysisWizardViewPanel");
                            mainView.queryById("fileLocationSelectorContainer").setVisible(false);
                            mainView.queryById("analysisListContainer").setVisible(true);
                            mainView.lastFileLocationField = null;
                        }
                    }
                },
                {xtype: 'textarea', fieldLabel: 'Location for generated files', itemId: 'fileLocationArea', minHeight: 150,
                    validator: function () {
                        //TODO: CHECK IF THE NAME AND THE ID ARE IN THE SAMPLES LIST
                        return (me.getModel().getType() === "intermediate_data") || (this.getValue() !== "");
                    },
                    listeners: {
                        focus: function () {
                            var mainView = this.up("AnalysisWizardViewPanel");
                            mainView.queryById("fileLocationSelectorContainer").setVisible(true);
                            mainView.queryById("analysisListContainer").setVisible(false);
                            mainView.lastFileLocationField = this;
                        }
                    }
                }
            ],
            listeners: {
                boxready: function () {
                    $(this.getEl().dom).mouseenter(function () {
//                            mainView.cytoscape_graph.select("nodes", [me.getModel().getID()]);
                    });
                    $(this.getEl().dom).mouseout(function () {
//                            mainView.cytoscape_graph.deselect();
                    });
                },
            }
        });
        me.callParent(arguments);
    }
});

Ext.define('SL.view.AnalysisViews.AnalysisWizardCreationDialog', {
    extend: 'Ext.window.Window',
    mixins: {AnalysisWizardCreationDialog: 'SL.view.AnalysisViews.AnalysisWizardView'},
    alias: 'widget.AnalysisWizardCreationDialog',
    analysisModels: null,
    loadModels: function (analysisModels) {
        this.analysisModels = analysisModels;
        var store = [];

        for (var i in analysisModels) {
            store.push({analysis_name: analysisModels[i].getName(), status: "waiting"});
        }
        this.queryById("analysisListContainer").getStore().loadRawData(store);
    },
    getAnalysisCount: function () {
        return this.analysisModels.length;
    },
    getAnalysisModel: function (analysisNumber) {
        return this.analysisModels[analysisNumber];
    },
    changeStatus: function (analysisNumber, newStatus) {
        this.queryById("analysisListContainer").getStore().getAt(analysisNumber).set("status", newStatus);
    },
    /**BC****************************************************************************************
     * 
     * COMPONENT DEFINITION
     * 
     **EC****************************************************************************************/
    initComponent: function () {
        var me = this;
        this.setController(application.getController("AnalysisController"));

        Ext.apply(me, {
            width: 500, height: 400, layout: 'fit', closable: false, modal: true,
            items: [
                {xtype: "grid", title: "Creating analysis...", itemId: "analysisListContainer",
                    store: {fields: ['analysis_name', 'status']},
                    columns: [
                        {text: "Analysis name", dataIndex: 'analysis_name', flex: 1, sortable: false},
                        {text: 'Status', dataIndex: 'status', sortable: false, align: 'center', width: 80, renderer: function (value) {
                                if (value === "done") {
                                    return '<i class="fa fa-check" style="color: rgb(81, 199, 136);"></i> Saved';
                                } else if (value === "waiting") {
                                    return '<i class="fa fa-clock-o" style="color: rgb(136, 136, 136);"></i> Waiting';
                                } else if (value === "sending") {
                                    return '<i class="fa fa-paper-plane-o" style="color: rgb(19, 153, 223);"></i> Sending';
                                } else {
                                    return '<i class="fa fa-close" style="color: rgb(242, 105, 105);"></i> Failed';
                                }
                            }
                        }
                    ]
                }
            ],
            buttons: [
                {text: '<i class="fa fa-check"></i> Close', cls: 'button', hidden: true, itemId: 'closeButton', scope: me, handler: function () {
                        this.close();
                    }
                }
            ]
        });
        me.callParent(arguments);
    }
});
