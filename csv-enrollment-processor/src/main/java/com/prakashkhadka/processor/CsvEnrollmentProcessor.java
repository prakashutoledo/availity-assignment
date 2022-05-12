package com.prakashkhadka.processor;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.nio.file.StandardOpenOption.CREATE;
import static java.nio.file.StandardOpenOption.READ;
import static java.nio.file.StandardOpenOption.TRUNCATE_EXISTING;
import static java.nio.file.StandardOpenOption.WRITE;
import static java.util.Comparator.comparing;
import static java.util.function.Function.identity;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toMap;

import com.prakashkhadka.domain.Enrollee;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * A CSV file format enrollment processor for {@link Enrollee}
 *
 * @author Prakash Khadka <br>
 * Created on: May 11, 2022
 */
public class CsvEnrollmentProcessor {
    private static final CsvEnrollmentProcessor CSV_ENROLLMENT_PROCESSOR = new CsvEnrollmentProcessor();

    private static final CsvMapper CSV_MAPPER = new CsvMapper();
    private static final CsvSchema DEFAULT_SCHEMA = CSV_MAPPER.schemaFor(Enrollee.class).withHeader();
    private static final String CSV_EXTENSION = ".csv";

    private CsvEnrollmentProcessor() {
        // Private instantiation
    }

    /**
     * Process the given csv file path for enrollment
     *
     * @param filePath A csv file path to process
     */
    public static void processFile(String filePath) {
        CSV_ENROLLMENT_PROCESSOR.process(filePath);
    }

    /**
     * Process the given csv path for enrollment
     *
     * @param filePath a csv {@link Path} to process
     */
    public static void processFile(Path filePath) {
        CSV_ENROLLMENT_PROCESSOR.process(filePath);
    }

    /**
     * Process the csv file
     *
     * @param filePath a csv file path to process
     *
     * @throws IllegalArgumentException if file path is null or it is blank or it doesn't end with .csv extension
     */
    private void process(String filePath) {
        if (filePath == null || filePath.isBlank() || !filePath.endsWith(CSV_EXTENSION)) {
            throw new IllegalArgumentException("Invalid filename");
        }
        process(Path.of(filePath));
    }

    /**
     * Process the csv file for enrollment
     *
     * @param path a csv {@link Path} to be processed
     *
     * @throws IllegalArgumentException if file path is null or it's string representation doesn't end with .csv extension
     * @throws UncheckedIOException     if unexpected io exception occurs while process the input stream of the given path
     */
    private void process(Path path) {
        if (path == null || !path.toString().endsWith(CSV_EXTENSION) || !Files.exists(path)) {
            throw new IllegalArgumentException("Invalid file path");
        }

        try (InputStream inputStream = Files.newInputStream(path, READ)) {
            processStream(path.getParent(), inputStream);
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

    /**
     * Process the input stream for the given parent path.This will read the contents inside the stream and separates
     * the enrollees by insurance company name in it's own csv file inside given parent path. Furthermore, it will only
     * include the enrollees with same user id by highest version followed by sorting by last name and then first name
     * <p>
     * Space complexity: O(c*e) where c is number of companies and e is number of unique enrollees for the company
     * Time complexity: O(c*e*log(e) where c is number of companies and e is number of unique enrollees for the company
     *
     * @param parentPath  a parent {@link Path} to write output csv file by company name
     * @param inputStream an input stream of the input csv file that is open
     *
     * @throws IOException if error occurred while mapping csv contents from stream
     */
    private void processStream(final Path parentPath, InputStream inputStream) throws IOException {
        MappingIterator<Enrollee> enrolleesMappingIterator = CSV_MAPPER
                .readerFor(Enrollee.class)
                .with(DEFAULT_SCHEMA)
                .readValues(inputStream);

        List<Enrollee> enrollees = enrolleesMappingIterator.readAll();

        // This will group enrollees by company with unique user id of higher version
        Map<String, Map<String, Enrollee>> companyEnrolleeMapByUserId = enrollees.stream()
                .collect(groupingBy(Enrollee::getInsuranceCompany,
                        toMap(Enrollee::getUserId, identity(), (oldValue, newValue) -> {
                            // For duplicate user id, we want to pass the enrollee with higher version
                            if (oldValue.getVersion() > newValue.getVersion()) {
                                return oldValue;
                            }
                            return newValue;
                        })));

        companyEnrolleeMapByUserId.forEach((companyName, companyEnrolleeMap) -> {
            String companyCsvName = String.format("%s.csv", companyName);

            Path companyCsvPath = Optional.ofNullable(parentPath)
                    .map(path -> Path.of(path.toString(), companyCsvName))
                    .orElseGet(() -> Path.of(companyCsvName));

            List<Enrollee> enrolleesByCompany = new ArrayList<>(companyEnrolleeMap.values());

            // Sort enrollees by last name and then by first name
            enrolleesByCompany.sort(comparing(Enrollee::getLastName).thenComparing(Enrollee::getFirstName));
            writeCsv(companyCsvPath, enrolleesByCompany);
        });
    }

    /**
     * Write the list of enrollees in the given csv file path as csv contents
     *
     * @param csvPath   a csv {@link Path} to write contents
     * @param enrollees a list of enrollees to be mapped into csv contents
     *
     * @throws UncheckedIOException if unexpected io exception occurs writing mapped enrollees into csv contents
     */
    private void writeCsv(Path csvPath, List<Enrollee> enrollees) {
        try (BufferedWriter printWriter = Files.newBufferedWriter(csvPath, UTF_8, CREATE, TRUNCATE_EXISTING, WRITE)) {
            CSV_MAPPER.writer(DEFAULT_SCHEMA).writeValue(printWriter, enrollees);
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }
}
