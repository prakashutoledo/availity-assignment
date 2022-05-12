package com.prakashkhadka.processor

import java.nio.file.Files

import static org.junit.jupiter.api.Assertions.assertEquals

import spock.lang.Specification
import spock.lang.TempDir

import java.nio.file.Path

import static org.junit.jupiter.api.Assertions.assertTrue

class CsvEnrollmentProcessorTest extends Specification {
    @TempDir
    private Path temporaryDirectoryPath;

    def 'Processing csv string path `#filePath` is failed because of`#reason`'() {
        when: 'Input csv file path is processed'
            CsvEnrollmentProcessor.processFile((String) filePath)

        then: 'Should throw IllegalArgumentException'
            def exception = thrown IllegalArgumentException

        and: 'Should match exception message'
            assertEquals "Invalid filename", exception.message, reason

        where:
            filePath         || reason
            ''               || 'Empty file path'
            '   '            || 'Blank file path'
            null             || 'Null file path'
            'testfile'       || 'Path without extension'
            'testfile.excel' || 'Path without .csv extension'
    }

    def 'Processing csv path `#filePath` is failed because of `#reason`'() {
        when: 'Input csv file path is processed'
            CsvEnrollmentProcessor.processFile((Path) filePath)

        then: 'Should throw IllegalArgumentException'
            def exception = thrown IllegalArgumentException

        and: 'Should match exception message'
            assertEquals "Invalid file path", exception.message, reason

        where:
            filePath                           || reason
            Path.of("non-existing-file")       || 'File path without extension'
            Path.of("non-existing-file.excel") || 'File path with .csv extension'
            Path.of("non-existing-file.csv")   || "File path doesn't exists"
            null                               || 'Null path'
    }

    def 'Processing valid csv string file path'() {
        given: 'Valid csv file path'
            def csvContents = """
                                |userId,firstName,lastName,version,insuranceCompany
                                |1,firstName1,lastName1,1,company1
                                |1,firstName1,lastName1,2,company1
                                |2,firstName10,lastName10,10,company3
                                |3,firstName9,lastName9,9,company3
                                |3,firstName9,lastName9,8,company3
                                |4,firstName8,lastName8,6,company3
                                |2,firstName2,lastName2,10,company2
                                |2,firstName2,lastName2,8,company2
                                |2,firstName2,lastName2,11,company2
                                |0,firstName0,lastName0,1,company2
                                |21,firstName21,lastName21,21,company1
                                |46,firstName46,lastName46,46,company2
                              """.stripIndent().stripMargin().trim();
            def absolutePath = Files.writeString Path.of(temporaryDirectoryPath.toString(), 'test.csv') , csvContents
            CsvEnrollmentProcessor.processFile absolutePath.toString()

        expect:
            def company1CsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |1,firstName1,lastName1,2,company1
                      |21,firstName21,lastName21,21,company1
                    """.stripMargin().stripIndent().trim()
            validateCsvContents'company1.csv', company1CsvContents

            def company2CsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |0,firstName0,lastName0,1,company2
                      |2,firstName2,lastName2,11,company2
                      |46,firstName46,lastName46,46,company2
                    """.stripMargin().stripIndent().trim()
            validateCsvContents'company2.csv', company2CsvContents

            def company3CsvContents =
                    """
                      |userId,firstName,lastName,version,insuranceCompany
                      |2,firstName10,lastName10,10,company3
                      |4,firstName8,lastName8,6,company3
                      |3,firstName9,lastName9,9,company3
                    """.stripMargin().stripIndent().trim()
            validateCsvContents'company3.csv', company3CsvContents
    }

    private void validateCsvContents(String companyName, String expectedContents) {
        def actualPath = Path.of temporaryDirectoryPath.toString(), companyName
        assertTrue Files.exists(actualPath), 'File do exists'
        assertEquals expectedContents, Files.readString(actualPath).trim(), "Csv contents are matched"
    }
}
