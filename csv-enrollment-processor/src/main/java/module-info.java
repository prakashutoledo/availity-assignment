/**
 * This module provides support for processing CSV files during enrollment
 * <p>
 *     The {@link com.prakashkhadka.processor} is the package provides implementation for
 *     enrollment processor of CSV files
 * </p>
 *
 * @author Prakash Khadka <br>
 *         Created on: May 11, 2022
 */
module availity.assignment.csv.enrollment.processor {
    requires transitive com.fasterxml.jackson.dataformat.csv;
    requires transitive com.fasterxml.jackson.databind;

    exports com.prakashkhadka.processor;
}