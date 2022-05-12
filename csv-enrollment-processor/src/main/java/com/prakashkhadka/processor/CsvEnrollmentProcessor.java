package com.prakashkhadka.processor;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.nio.file.StandardOpenOption.*;
import static java.util.Comparator.comparing;
import static java.util.function.Function.identity;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toMap;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.prakashkhadka.processor.domain.Enrollee;

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
 *
 */
public class CsvEnrollmentProcessor {
    private static final CsvEnrollmentProcessor CSV_ENROLLMENT_PROCESSOR = new CsvEnrollmentProcessor();

    private static final CsvMapper CSV_MAPPER = new CsvMapper();
    private static final CsvSchema DEFAULT_SCHEMA = CSV_MAPPER.schemaFor(Enrollee.class).withHeader();
    private static final String CSV_EXTENSION = ".csv";

    public static void processFile(String filePath) {
        CSV_ENROLLMENT_PROCESSOR.process(filePath);
    }

    public static void processFile(Path filePath) {
        CSV_ENROLLMENT_PROCESSOR.process(filePath);
    }

    private CsvEnrollmentProcessor() {
        // Private instantiation
    }


    private void process(String filePath) {
        if (filePath == null || filePath.isBlank() || !filePath.endsWith(CSV_EXTENSION)) {
            throw new IllegalArgumentException("Invalid filename");
        }
        process(Path.of(filePath));
    }

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

    private void writeCsv(Path csvPath, List<Enrollee> enrollees) {
        try (BufferedWriter printWriter = Files.newBufferedWriter(csvPath, UTF_8, CREATE, TRUNCATE_EXISTING, WRITE)){
            CSV_MAPPER.writer(DEFAULT_SCHEMA).writeValue(printWriter, enrollees);
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }
}
