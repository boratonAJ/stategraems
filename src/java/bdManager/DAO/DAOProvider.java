/* ***************************************************************
 *  This file is part of STATegra EMS.
 *
 *  STATegra EMS is free software: you can redistribute it and/or 
 *  modify it under the terms of the GNU General Public License as
 *  published by the Free Software Foundation, either version 3 of 
 *  the License, or (at your option) any later version.
 * 
 *  STATegra EMS is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with STATegra EMS.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *  More info http://bioinfo.cipf.es/stategraems
 *  Technical contact stategraemsdev@gmail.com
 *  *************************************************************** */
package bdManager.DAO;

import bdManager.DAO.analysis.Analysis_JDBCDAO;
import bdManager.DAO.analysis.QualityReport_JDBCDAO;
import bdManager.DAO.analysis.Step_JDBCDAO;
import bdManager.DAO.analysis.non_processed_data.intermediate_data.*;
import bdManager.DAO.analysis.non_processed_data.raw_data.ExtractionMethods.*;
import bdManager.DAO.analysis.non_processed_data.raw_data.RAWdata_JDBCDAO;
import bdManager.DAO.analysis.non_processed_data.raw_data.SeparationMethods.*;
import bdManager.DAO.analysis.processed_data.*;
import bdManager.DAO.analysis.processed_data.region_step.*;
import bdManager.DAO.samples.*;
import classes.analysis.Analysis;
import classes.analysis.ProcessedData;
import classes.analysis.QualityReport;
import classes.analysis.non_processed_data.IntermediateData;
import classes.analysis.non_processed_data.RAWdata;
import classes.analysis.non_processed_data.intermediate_data.*;
import classes.analysis.non_processed_data.raw_data.ExtractionMethod;
import classes.analysis.non_processed_data.raw_data.ExtractionMethods.*;
import classes.analysis.non_processed_data.raw_data.SeparationMethods.*;
import classes.analysis.processed_data.*;
import classes.analysis.processed_data.region_step.*;

/**
 *
 * @author Rafa Hernández de Diego
 */
public class DAOProvider {

    public static DAO getDAO(Object object) {
        if (object instanceof Analysis) {
            return new Analysis_JDBCDAO();
            //************************
            // EXTRACTION METHOD DAOS 
            //************************
        } else if (object instanceof ExtractionMethod) {
            if (object instanceof ChIPseq) {
                return new ChIPseq_JDBCDAO();
            } else if (object instanceof DNaseseq) {
                return new DNaseseq_JDBCDAO();
            } else if (object instanceof Methylseq) {
                return new Methylseq_JDBCDAO();
            } else if (object instanceof SmallRNAseq) {
                return new SmallRNAseq_JDBCDAO();
            } else if (object instanceof MRNAseq) {
                return new MRNAseq_JDBCDAO();
            } else if (object instanceof MassSpectrometry) {
                return new MassSpectrometry_JDBCDAO();
            } else if (object instanceof NuclearMagneticResonance) {
                return new NuclearMagneticResonance_JDBCDAO();
            }
            //************************
            // SEPARATION METHODS DAOS 
            //************************
        } else if (object instanceof SeparationMethod) {
            if (object instanceof ColumnChromatography) {
                return new ColumnChromatography_JDBCDAO();
            } else if (object instanceof CapillaryElectrophoresis) {
                return new CapillaryElectrophoresis_JDBCDAO();
            }
        } else if (object instanceof RAWdata) {
            return new RAWdata_JDBCDAO();
            //************************
            // INTERMEDIATE STEP DAOS 
            //************************
        } else if (object instanceof IntermediateData) {
            if (object instanceof Extract_relevant_features_step) {
                return new ExtractRelevantFeaturesStep_JDBCDAO();
            } else if (object instanceof Mapping_step) {
                return new MappingStep_JDBCDAO();
//            } else if (object instanceof Maxquant_step) {
//                return new MaxquantStep_JDBCDAO();
            } else if (object instanceof Preprocessing_step) {
                return new PreprocessingStep_JDBCDAO();
            } else if (object instanceof Smoothing_step) {
                return new SmoothingStep_JDBCDAO();
            } else if (object instanceof Union_step) {
                return new UnionStep_JDBCDAO();
            }
        } else if (object instanceof ProcessedData) {
            //************************
            // PROCESSED STEP DAOS 
            //************************
            if (object instanceof Calling_step) {
                return new Calling_step_JDBCDAO();
            } else if (object instanceof Data_matrix_step) {
                return new Data_matrix_step_JDBCDAO();
            } else if (object instanceof Merging_step) {
                return new Merging_step_JDBCDAO();
            } else if (object instanceof Proteomics_msquantification_step) {
                return new Proteomics_msquantification_step_JDBCDAO();
            } else if (object instanceof Quantification_step) {
                return new Quantification_step_JDBCDAO();
            } else if (object instanceof Region_calling_step) {
                return new Region_calling_step_JDBCDAO();
            } else if (object instanceof Region_intersection_step) {
                return new Region_intersection_step_JDBCDAO();
            } else if (object instanceof Region_consolidation_step) {
                return new Region_consolidation_step_JDBCDAO();
            }
        } else if (object instanceof QualityReport) {
            return new QualityReport_JDBCDAO();
        } else {
            return null;
        }
        return null;
    }

    public static DAO getDAOByName(String className) {
        if ("Experiment".equalsIgnoreCase(className)) {
            return new Experiment_JDBCDAO();
        } else if ("BioCondition".equalsIgnoreCase(className)) {
            return new BioCondition_JDBCDAO();
        } else if ("Bioreplicate".equalsIgnoreCase(className)) {
            return new Bioreplicate_JDBCDAO();
        } else if ("AnalyticalReplicate".equalsIgnoreCase(className)) {
            return new AnalyticalReplicate_JDBCDAO();
        } else if ("Batch".equalsIgnoreCase(className)) {
            return new Batch_JDBCDAO();
        } else if ("Treatment".equalsIgnoreCase(className)) {
            return new Treatment_JDBCDAO();
        } else if ("Analysis".equalsIgnoreCase(className)) {
            return new Analysis_JDBCDAO();
        } else if ("Step".equalsIgnoreCase(className)) {
            return new Step_JDBCDAO();
        } else if ("NonProcessedData".equalsIgnoreCase(className)) {
            //TODO
            return new Step_JDBCDAO();
            //RAW DATA
        } else if ("RAWData".equalsIgnoreCase(className)) {
            return new RAWdata_JDBCDAO();
        } else if ("ChIPseq".equalsIgnoreCase(className)) {
            return new ChIPseq_JDBCDAO();
        } else if ("DNaseseq".equalsIgnoreCase(className)) {
            return new DNaseseq_JDBCDAO();
        } else if ("mRNAseq".equalsIgnoreCase(className)) {
            return new MRNAseq_JDBCDAO();
        } else if ("GCMS".equalsIgnoreCase(className)) {
            return new MassSpectrometry_JDBCDAO();
        } else if ("LCMS".equalsIgnoreCase(className)) {
            return new MassSpectrometry_JDBCDAO();
        } else if ("CEMS".equalsIgnoreCase(className)) {
            return new MassSpectrometry_JDBCDAO();
        } else if ("MassSpectrometry".equalsIgnoreCase(className)) {
            return new MassSpectrometry_JDBCDAO();
        } else if ("Methylseq".equalsIgnoreCase(className)) {
            return new Methylseq_JDBCDAO();
        } else if ("SmallRNAseq".equalsIgnoreCase(className)) {
            return new SmallRNAseq_JDBCDAO();
        } else if ("NuclearMagneticResonance".equalsIgnoreCase(className)) {
            return new NuclearMagneticResonance_JDBCDAO();
        } else if ("LiquidChromatography".equalsIgnoreCase(className)) {
            return new ColumnChromatography_JDBCDAO();
        } else if ("GasChromatography".equalsIgnoreCase(className)) {
            return new ColumnChromatography_JDBCDAO();
        } else if ("ColumnChromatography".equalsIgnoreCase(className)) {
            return new ColumnChromatography_JDBCDAO();
        } else if ("CapillaryElectrophoresis".equalsIgnoreCase(className)) {
            return new CapillaryElectrophoresis_JDBCDAO();
            //INTERMEDIATE DATA
        } else if ("IntermediateData".equalsIgnoreCase(className)) {
            return new IntermediateData_JDBCDAO();
        } else if ("Preprocessing_step".equalsIgnoreCase(className)) {
            return new PreprocessingStep_JDBCDAO();
        } else if ("Mapping_step".equalsIgnoreCase(className)) {
            return new MappingStep_JDBCDAO();
        } else if ("Union_step".equalsIgnoreCase(className)) {
            return new UnionStep_JDBCDAO();
        } else if ("Smoothing_step".equalsIgnoreCase(className)) {
            return new SmoothingStep_JDBCDAO();
        } else if ("Extract_relevant_features".equalsIgnoreCase(className)) {
            return new ExtractRelevantFeaturesStep_JDBCDAO();
            //PROCESSED DATA
        } else if ("ProcessedData".equalsIgnoreCase(className)) {
            return new ProcessedData_JDBCDAO();
        } else if ("Region_calling_step".equalsIgnoreCase(className)) {
            return new Region_calling_step_JDBCDAO();
        } else if ("Region_intersection_step".equalsIgnoreCase(className)) {
            return new Region_intersection_step_JDBCDAO();
        } else if ("Region_consolidation_step".equalsIgnoreCase(className)) {
            return new Region_consolidation_step_JDBCDAO();
        } else if ("Calling_step".equalsIgnoreCase(className)) {
            return new Calling_step_JDBCDAO();
        } else if ("Data_matrix_step".equalsIgnoreCase(className)) {
            return new Data_matrix_step_JDBCDAO();
        } else if ("Merging_step".equalsIgnoreCase(className)) {
            return new Merging_step_JDBCDAO();
        } else if ("Proteomics_msquantification_step".equalsIgnoreCase(className)) {
            return new Proteomics_msquantification_step_JDBCDAO();
        } else if ("Quantification_step".equalsIgnoreCase(className)) {
            return new Quantification_step_JDBCDAO();
            //OTHER
        } else if ("QualityReport".equalsIgnoreCase(className)) {
            return new QualityReport_JDBCDAO();
        } else if ("User".equalsIgnoreCase(className)) {
            return new User_JDBCDAO();
        } else if ("Region_step".equalsIgnoreCase(className)) {
            return new Region_stepDAO();
        } else {
            return null;
        }
    }
}
